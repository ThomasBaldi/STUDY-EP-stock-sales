var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var CartService = require('../services/Cart&CartItemServ');
var OrderService = require('../services/Order&OrderItemServ');
var cartSer = new CartService(db);
var orderSer = new OrderService(db);

var { checkIfAdmin, checkIfToken } = require('../models/middleware/authMiddleware');

router
	.get('/orders', checkIfToken, async (req, res, next) => {
		try {
			const token = req.headers.authorization.split(' ')[1];
			const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
			let UserRole = decodedToken.Role;
			let UserId = decodedToken.UserId;
			if (!token) {
				res.status(400).json({
					message: 'Only registered users or Admin has access to this endpoint.',
				});
			} else {
				if (UserRole === 1) {
					//get all orders (completed/in-progress/cancelled) of all users
					var order = await orderSer.getAllOrders();
				} else {
					//get only all completed orders for user
					var order = await orderSer.getCompletedUSerOrders(UserId);
				}
				groupUsers = Object.values(
					order.reduce((a, c) => {
						a[c.UserId] = a[c.UserId] || [];
						a[c.UserId].push(c);
						return a;
					}, {})
				);
				var allOrders = [];
				groupUsers.forEach((e) => {
					e.User = {
						UserId: e[0].UserId,
						Username: e[0]['User.Username'],
						Orders: [],
					};
					e.forEach((x) => {
						Order = {
							OrderId: x.id,
							Status: x.Status,
							Total: x.TotalPrice,
						};
						e.User.Orders.push(Order);
					});
					allOrders.push(e.User);
				});
				if (order.length == 0) {
					res.status(400).json({
						Message: 'There are no completed orders to be seen yet.',
					});
				} else {
					res.status(200).json({
						Order: allOrders,
					});
				}
			}
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: 'Something went wrong with the Order search.',
			});
		}
	})
	.get('/allorders', checkIfAdmin, async (req, res, next) => {
		try {
			let carts = await cartSer.getAllQuery();
			let usersCarts = carts.slice(1);

			groupedByUser = Object.values(
				usersCarts[0].reduce((a, c) => {
					a[c.Username] = a[c.Username] || [];
					a[c.Username].push(c);
					return a;
				}, {})
			);

			var finalArray = [];
			groupedByUser.forEach((e) => {
				e.Cart = {
					Username: e[0].Username,
					CartId: e[0].CartId,
					Items: [],
				};
				e.forEach((x) => {
					Item = {
						ItemName: x.Name,
						ItemId: x.ItemId,
						Price: x.Price,
						Quantity: x.Quantity,
					};
					e.Cart.Items.push(Item);
				}),
					finalArray.push(e.Cart);
			});
			res.status(200).json({
				AllCarts: finalArray,
			});
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: 'Something went wrong with the Cart search.',
			});
		}
	});

module.exports = router;
