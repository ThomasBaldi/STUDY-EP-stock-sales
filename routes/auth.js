var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var db = require('../models');
var UserService = require('../services/UserService');
var userSer = new UserService(db);
var CartService = require('../services/Cart&CartItemServ');
var cartSer = new CartService(db);

const validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

router
	.post('/signup', async (req, res, next) => {
		const { Username, Password, Email } = req.body;
		const userExists = await userSer.getOne(Username);
		const xEmails = await userSer.getAllEmails(Email);
		if (xEmails.length >= 0) {
			if (xEmails.length >= 4) {
				res.status(400).json({ message: 'Email address has already been used on 4 accounts!' });
			} else {
				if (!Username || !Email || !Password) {
					res.status(400).json({ message: 'One or more properties are missing.' });
				}
				if (!Email.match(validEmail)) {
					res.status(400).json({ message: 'Email format is invalid' });
				}
				if (userExists) {
					if (Username == userExists.Username) {
						res.status(400).json({ message: 'Username already exists' });
					}
				} else {
					let salt = crypto.randomBytes(16);
					crypto.pbkdf2(Password, salt, 310000, 32, 'sha256', (err, hash) => {
						if (err) throw new Error('Internal Server Error');
						try {
							userSer.create(Username, hash, Email, salt);
							res.status(200).json({
								message: `User with Username: ${Username} was successfully created.`,
							});
						} catch (err) {
							console.log(err);
							res.status(400);
						}
					});
				}
			}
		}
	})
	.post('/login', async (req, res, next) => {
		const { Username, Password } = req.body;
		const userExists = await userSer.getOne(Username);
		if (!Username || !Password) {
			res.status(400).json({ message: 'One or more properties are missing.' });
		} else if (!userExists) {
			res.status(400).json({ message: 'Invalid Username.' });
		} else {
			//create cart upon login if user doesn't have one
			await cartSer.createCart(userExists.id);
			let cart = await cartSer.getOne(userExists.id);
			crypto.pbkdf2(Password, userExists.Salt, 310000, 32, 'sha256', (err, hash) => {
				if (err) {
					return err;
				}
				if (!crypto.timingSafeEqual(Buffer.from(userExists.Password), hash)) {
					res.status(400).json({ message: 'Invalid Password.' });
				}
				let token;
				let expire;
				if (userExists.id === 1) {
					expire = '24H';
				} else {
					expire = '2H';
				}
				console.log(expire);
				try {
					token = jwt.sign(
						{
							UserId: userExists.id,
							Email: userExists.Email,
							Cart: cart.id,
						},
						process.env.TOKEN_SECRET,

						{ expiresIn: expire }
					);
				} catch (err) {
					console.log(err);
					const error = new Error('Error! Something went wrong.');
					return next(error);
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
