var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var UserService = require('../services/UserService');
var CartService = require('../services/Cart&CartItemServ');
var OrderService = require('../services/Order&OrderItemServ');
var cartService = new CartService(db);
var userService = new UserService(db);
var orderService = new OrderService(db);

var { checkIfAdmin, checkIfUser } = require('../models/middleware/authMiddleware');

router
	.post('/cart/checkout', checkIfUser, async (req, res, next) => {
		const token = req.headers.authorization.split(' ')[1];
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
		//set discount rates
		let equalEmails = await userService.getAllEmails(decodedToken.Email);
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
			let UserId = decodedToken.UserId;
			let cart = await cartService.getCart(UserId);
			let itemsExistInCart = await cartService.getUserCartItem(cart.id);
			/* console.log(itemsExistInCart); */
			if (itemsExistInCart.length == 0) {
				res.status(400).json({
					message: 'Cannot checkout, there is no item in your cart yet.',
				});
			} else {
				await cartService.checkOutCart(cart.id);
				var Total = [];
				itemsExistInCart.forEach((e) => {
					Total.push(e.Price);
				});
				Total = Total.reduce((acc, curr) => acc + curr);
				if (discount) {
					var Discount = discount * 100 + '%';
					var FinalTotal = Total - Total * discount;
				} else {
					var FinalTotal = Total;
				}
				await orderService.createOrder(decodedToken.UserId, FinalTotal);
				let order = await orderService.getLastUserOrder(decodedToken.UserId);

				//give discount if available
				//create orderId and send it via POST /order/:id
				//together with the cartItems
				//that endpoint will create all orderItems
				res.status(200).json({
					message: 'Cart has been checked-out and order is placed!',
					OrderId: order.id,
					TotalPrice: Total,
					Discount: Discount,
					FinalPrice: FinalTotal,
				});
			}
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: 'Something went wrong during checkout.',
			});
		}
	})
	.get('/orders', checkIfUser, async (req, res, next) => {
		try {
			const token = req.headers.authorization.split(' ')[1];
			const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
			let UserId = decodedToken.UserId;
			let cart = await cartService.getCart(UserId);
			cart.ItemsInCart = [];
			cart.Total = [];
			let cartItems = await cartService.getUserCartItem(cart.id);
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
					Status: cart.Status,
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
			let carts = await cartService.getAllCartsQuery();
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
					Status: e[0].Status,
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
