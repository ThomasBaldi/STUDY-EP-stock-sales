var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var CartService = require('../services/Cart&CartItemServ');
var cartSer = new CartService(db);

var { checkIfAdmin, checkIfUser } = require('../models/middleware/authMiddleware');

router
	.get('/cart', checkIfUser, async (req, res) => {
		try {
			const token = req.headers.authorization.split(' ')[1];
			const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
			var ItemsInCart = [];
			var Total = [];
			let cartItems = await cartSer.getUserCartItem(decodedToken.Cart);
			cartItems.forEach((e) => {
				ItemsInCart.push({
					Name: e['Item.Name'],
					Id: e.ItemId,
					Price: e.Price,
					Quantity: e.Quantity,
				});
				Total.push(e.Price * e.Quantity);
			});
			if (Total.length != 0) {
				Total = Total.reduce((acc, curr) => acc + curr);
			} else {
				Total = 0;
			}
			res.status(200).json({
				Cart: {
					CartId: decodedToken.Cart,
					Total: Total,
					ItemsInCart: ItemsInCart,
				},
			});
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: 'Something went wrong with the Cart search.',
			});
		}
	})
	.get('/allcarts', checkIfAdmin, async (req, res) => {
		try {
			let carts = await cartSer.getAllQuery();
			console.log(carts);
			let usersCarts = carts.slice(1);
			let groupedByUser = Object.values(
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
	})
	.delete('/cart/:id', checkIfUser, async (req, res) => {
		let id = req.params.id;
		const token = req.headers.authorization.split(' ')[1];
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
		try {
			if (id) {
				if (id == decodedToken.Cart) {
					await cartSer.deleteAllCartItems(id);
					res.status(200).json({
						message: `All items in cart with id: ${id} were successfully deleted.`,
					});
				} else {
					res.status(400).json({
						message: `Cart with id ${id} isn't yours.`,
					});
				}
			}
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: `Something went wrong with the cart deletion.`,
			});
		}
	});

module.exports = router;
