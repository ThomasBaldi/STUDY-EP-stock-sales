module.exports = (sequelize, Sequelize) => {
	const OrderItem = sequelize.define(
		'OrderItem',
		{
			Name: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
			},
			Price: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
			},
			Quantity: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
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
