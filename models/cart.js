module.exports = (sequelize, Sequelize) => {
	const Cart = sequelize.define(
		'Cart',
		{
			Status: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
				defaultValue: 'in-progress',
			},
		},
		{ timestamps: false }
	);

	Cart.associate = function (models) {
		Cart.belongsTo(models.User, { foreignKey: 'UserId', allowNull: false });
		Cart.belongsToMany(models.Item, { through: models.ItemCart, foreignKey: 'CartId' });
	};
	return Cart;
};
