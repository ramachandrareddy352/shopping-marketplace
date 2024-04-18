const { request } = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;

// using product id and marketplace address the data is retrieved

const ProductSchema = new Schema({
  name: {
    // in same market no two have same names
    type: String,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  productId: {
    type: Number,
    required: true,
  },

  marketPlaceAddress: {
    type: String,
    required: true,
  },

  productImage1: {
    type: String,
    required: true,
  },

  productImage2: {
    type: String,
    required: true,
  },

  productImage3: {
    type: String,
    required: true,
  },
  // add tag to sort
  quantity: {
    type: Number,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  onSale: {
    type: Boolean,
    required: true,
  },

  rating: {
    type: Number,
    default: 0,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("product", ProductSchema);
module.exports = Product;
// nodemon index.js
