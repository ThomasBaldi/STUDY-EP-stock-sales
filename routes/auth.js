var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var db = require('../models');
var UserService = require('../services/UserService');
var userService = new UserService(db);

const validEmail = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

router.post('/signup', async (req, res, next) => {
	const { username, password, email } = req.body;
	const existingUser = await userService.getOne(username);
	const tooManyEmails = await userService.getAllEmails(email);

	if (!username || !email || !password) {
		res.status(400).json({ message: 'One or more properties are missing.' });
	}
	if (!email.match(validEmail)) {
		res.status(400).json({ message: 'Email format is invalid' });
	}
	if (existingUser) {
		if (username == existingUser.Username) {
			res.status(400).json({ message: 'Username already exists' });
		}
	} else if (tooManyEmails.length != 0) {
		if (tooManyEmails.length >= 4) {
			res.status(400).json({ message: 'Email address has already been used on 4 accounts!' });
		}
	} else {
		let salt = crypto.randomBytes(16);
		crypto.pbkdf2(password, salt, 310000, 32, 'sha256', (err, hash) => {
			if (err) throw new Error('Internal Server Error');
			try {
				userService.create(username, hash, email, salt);
				res.status(200).json({
					message: `User with username: ${username} is created.`,
				});
			} catch (err) {
				console.log(err);
				res.status(400);
			}
		});
	}
});

router.post('/login', async (req, res, next) => {
	const { username, password } = req.body;
	const existingUser = await userService.getOne(username);

	if (!username || !password) {
		res.status(400).json({ message: 'One or more properties are missing.' });
	} else if (!existingUser) {
		res.status(400).json({ message: 'Ivalid username.' });
	} else {
		crypto.pbkdf2(password, existingUser.Salt, 310000, 32, 'sha256', (err, hash) => {
			if (err) {
				return err;
			}
			if (!crypto.timingSafeEqual(Buffer.from(existingUser.Password), hash)) {
				res.status(400).json({ message: 'Ivalid password.' });
			}
			//jwt token
			let token;
			try {
				token = jwt.sign(
					{ userId: existingUser.id, email: existingUser.Email },
					process.env.TOKEN_SECRET,
					{ expiresIn: '2h' }
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
