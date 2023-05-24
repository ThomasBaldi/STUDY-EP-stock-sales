var express = require('express');
var router = express.Router();
var db = require('../models');
var jwt = require('jsonwebtoken');
var OrderService = require('../services/Order&OrderItemServ');
var orderSer = new OrderService(db);
var { checkIfAdmin } = require('../models/middleware/authMiddleware');

router
	.post('/:id', async (req, res, next) => {})
	.put('/:id', checkIfAdmin, async (req, res, next) => {
		//create order id
		//bulk create orderitems
	});
module.exports = router;
