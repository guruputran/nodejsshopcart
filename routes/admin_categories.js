/** @format */
// for route starting with /admin (prefix)

var express = require("express");
var router = express.Router();
//Get Category model
var Category = require("../models/category");
var { check, validationResult } = require("express-validator");

//Get Category index

router.get("/", function (req, res) {
  Category.find(function (err, categories) {
    if (err) return console.error(err);
    res.render("admin/categories", {
      categories: categories,
      Pgtitle: "Categories",
    });
  });
});
/*
 *Get Add Page
 */

router.get("/add-category", function (req, res) {
  var title = "";
  var slug = "";
  var Pgtitle = "Category Area";
  res.render("admin/add_category", {
    title: title,
    slug: slug,
    Pgtitle: Pgtitle,
  });
});
/*
 * Post Add category
 */

router.post(
  "/add-category",
  [check("title").isLength({ min: 1 }).withMessage("Title cannot be blank")],
  function (req, res) {
    var title = req.body.title;
    var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    var Pgtitle = "Admin Area";
    if (slug === "" || slug === null || slug === undefined) {
      slug = title.replace(/\s+/g, "-").toLowerCase();
    }

    var errors = validationResult(req);

    if (errors.length > 0) {
      res.render("categories/add_category", {
        title: title,
        slug: slug,
        Pgtitle: Pgtitle,
        errors: errors.errors,
      });
    } else {
      Category.findOne({ slug: slug }, function (err, category) {
        if (category) {
          req.flash("success", "slug exists, choose another");
          res.render("categories/add_category", {
            title: title,
            slug: slug,
            Pgtitle: Pgtitle,
          });
        } else {
          var category = new Category({
            title: title,
            slug: slug,
          });

          category.save(function (err) {
            if (err) {
              req.flash("danger", "Required inputs not given");
              res.render("admin/add_category", {
                title: title,
                slug: slug,
                Pgtitle: Pgtitle,
                errors: errors.errors,
              });
            } else {
              req.flash("success", "Category added!");
              res.redirect("/admin/categories");
            }
          });
        }
      });
    }
  }
);

// Get edit page

router.get("/edit-category/:slug", function (req, res) {
  Category.findOne({ slug: req.params.slug }, function (err, category) {
    if (err) return console.log(err);
    res.render("admin/edit_category", {
      title: category.title,
      Pgtitle: "Edit category",
      slug: category.slug,
      id: category._id,
    });
  });
});

// Post Cat Page
router.post(
  "/edit-category/:slug",
  [check("title").isLength({ min: 1 }).withMessage("Title cannot be blank")],
  function (req, res) {
    var title = req.body.title;
    var id = req.body.id;
    var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    var Pgtitle = "Admin Area";
    if (slug === "" || slug === null || slug === undefined) {
      slug = title.replace(/\s+/g, "-").toLowerCase();
    }
    var errors = validationResult(req);

    if (errors.length > 0) {
      res.render("admin/edit_category", {
        title: title,
        slug: slug,
        id: id,
        Pgtitle: Pgtitle,
        errors: errors.errors,
      });
    } else {
      Category.findOne(
        { slug: slug, _id: { $ne: id } },
        function (err, category) {
          if (category) {
            req.flash("danger", "slug exists, choose another");
            res.render("admin/edit_category", {
              title: title,
              slug: slug,
              Pgtitle: Pgtitle,
              id: id,
            });
          } else {
            Category.findById(id, function (err, category) {
              if (err) {
                res.render("admin/edit_category", {
                  title: title,
                  slug: slug,
                  id: id,
                  Pgtitle: Pgtitle,
                  errors: errors.errors,
                });
              }
              (category.title = title),
                (category.slug = slug),
                //
                category.save(function (err) {
                  if (err) {
                    res.render("admin/edit_category", {
                      title: title,
                      slug: slug,
                      id: id,
                      Pgtitle: Pgtitle,
                      errors: errors.errors,
                    });
                  } else {
                    req.flash("success", "Category updated!");
                    res.redirect(
                      "/admin/categories/edit-category/" + category.slug
                    );
                  }
                });
              //
            });
          }
        }
      );
    }
  }
);

// Delete
router.get("/delete-category/:id", function (req, res) {
  Category.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
    }
    req.flash("success", "category deleted!");
    res.redirect("/admin/categories/");
  });
});

//Exports
module.exports = router;
