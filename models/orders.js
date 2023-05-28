module.exports = (sequelize, Sequelize) => {
	const Order = sequelize.define('Order', {
		UserId: {
			type: Sequelize.DataTypes.INTEGER,
			allowNull: false,
		},
		Status: {
			type: Sequelize.DataTypes.STRING,
			allowNull: false,
			defaultValue: 'in_progress',
		},
		TotalPrice: {
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
	Order.associate = function (models) {
		Order.belongsTo(models.User);
		Order.belongsToMany(models.Item, { through: models.OrderItem, foreignKey: 'OrderId' });
		Order.hasMany(models.OrderItem);
	};
	return Order;
};
