var express = require('express');
var router = express.Router();
var db = require('../models');
var ItemService = require('../services/Item&CategoryServ');
var itemService = new ItemService(db);
var { checkIfAdmin } = require('../models/middleware/authMiddleware');

let idMsg = { message: 'There is no item matching such Id.' };
let nameMsg = { message: 'Item name already exists.' };
let priceMsg = { message: 'Price must be a number.' };
let skuMsg = { message: 'Item SKU already exists.' };
let regMsg = { message: 'SKU has to be 2 capital letters and 3 numbers.' };
let categoryMsg = { message: 'Category id does not exist.' };
let quantityMsg = { message: 'Quantity is either missing or set to 0.' };

let skuRegex = /^[A-Z]{2}\d{3}$/;

router
	.get('/', async (req, res, next) => {
		try {
			let allItems = await itemService.getAll();
			var items = [];
			allItems.forEach((e) =>
				items.push({
					name: e.Name,
					category: e['Category.name'],
					price: e.Price,
				})
			);
			res.status(200).json({
				message: 'All available items!',
				Items: items,
			});
		} catch (err) {
			console.log(err);
			res.status(400).json('Something went wrong with the request.');
		}
	})
	.post('/', checkIfAdmin, async (req, res, next) => {
		let { Name, Price, SKU, Quantity, Image, Category } = req.body;
		let nameExists = await itemService.getOne(Name);
		let skuExists = await itemService.getSKU(SKU);
		let categoryExists = await itemService.getOneCat(Category);
		if (!Name || !Price || !SKU || !Category) {
			res.status(400).json({
				message: 'One or more mandatory fields are missing.',
			});
		}
		if (nameExists) {
			res.status(400).json(nameMsg);
		} else if (typeof Price == 'string') {
			res.status(400).json(priceMsg);
		} else if (skuExists) {
			res.status(400).json(skuMsg);
		} else if (!SKU.match(skuRegex)) {
			res.status(400).json(regMsg);
		} else if (!categoryExists) {
			res.status(400).json(categoryMsg);
		} else if (!Quantity || Quantity <= 0) {
			res.status(400).json(quantityMsg);
		} else {
			itemService.createNew(Name, Price, SKU, Quantity, Image, Category);
			res.status(200).json({
				message: `${Name} is succesfully added to the items list.`,
			});
		}
	})
	.put('/:id', checkIfAdmin, async (req, res, next) => {
		let { Name, Price, SKU, Quantity, Image, Category } = req.body;
		let id = req.params.id;
		let nameExists;
		let skuExists;
		let categoryExists;
		let idExists = await itemService.getOneById(id);
		//since they depend on which attribute is sent
		if (Name) {
			nameExists = await itemService.getOne(Name);
		}
		if (SKU) {
			skuExists = await itemService.getSKU(SKU);
		}
		if (Category) {
			categoryExists = await itemService.getOneCat(Category);
		}
		//when id exists, validate req.body and attributes and then update
		if (idExists) {
			if (!req.body) {
				res.status(400).json({
					message: 'At least one field to be updated must be provided.',
				});
			} else {
				if (nameExists) {
					res.status(400).json(nameMsg);
				} else if (typeof Price == 'string') {
					res.status(400).json(priceMsg);
				} else if (skuExists) {
					res.status(400).json(skuMsg);
				} else if (!SKU.match(skuRegex)) {
					res.status(400).json(regMsg);
				} else if (Category && !categoryExists) {
					res.status(400).json(categoryMsg);
				} else if (Quantity <= 0) {
					res.status(400).json(quantityMsg);
				} else {
					itemService.updateItem(id, req.body);
					res.status(200).json({
						message: `Item with id: ${id} was succesfully updated.`,
					});
				}
			}
		} else {
			res.status(400).json(idMsg);
		}
	})
	.delete('/:id', checkIfAdmin, async (req, res, next) => {
		let id = req.params.id;
		let idExists = await itemService.getOneById(id);
		if (idExists) {
			itemService.delete(id);
			res.status(200).json({
				message: `Item with id ${id} was succesfully deleted.`,
			});
		} else {
			res.status(400).json(idMsg);
		}
	});

module.exports = router;
