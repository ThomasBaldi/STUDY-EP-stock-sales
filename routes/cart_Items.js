var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var ItemService = require('../services/Item&CategoryServ');
var itemService = new ItemService(db);
var CartService = require('../services/Cart&CartItemServ');
var cartService = new CartService(db);

var { checkIfUser } = require('../models/middleware/authMiddleware');

let itemToCart = { message: 'The item was added to your cart.' };
let itemAlready = { message: 'This item is already in your cart.' };
let noSuchItem = { message: 'There is no such item to be purchased.' };
let noSuchItemInCart = { message: 'There is no such item in your cart.' };

router
	.post('/', checkIfUser, async (req, res, next) => {
		let body = req.body;
		const token = req.headers.authorization.split(' ')[1];
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
		let cart = await cartService.getCart(decodedToken.UserId);
		if (!body) {
			res.status(400).json({
				message: 'Either Name or id of the item you want to add to the cart must be provided.',
			});
		} else {
			try {
				let item = await itemService.getItem(body);
				if (item) {
					let cartItem = await cartService.getOrCreateItem(cart.id, item.id, item.Price);
					if (cartItem[1] == true) {
						res.status(200).json(itemToCart);
					}
					if (cartItem[1] == false) {
						res.status(400).json(itemAlready);
					}
				} else {
					res.status(400).json(noSuchItem);
				}
			} catch (err) {
				console.log(err);
				res.status(400).json({
					message: 'Something went wrong with the Cart search.',
				});
			}
		}
	})
	.put('/:id', checkIfUser, async (req, res, next) => {
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
	.delete('/:id', checkIfUser, async (req, res, next) => {
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
				message: 'Something went wrong with the cart item deletion.',
			});
		}
	});

module.exports = router;
