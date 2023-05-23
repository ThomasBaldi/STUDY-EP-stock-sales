var express = require('express');
var router = express.Router();
var db = require('../models');
var ItemService = require('../services/Item&CategoryServ');
var itemService = new ItemService(db);
var { checkIfAdmin } = require('../models/middleware/authMiddleware');

let nameMsg = { message: 'Category with such name already exists.' };
let categoryMsg = { message: 'Category id does not exist.' };
let categoryNameMsg = { message: 'A new category name must be provided.' };

router
	.get('/categories', async (req, res, next) => {
		try {
			let allCategories = await itemService.getAllCat();
			res.status(200).json({
				message: 'All available categories!',
				Categories: allCategories,
			});
		} catch (err) {
			console.log(err);
			res.status(400).json('Something went wrong with the request.');
		}
	})
	.post('/category', checkIfAdmin, async (req, res, next) => {
		let Name = req.body.Name;
		if (!Name) {
			res.status(400).json(categoryNameMsg);
		} else {
			let newCat = await itemService.findOrCreateCat(Name);
			if (newCat[1] == true) {
				res.status(200).json({
					message: `${Name} was successfully added to the categories list.`,
				});
			} else if (newCat[1] == false) {
				res.status(400).json(nameMsg);
			}
		}
	})
	.put('/category/:id', checkIfAdmin, async (req, res, next) => {
		let Name = req.body.Name;
		let id = req.params.id;
		let nameExists = await itemService.catByName(Name);
		let idExists = await itemService.catById(id);
		if (idExists) {
			if (!Name) {
				res.status(400).json(categoryNameMsg);
			} else {
				if (nameExists) {
					res.status(400).json(nameMsg);
				} else {
					itemService.updateCat(id, Name);
					res.status(200).json({
						message: `Category with id: ${id} was successfully updated to ${Name}.`,
					});
				}
			}
		} else {
			res.status(400).json(categoryMsg);
		}
	})
	.delete('/category/:id', checkIfAdmin, async (req, res, next) => {
		let id = req.params.id;
		let idExists = await itemService.catById(id);
		let categoryInUse = await itemService.getAllByCat(id);
		if (idExists) {
			if (categoryInUse.length == 0) {
				itemService.deleteCat(id);
				res.status(200).json({
					message: `Category with id ${id} was successfully deleted.`,
				});
			} else {
				res.status(400).json({
					message: 'Error! Category belongs to available items.',
				});
			}
		} else {
			res.status(400).json(categoryMsg);
		}
	});

module.exports = router;
