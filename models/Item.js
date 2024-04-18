const mongoose = require("mongoose");
const { Schema } = mongoose;

const ItemSchema = new Schema({
  marketPlaceAddress: {
    type: String,
    required: true,
  },

  marketItemAddress: {
    type: String,
    required: true,
  },

  productId: {
    type: Number,
    required: true,
  },

  itemId: {
    type: Number,
    required: true,
  },

  imageURI: {
    type: String,
    required: true,
  },

  marketName: {
    type: String,
    required: true,
  },

  productName: {
    type: String,
    required: true,
  },

  buyer: {
    type: String,
    required: true,
  },

  owner: {
    type: String,
    required: true,
  },

  price: {
    type: Number, // price in native erc20 tokens
    required: true,
  },

  quantity: {
    type: Number,
    required: true,
  },

  collateralAddress: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("item", ItemSchema);
