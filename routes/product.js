const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Market = require("../models/Market");
const Product = require("../models/Product");
const ProductReviews = require("../models/ProductReviews");

// http://127.0.0.1:5000/api/product/createproduct/:marketPlaceAddress
// http://127.0.0.1:5000/api/product/updateproductdata/:marketPlaceAddress/:productId
// http://127.0.0.1:5000/api/product/updateproductrating/:marketPlaceAddress/:productId
// http://127.0.0.1:5000/api/product/marketproducts/:marketPlaceAddress
// http://127.0.0.1:5000/api/product/marketproduct/marketproduct/:marketPlaceAddress/:productId
// http://127.0.0.1:5000/api/product/sortedratingproducts/:marketPlaceAddress
// http://127.0.0.1:5000/api/product/sortedpriceproducts/:marketPlaceAddress
// http://127.0.0.1:5000/api/product/deleteproduct/:marketPlaceAddress/:productId
// http://127.0.0.1:5000/api/product/deleteallmarketproducts/:marketPlaceAddress

// delete all products in market after deleting the marketplace

router.post(
  "/createproduct/:marketPlaceAddress",
  [
    body("name", "Enter a valid name").isLength({
      min: 3,
      max: 100,
    }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
    body("productId", "Invalid product id").isInt({ min: 1 }),
    body("marketOwner", "Enter a valid wallet address").isLength({
      min: 42,
      max: 42,
    }),
    body("productImage1", "invalid image-1").isLength({ min: 5 }),
    body("productImage2", "invalid image-2").isLength({ min: 5 }),
    body("productImage3", "invalid image-3").isLength({ min: 5 }),
    body("quantity", "Invaid quantity").isInt({ min: 1 }),
    body("price", "Invaid price").isInt({ min: 1 }),
    body("onSale", "Invalid data").isBoolean(),
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

      if (!market || market.marketOwner != req.body.marketOwner) {
        return res.status(400).json({
          success: success,
          error: "market place not found or invalid market owner",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.body.productId,
      });

      if (product) {
        return res.status(400).json({
          success: success,
          error: "product id already exist",
        });
      }

      product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        name: req.body.name,
      });

      if (product) {
        return res.status(400).json({
          success: success,
          error: "product name already exist",
        });
      }

      product = await Product.create({
        name: req.body.name,
        description: req.body.description,
        productId: req.body.productId,
        marketPlaceAddress: req.params.marketPlaceAddress,
        productImage1: req.body.productImage1,
        productImage2: req.body.productImage2,
        productImage3: req.body.productImage3,
        quantity: req.body.quantity,
        price: req.body.price,
        onSale: req.body.onSale,
      });

      success = true;
      res.json({ success: success, product: product });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.put(
  "/updateproductdata/:marketPlaceAddress/:productId",
  [
    body("name"),
    body("description"),
    body("marketOwner", "Enter a valid owner address").isLength({
      min: 42,
      max: 42,
    }),
    body("productImage1"),
    body("productImage2"),
    body("productImage3"),
    body("quantity"),
    body("price"),
    body("onSale"),
  ],
  async (req, res) => {
    let success = false;

    try {
      // Create a new new issue, single user can create multiple reports
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market || market.marketOwner != req.body.marketOwner) {
        return res.status(400).json({
          success: success,
          error: "Invalid marketplace or owner address",
        });
      }

      let product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "product id not exist",
        });
      }

      let updatedData = {};
      // length of the data is checked at frontend part

      if (req.body.name) {
        let data = await Product.findOne({
          marketPlaceAddress: req.params.marketPlaceAddress,
          name: req.body.name,
        });

        if (data) {
          return res.status(400).json({
            success: success,
            error: "Name is already exists",
          });
        }

        updatedData.name = req.body.name;
      }

      if (req.body.description) {
        updatedData.description = req.body.description;
      }

      if (req.body.productImage1) {
        updatedData.productImage1 = req.body.productImage1;
      }

      if (req.body.productImage2) {
        updatedData.productImage2 = req.body.productImage2;
      }

      if (req.body.productImage3) {
        updatedData.productImage3 = req.body.productImage3;
      }

      if (req.body.quantity) {
        updatedData.quantity = req.body.quantity;
      }

      if (req.body.price) {
        updatedData.price = req.body.price;
      }

      if (req.body.onSale) {
        updatedData.onSale = req.body.onSale;
      }
      // if data is not not found it does not create a new one
      await Product.findOneAndUpdate(
        {
          marketPlaceAddress: req.params.marketPlaceAddress,
          productId: req.params.productId,
        },
        { $set: updatedData },
        { new: false }
      );

      product = await Product.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      success = true;
      res.json({ success: success, product: product });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.put(
  "/updateproductrating/:marketPlaceAddress/:productId",
  async (req, res) => {
    let success = false;

    try {
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        return res.status(400).json({
          success: success,
          error: "market place address not found",
        });
      }

      let product = await Product.findOne({
        productId: req.params.productId,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "product not found",
        });
      }

      let reviews = await ProductReviews.find({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (reviews.length != 0) {
        let newRating = 0;

        for (let i = 0; i < reviews.length; i++) {
          newRating = newRating + reviews[i].stars;
        }

        newRating = newRating / reviews.length;

        let updatedMarket = {};
        updatedMarket.rating = newRating;

        await Product.findOneAndUpdate(
          {
            productId: req.params.productId,
            marketPlaceAddress: req.params.marketPlaceAddress,
          },
          { $set: updatedMarket },
          { new: false }
        );
      }

      product = await Product.findOne({
        productId: req.params.productId,
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      success = true;
      res.json({ success: success, product: product });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get("/marketproducts/:marketPlaceAddress", async (req, res) => {
  let success = false;
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

    let products = await Product.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    success = true;
    res.json({ success: success, products: products });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get(
  "/marketproduct/:marketPlaceAddress/:productId",
  async (req, res) => {
    let success = false;
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

      success = true;
      res.json({ success: success, product: product });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get("/sortedproductnames/:marketPlaceAddress", async (req, res) => {
  let success = false;
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

    let products = await Product.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
    }).sort({ name: 1 });

    success = true;
    res.json({ success: success, products: products });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/sortedratingproducts/:marketPlaceAddress", async (req, res) => {
  let success = false;
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

    let products = await Product.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
    }).sort({ rating: 1 });

    success = true;
    res.json({ success: success, products: products });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/sortedpriceproducts/:marketPlaceAddress", async (req, res) => {
  let success = false;
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

    let products = await Product.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
    }).sort({ price: 1 });

    success = true;
    res.json({ success: success, products: products });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.delete(
  "/deleteproduct/:marketPlaceAddress/:productId",
  [
    body("marketOwner", "Enter a valid owner address").isLength({
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

      if (!market || market.marketOwner != req.body.marketOwner) {
        return res.status(400).json({
          success: success,
          error: "Invalid marketplace or owner address",
        });
      }

      let product = await Product.findOneAndDelete({
        marketPlaceAddress: req.params.marketPlaceAddress,
        productId: req.params.productId,
      });

      if (!product) {
        return res.status(400).json({
          success: success,
          error: "No products exists",
        });
      }

      success = true;
      res.json({ success: success, product: product });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.delete(
  "/deleteallmarketproducts",
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
        return res.status(400).json({
          success: success,
          error: "Marketplace is exist so you cannot delete all products",
        });
      }

      let products = await Product.deleteMany({
        marketPlaceAddress: req.body.marketPlaceAddress,
      });

      if (!products) {
        return res.status(400).json({
          success: success,
          error: "No products exists",
        });
      }

      success = true;
      res.json({ success: success, products: products });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

module.exports = router;
