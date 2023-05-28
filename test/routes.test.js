const express = require('express');
const request = require('supertest');
const app = express();
var db = require('../models');
var UserService = require('../services/UserService');
var userSer = new UserService(db);

/* const { save } = require('./save_json'); */
var authRouter = require('../routes/auth');
var utilityRouter = require('../routes/utility');
var itemsRouter = require('../routes/items');
var categoriesRouter = require('../routes/categories');

app.use(express.json());
app.use('/', authRouter);
app.use('/', utilityRouter);
app.use('/', itemsRouter);
app.use('/', categoriesRouter);

rewriteTables = async () => {
	await db.sequelize.sync({ force: true });
};

describe('testing-API-ednpoints', () => {
	//1 post /setup endpoint Checks if database is populated,
	//makes API call to Noroff API, and populates empty database.
	test('POST /setup - success', async () => {
		//empty database by calling the rewriting of tables
		await rewriteTables();
		const res = await request(app).post('/setup').send();
		expect(res.status).toBe(200);
		expect(res.body).toEqual({
			message: 'Roles, Admin user, Categories and Items from API are successfully added to DB.',
		});
	});
	//2 post /signup endpoint – registers a new user.
	test('POST /signup - success', async () => {
		let user = { Username: 'TestUser', Password: 'test123', Email: 'test@test.com' };
		const res = await request(app).post('/signup').send(user);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('message');
		expect(res.body.message).toEqual('User with Username: TestUser was successfully created.');
	});
	//store token
	var token;
	//3 post /login - use the token from the user created in test 1.
	//tokens wouldn't be of any good use upon registration... especially as they expire
	//token are set to be created and delivered in respons of a successful login instead
	test('POST /login - success', async () => {
		let admin = { Username: 'Admin', Password: 'P@ssword2023' };
		const res = await request(app).post('/login').send(admin);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('message');
		expect(res.body.message).toEqual(`You are now logged in!`);
		expect(res.body).toHaveProperty('data');
		expect(res.body.data).toHaveProperty('token');
		token = res.body.data.token;
		return token;
	});
	//4 post /category - create a new category with the name CAT_TEST.
	test('POST /category - success', async () => {
		let category = { Name: 'CAT_TEST' };
		const res = await request(app)
			.post('/category')
			.set('Authorization', 'Bearer ' + token)
			.send(category);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('message');
		expect(res.body.message).toEqual('CAT_TEST was successfully added to the categories list.');
	});
	//5 post /item - create a new item with the CAT_TEST category
	//and the ITEM_TEST item name.
	test('POST /item - success', async () => {
		let item = {
			Name: 'ITEM_TEST',
			Price: 10,
			SKU: 'FT789',
			Quantity: 20,
			Image: 'https://test.com/test.jpg',
			Category: 9,
		};
		const res = await request(app)
			.post('/item')
			.set('Authorization', 'Bearer ' + token)
			.send(item);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('message');
		expect(res.body.message).toEqual('ITEM_TEST was successfully added to the items list.');
	});
	//6 post /search - search for items with the text “mart“ in the item name
	//(three items should be returned from the initial data).
	test('POST /search items "mart"- success', async () => {
		let search = {
			Items: 'mart',
		};
		let results = [
			{
				id: 132,
				Name: 'Smartphone',
				Price: 500,
				Status: 'in-stock',
				SKU: 'EL123',
				Quantity: 10,
				Image: 'http://example.com/image/Smartphone.jpg',
				'Category.Name': 'Electronics',
			},
			{
				id: 135,
				Name: 'Smartwatch',
				Price: 300,
				Status: 'in-stock',
				SKU: 'EL125',
				Quantity: 8,
				Image: 'http://example.com/image/Smartwatch.jpg',
				'Category.Name': 'Electronics',
			},
			{
				id: 156,
				Name: 'Smart Watch',
				Price: 150,
				Status: 'in-stock',
				SKU: 'EL133',
				Quantity: 20,
				Image: 'http://example.com/image/Smart Watch.jpg',
				'Category.Name': 'Electronics',
			},
		];

		const res = await request(app).post('/search').send(search);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('ItemsResult');
		expect(res.body.ItemsResult).toEqual(results);
	});
	//7 post /search – search for all items with the category name "Electronics"
	//and item name “Laptop” (one item should be returned from the initial data).
	test('POST /search item "Laptop" with category "Electronics"- success', async () => {
		let search = {
			Items: 'Laptop',
			Categories: 'Electronics',
		};
		let results = [
			{
				id: 142,
				Name: 'Laptop',
				Price: 1000,
				Status: 'in-stock',
				SKU: 'EL126',
				Quantity: 6,
				Image: 'http://example.com/image/Laptop.jpg',
				'Category.Name': 'Electronics',
			},
		];
		const res = await request(app).post('/search').send(search);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('ItemsWithCategory');
		expect(res.body.ItemsWithCategory).toEqual(results);
	});
	//8 Test the Admin user endpoints with the user created in test 1
	//(at least 3 endpoints should be tested).
	test('PUT /item name, PUT /item price and quantity PUT/category name - success', async () => {
		let newName = {
			Name: 'PROVA_PROVA',
		};
		let newPrice = {
			Price: 100,
			Quantity: 2000,
		};
		let newCatName = {
			Name: 'Fottetevi',
		};
		//test update of item name
		const res = await request(app)
			.put('/item/161')
			.set('Authorization', 'Bearer ' + token)
			.send(newName);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('message');
		expect(res.body.message).toEqual('Item with id: 161 was successfully updated.');
		//test update of item price
		const res2 = await request(app)
			.put('/item/161')
			.set('Authorization', 'Bearer ' + token)
			.send(newPrice);
		expect(res2.status).toBe(200);
		expect(res2.body).toHaveProperty('message');
		expect(res2.body.message).toEqual('Item with id: 161 was successfully updated.');
		//test update of category name
		const res3 = await request(app)
			.put('/category/9')
			.set('Authorization', 'Bearer ' + token)
			.send(newCatName);
		expect(res3.status).toBe(200);
		expect(res3.body).toHaveProperty('message');
		expect(res3.body.message).toEqual('Category with id: 9 was successfully updated to Fottetevi.');
	});
	//9 Delete all the values added to the database in the previous tests
	//(CAT_TEST, ITEM_TEST, and the user created).
	test('DELETE /item/:id, DELETE /category/:id - success', async () => {
		const res = await request(app)
			.delete('/item/161')
			.set('Authorization', 'Bearer ' + token);
		expect(res.status).toBe(200);
		expect(res.body).toHaveProperty('message');
		expect(res.body.message).toEqual('Item with id 161 was successfully deleted.');
		const res2 = await request(app)
			.delete('/category/9')
			.set('Authorization', 'Bearer ' + token);
		expect(res2.status).toBe(200);
		expect(res2.body).toHaveProperty('message');
		expect(res2.body.message).toEqual('Category with id 9 was successfully deleted.');
		//as there is no delete user endpoint requested in the setup of the document,
		//this isn't a real endpoint test, but I'll delete the user, just to meet this
		//missplaced requirement
		await userSer.deleteUser('TestUser');
	});
	//10 post /setup endpoint - Test must be run again, but should not make the API call
	//or populate the database.Should return relevant message.
	//(api call happens only if there is no data, so the res returns 300 and a message)
	test('POST /setup with no API call - success', async () => {
		const res = await request(app).post('/setup').send();
		expect(res.status).toBe(300);
		expect(res.body).toEqual({
			message: 'All setup data has already been added to DB',
		});
	});
});
