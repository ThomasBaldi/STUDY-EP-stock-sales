class OrderService {
	constructor(db) {
		this.client = db.sequelize;
		this.Order = db.Order;
		this.OrderItem = db.OrderItem;
	}

	async createOrder(userId, Price) {
		return this.Order.create({
			UserId: userId,
			TotalPrice: Price,
		});
	}

	async getLastUserOrder(userId) {
		return this.Order.findOne({
			raw: true,
			where: {
				UserId: userId,
			},
			order: [['id', 'DESC']],
		});
	}
}

module.exports = OrderService;
