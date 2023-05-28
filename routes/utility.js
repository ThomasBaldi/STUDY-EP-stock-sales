var express = require('express');
var router = express.Router();
var crypto = require('crypto');
const axios = require('axios');
var db = require('../models');
var UserService = require('../services/UserService');
var ItemService = require('../services/Item&CategoryServ');
var userSer = new UserService(db);
var itemSer = new ItemService(db);

let atLeast = { message: 'At least one character must be provided on search parameters.' };
let noRes = { ItemsResult: 'No results available.' };

router
	.post('/setup', async (req, res, next) => {
		const existRoles = await userSer.getRoles();
		const existsAdmin = await userSer.getOne('Admin');
		const existCategories = await itemSer.getAllCat();
		const existsItems = await itemSer.getAll();
		var items = [];
		var categories = [];
		//populate all tables if no data is stored!
		if (
			existRoles.length == 0 ||
			!existsAdmin ||
			existCategories.length == 0 ||
			existsItems.length == 0
		) {
			try {
				//get the data and push it to the arrays
				await axios.get('http://143.42.108.232:8888/items/stock').then((res) => {
					//items array
					let data = res.data.data;
					data.forEach((e) => items.push(e));
					//category array
					data.forEach((e) => {
						if (!categories.includes(e.category)) {
							categories.push(e.category);
						}
					});
				});
				//create objects array of the strings array
				let newCategories = categories.map((name, id = 1) => {
					return { Name: name, id: id + 1 };
				});
				//switch categoryName with categoryId
				items.map((e) => {
					var result = newCategories.filter((x) => x.Name == e.category);
					if (result.length > 0) {
						e.category = result[0].id;
					}
					return e;
				});
				//populate roles
				await userSer.bulkRole();
				//insert Admin user
				let salt = crypto.randomBytes(16);
				crypto.pbkdf2('P@ssword2023', salt, 310000, 32, 'sha256', (err, hash) => {
					if (err) throw new Error('Internal Server Error');
					try {
						userSer.createAdmin('Admin', hash, 'admin@admin.com', salt);
					} catch (err) {
						console.log(err);
						res.status(400).json({
							message: 'Something went wrong with the Admin creation.',
						});
					}
				});
				//populate categories
				newCategories.forEach(async (e) => await itemSer.createCat(e.id, e.Name));
				//populate items
				items.forEach(async (e) => {
					await itemSer.create(
						e.id,
						e.item_name,
						e.price,
						e.sku,
						e.stock_quantity,
						e.img_url,
						e.category
					);
				});
				res.status(200).json({
					message: 'Roles, Admin user, Categories and Items from API are successfully added to DB.',
				});
			} catch (err) {
				console.log(err);
				res.status(400).json({ message: 'Something went wrong with the setup.' });
			}
		} else {
			res.status(300).json({ message: 'All setup data has already been added to DB' });
		}
	})
	.post('/search', async (req, res, next) => {
		let { Items, SKU, Categories } = req.body;
		let string = /^.*[a-zA-Z0-9]+.*$/;
		let skuRegex = /^[A-Z]{2}\d{3}$/;
		if (!req.body) {
			res.status(200).json({
				Search: result,
			});
		} else {
			try {
				if (!string.test(Items)) {
					res.status(400).json(atLeast);
				} else if (!string.test(Categories)) {
					res.status(400).json(atLeast);
				} else if (!string.test(Items)) {
					res.status(400).json(atLeast);
				} else {
					if (Items && !Categories) {
						//case insensitive partial item name
						let result = await itemSer.searchItems(Items);
						if (result.length <= 0) {
							res.status(400).json(noRes);
						}
						res.status(200).json({ ItemsResult: result });
					}
					if (Categories && !Items) {
						//specific category name
						let result = await itemSer.searchCat(Categories);
						if (result.length <= 0) {
							res.status(400).json(noRes);
						}
						res.status(200).json({ CategoryResult: result });
					}
					if (SKU) {
						if (!SKU.match(skuRegex)) {
							res.status(200).json({
								message: 'SKU has to be 2 upperCase letters and 3 numbers.',
							});
						} else {
							//specific SKU
							let result = await itemSer.searchSKU(SKU);
							res.status(200).json({ ItemsSKUresult: result });
						}
					}
					if (Items && Categories) {
						//Search for a partial item_name for a specific category name
						let cat = await itemSer.catByName(Categories);
						if (!cat) {
							res.status(200).json({ message: 'No category matches your search parameter' });
						} else {
							let result = await itemSer.searchItemCat(Items, cat.id);
							res.status(200).json({ ItemsWithCategory: result });
						}
					}
				}
			} catch (err) {
				console.log(err);
				res.status(400).json({ message: 'Something went wrong with the search request.' });
			}
		}
	});

module.exports = router;
