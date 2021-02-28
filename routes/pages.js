/** @format */

var express = require("express");
var router = express.Router();

// Get Page model
var Page = require("../models/page");

/*
 * GET /
 */
// router.get("/", function (req, res) {
//   Page.findOne({ slug: "home" }, function (err, page) {
//     if (err) console.log(err);
//     res.render("index", {
//       title: page.title,
//       content: page.content,
//     });
//   });
// });
// https://stackoverflow.com/questions/21119288/simplest-way-to-have-express-serve-a-default-page
// mohRamadan
router.get("/", function (req, res) {
  res.redirect("/products");
});
/*
 * GET a page
 */
router.get("/:slug", function (req, res) {
  var slug = req.params.slug;

  Page.findOne({ slug: slug }, function (err, page) {
    if (err) console.log(err);

    if (!page) {
      res.redirect("/");
    } else {
      res.render("index", {
        title: page.title,
        content: page.content,
      });
    }
  });
});

// Exports
module.exports = router;
