var express = require('express');
var router = express.Router();
var db = require('../models');
var ItemService = require('../services/ItemService');
var itemService = new ItemService(db);

router.get('/', async (req, res, next) => {
	let allItems = await itemService.getAll();

	var items = [];
	allItems.forEach((e) =>
		items.push({
			name: e.Name,
			category: e['Category.name'],
			price: e.Price,
		})
	);

	console.log(items);

	res.status(200).json({
		message: 'All available items!',
		Items: items,
	});
});

module.exports = router;
