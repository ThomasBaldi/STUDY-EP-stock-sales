module.exports = (sequelize, Sequelize) => {
	const User = sequelize.define('User', {
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
			validate: {
				isEmail: true,
			},
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
	//this should trigger when new users are added through app and not manually on workbench
	User.addHook('beforeCreate', async (user) => {
		const count = await sequelize.models.User.count({ where: { Email: user.Email } });
		if (count >= 4) {
			throw new Error('Email address has already been used 4 times!');
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
