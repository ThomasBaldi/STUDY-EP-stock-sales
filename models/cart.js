module.exports = (sequelize, Sequelize) => {
	const Cart = sequelize.define(
		'Cart',
		{
			UserId: {
				type: Sequelize.DataTypes.INTEGER,
				allowNull: false,
				unique: true,
			},
			Status: {
				type: Sequelize.DataTypes.STRING,
				allowNull: false,
				defaultValue: 'in-progress',
			},
			TotalPrice: {
				type: Sequelize.DataTypes.STRING,
				allowNull: true,
			},
		},
		{ timestamps: false }
	);

	Cart.associate = function (models) {
		Cart.belongsTo(models.User, { foreignKey: 'UserId', allowNull: false });
		Cart.belongsToMany(models.Item, { through: models.ItemCart, foreignKey: 'CartId' });
		Cart.hasMany(models.ItemCart);
	};
	return Cart;
};
