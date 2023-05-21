var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var ItemService = require('../services/Item&CategoryServ');
var itemService = new ItemService(db);
var CartService = require('../services/Cart&CartItemServ');
var cartService = new CartService(db);

var { checkIfAdmin, checkIfUser } = require('../models/middleware/authMiddleware');

let itemToCart = { message: 'The item was added to your cart.' };
let itemAlready = { message: 'This item is already in your cart.' };
let noSuchItem = { message: 'There is no such item to be purchased.' };
let noSuchItemInCart = { message: 'There is no such item in your cart.' };

router
	.get('/', checkIfUser, async (req, res, next) => {
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
					Price: e['Item.Price'],
					Quantity: e.Quantity,
				});
				cart.Total.push(e['Item.Price']);
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
	.get('/allcarts', checkIfAdmin, async (req, res, next) => {
		try {
			let carts = await cartService.getAllCarts();

			groupedUsers = Object.values(
				carts.reduce((a, c) => {
					a[c['User.Username']] = a[c['User.Username']] || [];
					a[c['User.Username']].push(c);
					return a;
				}, {})
			);

			var finalArray = [];
			groupedUsers.forEach((e) => {
				e.Cart = {
					Username: e[0]['User.Username'],
					CartId: e[0].id,
					Status: e[0].Status,
					Items: [],
				};
				e.forEach((x) => {
					Item = {
						ItemName: x['ItemCarts.Item.Name'],
						ItemId: x['ItemCarts.Item.id'],
						Price: x['ItemCarts.Item.Price'],
						Quantity: x['ItemCarts.Quantity'],
					};
					e.Cart.Items.push(Item);
				}),
					finalArray.push(e.Cart);
			});
			console.log(groupedUsers[0].Cart);
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
	.post('/cart_item', checkIfUser, async (req, res, next) => {
		let { id, Name } = req.body;
		const token = req.headers.authorization.split(' ')[1];
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
		let cart = await cartService.getCart(decodedToken.UserId);
		if (!id && !Name) {
			res.status(400).json({
				message: 'Either Name or id of the item you want to add to the cart must be provided.',
			});
		} else {
			try {
				if (id) {
					let item = await itemService.getOneById(id);
					let itemIsInCart = await cartService.getCartItemByItem(cart.id, id);
					if (item) {
						if (!itemIsInCart) {
							cartService.createCartItem(cart.id, id);
							res.status(200).json(itemToCart);
						} else {
							res.status(400).json(itemAlready);
						}
					} else {
						res.status(400).json(noSuchItem);
					}
				} else if (Name) {
					let item = await itemService.getOne(Name);
					if (item) {
						let itemIsInCart = await cartService.getCartItemByItem(cart.id, item.id);
						if (!itemIsInCart) {
							cartService.createCartItem(cart.id, item.id);
							res.status(200).json(itemToCart);
						} else {
							res.status(400).json(itemAlready);
						}
					} else {
						res.status(400).json(noSuchItem);
					}
				}
			} catch (err) {
				console.log(err);
				res.status(400).json({
					message: 'Something went wrong with the Cart search.',
				});
			}
		}
	})
	.put('/cart_item/:id', checkIfUser, async (req, res, next) => {
		let quant = req.body.Quantity;
		let id = req.params.id;
		const token = req.headers.authorization.split(' ')[1];
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
		let cart = await cartService.getCart(decodedToken.UserId);
		if (!quant) {
			res.status(400).json({
				message: 'A new quantity for the item must be provided.',
			});
		} else {
			try {
				if (id) {
					let itemIsInCart = await cartService.getCartItemByItem(cart.id, id);
					let itemStock = await itemService.getOneById(id);
					if (!itemIsInCart) {
						res.status(400).json(noSuchItemInCart);
					} else {
						if (itemStock.Quantity >= quant) {
							cartService.updateQuantity(id, cart.id, quant);
							res.status(200).json({
								message: `Quantity for item with id ${id} was successfully updated to ${quant}.`,
							});
						} else {
							res.status(400).json({
								message: `There's not enough stock, total available quantity is ${itemStock.Quantity}`,
							});
						}
					}
				}
			} catch (err) {
				console.log(err);
				res.status(400).json({
					message: 'Something went wrong with the cart item search.',
				});
			}
		}
	})
	.delete('/cart_item/:id', checkIfUser, async (req, res, next) => {
		let id = req.params.id;
		const token = req.headers.authorization.split(' ')[1];
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
		let cart = await cartService.getCart(decodedToken.UserId);
		try {
			if (id) {
				let itemIsInCart = await cartService.getCartItemByItem(cart.id, id);
				if (!itemIsInCart) {
					res.status(400).json(noSuchItemInCart);
				} else {
					cartService.deleteCartItem(id, cart.id);
					res.status(200).json({
						message: `Item with id ${id} was successfully deleted from your cart.`,
					});
				}
			}
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: 'Something went wrong with the cart item search.',
			});
		}
	})
	.delete('/:id', checkIfUser, async (req, res, next) => {});

module.exports = router;
