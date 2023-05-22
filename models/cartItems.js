module.exports = (sequelize, Sequelize) => {
	const CartItem = sequelize.define(
		'CartItem',
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

	CartItem.associate = function (models) {
		CartItem.belongsTo(models.Cart);
		CartItem.belongsTo(models.Item);
	};
	return CartItem;
};
