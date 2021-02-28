/** @format */
// for route starting with /admin (prefix)

var express = require("express");
var router = express.Router();
var { validator, result, validateFile } = require("../middleware/validator");
var {
  validatorEd,
  resultEd,
  validateFileEd,
} = require("../middleware/validatorEd");
var fs = require("fs-extra");
var Product = require("../models/product");
var Category = require("../models/category");
var resizeImg = require("resize-img");
var auth = require("../config/auth");
var isAdmin = auth.isAdmin;

var { check, validationResult } = require("express-validator");

//Get page index

// router.get("/", function (req, res) {
//   res.send("admin area");
// });

router.get("/", isAdmin, function (req, res) {
  var count;
  Product.estimatedDocumentCount(function (err, c) {
    count = c;
  });
  Product.find(function (err, products) {
    res.render("admin/products", {
      products: products,
      count: count,
      Pgtitle: "Products List",
    });
  });
});
/*
 *Get Add Page
 */

router.get("/add-product", isAdmin, function (req, res) {
  var title = "";
  var price = "";
  var desc = "";
  var slug = "";
  var Pgtitle = "Admin Area";
  Category.find(function (err, categories) {
    res.render("admin/add_product", {
      title: title,
      desc: desc,
      price: price,
      slug: slug,
      Pgtitle: Pgtitle,
      categories: categories,
    });
  });
});
/*
 * Post Add Page
 */

router.post(
  "/add-product",
  validator,
  result,
  validateFile,
  function (req, res) {
    var imageFile =
      typeof req.files.image !== "undefined" ? req.files.image.name : "";
    var title = req.body.title;
    var slug = title.replace(/\s+/g, "-").toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var Pgtitle = "Admin Area";
    if (slug === "" || slug === null || slug === undefined) {
      slug = title.replace(/\s+/g, "-").toLowerCase();
    }

    var errors = validationResult(req);

    if (errors.length > 0) {
      Category.find(function (err, categories) {
        res.render("admin/add_product", {
          title: title,
          desc: desc,
          price: price,
          slug: slug,
          Pgtitle: Pgtitle,
          imageFile: imageFile,
          categories: categories,
          errors: errors.errors,
        });
      });
    } else {
      Product.findOne({ slug: slug }, function (err, product) {
        if (product) {
          req.flash("danger", "Product Title exists, choose another");
          Category.find(function (err, categories) {
            res.render("admin/add_product", {
              title: title,
              desc: desc,
              price: price,
              imageFile: imageFile,
              slug: slug,
              Pgtitle: Pgtitle,
              categories: categories,
            });
          });
        } else {
          var price2 = parseFloat(price).toFixed(2);
          var product = new Product({
            title: title,
            slug: slug,
            desc: desc,
            slug: slug,
            imageFile: imageFile,
            price: price2,
            category: category,
            image: imageFile,
          });
          //https://stackoverflow.com/questions/37589161/is-it-posible-to-create-a-dir-in-node-like-mkdir-p-does
          async function createFolder(folder) {
            try {
              await fs.ensureDirSync(folder); // guarantees the directory is created, or error.
            } catch (err) {
              throw new Error(
                "You do not have the right permissions to make this folder."
              );
            }
          }
          product.save(function (err) {
            if (err) return console.log(err);
            createFolder(
              "public/product_images/" + product._id,
              function (err) {
                return console.log(err);
              }
            );

            createFolder(
              "public/product_images/" + product._id + "/gallery",
              function (err) {
                return console.log(err);
              }
            );

            createFolder(
              "public/product_images/" + product._id + "/gallery/thumbs",
              function (err) {
                return console.log(err);
              }
            );

            if (imageFile != "") {
              var productImage = req.files.image;
              var path =
                "public/product_images/" + product._id + "/" + imageFile;

              productImage.mv(path, function (err) {
                return console.log(err);
              });
            }

            req.flash("success", "Product added!");
            res.redirect("/admin/products");
          });
        }
      });
    }
  }
);

// Get edit product

