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
let noSuchItem = { message: 'There is no such Item to be purchased.' };

router
	.get('/', checkIfUser, async (req, res, next) => {
		try {
			const token = req.headers.authorization.split(' ')[1];
			const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
			let cart = await cartService.getCart(decodedToken.UserId);
			console.log(cart);
			res.status(200).json({
				Cart: {
					id: cart.id,
					Status: cart.Status,
					Total: cart.TotalPrice,
				},
			});
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: 'Something went wrong with the Cart search.',
			});
		}
	})
	.get('/allcarts', checkIfAdmin, async (req, res, next) => {})
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
					let itemIsInCart = await cartService.getCartItemByItem(id);
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
						let itemIsInCart = await cartService.getCartItemByItem(item.id);
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
	.put('/cart_item/:id', checkIfUser, async (req, res, next) => {})
	.delete('/:id', checkIfUser, async (req, res, next) => {})
	.delete('/cart_item/:id', checkIfUser, async (req, res, next) => {});

module.exports = router;
