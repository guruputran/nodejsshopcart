/** @format */

const { check, validationResult } = require("express-validator");
//Define validator for the post products
const validator = [
  check("title").isLength({ min: 1 }).withMessage("Title cannot be blank"),
  check("desc").isLength({ min: 1 }).withMessage("Description cannot be blank"),
  check("price")
    .isLength({ min: 1 })
    .withMessage("Price cannot be blank")
    .isDecimal(),
];
const result = (req, res, next) => {
  const result = validationResult(req);
  const hasError = !result.isEmpty();
  if (hasError) {
    const error = result.array()[0].msg;
    // return res.json({ success: false, message: error });
    req.flash("danger", `${error}`);
    res.redirect("/admin/products/add-product");
  }
  if (!req.files) {
    // return res.json({ success: false, message: "Image is required!" });
    req.flash("danger", "Image is required!");
    res.redirect("/admin/products/add-product");
  }
  const fileExtension = req.files.image.mimetype.split("/").pop();
  next();
};
const validateFile = (req, res, next) => {
  const expectedFileType = ["png", "jpg", "jpeg"];
  const fileExtension = req.files.image.mimetype.split("/").pop();
  if (!req.files) {
    //return res.json({ success: false, message: "Image is required!" });
    req.flash("danger", "Image is required!");
    res.redirect("/admin/products/add-product");
  }

  if (!expectedFileType.includes(fileExtension)) {
    // return res.json({
    //   success: false,
    //   message: "Image type invalid. Only .jpg,.png can",
    // });
    req.flash("danger", "Disallowed format!!");
    res.redirect("/admin/products/add-product");
  } else {
    next(); //as it hangs and tries to finish off admin_products success
  }
};
module.exports = {
  validator,
  result,
  validateFile,
};
