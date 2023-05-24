var express = require('express');
var router = express.Router();
var crypto = require('crypto');
const axios = require('axios');
var db = require('../models');
var UserService = require('../services/UserService');
var ItemService = require('../services/Item&CategoryServ');
var userSer = new UserService(db);
var itemSer = new ItemService(db);

router
	.post('/setup', async (req, res, next) => {
		const existRoles = await userSer.getRoles();
		const existsAdmin = await userSer.getOne('Admin');
		const existCategories = await itemSer.getAllCat();
		const existsItems = await itemSer.getAll();
		var items = [];
		var categories = [];
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
		//populate all tables if no data is stored!
		if (
			existRoles.length == 0 ||
			!existsAdmin ||
			existCategories.length == 0 ||
			existsItems.length == 0
		) {
			try {
				//roles
				await userSer.bulkRole();
				//Admin user
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
				//categories
				newCategories.forEach((e) => itemSer.createCat(e.id, e.Name));
				//items
				items.forEach((e) => {
					itemSer.create(
						e.id,
						e.item_name,
						e.price,
						e.sku,
						e.stock_quantity,
						e.img_url,
						e.category
					);
				});
			} catch (err) {
				console.log(err);
				res.status(400).json({ message: 'Something went wrong with the setup.' });
			}
			res.status(200).json({
				message: 'Roles, Admin user, Categories and Items from API are successfully added to DB.',
			});
		} else {
			res.status(300).json({ message: 'All setup data has already been added to DB' });
		}
	})
	.post('/search', async (res, req, next) => {});

module.exports = router;
