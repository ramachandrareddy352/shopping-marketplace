const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Item = require("../models/Item");
const Market = require("../models/Market");
const Product = require("../models/Product");

// "/createitem/:marketPlaceAddress/:productId",
// "/soldeditems/:marketPlaceAddress"
// "/soldeditems/:marketPlaceAddress/:productId"
// "/boughtitems/:marketPlaceAddress/:buyer"
// "/owneditems/:marketPlaceAddress/:owner"
// "/getitem/:marketPlaceAddress/:itemId"

router.post(
  "/createitem/:marketPlaceAddress/:productId",
  [
    body("marketItemAddress", "Enter a valid market items address").isLength({
      min: 42,
      max: 42,
    }),
    body("itemId", "Invalid item id").isInt({ min: 1 }),
    body("imageURI", "Invalid image uri").isLength({ min: 5 }),
    body("marketName", "Invalid market name").isLength({ min: 5 }),
    body("productName", "Invalid product name").isLength({ min: 5 }),
    body("buyer", "Enter a valid buyer address").isLength({
      min: 42,
      max: 42,
    }),
    body("owner", "Enter a valid owner address").isLength({
      min: 42,
      max: 42,
    }),
    body("price", "Invalid price").isInt({ min: 1 }),
    body("quantity", "Invalid quantity number").isInt({ min: 1 }),
    body("collateralAddress", "Enter a valid collateral address").isLength({
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
      // check the whether the market is exist or not
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market || market.name != req.body.marketName) {
        return res.status(400).json({
          success: success,
          error: "Market place or name invalid",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product || product.name != req.body.productName) {
        return res.status(400).json({
          success: success,
          error: "Market product or name invalid",
        });
      }

      let item = await Item.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        itemId: req.body.itemId,
      });

      if (item) {
        return res.status(400).json({
          success: success,
          error: "Item is already exist",
        });
      }

      item = await Item.create({
        marketPlaceAddress: req.params.marketPlaceAddress,
        marketItemAddress: req.body.marketItemAddress,
        productId: req.params.productId,
        itemId: req.body.itemId,
        imageURI: req.body.imageURI,
        marketName: req.body.marketName,
        productName: req.body.productName,
        buyer: req.body.buyer,
        owner: req.body.owner,
        price: req.body.price,
        quantity: req.body.quantity,
        collateralAddress: req.body.collateralAddress,
      });

      success = true;
      res.json({ success: success, item: item });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get("/soldeditems/:marketPlaceAddress", async (req, res) => {
  let success = false;

  try {
    let market = await Market.findOne({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    if (!market) {
      return res.status(400).json({
        success: success,
        error: "Market place not exist",
      });
    }

    let items = await Item.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    success = true;
    res.json({ success: success, items: items });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/soldeditems/:marketPlaceAddress/:productId", async (req, res) => {
  let success = false;

  try {
    let market = await Market.findOne({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    if (!market) {
      return res.status(400).json({
        success: success,
        error: "Market place not exist",
      });
    }

    let product = await Product.findOne({
      marketPlaceAddress: req.params.marketPlaceAddress,
      productId: req.params.productId,
    });

    if (!product) {
      return res.status(400).json({
        success: success,
        error: "Market place product not exist",
      });
    }

    let items = await Item.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
      productId: req.params.productId,
    });

    success = true;
    res.json({ success: success, items: items });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/boughtitems/:marketPlaceAddress/:buyer", async (req, res) => {
  let success = false;

  try {
    let items = await Item.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
      buyer: req.params.buyer,
    });

    success = true;
    res.json({ success: success, items: items });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/owneditems/:marketPlaceAddress/:owner", async (req, res) => {
  let success = false;

  try {
    let items = await Item.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
      owner: req.params.owner,
    });

    success = true;
    res.json({ success: success, items: items });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/getitem/:marketPlaceAddress/:itemId", async (req, res) => {
  let success = false;

  try {
    let item = await Item.findOne({
      marketPlaceAddress: req.params.marketPlaceAddress,
      itemId: req.params.itemId,
    });

    if (!item) {
      return res.status(400).json({
        success: success,
        error: "Item does not exist",
      });
    }

    success = true;
    res.json({ success: success, item: item });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/myboughtitems/:buyer", async (req, res) => {
  let success = false;

  try {
    let items = await Item.find({
      buyer: req.params.buyer,
    });

    success = true;
    res.json({ success: success, items: items });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/myowneditems/:owner", async (req, res) => {
  let success = false;

  try {
    let items = await Item.find({
      owner: req.params.owner,
    });

    success = true;
    res.json({ success: success, items: items });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.put("/updatemarketname/:marketPlaceAddress", async (req, res) => {
  let success = false;

  try {
    let market = await Market.findOne({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    if (!market) {
      return res.status(400).json({
        success: success,
        error: "Market place address invalid",
      });
    }

    let updatedData = {};
    updatedData.marketName = market.name;

    await Item.updateMany(
      { marketPlaceAddress: req.params.marketPlaceAddress },
      { $set: updatedData },
      { new: false }
    );

    let items = await Item.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    success = true;
    res.json({ success: success, items: items });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.put(
  "/updateproductname/:marketPlaceAddress/:productId",
  async (req, res) => {
    let success = false;

    try {
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        return res.status(400).json({
          success: success,
          error: "Market place address invalid",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "Product invalid",
        });
      }

      let updatedData = {};
      updatedData.ProductName = product.name;

      await Item.updateMany(
        {
          marketPlaceAddress: req.params.marketPlaceAddress,
          productId: req.params.productId,
        },
        { $set: updatedData },
        { new: false }
      );

      let items = await Item.find({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      success = true;
      res.json({ success: success, items: items });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

module.exports = router;
