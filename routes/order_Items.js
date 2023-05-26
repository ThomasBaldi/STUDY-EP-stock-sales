var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var OrderService = require('../services/Order&OrderItemServ');
var orderSer = new OrderService(db);
var { checkIfAdmin, checkIfUser } = require('../models/middleware/authMiddleware');

router
	.post('/:id', checkIfUser, async (req, res, next) => {
		//paste order id
		let orederId = req.params.id;
		let { id, Quantity } = req.body;
		//check if quantity is available
		//add item to order if order isn't completed
		//add costs for item * quantity to order
		//subtract quantity from available items
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
