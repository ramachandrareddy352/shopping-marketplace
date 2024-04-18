const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const Market = require("../models/Market");
const Product = require("../models/Product");
const MyCart = require("../models/MyCart");

// "/addcartitem"
// "/deletecartitem"
// "/mycartitems/:userWallet"
// "/mymarketcartitems/:userWallet/:marketPlaceAddress"
// "/deleteallmarketcartitems"
// "/deleteallmycartitems"

// delete the related marketplace or product cart items after deleting related product or marketplace
// what if the prices are updated for a product after you add item to cart

router.post(
  "/addcartitem/:marketPlaceAddress/:productId",
  [
    body("userWallet", "Enter a valid userWallet address").isLength({
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
      let market = Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        return res.status(400).json({
          success: success,
          error: "Market place invalid data",
        });
      }

      let product = Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "Product invalid data",
        });
      }

      let cartItem = await MyCart.findOne({
        userWallet: req.body.userWallet,
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (cartItem) {
        return res.status(400).json({
          success: success,
          error: "Item is already in cart",
        });
      }

      cartItem = await MyCart.create({
        marketPlaceAddress: req.body.marketPlaceAddress,
        productId: req.body.productId,
        userWallet: req.body.userWallet,
        marketName: market.name,
        productName: product.name,
        imageURI: product.productImage1,
        price: product.price,
      });

      success = true;
      res.json({ success: success, cartItem: cartItem });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.put("updatemarketdata/:marketPlaceAddress", async (req, res) => {
  try {
    let market = await Market.findOne({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    if (!market) {
      return res.status(400).json({
        success: success,
        error: "Market place invalid data",
      });
    }

    let updatedData = {};
    updatedData.marketName = market.name;

    await MyCart.updateMany(
      { marketPlaceAddress: req.params.marketPlaceAddress },
      { $set: updatedData },
      { new: false }
    );

    success = true;
    res.json({ success: success });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.put(
  "updateproductdata/:marketPlaceAddress/:productId",
  [],
  async (req, res) => {
    try {
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        return res.status(400).json({
          success: success,
          error: "Market place invalid data",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "Product invalid data",
        });
      }

      let updatedData = {};
      updatedData.productName = product.name;
      updatedData.imageURI = product.productImage1;
      updatedData.price = product.price;

      await MyCart.updateMany(
        {
          marketPlaceAddress: req.params.marketPlaceAddress,
          productId: req.params.productId,
        },
        { $set: updatedData },
        { new: false }
      );

      success = true;
      res.json({ success: success });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get(
  "/mycartitems",
  [
    body("userWallet", "Enter a valid user address").isLength({
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
      let cartItems = await MyCart.find({
        userWallet: req.body.userWallet,
      });

      success = true;
      res.json({ success: success, cartItems: cartItems });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get(
  "/mymarketcartitems/:marketPlaceAddress",
  [
    body("userWallet", "Enter a valid user address").isLength({
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
      let market = await Market.find({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        return res.status(400).json({
          success: success,
          error: "Inavlid market address not found",
        });
      }

      let cartItems = await MyCart.find({
        marketPlaceAddress: req.params.marketPlaceAddress,
        userWallet: req.body.userWallet,
      });

      success = true;
      res.json({ success: success, cartItems: cartItems });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/deleteallmarketcartitems",
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
      let market = Market.findOne({
        marketPlaceAddress: req.body.marketPlaceAddress,
      });

      if (market) {
        return res.status(400).json({
          success: success,
          error: "Market is exist not able to delete the cart items",
        });
      }

      let cartItem = await MyCart.deleteMany({
        marketPlaceAddress: req.body.marketPlaceAddress,
      });

      success = true;
      res.json({ success: success, cartItem: cartItem });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/deleteallmycartitems",
  [
    body("userWallet", "Enter a valid market place address").isLength({
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
      let cartItem = await MyCart.deleteMany({
        userWallet: req.body.userWallet,
      });

      if (!cartItem) {
        return res.status(400).json({
          success: success,
          error: "You do not hve any cart items to delete",
        });
      }
      success = true;
      res.json({ success: success, cartItem: cartItem });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/deletecartitem",
  [
    body("marketPlaceAddress", "Enter a valid market place address").isLength({
      min: 42,
      max: 42,
    }),
    body("userWallet", "Enter a valid userWallet address").isLength({
      min: 42,
      max: 42,
    }),
    body("productId", "Enter a valid productId").isInt({ min: 1 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: success, error: errors.array() });
    }

    try {
      let market = Market.findOne({
        marketPlaceAddress: req.body.marketPlaceAddress,
      });

      if (!market) {
        return res.status(400).json({
          success: success,
          error: "Market place not exist",
        });
      }

      let product = Product.findOne({
        marketPlaceAddress: req.body.marketPlaceAddress,
        productId: req.body.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "Product not found",
        });
      }

      let cartItem = await MyCart.findOneAndDelete({
        marketPlaceAddress: req.body.marketPlaceAddress,
        productId: req.body.productId,
        userWallet: req.body.userWallet,
      });

      if (!cartItem) {
        return res.status(400).json({
          success: success,
          error: "Item not found",
        });
      }

      success = true;
      res.json({ success: success, cartItem: cartItem });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get("/sortedpricecarts", [body("userWallet")], async (req, res) => {
  let success = false;
  try {
    let cartItems = await MyCart.find({ userWallet: req.body.userWallet }).sort(
      {
        price: 1,
      }
    );

    success = true;
    res.json({ success: success, cartItems: cartItems });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/sortedmarketnames", [body("userWallet")], async (req, res) => {
  let success = false;
  try {
    let cartItems = await MyCart.find({ userWallet: req.body.userWallet }).sort(
      {
        marketName: 1,
      }
    );

    success = true;
    res.json({ success: success, cartItems: cartItems });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

module.exports = router;
