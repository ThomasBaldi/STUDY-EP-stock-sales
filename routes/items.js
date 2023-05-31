var express = require('express');
var router = express.Router();
var db = require('../models');
var ItemService = require('../services/Item&CategoryServ');
var itemSer = new ItemService(db);
var { checkIfAdmin } = require('../models/middleware/authMiddleware');

let idMsg = { message: 'There is no item matching such Id.' };
let nameMsg = { message: 'Item name already exists.' };
let priceMsg = { message: 'Price must be a number.' };
let skuMsg = { message: 'Item SKU already exists in another item.' };
let regMsg = { message: 'SKU has to be 2 capital letters and 3 numbers.' };
let categoryMsg = { message: 'Category id does not exist.' };
let quantityMsg = { message: 'Quantity is either missing or set to 0.' };

let skuRegex = /^[A-Z]{2}\d{3}$/;

router
	.get('/items', async (req, res, next) => {
		try {
			let allItems = await itemSer.getAll();
			var availableItems = [];
			allItems.forEach((e) => {
				if (e.Status == 'in-stock') {
					availableItems.push(e);
				}
			});
			//Guest Users can only view in-stock items. (items catalogue rule)
			if (req.headers.authorization == undefined) {
				res.status(200).json({
					message: 'All available items!',
					Items: availableItems,
				});
				//rest can see them all (items endpoints rule)
			} else if ((token = req.headers.authorization.split(' ')[1])) {
				res.status(200).json({
					message: 'All available items!',
					Items: allItems,
				});
			}
		} catch (err) {
			console.log(err);
			res.status(400).json('Something went wrong while retrieving the items.');
		}
	})
	.post('/item', checkIfAdmin, async (req, res, next) => {
		let { Name, Price, SKU, Quantity, Image, Category } = req.body;
		let nameExists = await itemSer.itemByName(Name);
		let skuExists = await itemSer.getSKU(SKU);
		let categoryExists = await itemSer.catById(Category);
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
			itemSer.createNew(Name, Price, SKU, Quantity, Image, Category);
			res.status(200).json({
				message: `${Name} was successfully added to the items list.`,
			});
		}
	})
	.put('/item/:id', checkIfAdmin, async (req, res, next) => {
		let { Name, Price, SKU, Quantity, Category } = req.body;
		let id = req.params.id;
		let nameExists;
		let skuExists;
		let categoryExists;
		let idExists = await itemSer.itemById(id);
		//since they depend on which attribute is sent
		if (Name) {
			nameExists = await itemSer.itemByName(Name);
		}
		if (SKU) {
			skuExists = await itemSer.getSKU(SKU);
		}
		if (Category) {
			categoryExists = await itemSer.catById(Category);
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
				} else if (SKU && !SKU.match(skuRegex)) {
					res.status(400).json(regMsg);
				} else if (Category && !categoryExists) {
					res.status(400).json(categoryMsg);
				} else if (Quantity <= 0) {
					res.status(400).json(quantityMsg);
				} else {
					itemSer.updateItem(id, req.body);
					res.status(200).json({
						message: `Item with id: ${id} was successfully updated.`,
					});
				}
			}
		} else {
			res.status(400).json(idMsg);
		}
	})
	.delete('/item/:id', checkIfAdmin, async (req, res, next) => {
		let id = req.params.id;
		let idExists = await itemSer.itemById(id);
		if (idExists) {
			itemSer.deleteItem(id);
			res.status(200).json({
				message: `Item with id ${id} was successfully deleted.`,
			});
		} else {
			res.status(400).json(idMsg);
		}
	});

module.exports = router;