router.get("/edit-product/:id", isAdmin, function (req, res) {
  var errors;
  if (req.session.errors) errors = req.session.errors;
  req.session.errors = null;

  Category.find(function (err, categories) {
    Product.findById(req.params.id, function (err, p) {
      if (err) {
        console.log(err);
        res.redirect("/admin/products/");
      } else {
        var galleryDir = "public/product_images/" + p._id + "/gallery";
        var galleryImages = null;

        fs.readdir(galleryDir, function (err, files) {
          if (err) {
            console.log(err);
          } else {
            galleryImages = files;

            res.render("admin/edit_product", {
              title: p.title,
              errors: errors,
              desc: p.desc,
              Pgtitle: "Edit products",
              categories: categories,
              category: p.category.replace(/\s+/g, "-").toLowerCase(),
              price: parseFloat(p.price).toFixed(2),
              image: p.image,
              galleryImages: galleryImages,
              id: p._id,
            });
          }
        });
      }
    });
  });
});

/*
 * POST edit product
 */
router.post(
  "/edit-product/:id",
  validatorEd,
  resultEd,
  validateFileEd,
  function (req, res) {
    var pimage = req.body.pimage;
    var imageFile = "";
    if (pimage) {
      console.log("RFQ", req.files);
      if (req.files === null || req.files === undefined) {
        imageFile = "";
      } else {
        imageFile = req.files.image.name;
      }
    } else {
      imageFile = "";
    }

    var title = req.body.title;
    var slug = title.replace(/\s+/g, "-").toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;

    var id = req.params.id;
    var errors = validationResult(req);
    if (errors.length > 0) {
      Category.find(function (err, categories) {
        res.redirect("/admin/products/edit-product/" + id, {
          title: title,
          desc: desc,
          price: price,
          slug: slug,
          Pgtitle: Pgtitle,
          imageFile: imageFile,
          categories: categories,
          errors: errors.errors,
        });
      });
    } else {
      Product.findOne({ slug: slug, _id: { $ne: id } }, function (err, p) {
        if (err) console.log(err);
        if (p) {
          errors = req.session.errors;
          req.flash("danger", "Product title exists, choose another.");
          res.redirect("/admin/products/edit-product/" + id);
        } else {
          Product.findById(id, function (err, p) {
            if (err) console.log(err);
            p.title = title;
            p.slug = slug;
            p.desc = desc;
            errors = req.session.errors;
            p.price = parseFloat(price).toFixed(2);
            p.category = category;
            if (imageFile != "") {
              p.image = imageFile;
            }
            p.save(function (err) {
              if (err) console.log(err);

              if (imageFile != "") {
                if (pimage != "") {
                  fs.remove(
                    "public/product_images/" + id + "/" + pimage,
                    function (err) {
                      if (err) console.log(err);
                    }
                  );
                }

                var productImage = req.files.image;
                var path = "public/product_images/" + id + "/" + imageFile;

                productImage.mv(path, function (err) {
                  return console.log(err);
                });
              }
              req.flash("success", "Product edited!");
              res.redirect("/admin/products/edit-product/" + id);
            });
          });
        }
      });
    }
  }
);
/*
 * POST product gallery
 */
router.post("/product-gallery/:id", function (req, res) {
  var productImage = req.files.file;
  var id = req.params.id;
  var path = "public/product_images/" + id + "/gallery/" + req.files.file.name;
  var thumbsPath =
    "public/product_images/" + id + "/gallery/thumbs/" + req.files.file.name;

  productImage.mv(path, function (err) {
    if (err) console.log(err);

    resizeImg(fs.readFileSync(path), { width: 100, height: 100 }).then(
      function (buf) {
        fs.writeFileSync(thumbsPath, buf);
      }
    );
  });

  res.sendStatus(200);
});

/*
 * GET delete image
 */
router.get("/delete-image/:image", function (req, res) {
  var originalImage =
    "public/product_images/" + req.query.id + "/gallery/" + req.params.image;
  var thumbImage =
    "public/product_images/" +
    req.query.id +
    "/gallery/thumbs/" +
    req.params.image;

  fs.remove(originalImage, function (err) {
    if (err) {
      console.log(err);
    } else {
      fs.remove(thumbImage, function (err) {
        if (err) {
          console.log(err);
        } else {
          req.flash("success", "Image deleted!");
          res.redirect("/admin/products/edit-product/" + req.query.id);
        }
      });
    }
  });
});

/*
 * GET delete product
 */
router.get("/delete-product/:id", isAdmin, function (req, res) {
  var id = req.params.id;
  var path = "public/product_images/" + id;

  fs.remove(path, function (err) {
    if (err) {
      console.log(err);
    } else {
      Product.findByIdAndRemove(id, function (err) {
        console.log(err);
      });

      req.flash("success", "Product deleted!");
      res.redirect("/admin/products");
    }
  });
});

//Exports
module.exports = router;
