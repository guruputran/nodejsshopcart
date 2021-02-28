/** @format */
// for route starting with /admin (prefix)

var express = require("express");
var router = express.Router();
var Page = require("../models/page");
var { check, validationResult } = require("express-validator");
// Get page model
var Page = require("../models/page");
//Get page index

// router.get("/", function (req, res) {
//   res.send("admin area");
// });

router.get("/", function (req, res) {
  Page.find({})
    .sort({ sorting: 1 })
    .exec(function (err, pages) {
      res.render("admin/pages", {
        pages: pages,
        Pgtitle: "Show Admin Pages",
      });
    });
});
/*
 *Get Add Page
 */

router.get("/add-page", function (req, res) {
  var title = "";
  var slug = "";
  var content = "";
  var Pgtitle = "Admin Area";
  res.render("admin/add_page", {
    title: title,
    slug: slug,
    content: content,
    Pgtitle: Pgtitle,
  });
});
/*
 * Post Add Page
 */

router.post(
  "/add-page",
  [
    check("title").isLength({ min: 1 }).withMessage("Title cannot be blank"),
    check("content")
      .isLength({ min: 1 })
      .withMessage("Content cannot be blank"),
  ],
  function (req, res) {
    var title = req.body.title;
    var content = req.body.content;
    var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    var Pgtitle = "Admin Area";
    if (slug === "" || slug === null || slug === undefined) {
      slug = title.replace(/\s+/g, "-").toLowerCase();
    }

    var errors = validationResult(req);

    if (errors.length > 0) {
      res.render("pages/add_page", {
        title: title,
        slug: slug,
        content: content,
        Pgtitle: Pgtitle,
        errors: errors.errors,
      });
    } else {
      Page.findOne({ slug: slug }, function (err, page) {
        if (page) {
          req.flash("success", "Page Slug exists, choose another");
          res.render("pages/add_page", {
            title: title,
            slug: slug,
            Pgtitle: Pgtitle,
            content: content,
          });
        } else {
          var page = new Page({
            title: title,
            slug: slug,
            content: content,
            sorting: 0,
          });

          page.save(function (err) {
            if (err) {
              req.flash("danger", "Required inputs not given");
              res.render("admin/add_page", {
                title: title,
                slug: slug,
                content: content,
                Pgtitle: Pgtitle,
                errors: errors.errors,
              });
            } else {
              req.flash("success", "Page added!");
              res.redirect("/admin/pages");
            }
          });
        }
      });
    }
  }
);

// Sort pages function
function sortPages(ids, callback) {
  var count = 0;

  for (var i = 0; i < ids.length; i++) {
    var id = ids[i];
    count++;

    (function (count) {
      Page.findById(id, function (err, page) {
        page.sorting = count;
        page.save(function (err) {
          if (err) return console.log(err);
          ++count;
          if (count >= ids.length) {
            callback();
          }
        });
      });
    })(count);
  }
}

/*
 * POST reorder pages
 */
router.post("/reorder-pages", function (req, res) {
  var ids = req.body["id[]"];

  sortPages(ids, function () {
    Page.find({})
      .sort({ sorting: 1 })
      .exec(function (err, pages) {
        if (err) {
          console.log(err);
        } else {
          req.app.locals.pages = pages;
        }
      });
  });
});

// Get edit page

router.get("/edit-page/:id", function (req, res) {
  Page.findById(req.params.id, function (err, page) {
    if (err) return console.log(err);
    res.render("admin/edit_page", {
      title: page.title,
      Pgtitle: "Edit page",
      slug: page.slug,
      content: page.content,
      id: page._id,
    });
  });
});

// Post Edit Page
router.post(
  "/edit-page/:id",
  [
    check("title").isLength({ min: 1 }).withMessage("Title cannot be blank"),
    check("content")
      .isLength({ min: 1 })
      .withMessage("Content cannot be blank"),
  ],
  function (req, res) {
    var title = req.body.title;
    var content = req.body.content;
    var id = req.params.id;
    var slug = req.body.slug.replace(/\s+/g, "-").toLowerCase();
    var Pgtitle = "Admin Area";
    if (slug === "" || slug === null || slug === undefined) {
      slug = title.replace(/\s+/g, "-").toLowerCase();
    }

    var errors = validationResult(req);

    if (errors.length > 0) {
      res.render("admin/edit_page", {
        title: title,
        slug: slug,
        content: content,
        id: id,
        Pgtitle: Pgtitle,
        errors: errors.errors,
      });
    } else {
      Page.findOne({ slug: slug, _id: { $ne: id } }, function (err, page) {
        if (page) {
          req.flash("danger", "slug exists, choose another");
          res.render("admin/edit_page", {
            title: title,
            slug: slug,
            Pgtitle: Pgtitle,
            content: content,
            id: id,
          });
        } else {
          Page.findById(id, function (err, page) {
            if (err) {
              res.render("admin/edit_page", {
                title: title,
                slug: slug,
                content: content,
                id: id,
                Pgtitle: Pgtitle,
                errors: errors.errors,
              });
            }
            (page.title = title),
              (page.slug = slug),
              (page.content = content),
              //
              page.save(function (err) {
                if (err) {
                  res.render("admin/edit_page", {
                    title: title,
                    slug: slug,
                    content: content,
                    id: id,
                    Pgtitle: Pgtitle,
                    errors: errors.errors,
                  });
                } else {
                  req.flash("success", "Page updated!");
                  res.redirect("/admin/pages/edit-page/" + id);
                }
              });
            //
          });
        }
      });
    }
  }
);

// Delete
router.get("/delete-page/:id", function (req, res) {
  Page.findByIdAndRemove(req.params.id, function (err) {
    if (err) {
    }
    req.flash("success", "Page updated!");
    res.redirect("/admin/pages/");
  });
});

//Exports
module.exports = router;
