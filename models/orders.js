module.exports = (sequelize, Sequelize) => {
	const Order = sequelize.define(
		'Order',
		{
			State: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
				defaultValue: 'in_progress',
			},
		},
		{ timestamps: false }
	);
	Order.associate = function (models) {
		Order.belongsTo(models.User);
		Order.belongsToMany(models.Cart, { through: models.ItemOrder, foreignKey: 'OrderId' });
	};
	return Order;
};
