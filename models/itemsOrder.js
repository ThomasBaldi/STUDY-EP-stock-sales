module.exports = (sequelize, Sequelize) => {
	const OrderItem = sequelize.define(
		'OrderItem',
		{
			Price: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
			},
			Quantity: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1,
			},
		},
		{ timestamps: false }
	);
	OrderItem.associate = function (models) {
		OrderItem.belongsTo(models.Order);
		OrderItem.belongsTo(models.Item);
	};
	return OrderItem;
};
