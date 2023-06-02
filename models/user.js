module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define('User', {
		FirstName: {
			type: Sequelize.DataTypes.STRING,
			allowNull: false,
		},
		LastName: {
			type: Sequelize.DataTypes.STRING,
			allowNull: false,
		},
		Username: {
			type: Sequelize.DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		Password: {
			type: Sequelize.DataTypes.BLOB,
			allowNull: false,
		},
		Email: {
			type: Sequelize.DataTypes.STRING,
			allowNull: false,
		},
		Salt: {
			type: Sequelize.DataTypes.BLOB,
			allowNull: false,
		},
		createdAt: {
			allowNull: false,
			type: Sequelize.DATE,
			defaultValue: Sequelize.fn('NOW'),
		},
		updatedAt: {
			allowNull: false,
			type: Sequelize.DATE,
			defaultValue: Sequelize.fn('NOW'),
		},
	});
	/* extra protection in case the api fails and tries to allow for more 
	than the allowed duplicate amounts */
	User.addHook('beforeCreate', async (user) => {
		const count = await sequelize.models.User.count({ where: { Email: user.Email } });
		if (count >= 4) {
			throw new Error('Email address has already been used 4 times!');
		}
		const adminCount = await sequelize.models.User.count({ where: { Role: 3 } });
		if (adminCount >= 1) {
			throw new Error('Admin user already exists');
		}
	});
	User.addHook('beforeBulkCreate', async (user) => {
		const count = await sequelize.models.User.count({ where: { Email: user.Email } });
		if (count >= 4) {
			throw new Error('Email address has already been used 4 times!');
		}
	});

	User.associate = function (models) {
		User.hasMany(models.Order, {
			foreignKey: 'UserId',
		});
	};
	return User;
};
