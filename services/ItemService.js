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

	async createNew(name, price, sku, quantity, image, category) {
		return this.Item.create({
			Name: name,
			Price: price,
			SKU: sku,
			Quantity: quantity,
			Image: image,
			CategoryId: category,
		});
	}

	async getOne(name) {
		return this.Item.findOne({
			where: { Name: name },
		});
	}

	async getOneById(id) {
		return this.Item.findOne({
			raw: true,
			where: { id: id },
		});
	}

	async getSKU(sku) {
		return this.Item.findOne({
			where: { SKU: sku },
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

	async updateItem(id, body) {
		return this.Item.update(body, {
			where: {
				id: id,
			},
		});
	}

	async delete(ItemId) {
		return this.Item.destroy({
			where: {
				id: ItemId,
			},
		});
	}

	//category methods -----------------------------------------------

	async createCat(id, name) {
		return this.Category.create({
			id: id,
			Name: name,
		});
	}

	async getOneCat(id) {
		return this.Category.findOne({
			raw: true,
			where: { id: id },
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
