module.exports = (sequelize, Sequelize) => {
	const ItemCart = sequelize.define(
		'ItemCart',
		{
			Quantity: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
				defaultValue: 1,
			},
		},
		{ timestamps: false }
	);

	ItemCart.associate = function (models) {
		ItemCart.belongsTo(models.Cart);
		ItemCart.belongsTo(models.Item);
	};
	return ItemCart;
};
