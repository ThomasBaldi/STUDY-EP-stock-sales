const { Op } = require('sequelize');

class CartService {
	constructor(db) {
		this.client = db.sequelize;
		this.Cart = db.Cart;
		this.CartItem = db.ItemCart;
		this.Item = db.Item;
	}

	async createCart(userId) {
		return this.Cart.create({
			UserId: userId,
		});
	}

	async getCart(userId) {
		return this.Cart.findOne({
			raw: true,
			where: { UserId: userId },
			include: {
				model: this.CartItem,
				attributes: ['ItemId'],
			},
		});
	}

	//cartitem methods----------------------------------------------

	async createCartItem(cartId, itemId) {
		return this.CartItem.create({
			CartId: cartId,
			ItemId: itemId,
			include: {
				model: this.Item,
				attribute: ['Price'],
				as: 'Price',
			},
		});
	}

	async getCartItemByItem(itemId) {
		return this.CartItem.findOne({
			where: { ItemId: itemId },
		});
	}
}

module.exports = CartService;
