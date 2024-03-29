const { sequelize } = require('../models');

class CartService {
	constructor(db) {
		this.client = db.sequelize;
		this.Cart = db.Cart;
		this.CartItem = db.CartItem;
		this.Item = db.Item;
		this.User = db.User;
	}

	async createCart(userId) {
		return this.Cart.findOrCreate({
			where: { UserId: userId },
		});
	}

	async getOne(userId) {
		return this.Cart.findOne({
			raw: true,
			where: { UserId: userId },
		});
	}

	async getAll() {
		return this.Cart.findAll({
			raw: true,
			include: [
				{
					model: this.User,
					attributes: ['Username'],
				},
				{
					model: this.CartItem,
					attributes: {
						exclude: ['CartId', 'ItemId'],
					},
					include: {
						model: this.Item,
						attributes: ['Name', 'Price'],
					},
				},
			],
		});
	}

	async getAllQuery() {
		return (
			this.Cart.findAll({ where: {} }),
			sequelize
				.query(
					'SELECT users.Username AS `Username`, users.FirstName AS `Firstname`, users.LastName AS `Lastname`, carts.id AS `CartId`, cartitems.ItemID AS `ItemId`, items.Name AS `Name`, cartitems.Price AS `Price`, cartitems.Quantity AS `Quantity` FROM users JOIN carts ON users.id = carts.UserId LEFT JOIN cartitems ON carts.id = cartitems.CartId LEFT JOIN items ON cartitems.ItemId = items.id'
				)
				.catch((err) => {
					return err;
				})
		);
	}

	//cartitem methods----------------------------------------------

	async createCartItem(cartId, itemId, price) {
		return this.CartItem.create({
			CartId: cartId,
			ItemId: itemId,
			Price: price,
		});
	}

	async getUserCartItem(cartId) {
		return this.CartItem.findAll({
			raw: true,
			where: {
				CartId: cartId,
			},
			attributes: {
				exclude: ['CartId'],
			},
			include: {
				model: this.Item,
				attributes: ['Name'],
			},
		});
	}

	async getOrCreateCartItem(cartId, itemId, itemPrice) {
		return this.CartItem.findOrCreate({
			raw: true,
			where: {
				CartId: cartId,
				ItemId: itemId,
				Price: itemPrice,
			},
		});
	}

	async getCartItemByItem(cartId, itemId) {
		return this.CartItem.findOne({
			raw: true,
			where: {
				ItemId: itemId,
				CartId: cartId,
			},
		});
	}

	async updateQuantity(itemId, cartId, quantity) {
		return this.CartItem.update(
			{ Quantity: quantity },
			{
				where: {
					CartId: cartId,
					ItemId: itemId,
				},
			}
		);
	}

	async deleteCartItem(itemId, cartId) {
		return this.CartItem.destroy({
			where: {
				CartId: cartId,
				ItemId: itemId,
			},
		});
	}

	async deleteAllCartItems(cartId) {
		return this.CartItem.destroy({
			where: {
				CartId: cartId,
			},
		});
	}

	async deleteCartItem(id, cartId) {
		return this.CartItem.destroy({
			where: {
				ItemId: id,
				CartId: cartId,
			},
		});
	}
}

module.exports = CartService;
