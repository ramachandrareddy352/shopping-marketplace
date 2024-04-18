const mongoose = require("mongoose");
const { Schema } = mongoose;

const MyCartSchema = new Schema({
  marketPlaceAddress: {
    type: String,
    required: true,
  },

  productId: {
    type: Number,
    required: true,
  },

  userWallet: {
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

  imageURI: {
    type: String,
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },
  // use a unique while getting error
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("mycart", MyCartSchema);
