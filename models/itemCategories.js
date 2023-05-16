module.exports = (sequelize) => {
	const ItemCategory = sequelize.define('ItemCategory', {}, { timestamps: false });
	return ItemCategory;
};
