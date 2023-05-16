module.exports = (sequelize, Sequelize) => {
	const Category = sequelize.define('Category', {
		Name: {
			type: Sequelize.DataTypes.STRING,
			allowNull: false,
			unique: true,
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

	Category.associate = function (models) {
		Category.belongsToMany(models.Item, { through: models.ItemCategory });
	};
	return Category;
};
