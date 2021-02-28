/** @format */

const { check, validationResult } = require("express-validator");
//Define validator for the post products
const validatorUser = [
  check("name").isLength({ min: 1 }).withMessage("Name cannot be blank"),
  check("email")
    .normalizeEmail()
    .isEmail()
    .withMessage("Please enter a valid email address"),
  check("username")
    .isLength({ min: 1 })
    .withMessage("Username cannot be blank"),
  check("password")
    .isLength({ min: 1 })
    .withMessage("Password cannot be blank"),
  check("password2")
    .isLength({ min: 1 })
    .withMessage("Confirm password cannot be blank"),
];
const resultUser = (req, res, next) => {
  const result = validationResult(req);
  const hasError = !result.isEmpty();
  if (hasError) {
    const error = result.array()[0].msg;
    // return res.json({ success: false, message: error });
    req.flash("danger", `${error}`);
    res.redirect("/users/register");
  }

  next();
};

module.exports = {
  validatorUser,
  resultUser,
};
