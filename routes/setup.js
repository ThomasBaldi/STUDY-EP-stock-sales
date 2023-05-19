var express = require('express');
var router = express.Router();
var crypto = require('crypto');
const axios = require('axios');
var db = require('../models');
var UserService = require('../services/UserService');
var ItemService = require('../services/ItemService');
var userService = new UserService(db);
var itemService = new ItemService(db);

router.post('/', async (req, res, next) => {
	const existRoles = await userService.getRoles();
	const existsAdmin = await userService.getOne('Admin');
	const existCategories = await itemService.getAllCat();
	const existsItems = await itemService.getAll();
	var items = [];
	var categories = [];

	//get the data and add push it to the arrays
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
		return { name: name, id: id + 1 };
	});

	//switch categoryName with categoryId
	items.map((e) => {
		var result = newCategories.filter((x) => x.name == e.category);
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
			userService.createRole('Admin');
			userService.createRole('User');

			//Admin user
			let salt = crypto.randomBytes(16);
			crypto.pbkdf2('P@ssword2023', salt, 310000, 32, 'sha256', (err, hash) => {
				if (err) throw new Error('Internal Server Error');
				try {
					userService.createAdmin('Admin', hash, 'admin@admin.com', salt);
				} catch (err) {
					console.log(err);
					res.status(400);
				}
			});

			//categories
			newCategories.forEach((e) => itemService.createCat(e.id, e.name));

			//items
			items.forEach((e) => {
				itemService.create(
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
			message: 'Roles, Admin user, Categories and Items from API are succesfully added to DB.',
		});
	} else {
		res.status(300).json({ message: 'All setup data has already been added to DB' });
	}
});

module.exports = router;
