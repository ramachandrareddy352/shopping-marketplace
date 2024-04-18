const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const ProductReviews = require("../models/ProductReviews");
const Product = require("../models/Product");
const Item = require("../models/Item");
const Market = require("../models/Market");

// http://127.0.0.1:5000/api/productReview/createproductreview/:marketPlaceAddress/:productId
// http://127.0.0.1:5000/api/productReview/updatemarketreview/:marketPlaceAddress/:productId
// http://127.0.0.1:5000/api/productReview/productreviews/:marketPlaceAddress/:productId
// http://127.0.0.1:5000/api/productReview/myproductreview/:marketPlaceAddress/:userWallet/:productId
// http://127.0.0.1:5000/api/productReview/deletemyproductreview/:marketPlaceAddress/:productId
// http://127.0.0.1:5000/api/productReview/deleteallmarketproductreviews
// http://127.0.0.1:5000/api/productReview/deleteallproductreviews

// delete all product review , if a product is deleted or related marketplace is deleted
// on exist market have to update the products data

router.post(
  "/createproductreview/:marketPlaceAddress/:productId",
  [
    body("userWallet", "Enter a valid wallet address").isLength({
      min: 42,
      max: 42,
    }),
    body("stars", "Invalid range").isInt({ min: 1, max: 10 }),
    body("review", "Enter a valid review").isLength({ min: 5 }),
  ],
  async (req, res) => {
    // If there are errors, return Bad request and the errors
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
        return res.status(400).json({
          success: success,
          error: "market place not found",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "product not found",
        });
      }

      let ownerItems = await Item.findOne({
        owner: req.body.userWallet,
        productId: req.params.productId,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      let buyerItems = await Item.findOne({
        buyer: req.body.userWallet,
        productId: req.params.productId,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!ownerItems && !buyerItems) {
        return res.status(400).json({
          success: success,
          error:
            "Only owner or buyer of item in this marketplace can review this",
        });
      }

      let productReview = await ProductReviews.findOne({
        userWallet: req.body.userWallet,
        productId: req.params.productId,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (productReview) {
        return res.status(400).json({
          success: success,
          error: "Sorry you have already reviewed",
        });
      }

      productReview = await ProductReviews.create({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
        userWallet: req.body.userWallet,
        stars: req.body.stars,
        review: req.body.review,
      });

      success = true;
      res.json({ success: success, productReview: productReview });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.put(
  "/updatemarketreview/:marketPlaceAddress/:productId",
  [
    body("userWallet", "Enter a valid user address").isLength({
      min: 42,
      max: 42,
    }),
    body("stars", "Invalid range").isInt({ min: 1, max: 10 }),
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
        return res.status(400).json({
          success: success,
          error: "market place not found",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "product not found",
        });
      }

      let productReview = await ProductReviews.findOne({
        productId: req.params.productId,
        userWallet: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!productReview) {
        return res.status(400).json({
          success: success,
          error: "You do not have any review to update",
        });
      }

      let updatedMarket = {};
      updatedMarket.stars = req.body.stars;
      updatedMarket.review = req.body.review;

      await ProductReviews.findOneAndUpdate(
        {
          userWallet: req.body.userWallet,
          marketPlaceAddress: req.params.marketPlaceAddress,
          productId: req.params.productId,
        },
        { $set: updatedMarket },
        { new: false }
      );

      productReview = await ProductReviews.findOne({
        userWallet: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      success = true;
      res.json({ success: success, productReview: productReview });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get(
  "/productreviews/:marketPlaceAddress/:productId",
  async (req, res) => {
    let success = true;
    try {
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        success = false;
        return res.status(400).json({
          success: success,
          error: "market place not found",
        });
      }

      let productReviews = await ProductReviews.find({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      res.json({ success: success, productReviews: productReviews });
    } catch (error) {
      success = false;
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get(
  "/myproductreview/:marketPlaceAddress/:userWallet/:productId",
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
        return res.status(400).json({
          success: success,
          error: "market place not found",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "product not found",
        });
      }

      const productReview = await ProductReviews.findOne({
        userWallet: req.params.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!productReview) {
        return res.status(400).json({
          success: success,
          error: "product review not found",
        });
      }

      success = true;
      res.json({ success: success, productReview: productReview });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/deleteallproductreviews",
  [
    body("marketPlaceAddress", "Enter a valid market place address").isLength({
      min: 42,
      max: 42,
    }),
    body("productId", "Enter a valid id").isLength({ min: 1 }),
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

      if (!market) {
        return res.status(400).json({
          success: success,
          error: "market place not exist",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.body.marketPlaceAddress,
        productId: req.body.productId,
      });

      if (product) {
        return res.status(400).json({
          success: success,
          error: "product is exist",
        });
      }

      const productReviews = await MarketReviews.deleteMany({
        marketPlaceAddress: req.body.marketPlaceAddress,
        productId: req.body.productId,
      });

      success = true;
      res.json({ success: success, productReviews: productReviews });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/deleteallmarketproductreviews",
  [
    body("marketPlaceAddress", "Enter a valid market place address").isLength({
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
        return res.status(400).json({
          success: success,
          error: "market place is exist",
        });
      }

      const productReviews = await MarketReviews.deleteMany({
        marketPlaceAddress: req.body.marketPlaceAddress,
      });

      success = true;
      res.json({ success: success, productReviews: productReviews });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/deletemyproductreview/:marketPlaceAddress/:productId",
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
        return res.status(400).json({
          success: success,
          error: "market place not found",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "product not found",
        });
      }

      const productReview = await ProductReviews.findOneAndRemove({
        userWallet: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!productReview) {
        return res
          .status(400)
          .json({ success: success, error: "Review not found" });
      }

      success = true;
      res.json({ success: success, productReview: productReview });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

module.exports = router;
