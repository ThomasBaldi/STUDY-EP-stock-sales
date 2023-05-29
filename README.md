# Stock-control and sales application - EndProject Assignment

Back-end system for a Stock-control and sales system.

## Installation Instructions

1. Download the complete repository as a zip file.
2. Unzip all its content and save in a new directory on your computer.
3. Open the directory in VScode and run "npm install" to make sure that all dependencies are correclty installed.
4. Open mySQL Workbench, start a local instance and run the following code:

```
CREATE USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'P@ssw0rd';
ALTER USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'P@ssw0rd';
GRANT ALL PRIVILEGES ON database_name.* TO 'admin'@'localhost';
```

This will create the user that will interact and have all access to the database of the system. 5. Run `CREATE DATABASE StockSalesDB;` to create the databse/schema. 6. Go back to Vscode, create a .env file at the main branch of the directory(same level as app.js), and copy paste the following variables in it (make sure also to save):

```
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="P@ssw0rd"
DATABASE_NAME= "StockSalesDB"
DIALECT="mysql"
PORT="3000"
HOST="localhost"
TOKEN_SECRET='7bbfda2dc66ae26fb8e3028cbddece55d19514292d048bce237005904b9874703654bf0cd155a4814f13615d9f40f5edb7ee2119c14fd208a3a360c74628eea9'
```

The token secret could be anything, I decided to create a token from the terminal by running node and generating the above token secret with crypto. 7. Now you can run "npm start" in your terminal, this will create all the tables and their relationships in the StockSalesDB database you created earlier. 8. The databse part of the system is now set up and ready for use.
It is set up to respect 3N form and every table has all the required fields, plus createdAt and updatedAt where it makes sense for an Admin User to keep track of such timestamps and will be shown also to the customer where needed.

## Endpoints and system usage:

You can either follow this Postaman documentation here () or the instructions I am adding to this Readme

1. First of all, let's populate the database with the "POST/setup" endpoint.

- It doesn't need a body
- It will create 2 roles, 1 = Admin and 2 = User,
- It then creates a unique Admin user (there's a hook on the user model to reinforce the prevention of any other Admins from being created)
- It then makes a call to the provided Noroff API which is used to store items and categories
- Thereafter, the stored categories are inserted in their db table
- And lastly, the items are inserted in their db table
- These action will only trigger, if items are not already available in the database
- Otherwise, the endpoint will notify that all relevant data is already available in the databse

2. Categories:

- Everyone has access to "GET/categories" (an error response message will be sent should there be any errors)
- Only the Admin can add new categories through "POST/category" with a request body:

```JSON
{ "Name": "TestCategory" }
```

Error messages are given if there is a missing body to the request or if the category already exists.

- Only the Admin can update a category through "PUT/cateogry/:id" with a request body:

```JSON
{ "Name": "UpdatedCategory" }
```

Error messages are in place for, parameter id not matching any category id, body not having any Name spcified, name provided already in use in another category.

- Only the Admin can delete categories through "DELETE/category/:id" by giving the id of such category as a parameter.
  Error messages are in place should the id not match any existing category or be currently in use with any items.

3. Items:

- Everyone has acces to "GET/items" but, as per requirements, guest users will only be able to see in-stock items.
  An error message will be displayed in the response body should there be any issue retrieving all items.
- Only the Admin can add items through "POST/item" with a request body like the following:

```JSON
{
    "Name": "TestItem",
    "Price": 10,
    "SKU": "TR189",
    "Quantity": 100,
    "Image": "https://test.com/test.jpg",
    "Category": 1
}
```

The only optional attribute is the Image one. All other attributes are mandatory.
Checks are made to validate that all attributes provided are either available(category id), meeting format requirements(SKU) or are not already in use on other items (as per the unique constraints of Name and SKU). Should any error happen, a relevant message will be sent in the response body.

- Only the Admin can update an item through "PUT/item/:id" with a request body and by passing an existing item id as a parameter.
  The update is possible with any combination of attribute, could for example be simply a Name change or a PRICE, SKU and Image change, the attributes you add to the request body will be the ones being updated.
  As for the post endpoint, checks are made for validation and error handling with relevant response messages.
- Only the Admin can delete items through "DELETE/item/:id" by giving the id of such item as a parameter.
  Error messages are in place should the id not match any existing item.

4. Signup and Login:

## Testing with Supertest and Jest

## Libraries/Packages Link

```JSON
"dependencies": {
		"axios": "^1.4.0",
		"cookie-parser": "~1.4.4",
		"debug": "~2.6.9",
		"dotenv": "^16.0.3",
		"ejs": "^3.1.9",
		"express": "^4.18.2",
		"http-errors": "~1.6.3",
		"jest": "^29.5.0",
		"jsonwebtoken": "^9.0.0",
		"morgan": "~1.9.1",
		"mysql2": "^3.3.1",
		"sequelize": "^6.31.1",
		"supertest": "^6.3.3",
		"supervisor": "^0.12.0"
	}
```
