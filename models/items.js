module.exports = (sequelize, Sequelize) => {
	const Item = sequelize.define('Item', {
		id: {
			type: Sequelize.DataTypes.INTEGER,
			primaryKey: true,
			allowNull: false,
			unique: true,
		},
		Name: {
			type: Sequelize.DataTypes.STRING,
			allowNull: false,
			unique: true,
		},
		Price: {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: false,
		},
		Status: {
			type: Sequelize.DataTypes.STRING,
			allowNull: false,
			defaultValue: 'in-stock',
		},
		SKU: {
			type: Sequelize.DataTypes.STRING,
			allowNull: false,
		},
		Quantity: {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: false,
		},
		Image: {
			type: Sequelize.DataTypes.STRING,
			allowNull: true,
		},
		CategoryId: {
			type: Sequelize.DataTypes.INTEGER,
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

	Item.associate = function (models) {
		Item.belongsToMany(models.Cart, { through: models.ItemCart, foreignKey: 'ItemId' });
		Item.belongsTo(models.Category);
	};
	return Item;
};
