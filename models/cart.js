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
		},
		{ timestamps: false }
	);

	Cart.associate = function (models) {
		Cart.belongsTo(models.User, { foreignKey: 'UserId', allowNull: false });
		Cart.belongsToMany(models.Item, { through: models.CartItem, foreignKey: 'CartId' });
		Cart.hasMany(models.CartItem);
	};
	return Cart;
};
