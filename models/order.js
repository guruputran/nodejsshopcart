/** @format */

var mongoose = require("mongoose");

// User Schema
var OrderSchema = mongoose.Schema({
  order: [mongoose.Schema.Types.Mixed],
  username: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
    default: 0,
  },
});

var Order = (module.exports = mongoose.model("Order", OrderSchema));
