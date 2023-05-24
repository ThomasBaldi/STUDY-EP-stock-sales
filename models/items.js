module.exports = (sequelize, Sequelize) => {
	const Item = sequelize.define('Item', {
		id: {
			type: Sequelize.DataTypes.INTEGER,
			primaryKey: true,
			autoIncrement: true,
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
			unique: true,
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
		Item.belongsTo(models.Category);
		Item.belongsToMany(models.Cart, { through: models.CartItem, foreignKey: 'ItemId' });
		Item.belongsToMany(models.Order, { through: models.OrderItem, foreignKey: 'ItemId' });
		Item.hasMany(models.CartItem);
		Item.hasMany(models.OrderItem);
	};
	return Item;
};
