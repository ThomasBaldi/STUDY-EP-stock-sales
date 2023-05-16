module.exports = (sequelize) => {
	const ItemOrder = sequelize.define('ItemOrder', {}, { timestamps: false });
	return ItemOrder;
};
