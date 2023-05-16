module.exports = (sequelize, Sequelize) => {
	const ItemCart = sequelize.define(
		'ItemCart',
		{
			Quantity: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
			},
		},
		{ timestamps: false }
	);
	return ItemCart;
};
