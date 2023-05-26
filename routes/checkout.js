var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var UserService = require('../services/UserService');
var ItemService = require('../services/Item&CategoryServ');
var CartService = require('../services/Cart&CartItemServ');
var OrderService = require('../services/Order&OrderItemServ');
var userSer = new UserService(db);
var cartSer = new CartService(db);
var itemSer = new ItemService(db);
var orderSer = new OrderService(db);

var { checkIfUser } = require('../models/middleware/authMiddleware');

router.post('/', checkIfUser, async (req, res, next) => {
	const token = req.headers.authorization.split(' ')[1];
	const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
	//set discount rates
	let equalEmails = await userSer.getAllEmails(decodedToken.Email);
	if (equalEmails.length == 2) {
		var discount = 0.1;
	}
	if (equalEmails.length == 3) {
		var discount = 0.3;
	}
	if (equalEmails.length == 4) {
		var discount = 0.4;
	}
	try {
		let userId = decodedToken.UserId;
		let cart = decodedToken.Cart;
		let itemsCart = await cartSer.getUserCartItem(cart);
		if (itemsCart.length == 0) {
			res.status(400).json({
				message: 'Cannot checkout, there is no item in your cart yet.',
			});
		} else {
			var Total = [];
			itemsCart.forEach(async (e) => {
				Total.push(e.Price * e.Quantity);
			});
			//check stock availability
			var lowStock = [];
			await Promise.all(
				itemsCart.map(async (e) => {
					let item = await itemSer.getLowQuantItem(e.ItemId, e.Quantity);
					if (item != null) {
						lowStock.push(item);
					}
				})
			);
			if (lowStock.length != 0) {
				let items = [];
				lowStock.forEach((e) => {
					items.push({ Name: e.Name, ID: e.id, AvailableQuantity: e.Quantity });
				});
				res.status(400).json({
					Message:
						'These items cannot be ordered as they have a too high quantity for the current available stock quantity, please change the quantities in the cart to proceed your checkout.',
					Items: items,
				});
			} else {
				//get cart total and give discount if available
				Total = Total.reduce((acc, curr) => acc + curr);
				if (discount) {
					var Discount = discount * 100 + '%';
					var FinalTotal = Total - Total * discount;
				} else {
					var Discount = 'No discount! Family discounts available when using the same email!';
					var FinalTotal = Total;
				}
				//create order
				await orderSer.createOrder(userId, FinalTotal);
				//create orderItems
				let order = await orderSer.getLastUserOrder(userId);
				itemsCart.forEach((e) => {
					(e.OrderId = order.id), (e.Name = e['Item.Name']), delete e['Item.Name'];
				});
				await orderSer.createOrderItems(itemsCart);
				//delete cart items once orderItems are created
				await cartSer.deleteAllCartItems(cart);
				//change item quantities
				itemsCart.forEach(async (e) => {
					let item = await itemSer.itemById(e.ItemId);
					let body = { Quantity: item.Quantity - e.Quantity };
					if (body.Quantity == 0) {
						body.Status = 'out-of-stock';
					}
					await itemSer.updateItem(e.ItemId, body);
				});
				res.status(200).json({
					message: 'Cart has been checked-out and order is placed!',
					OrderId: order.id,
					TotalPrice: Total,
					Discount: Discount,
					FinalPrice: FinalTotal,
				});
			}
		}
	} catch (err) {
		console.log(err);
		res.status(400).json({
			message: 'Something went wrong during checkout.',
		});
	}
});

module.exports = router;
