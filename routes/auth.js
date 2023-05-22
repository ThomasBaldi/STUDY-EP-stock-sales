var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var db = require('../models');
var UserService = require('../services/UserService');
var userService = new UserService(db);
var CartService = require('../services/Cart&CartItemServ');
var cartService = new CartService(db);

const validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

router.post('/signup', async (req, res, next) => {
	const { Username, Password, Email } = req.body;
	const existingUser = await userService.getOne(Username);
	const tooManyEmails = await userService.getAllEmails(Email);

	if (!Username || !Email || !Password) {
		res.status(400).json({ message: 'One or more properties are missing.' });
	}
	if (!Email.match(validEmail)) {
		res.status(400).json({ message: 'Email format is invalid' });
	}
	if (existingUser) {
		if (Username == existingUser.Username) {
			res.status(400).json({ message: 'Username already exists' });
		}
	} else if (tooManyEmails.length != 0) {
		if (tooManyEmails.length > 4) {
			res.status(400).json({ message: 'Email address has already been used on 4 accounts!' });
		}
	} else {
		let salt = crypto.randomBytes(16);
		crypto.pbkdf2(Password, salt, 310000, 32, 'sha256', (err, hash) => {
			if (err) throw new Error('Internal Server Error');
			try {
				userService.create(Username, hash, Email, salt);
				res.status(200).json({
					message: `User with Username: ${Username} was successfully created.`,
				});
			} catch (err) {
				console.log(err);
				res.status(400);
			}
		});
	}
});

router.post('/login', async (req, res, next) => {
	const { Username, Password } = req.body;
	const existingUser = await userService.getOne(Username);
	const existingCart = await cartService.getCart(existingUser.id);

	if (!Username || !Password) {
		res.status(400).json({ message: 'One or more properties are missing.' });
	} else if (!existingUser) {
		res.status(400).json({ message: 'Invalid Username.' });
	} else {
		crypto.pbkdf2(Password, existingUser.Salt, 310000, 32, 'sha256', (err, hash) => {
			if (err) {
				return err;
			}
			if (!crypto.timingSafeEqual(Buffer.from(existingUser.Password), hash)) {
				res.status(400).json({ message: 'Invalid Password.' });
			}
			//jwt token
			let token;
			try {
				token = jwt.sign(
					{ UserId: existingUser.id, Email: existingUser.Email },
					process.env.TOKEN_SECRET,
					{ expiresIn: '2h' }
				);
			} catch (err) {
				console.log(err);
				const error = new Error('Error! Something went wrong.');
				return next(error);
			}
			//create cart upon login if user doesn't have one
			if (!existingCart && existingUser.id != 1) {
				cartService.createCart(existingUser.id);
			}
			res.status(200).json({
				message: `You are now logged in!`,
				data: {
					token: token,
				},
			});
		});
	}
});

module.exports = router;
