/** @format */

var express = require("express");
var router = express.Router();
var passport = require("passport");
var bcrypt = require("bcryptjs");

var express = require("express");
var router = express.Router();
var { validatorUser, resultUser } = require("../middleware/validatorUser");
var { validationResult } = require("express-validator");
var auth = require("../config/auth");
var isUser = auth.isUser;
var isAdmin = auth.isAdmin;

// Get Users model
var User = require("../models/user");
var Order = require("../models/order");
const statusVals = [
  {
    id: 1,
    value: 0,
    name: "unpaid",
  },
  { id: 2, value: 1, name: "paid" },
  { id: 3, value: 2, name: "delivery sent" },
];

/*
 * GET register
 */
router.get("/register", function (req, res) {
  res.render("register", {
    title: "Register",
  });
});

/*
 * POST register
 */
router.post("/register", validatorUser, resultUser, function (req, res) {
  var name = req.body.name;
  var email = req.body.email;
  var username = req.body.username;
  var password = req.body.password;
  var password2 = req.body.password2;

  var errors = validationResult(req).array();
  //https://www.positronx.io/express-validator-tutorial-with-input-validation-examples/
  if (errors.length > 0) {
    res.render("register", {
      errors: errors,
      user: null,
      title: "Register",
    });
  } else {
    User.findOne({ username: username }, function (err, user) {
      if (err) console.log(err);

      if (user) {
        req.flash("danger", "Username exists, choose another!");
        res.redirect("/users/register");
      } else {
        var user = new User({
          name: name,
          email: email,
          username: username,
          password: password,
          admin: 0,
        });

        bcrypt.genSalt(10, function (err, salt) {
          bcrypt.hash(user.password, salt, function (err, hash) {
            if (err) console.log(err);

            user.password = hash;

            user.save(function (err) {
              if (err) {
                console.log(err);
              } else {
                req.flash("success", "You are now registered!");
                res.redirect("/users/login");
              }
            });
          });
        });
      }
    });
  }
});

/*
 * GET login
 */
router.get("/login", function (req, res) {
  if (res.locals.user) res.redirect("/");

  res.render("login", {
    title: "Log in",
  });
});

/*
 * POST login
 */
router.post("/login", function (req, res, next) {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

/*
 * GET logout
 */
router.get("/logout", function (req, res) {
  req.logout();

  req.flash("success", "You are logged out!");
  res.redirect("/users/login");
});
/*
 * GET user orders
 */
router.get("/orders", isUser, function (req, res) {
  Order.find({ username: res.locals.user.username }, function (err, orders) {
    res.render("orders", {
      title: "order list",
      orders: orders,
    });
  });
});
/*
 * GET admin orders
 */
router.get("/adminorders", isAdmin, function (req, res) {
  Order.find(function (err, orders) {
    res.render("orders", {
      title: "order list",
      orders: orders,
      statusVals: statusVals,
    });
  });
});
//edit order
router.get("/orders/edit/:id", isAdmin, function (req, res) {
  var id = req.params.id;
  Order.findOne({ _id: id }, function (err, order) {
    if (err) return console.log(err);
    res.render("admin/edit_order", {
      status: order.status,
      Pgtitle: "Edit order",
      order: order,
      id: order._id,
      username: order.username,
      statusVals: statusVals,
    });
  });
});
//post update order

router.post("/orders/edit-order/:id", function (req, res) {
  var id = req.params.id;
  var status = req.body.status;
  Order.findOne({ _id: id }, function (err, order) {
    (order.status = status),
      order.save(function (err) {
        if (err) {
          res.render("orders/edit_order", {
            status: order.status,
            Pgtitle: "Edit order",
            order: order,
            id: order._id,
            username: order.username,
            statusVals: statusVals,
          });
        } else {
          req.flash("success", "Order updated!");
          res.redirect("/users/orders/edit/" + order._id);
        }
      });
  });
});

//delete order
router.get("/orders/delete/:id", isAdmin, function (req, res) {
  var id = req.params.id;
  Order.findByIdAndRemove(id, function (err) {
    console.log(err);
  });
  req.flash("success", "Order deleted!");
  res.redirect("/users/adminorders");
});

// Exports
module.exports = router;
