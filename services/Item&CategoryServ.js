const { Op, sequelize } = require('sequelize');

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

	async itemByName(name) {
		return this.Item.findOne({
			raw: true,
			where: { Name: name },
		});
	}

	async itemById(id) {
		return this.Item.findOne({
			raw: true,
			where: { id: id },
		});
	}

	async getItem(body) {
		return this.Item.findOne({
			raw: true,
			where: body,
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
			attributes: {
				exclude: ['Status', 'SKU', 'Image', 'CategoryId', 'createdAt', 'updatedAt', 'Role'],
			},
			include: {
				model: this.Category,
				attributes: ['Name'],
			},
		});
	}

	async getAllByCat(id) {
		return this.Item.findAll({
			raw: true,
			where: { CategoryId: id },
		});
	}

	async getLowQuantItem(id, quantity) {
		return this.Item.findOne({
			raw: true,
			where: {
				id: id,
				Quantity: {
					[Op.lt]: quantity,
				},
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

	async deleteItem(ItemId) {
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

	async findOrCreateCat(name) {
		return this.Category.findOrCreate({
			where: { Name: name },
		});
	}

	async catById(id) {
		return this.Category.findOne({
			raw: true,
			where: { id: id },
		});
	}

	async catByName(name) {
		return this.Category.findOne({
			raw: true,
			where: { Name: name },
		});
	}

	async getAllCat() {
		return this.Category.findAll({
			raw: true,
			where: {},
			attributes: {
				exclude: ['createdAt', 'updatedAt'],
			},
		});
	}

	async updateCat(id, name) {
		return this.Category.update(
			{ Name: name },
			{
				where: { id: id },
			}
		);
	}

	async deleteCat(id) {
		return this.Category.destroy({
			where: {
				id: id,
			},
		});
	}

	// utility --------

	async searchItems(name) {
		return this.Item.findAll({
			raw: true,
			where: { Name: { [Op.like]: `%${name}%` } },
			attributes: {
				exclude: ['createdAt', 'updatedAt', 'CategoryId'],
			},
			include: {
				model: this.Category,
				attributes: ['Name'],
			},
		});
	}

	async searchCat(name) {
		return this.Category.findAll({
			raw: true,
			where: { Name: name },
			attributes: {
				exclude: ['createdAt', 'updatedAt'],
			},
		});
	}

	async searchSKU(sku) {
		return this.Item.findAll({
			raw: true,
			where: { SKU: { [Op.like]: `%${sku}%` } },
			attributes: {
				exclude: ['createdAt', 'updatedAt', 'CategoryId'],
			},
			include: {
				model: this.Category,
				attributes: ['Name'],
			},
		});
	}

	async searchItemCat(name, category) {
		return this.Item.findAll({
			raw: true,
			where: {
				Name: { [Op.like]: `%${name}%` },
				CategoryId: category,
			},
			attributes: {
				exclude: ['createdAt', 'updatedAt', 'CategoryId'],
			},
			include: {
				model: this.Category,
				attributes: ['Name'],
			},
		});
	}
}

module.exports = ItemService;
