const { sequelize } = require('../models');

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

	async getUserOrderInPro(userId) {
		return this.Order.findOne({
			raw: true,
			where: {
				UserId: userId,
				Status: 'in_progress',
			},
			order: [['id', 'DESC']],
		});
	}

	async getOrder(id) {
		return this.Order.findOne({
			raw: true,
			where: {
				id: id,
			},
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

	async getCompletedUserOrders(id) {
		return this.Order.findAll({
			raw: true,
			where: {
				UserId: id,
				Status: 'complete',
			},
			include: [
				{
					model: this.OrderItem,
					attributes: [['ItemId', 'id'], 'Name', ['Quantity', 'quant']],
				},
			],
		});
	}

	async getAllOrderItems(id) {
		return this.Order.findAll({
			raw: true,
			where: {
				id: id,
			},
			include: {
				model: this.OrderItem,
				attributes: [
					['ItemId', 'id'],
					['Quantity', 'quant'],
				],
			},
		});
	}

	async getAllOrdersQuery() {
		return (
			this.Order.findAll({
				/*
				if you'd like to see same results without the need of reducing and
				restructuring the results, so much extra code just for the purpose of
				testing our raw SQL skills...
				A pitty that requirements set rules that forces
				one to not beeing able to use ORM when they can be of best use!

			nest: true,
			where: {},
			include: [
				{
					model: this.User,
					raw: true,
					attributes: ['Username'],
				},
				{
					model: this.OrderItem,
					attributes: ['Name', 'ItemId', 'Price', 'Quantity'],
					as: 'OrderItems',
					required: true,
					raw: true,
				},
			], */
			}),
			sequelize.query(
				'SELECT `Order`.`id`, `Order`.`UserId`, `Order`.`Status`, `Order`.`TotalPrice`, `Order`.`createdAt`, `Order`.`updatedAt`, `User`.`id` , `User`.`Username` AS `Username`,  `User`.`FirstName` AS `Firstname`, `User`.`Lastname` AS `Lastname`, `OrderItems`.`OrderId` AS `OrderId`, `OrderItems`.`Name` AS `Name`, `OrderItems`.`ItemId` AS `ItemId`, `OrderItems`.`Price` AS `Price`, `OrderItems`.`Quantity` AS `Quantity` FROM `Orders` AS `Order` LEFT OUTER JOIN `Users` AS `User` ON `Order`.`UserId` = `User`.`id` INNER JOIN `OrderItems` AS `OrderItems` ON `Order`.`id` = `OrderItems`.`OrderId`'
			)
		);
	}

	async statusUpdate(id, status) {
		return this.Order.update({ Status: status }, { where: { id: id } });
	}

	//order items methods -----------

	async createOrderItem(item) {
		return this.OrderItem.create(item);
	}
}

module.exports = OrderService;
