# Stock-control and sales application - EP Assignment

Back-end system for a Stock-control and sales system.

## Installation Instructions

1. Download the complete repository as a zip file.
2. Unzip all its content and save it in a new directory on your computer.
3. Open the directory in VScode and run "npm install" to make sure that all dependencies are correclty installed and up to date.
4. Open mySQL Workbench, start a local instance and run the following querries:

```
CREATE USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'P@ssw0rd';
ALTER USER 'admin'@'localhost' IDENTIFIED WITH mysql_native_password BY 'P@ssw0rd';
GRANT ALL PRIVILEGES ON database_name.* TO 'admin'@'localhost';
```

This will create the user that will interact and have all access to the database of the system.

5. Run `CREATE DATABASE StockSalesDB;` to create the databse/schema.
6. Go back to Vscode, create a .env file at the main branch of the directory (same level as app.js), and copy paste the following variables in it (make sure also to save):

(The token secret could be anything, I decided to create a token from the terminal by running node and generating the above token secret with crypto. )

```
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="P@ssw0rd"
DATABASE_NAME= "StockSalesDB"
DIALECT="mysql"
PORT="3000"
HOST="localhost"
TOKEN_SECRET='7bbfda2dc66ae26fb8e3028cbddece55d19514292d048bce237005904b9874703654bf0cd155a4814f13615d9f40f5edb7ee2119c14fd208a3a360c74628eea9'
```

7. Now you can run "npm start" in your terminal, this will create all the tables and their relationships in the StockSalesDB database you created earlier.
8. The databse part of the system is now set up and ready for use.
   It is set up to respect 3N form and every table has all the required fields, plus createdAt and updatedAt where it makes sense for an Admin User to keep track of such timestamps and will be shown also to the customer where needed.

## Endpoints and system usage:

You can either follow the Postaman documentation here () or the instructions and details I am adding to this section of the readme.

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

- Guests can signup through "POST/signup" with a request body like the following one:

```JSON
{
    "Username": "TestUser",
    "Password": "test123",
    "Email": "test@test.com",
}
```

The user role is set to be by default equal to 2 (User) in the user model and the previous mentioned hook preventing more than 1 Admin users beeing added ensures that this endpoint only creates Users with a User role.
Validation checks are made on Username having to be unique and on emails, as there is a maximum of 4 duplicate emails allowed. A hook is set up on the user model to enforce such email duplicate restriction and prevent a fifth equal email to be added on signup.
As per previous endpoints, all errors are handled and return relevant response messages.
While the signup is being done, the password is hashed and salted using crypto and then stored in the database as datatype BLOB for security reasons.

- Admin and existing users can login through "POST/login" with a request body like the following one:

```JSON
{
    "Username": "TestUser",
    "Password": "test123",
}
```

The endpoint validates the request body by checking if the Username is stored in the databse and by checking through crypto if the hashed salted password matches.
A cart check is also done, to see if the user has already the one and only cart he/she can have, if it is the first login, a cart will be created.
Also a token is created during login and this has an expiration time of 2h (I set it to 24h if it is the admin that logs in as I can imagine a workday is longer than 2 hours for him/her).
The token is provided in the response body together with a login message.
(PS: Requirements in the test area would insinuate that a token should be provided in the signup response and used during login, something I don't believe to be a well working practice especially as it expires after 2 hours and should work as a session/role-authentication method, but shouldn't be used for skipping the login user/password authentication process)

5. Cart:

- Registered users can access the "GET/cart" endpoint.
  Here they'll be able to see they're cart and cart id, the current total price of their cart and the items they've added to it (with Item details such as name id price and quantity)
  The endpoint handles errors should there be any in retrieving such data.

- Only the Admin can access the "GET/allcarts" endpoint.
  The result body is the same as the get/cart for users, simply it shows all carts of all the users.
  The endpoint handles errors should there be any in retrieving such data.

- Registered users can empty their carts of all cartitems in it by accessing the "DELETE/cart/:id" and passing their cart id as a parameter.
  Should they pass a cart number that isn't theirs, an error message will be sent as a response. Otherwise, should there be any error during the deletion, a relevant message will be in the response.

6. Cart-Items:

- Registered users can add cart items to their cart through "POST/cart_item" with a request body like the following one:

```JSON
{
    "id": 130, //or "Name": "sofa",
}
```

The endpoint can be used with either id or Name as attributes in the body request, it'll make sure that such item exists in the inventary and that the item isn't already in the cart.
If it exists in the cart, the user will be notified about it in the response body.
Any other type of error is also handled and will have a response with relevant message.
The cart item references the item from the items table, but the price is inserted in the cart item to prevent price changes, should the items price be changed while the user has the item in his/her cart.

- Registered users that have added items in their cart can change the desired quantity for the respective items through "PUT/item_cart/:id" with a the item id as a parameter and a request body like the following one:

```JSON
{
    "Quantity": 20,
}
```

This endpoint checks if the quantity is available in the inventory and if it is, it'll update the quantity of the desired cart item, otherwise it'll notify the user with a response body of the too high quantity request and showing the max available current quantity of the ionventory.
If any other error happens, it'll be handled and a relevant response will be sent.

- Registered users can remove a spoecifc cart item from their cart through "DELETE/cart_item/:id" by passing the specific cart item id as a parameter.
  If it isn't matching any of the cart items in the cart a releveant reponse is sent.
  Any other error will send a relevant response message.

7. Orders:

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
