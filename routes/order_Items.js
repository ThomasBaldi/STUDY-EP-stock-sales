var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var UserService = require('../services/UserService');
var OrderService = require('../services/Order&OrderItemServ');
var ItemService = require('../services/Item&CategoryServ');
var CartService = require('../services/Cart&CartItemServ');
var userSer = new UserService(db);
var orderSer = new OrderService(db);
var itemSer = new ItemService(db);
var cartSer = new CartService(db);

var { checkIfAdmin, checkIfUser } = require('../models/middleware/authMiddleware');

router
	/* this endpoint has 2 methods of use:
	it can be used through POST/cart/checkout which has a Post request within it.
	that endpoint creates an order and sends a post request for each item that is 
	in the users cart.
	
	otherwise I've implemented the requested endpoint functionalities, 
	but its specifications didn't consider the implication of 
	having an order	being created for each call, and then adding an orderItem with 
	such order id. Basically creating a new order for each item in the cart.
	The workaround I came up with was to have only a restriction to 1 order per customer
	with an "in-progress" status.
	furthermore, I don't believe this to be a very thought-through request of a checkout 
	system, it has an excess of complexity added to it that really isn't needed.
	It could and should have easily been a POST/order/:cartId (or even just POST/order)
	that automatically creates one order and an itemorder for each 
	cart item (with same orderId)
	 */
	.post('/:id', checkIfUser, async (req, res, next) => {
		const token = req.headers.authorization.split(' ')[1];
		const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
		let cart = decodedToken.Cart;
		//accept either the post body from /checkout or the Item from
		//a single direct request
		/* let { body } = req.body; */
		//automatic post request from within checkout endpoint
		if (req.body.body) {
			let { body } = req.body;
			//create the order item
			await orderSer.createOrderItem(body.Item);
			//delete cart items once orderItems are created
			await cartSer.deleteAllCartItems(cart);
			//change item stock quantities
			let item = await itemSer.itemById(body.Item.ItemId);
			let quant = { Quantity: item.Quantity - body.Item.Quantity };
			if (quant.Quantity == 0) {
				quant.Status = 'out-of-stock';
			}
			await itemSer.updateItem(body.Item.ItemId, quant);
		}
		//in case one would really add ane orderItem at the time with a direct request
		//to this endpoint instead of using the automatic (check-them-all-out)
		//POST/cart/checkout endpoint...
		else {
			let paramId = req.params.id;
			var Total = [];
			let cartItems = await cartSer.getAll(cart);
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
			cartItems.forEach(async (e) => {
				Total.push(e['CartItems.Price'] * e['CartItems.Quantity']);
			});
			//check stock availability
			var lowStock = [];
			await Promise.all(
				cartItems.map(async (e) => {
					let item = await itemSer.getLowQuantItem(e['CartItems.Item.id'], e['CartItems.Quantity']);
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
				//check that id is in cart
				let isInCart = cartItems.find((i) => {
					if (i['CartItems.Item.id'] == paramId) return i;
				});
				//else handle the error
				if (!isInCart) {
					res.status(400).json({ message: 'The item is not in your cart.' });
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
					//create orderId
					let UserId = decodedToken.UserId;
					let orderInPro = await orderSer.getUserOrderInPro(UserId);
					if (!orderInPro) {
						orderInPro = await orderSer.createOrder(UserId, Total);
					}
					//create oorderItem
					let orderItem = {
						Name: isInCart['CartItems.Item.Name'],
						Quantity: isInCart['CartItems.Quantity'],
						Price: isInCart['CartItems.Price'],
						ItemId: isInCart['CartItems.Item.id'],
						OrderId: orderInPro.id,
					};
					await orderSer.createOrderItem(orderItem);
					//change stock quantity
					let item = await itemSer.itemById(paramId);
					let quant = { Quantity: item.Quantity - orderItem.Quantity };
					if (quant.Quantity == 0) {
						quant.Status = 'out-of-stock';
					}
					await itemSer.updateItem(paramId, quant);
					//delete cartitem from cart
					await cartSer.deleteCartItem(paramId, cart);
					//then check if cart is empty
					let itemsStillIn = await cartSer.getUserCartItem(cart);
					//if yes send res with total and discount if applicable
					if (itemsStillIn.length === 0) {
						res.status(200).json({
							message: 'Cart has been checked-out and order is placed!',
							OrderId: orderInPro.id,
							TotalPrice: Total,
							Discount: Discount,
							FinalPrice: FinalTotal,
						});
					} else {
						//else send item is added to order...
						res.status(200).json({
							message: `OrderItem has been added to Order ${orderInPro.id}!`,
						});
					}
				}
			}
		}
	})
	.put('/:id', checkIfAdmin, async (req, res, next) => {
		//update order status
		let orderId = req.params.id;
		let Status = req.body.Status;
		let statusVals = /in-process|complete|cancelled/;
		try {
			if (!Status) {
				res.status(200).json({
					message: `A status wasn't provided in your request.`,
				});
			} else if (!statusVals.test(Status)) {
				res.status(200).json({
					message: `Status can be only one of these types: in-process / complete / cancelled`,
				});
			} else {
				await orderSer.statusUpdate(orderId, Status);
				//restore item quantity if order gets cancelled
				if (Status === 'cancelled') {
					let itemsOrder = await orderSer.getAllOrderItems(orderId);
					itemsOrder.forEach(async (e) => {
						let item = await itemSer.itemById(e['OrderItems.id']);
						let body = { Quantity: item.Quantity + e['OrderItems.quant'] };
						await itemSer.updateItem(item.id, body);
					});
				}
				res.status(200).json({
					message: `Order with id ${orderId} was successfully updated to ${Status}`,
				});
			}
		} catch (err) {
			console.log(err);
			res.status(400).json({
				message: 'Something went wrong during order status update.',
			});
		}
	});
module.exports = router;
