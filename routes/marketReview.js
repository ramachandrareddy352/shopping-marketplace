const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const MarketReviews = require("../models/MarketReviews");
const Item = require("../models/Item");
const Market = require("../models/Market");

// http://127.0.0.1:5000/api/marketReview/createmarketreview/:marketPlaceAddress
// http://127.0.0.1:5000/api/marketReview/updatemarketreview/:marketPlaceAddress
// http://127.0.0.1:5000/api/marketReview/marketreviews/:marketPlaceAddress
// http://127.0.0.1:5000/api/marketReview/mymarketreview/:marketPlaceAddress/:userWallet
// http://127.0.0.1:5000/api/marketReview/deletemymarketreview/:marketPlaceAddress
// http://127.0.0.1:5000/api/marketReview/deleteallmarketreviews

// one person can have one marketplace review

router.post(
  "/createmarketreview/:marketPlaceAddress",
  [
    body("userWallet", "Enter a valid wallet address").isLength({
      min: 42,
      max: 42,
    }),
    body("stars", "Invalid range(1-10)").isInt({ min: 1, max: 10 }),
    body("review", "Enter a valid review").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: success, error: errors.array() });
    }

    try {
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        success = false;
        return res.status(400).json({
          success: success,
          error: "Market place address not found",
        });
      }

      let marketReview = await MarketReviews.findOne({
        userWallet: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (marketReview) {
        return res.status(400).json({
          success: success,
          error: "Sorry you have already reviewed",
        });
      }

      let ownerItems = await Item.findOne({
        owner: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      let buyerItems = await Item.findOne({
        buyer: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!ownerItems && !buyerItems) {
        return res.status(400).json({
          success: success,
          error:
            "Only owner or buyer of item in this marketplace can review this",
        });
      }

      marketReview = await MarketReviews.create({
        marketPlaceAddress: req.params.marketPlaceAddress,
        userWallet: req.body.userWallet,
        stars: req.body.stars,
        review: req.body.review,
      });

      success = true;
      res.json({ success: success, marketReview: marketReview });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.put(
  "/updatemarketreview/:marketPlaceAddress",
  [
    body("userWallet", "Enter a valid wallet address").isLength({
      min: 42,
      max: 42,
    }),
    body("stars", "Invalid range(1-10)").isInt({ min: 1, max: 10 }),
    body("review", "Enter a valid review").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: success, error: errors.array() });
    }

    try {
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        success = false;
        return res.status(400).json({
          success: success,
          error: "Market address not found",
        });
      }

      let marketReview = await MarketReviews.findOne({
        userWallet: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!marketReview) {
        return res.status(400).json({
          success: success,
          error: "You do not have any review to update",
        });
      }

      let updatedMarket = {};
      updatedMarket.stars = req.body.stars;
      updatedMarket.review = req.body.review;

      await MarketReviews.findOneAndUpdate(
        {
          userWallet: req.body.userWallet,
          marketPlaceAddress: req.params.marketPlaceAddress,
        },
        { $set: updatedMarket },
        { new: false }
      );

      marketReview = await MarketReviews.findOne({
        userWallet: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      success = true;
      res.json({ success: success, marketReview: marketReview });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get("/marketreviews/:marketPlaceAddress", async (req, res) => {
  let success = true;
  try {
    let market = await Market.findOne({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    if (!market) {
      success = false;
      return res.status(400).json({
        success: success,
        error: "Market address not found",
      });
    }

    let marketReviews = await MarketReviews.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    res.json({ success: success, marketReviews: marketReviews });
  } catch (error) {
    success = false;
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get(
  "/mymarketreview/:marketPlaceAddress/:userWallet",
  async (req, res) => {
    let success = false;

    try {
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        success = false;
        return res.status(400).json({
          success: success,
          error: "Market address not found",
        });
      }

      const review = await MarketReviews.findOne({
        userWallet: req.params.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!review) {
        success = false;
        return res.status(400).json({
          success: success,
          error: "Review not found",
        });
      }

      success = true;
      res.json({ success: success, review: review });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/deletemymarketreview/:marketPlaceAddress",
  [
    body("userWallet", "Enter a valid wallet address").isLength({
      min: 42,
      max: 42,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: success, error: errors.array() });
    }

    try {
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        success = false;
        return res.status(400).json({
          success: success,
          error: "Market address not found",
        });
      }

      let issue = await MarketReviews.findOneAndRemove({
        userWallet: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!issue) {
        return res
          .status(400)
          .json({ success: success, error: "Review not found" });
      }

      success = true;
      res.json({ success: success, issue: issue });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/deleteallmarketreviews",
  [
    body("marketPlaceAddress", "Enter a valid marketplace address").isLength({
      min: 42,
      max: 42,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: success, error: errors.array() });
    }

    try {
      let market = await Market.findOne({
        marketPlaceAddress: req.body.marketPlaceAddress,
      });

      if (market) {
        success = false;
        return res.status(400).json({
          success: success,
          error: "Market address is exist so you cannot delete the reviews",
        });
      }

      const issue = await MarketReviews.deleteMany({
        marketPlaceAddress: req.body.marketPlaceAddress,
      });

      success = true;
      res.json({ success: success, issue: issue });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

module.exports = router;
