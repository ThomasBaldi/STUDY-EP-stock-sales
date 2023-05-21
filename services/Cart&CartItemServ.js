class CartService {
	constructor(db) {
		this.client = db.sequelize;
		this.Cart = db.Cart;
		this.CartItem = db.ItemCart;
		this.Item = db.Item;
		this.User = db.User;
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

	//cartitem methods----------------------------------------------

	async createCartItem(cartId, itemId) {
		return this.CartItem.create({
			CartId: cartId,
			ItemId: itemId,
		});
	}

	async getUserCartItem(cartId) {
		return this.CartItem.findAll({
			raw: true,
			where: {
				CartId: cartId,
			},
			attributes: {
				exclude: ['CartId', 'ItemId'],
			},
			include: {
				model: this.Item,
				attributes: ['Name', 'Price'],
			},
		});
	}

	async getCartItemByItem(cartId, itemId) {
		return this.CartItem.findOne({
			where: {
				ItemId: itemId,
				CartId: cartId,
			},
		});
	}
}

module.exports = CartService;
