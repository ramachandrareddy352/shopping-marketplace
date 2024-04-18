const mongoose = require("mongoose");
const { Schema } = mongoose;

const MarketReviewSchema = new Schema({
  marketPlaceAddress: {
    type: String,
    required: true,
  },

  userWallet: {
    type: String,
    required: true,
  },

  stars: {
    type: Number, // 1-10 zerois not allowed
    required: true,
  },

  review: {
    type: String,
    required: true,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("marketReviews", MarketReviewSchema);
