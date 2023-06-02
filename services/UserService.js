const { Op } = require('sequelize');

class UserService {
	constructor(db) {
		this.client = db.sequelize;
		this.User = db.User;
		this.Role = db.Role;
	}

	//roles--------

	async bulkRole() {
		return this.Role.bulkCreate([{ Role: 'Admin' }, { Role: 'User' }]);
	}

	async getRoles() {
		return this.Role.findAll({
			where: {},
		});
	}

	//user----------

	async create(firstname, lastname, username, password, email, salt) {
		return this.User.create({
			FirstName: firstname,
			LastName: lastname,
			Username: username,
			Password: password,
			Email: email,
			Salt: salt,
		});
	}

	async createAdmin(firstname, lastname, username, password, email, salt) {
		return this.User.findOrCreate({
			where: {
				FirstName: firstname,
				LastName: lastname,
				Username: username,
				Password: password,
				Email: email,
				Salt: salt,
				Role: 1,
			},
		});
	}

	async getAllUsers() {
		return this.User.findAll({
			raw: true,
			where: { Role: 2 },
			attributes: {
				exclude: ['Password', 'Salt', 'createdAt', 'updatedAt', 'Role'],
			},
		});
	}

	async getAllEmails(email) {
		return this.User.findAll({
			raw: true,
			where: {
				Email: email,
			},
		});
	}

	async getOne(username) {
		return await this.User.findOne({
			raw: true,
			where: { Username: username },
		});
	}

	async deleteUser(name) {
		return this.User.destroy({
			where: {
				Username: name,
				Role: {
					//Admin cannot be deleted
					[Op.not]: 1,
				},
			},
		});
	}
}

module.exports = UserService;
