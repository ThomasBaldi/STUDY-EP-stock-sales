const { Op } = require('sequelize');

class ItemService {
	constructor(db) {
		this.client = db.sequelize;
		this.Item = db.Item;
		this.Category = db.Category;
	}

	async create(id, name, price, sku, quantity, image, category) {
		return this.Item.create({
			id: id,
			Name: name,
			Price: price,
			SKU: sku,
			Quantity: quantity,
			Image: image,
			CategoryId: category,
		});
	}

	async getOne() {
		return this.Item.findOne({
			where: {},
		});
	}

	async getAll() {
		return this.Item.findAll({
			raw: true,
			where: {},
			include: {
				model: this.Category,
				attributes: ['name'],
			},
		});
	}

	async update() {
		return this.Item.update({
			where: {},
		});
	}

	async deleteItem(ItemId) {
		return this.Item.destroy({
			where: {
				id: ItemId,
				Role: {
					//Admin cannot be deleted
					[Op.not]: 1,
				},
			},
		});
	}

	async createCat(id, name) {
		return this.Category.create({
			id: id,
			Name: name,
		});
	}

	async getOneCat(name) {
		return this.Category.findOne({
			raw: true,
			where: { Name: name },
		});
	}

	async getAllCat() {
		return this.Category.findAll({
			raw: true,
			where: {},
		});
	}

	async update(id) {
		return this.Category.update({
			where: { id: id },
		});
	}

	async deleteItem(id) {
		return this.Item.destroy({
			where: {
				id: id,
			},
		});
	}
}

module.exports = ItemService;
