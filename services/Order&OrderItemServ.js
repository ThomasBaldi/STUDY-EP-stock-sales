class OrderService {
	constructor(db) {
		this.client = db.sequelize;
		this.Order = db.Order;
		this.OrderItem = db.OrderItem;
		this.User = db.User;
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

	async getAllOrders() {
		return this.Order.findAll({
			raw: true,
			where: {},
			include: {
				model: this.User,
				attributes: ['Username'],
			},
		});
	}

	async getCompletedUSerOrders(id) {
		return this.Order.findAll({
			raw: true,
			where: {
				UserId: id,
				Status: 'Completed',
			},
			include: {
				model: this.User,
				attributes: ['Username'],
			},
		});
	}

	//order items methods -----------

	async createOrderItems(items) {
		return this.OrderItem.bulkCreate(items);
	}
}

module.exports = OrderService;
