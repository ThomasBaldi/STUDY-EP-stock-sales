var jwt = require('jsonwebtoken');

module.exports = {
	checkIfAdmin: (req, res, next) => {
		let token = req.headers.authorization;
		if (!token) {
			res.status(200).json({ status: 'Failure', message: 'Token was not provided.' });
		}
		const decodedToken = jwt.verify(token.split(' ')[1], process.env.TOKEN_SECRET);

		if (decodedToken.userId !== 1) {
			res.status(400).json({
				message: 'Only Admin user has access to this endpoint',
			});
		} else {
			next();
		}
	},
};
