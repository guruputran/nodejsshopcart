/** @format */

var express = require("express");
var path = require("path");
var mongoose = require("mongoose");
var config = require("./config/database");
var session = require("express-session");
var bodyParser = require("body-parser");
var fileUpload = require("express-fileupload");
var passport = require("passport");

//Connect to db
mongoose.connect(config.database, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("connected to Mongodb");
});

var app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//Set public folder

app.use(express.static(path.join(__dirname, "public")));

// parse application/x-www-form-urlencoded Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));

//Express fileupload middleware
app.use(fileUpload());
// parse application/json
app.use(bodyParser.json());

//Express session
app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    //   cookie: { secure: true },
  })
);

//Set global variables
app.locals.errors = null;

// Get Page Model
var Page = require("./models/page");

// Get all pages to pass to header.ejs
Page.find({})
  .sort({ sorting: 1 })
  .exec(function (err, pages) {
    if (err) {
      console.log(err);
    } else {
      app.locals.pages = pages;
    }
  });

// Get Category Model
var Category = require("./models/category");

// Get all categories to pass to header.ejs
Category.find(function (err, categories) {
  if (err) {
    console.log(err);
  } else {
    app.locals.categories = categories;
  }
});

app.use(require("connect-flash")());
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

// Passport Config OLD
require("./config/passport")(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get("*", function (req, res, next) {
  res.locals.cart = req.session.cart;
  res.locals.user = req.user; // caused user undefined error in authjs || null;
  next();
});

//Set routes
// Set routes
var pages = require("./routes/pages.js");
var products = require("./routes/products.js");
var cart = require("./routes/cart.js");
var users = require("./routes/users.js");
var adminPages = require("./routes/admin_pages.js");
var adminCategories = require("./routes/admin_categories.js");
var adminProducts = require("./routes/admin_products.js");

app.use("/admin/pages", adminPages);
app.use("/admin/categories", adminCategories);
app.use("/admin/products", adminProducts);
app.use("/products", products);
app.use("/cart", cart);
app.use("/users", users);
app.use("/", pages);

//Start server at Port 3000
var port = 3000;
app.listen(port, function () {
  console.log("Server listening on port" + port);
});
