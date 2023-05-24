var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var CartService = require('../services/Cart&CartItemServ');
var OrderService = require('../services/Order&OrderItemServ');
var cartSer = new CartService(db);
var orderSer = new OrderService(db);

var { checkIfAdmin, checkIfUser } = require('../models/middleware/authMiddleware');

router
	.get('/orders', checkIfUser, async (req, res, next) => {
		try {
			const token = req.headers.authorization.split(' ')[1];
			const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
			let UserId = decodedToken.UserId;
			let cart = await cartSer.getCart(UserId);
			cart.ItemsInCart = [];
			cart.Total = [];
			let cartItems = await cartSer.getUserCartItem(cart.id);
			cartItems.forEach((e) => {
				cart.ItemsInCart.push({
					Name: e['Item.Name'],
					Id: e.ItemId,
					Price: e.Price,
					Quantity: e.Quantity,
				});
				cart.Total.push(e.Price);
			});
			if (cart.Total.length != 0) {
				cart.Total = cart.Total.reduce((acc, curr) => acc + curr);
			} else {
				cart.Total = 0;
			}
			res.status(200).json({
				Cart: {
					id: cart.id,
					Total: cart.Total,
					ItemsInCart: cart.ItemsInCart,
				},
			});
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: 'Something went wrong with the Cart search.',
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
