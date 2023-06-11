var express = require('express');
var router = express.Router();
const axios = require('axios');
var db = require('../models');
var UserService = require('../services/UserService');
var ItemService = require('../services/Item&CategoryServ');
var CartService = require('../services/Cart&CartItemServ');
var OrderService = require('../services/Order&OrderItemServ');
var userSer = new UserService(db);
var cartSer = new CartService(db);
var itemSer = new ItemService(db);
var orderSer = new OrderService(db);

let url = 'http://localhost:3000';

var { checkIfUser, getDecoded } = require('../models/middleware/authMiddleware');

router.post('/', checkIfUser, async (req, res, next) => {
	const decodedToken = getDecoded(req);
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
						'The items listed have too low stock to meet your requested quantities, please change the quantities in the cart to proceed with your checkout.',
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
				//create order and fix itemsCart so that it fits the orderItem attributes
				await orderSer.createOrder(userId, FinalTotal);
				let order = await orderSer.getLastUserOrder(userId);
				itemsCart.forEach((e) => {
					(e.OrderId = order.id), (e.Name = e['Item.Name']), delete e['Item.Name'];
				});
				try {
					let token = req.headers.authorization.split(' ')[1];
					itemsCart.forEach(async (e) => {
						await axios.post(
							`${url}/order/${e.ItemId}`,
							{
								body: { Item: e },
							},
							{
								headers: {
									Authorization: 'Bearer ' + token,
								},
							}
						);
					});
					res.status(200).json({
						message: 'Cart has been checked-out and order is placed!',
						OrderId: order.id,
						TotalPrice: Total,
						Discount: Discount,
						FinalPrice: FinalTotal,
					});
				} catch (err) {
					console.log(err);
					res.status(500).json({ message: 'An interna server error occured' });
				}
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
