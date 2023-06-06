var express = require('express');
var router = express.Router();
var db = require('../models');
var OrderService = require('../services/Order&OrderItemServ');
var orderSer = new OrderService(db);

var { checkIfAdmin, checkIfToken, getDecoded } = require('../models/middleware/authMiddleware');

router
	.get('/orders', checkIfToken, async (req, res, next) => {
		try {
			const decodedToken = getDecoded(req);
			let UserRole = decodedToken.Role;
			let UserId = decodedToken.UserId;
			if (!decodedToken) {
				res.status(400).json({
					message: 'Only registered users or Admin has access to this endpoint.',
				});
			} else {
				if (UserRole === 1) {
					//get all orders (completed/in-progress/cancelled) of all users
					var order = await orderSer.getAllOrders();
				} else {
					//get only all completed orders for user
					var order = await orderSer.getCompletedUserOrders(UserId);
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
							Created: x.createdAt,
							Updated: x.updatedAt,
							Status: x.Status,
							Total: x.TotalPrice,
						};
						e.User.Orders.push(Order);
					});
					allOrders.push(e.User);
				});
				if (order.length == 0) {
					res.status(200).json({
						Message: 'There are no completed orders to be seen yet.',
					});
				} else {
					res.status(200).json({
						Orders: allOrders,
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
			//get all orders and all items in orders
			let order = await orderSer.getAllOrdersQuery();
			let userOrders = order.slice(1);
			var allOrders = [];
			let byOrder = Object.values(
				userOrders[0].reduce((a, c) => {
					if (!a[c.OrderId]) {
						a[c.OrderId] = [];
					}
					a[c.OrderId].push(c);
					return a;
				}, {})
			);
			byOrder.forEach((o) => {
				o.Order = {
					Order: o[0].OrderId,
					Created: o[0].createdAt,
					Updated: o[0].updatedAt,
					Username: o[0].Username,
					Fullname: o[0].Firstname + ' ' + o[0].Lastname,
					Status: o[0].Status,
					Total: o[0].TotalPrice,
					Items: [],
				};
				o.forEach((i) => {
					Item = {
						Name: i.Name,
						id: i.ItemId,
						Price: i.Price,
						Quantity: i.Quantity,
					};
					o.Order.Items.push(Item);
				});
				allOrders.push(o.Order);
			});
			if (allOrders.length == 0) {
				res.status(400).json({
					message: 'There are no orders to be seen yet.',
				});
			} else {
				res.status(200).json({
					AllOrders: allOrders,
				});
			}
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: 'Something went wrong with the Order search.',
			});
		}
	});

module.exports = router;
