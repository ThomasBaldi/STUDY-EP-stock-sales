module.exports = (sequelize, Sequelize) => {
	const Category = sequelize.define('Category', {
		id: {
			type: Sequelize.DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
			unique: true,
			autoIncrement: true,
		},
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
		Category.hasMany(models.Item, { foreignKey: 'CategoryId' });
	};
	return Category;
};
