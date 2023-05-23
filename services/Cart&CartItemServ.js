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

	async getCart(userId) {
		return this.Cart.findOne({
			raw: true,
			where: { UserId: userId },
		});
	}

	async getCartById(id) {
		return this.Cart.findOne({
			raw: true,
			where: { id: id },
		});
	}

	async getAllCarts() {
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

	async getAllCartsQuery() {
		return (
			this.Cart.findAll({ where: {} }),
			sequelize
				.query(
					'SELECT users.Username AS `Username`, carts.Status AS Status, carts.id AS `CartId`, cartitems.ItemID AS `ItemId`, items.Name AS `Name`, cartitems.Price AS `Price`, cartitems.Quantity AS `Quantity` FROM users JOIN carts ON users.id = carts.UserId JOIN cartitems ON carts.id = cartitems.CartId JOIN items ON cartitems.ItemId = items.id'
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
}

module.exports = CartService;
