var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var db = require('./models');
db.sequelize.sync({ force: false });

var authRouter = require('./routes/auth');
var utilityRouter = require('./routes/utility');
var itemsRouter = require('./routes/items');
var categoriesRouter = require('./routes/categories');
var cartRouter = require('./routes/cart');
var cartItemRouter = require('./routes/cart_Items');
var ordersRouter = require('./routes/orders');
var orderItemsRouter = require('./routes/order_Items');
var cartCheckotuRouter = require('./routes/checkout');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', authRouter);
app.use('/', utilityRouter);
app.use('/', itemsRouter);
app.use('/', categoriesRouter);
app.use('/', cartRouter);
app.use('/cart_item', cartItemRouter);
app.use('/', ordersRouter);
app.use('/order', orderItemsRouter);
app.use('/cart/checkout', cartCheckotuRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render('error');
});

module.exports = app;
