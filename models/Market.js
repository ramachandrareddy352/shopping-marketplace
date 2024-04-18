const { request } = require("express");
const mongoose = require("mongoose");
const { Schema } = mongoose;

const MarketSchema = new Schema({
  name: {
    type: String,
    uniquie: true,
    required: true,
  },

  description: {
    type: String,
    required: true,
  },

  marketOwner: {
    type: String, // wallet address
    unique: true,
    required: true,
  },

  marketLogo: {
    type: String,
    required: true,
  },

  marketBackground: {
    type: String,
    required: true,
  },

  marketTwitter: {
    type: String,
    required: true,
  },

  marketInsta: {
    type: String,
    required: true,
  },

  marketFacbook: {
    type: String,
    required: true,
  },

  marketYoutube: {
    type: String,
    required: true,
  },

  marketMail: {
    type: String,
    required: true,
  },

  marketId: {
    type: Number,
    required: true,
    unique: true,
  },

  marketPlaceAddress: {
    type: String,
    required: true,
    uniquie: true,
  },

  marketItemAddress: {
    type: String,
    required: true,
    uniquie: true,
  },

  marketRating: {
    type: Number, // 1-10
    default: 0,
  },

  totalTradedInUSD: {
    type: Number,
    default: 0,
  },

  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("market", MarketSchema);
