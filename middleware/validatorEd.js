/** @format */

const { check, validationResult } = require("express-validator");
//Define validator for the post products
const validatorEd = [
  check("title").isLength({ min: 1 }).withMessage("Title cannot be blank"),
  check("desc").isLength({ min: 1 }).withMessage("Description cannot be blank"),
  check("price")
    .isLength({ min: 1 })
    .withMessage("Price cannot be blank")
    .isDecimal(),
];
const resultEd = (req, res, next) => {
  const result = validationResult(req);
  const hasError = !result.isEmpty();
  var id = req.params.id;
  if (hasError) {
    const error = result.array()[0].msg;
    // return res.json({ success: false, message: error });
    req.flash("danger", `${error}`);
    res.redirect("/admin/products/edit-product/id");
  }
  if (!req.files && !req.body.pimage) {
    // return res.json({ success: false, message: "Image is required!" });
    req.flash("danger", "Image is required 1 !");
    res.redirect("/admin/products/edit-product/id");
  } else {
    if (!req.body.pimage) {
      const fileExtension = req.files.image.mimetype.split("/").pop();
    }
    next();
  }
};
const validateFileEd = (req, res, next) => {
  const expectedFileType = ["png", "jpg", "jpeg"];
  let fileExtension;
  if (!req.body.pimage) {
    fileExtension = req.files.image.mimetype.split("/").pop();
  } else {
    fileExtension = req.body.pimage.split(".").pop();
  }

  var id = req.params.id;
  if (!req.files && !req.body.pimage) {
    //return res.json({ success: false, message: "Image is required!" });
    req.flash("danger", "Image is required 2 !");
    res.redirect("/admin/products/edit-product/id");
  }

  if (!expectedFileType.includes(fileExtension)) {
    // return res.json({
    //   success: false,
    //   message: "Image type invalid. Only .jpg,.png can",
    // });
    req.flash("danger", "Disallowed format!!");
    res.redirect("/admin/products/edit-product/id");
  } else {
    next(); //as it hangs and tries to finish off admin_products success
  }
};
module.exports = {
  validatorEd,
  resultEd,
  validateFileEd,
};
