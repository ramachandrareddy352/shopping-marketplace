const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Market = require("../models/Market");
const MarketReviews = require("../models/MarketReviews");

// http://127.0.0.1:5000/api/market/createmarket
// http://127.0.0.1:5000/api/market/updatemarketdata/:marketPlaceAddress
// http://127.0.0.1:5000/api/market/updatemarketowner/:marketPlaceAddress
// http://127.0.0.1:5000/api/market/updatemarketrating/:marketPlaceAddress
// http://127.0.0.1:5000/api/market/updatemarkettradedvolume/:marketPlaceAddress
// http://127.0.0.1:5000/api/market/allmarkets
// http://127.0.0.1:5000/api/market/mymarket
// http://127.0.0.1:5000/api/market/market/:marketPlaceAddress
// http://127.0.0.1:5000/api/market/sortedratingmarkets
// http://127.0.0.1:5000/api/market/sortedtradingmarkets
// http://127.0.0.1:5000/api/market/deletemarket/:marketPlaceAddress

// after deleting marketplace delete all the related products, product reviews and market reviews data also except items

router.post(
  "/createmarket",
  [
    body("name", "Enter a valid name").isLength({
      min: 3,
      max: 50,
    }),
    body("description", "Enter a valid description").isLength({ min: 5 }),
    body("marketOwner", "Enter a valid owner address").isLength({
      min: 42,
      max: 42,
    }),
    body("marketLogo", "Enter a valid market logo").isLength({ min: 5 }),
    body("marketBackground", "Enter a valid market background image").isLength({
      min: 5,
    }),
    body("marketTwitter", "Enter a valid twitter account").isLength({ min: 5 }),
    body("marketInsta", "Enter a valid insta page").isLength({ min: 5 }),
    body("marketFacbook", "Enter a valid facebook account").isLength({
      min: 5,
    }),
    body("marketYoutube", "Enter a valid youtube channel").isLength({ min: 5 }),
    body("marketMail", "Enter a valid email").isEmail(),
    body("marketId", "Enter a valid marketId").isInt({ min: 1 }),
    body("marketPlaceAddress", "Enter a valid market place address").isLength({
      min: 42,
      max: 42,
    }),
    body("marketItemAddress", "Enter a valid market item address").isLength({
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
        marketOwner: req.body.marketOwner,
      });

      if (market) {
        return res.status(400).json({
          success: success,
          error: "Owner has already marketplace exists",
        });
      }

      market = await Market.findOne({
        name: req.body.name,
      });

      if (market) {
        return res.status(400).json({
          success: success,
          error: "Sorry market name is already exists",
        });
      }

      market = await Market.findOne({
        marketPlaceAddress: req.body.marketPlaceAddress,
      });

      if (market) {
        return res.status(400).json({
          success: success,
          error: "Sorry market place address is already exists",
        });
      }

      market = await Market.create({
        name: req.body.name,
        description: req.body.description,
        marketOwner: req.body.marketOwner,
        marketLogo: req.body.marketLogo,
        marketBackground: req.body.marketBackground,
        marketTwitter: req.body.marketTwitter,
        marketInsta: req.body.marketInsta,
        marketFacbook: req.body.marketFacbook,
        marketYoutube: req.body.marketYoutube,
        marketMail: req.body.marketMail,
        marketId: req.body.marketId,
        marketPlaceAddress: req.body.marketPlaceAddress,
        marketItemAddress: req.body.marketItemAddress,
      });

      success = true;
      res.json({ success: success, market: market });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.put(
  "/updatemarketdata/:marketPlaceAddress",
  [
    body("marketOwner"),
    body("name"),
    body("description"),
    body("marketLogo"),
    body("marketBackground"),
    body("marketTwitter"),
    body("marketInsta"),
    body("marketFacbook"),
    body("marketYoutube"),
    body("marketMail"),
  ],
  async (req, res) => {
    let success = false;

    try {
      // Create a new new issue, single user can create multiple reports
      let market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      if (!market) {
        return res.status(400).json({
          success: success,
          error: "Invalid marketplace address",
        });
      }

      market = await Market.findOne({
        marketOwner: req.body.marketOwner,
      });

      if (
        !market ||
        market.marketPlaceAddress != req.params.marketPlaceAddress
      ) {
        return res.status(400).json({
          success: success,
          error: "You do not have any marketplace",
        });
      }

      let updatedData = {};
      // length of the data is checked at frontend part

      if (req.body.name) {
        let data = await Market.findOne({ name: req.body.name });

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

      if (req.body.marketLogo) {
        updatedData.marketLogo = req.body.marketLogo;
      }

      if (req.body.marketBackground) {
        updatedData.marketBackground = req.body.marketBackground;
      }

      if (req.body.marketTwitter) {
        updatedData.marketTwitter = req.body.marketTwitter;
      }

      if (req.body.marketInsta) {
        updatedData.marketInsta = req.body.marketInsta;
      }

      if (req.body.marketFacbook) {
        updatedData.marketFacbook = req.body.marketFacbook;
      }

      if (req.body.marketYoutube) {
        updatedData.marketYoutube = req.body.marketYoutube;
      }

      if (req.body.marketMail) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(req.body.marketMail)) {
          return res.status(400).json({
            success: success,
            error: "Invalid email address",
          });
        }

        updatedData.marketMail = req.body.marketMail;
      }

      // if data is not not found it does not create a new one
      await Market.findOneAndUpdate(
        { marketPlaceAddress: req.params.marketPlaceAddress },
        { $set: updatedData },
        { new: true }
      );

      market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      success = true;
      res.json({ success: success, market: market });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.put(
  "/updatemarketowner/:marketPlaceAddress",
  [
    body("newOwner", "Invalid new owner").isLength({ min: 42, max: 42 }),
    body("marketOwner", "Invalid market owner").isLength({ min: 42, max: 42 }),
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
          error: "Invalid market place address",
        });
      }

      market = await Market.findOne({
        marketOwner: req.body.marketOwner,
      });

      if (
        !market ||
        market.marketPlaceAddress != req.params.marketPlaceAddress
      ) {
        return res.status(400).json({
          success: success,
          error: "You do not have any marketplace",
        });
      }

      market = await Market.findOne({
        marketOwner: req.body.newOwner,
      });

      if (market) {
        return res.status(400).json({
          success: success,
          error: "New owner has already have marketplace",
        });
      }

      let updatedMarket = {};
      updatedMarket.marketOwner = req.body.newOwner;

      await Market.findOneAndUpdate(
        { marketPlaceAddress: req.params.marketPlaceAddress },
        { $set: updatedMarket },
        { new: false }
      );

      market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      success = true;
      res.json({ success: success, market: market });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.put("/updatemarketrating/:marketPlaceAddress", async (req, res) => {
  let success = false;

  try {
    let market = await Market.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    if (!market) {
      return res.status(400).json({
        success: success,
        error: "market place address not found",
      });
    }

    let reviews = await MarketReviews.find({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    if (reviews.length != 0) {
      let newRating = 0;

      for (let i = 0; i < reviews.length; i++) {
        newRating = newRating + reviews[i].stars;
      }

      newRating = newRating / reviews.length;

      let updatedMarket = {};
      updatedMarket.marketRating = newRating;

      await Market.findOneAndUpdate(
        { marketPlaceAddress: req.params.marketPlaceAddress },
        { $set: updatedMarket },
        { new: false }
      );
    }

    market = await Market.findOne({
      marketPlaceAddress: req.params.marketPlaceAddress,
    });

    success = true;
    res.json({ success: success, market: market });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.put(
  "/updatemarkettradedvolume/:marketPlaceAddress",
  [body("tradeVolume", "Invalid volume").isInt({ min: 1 })],
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
          error: "marketPlace address not found",
        });
      }

      let updatedMarket = {};
      updatedMarket.totalTradedInUSD =
        market.totalTradedInUSD + req.body.tradeVolume;

      await Market.findOneAndUpdate(
        { marketPlaceAddress: req.params.marketPlaceAddress },
        { $set: updatedMarket },
        { new: false }
      );

      market = await Market.findOne({
        marketPlaceAddress: req.params.marketPlaceAddress,
      });

      success = true;
      res.json({ success: success, market: market });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get("/allmarkets", async (req, res) => {
  let success = false;
  try {
    let markets = await Market.find({});

    success = true;
    res.json({ success: success, markets: markets });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/market/:marketPlaceAddress", async (req, res) => {
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

    success = true;
    res.json({ success: success, market: market });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get(
  "/mymarket",
  [
    body("marketOwner", "Enter a valid owner address").isLength({
      min: 42,
      max: 42,
    }),
  ],
  async (req, res) => {
    let success = false;
    try {
      let market = await Market.findOne({
        marketOwner: req.body.marketOwner,
      });

      if (!market) {
        return res.status(400).json({
          success: success,
          error: "You do not have any marketplace",
        });
      }

      success = true;
      res.json({ success: success, market: market });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

router.get("/sortedmarketnames", async (req, res) => {
  let success = false;
  try {
    let markets = await Market.find({}).sort({
      name: 1,
    });

    success = true;
    res.json({ success: success, markets: markets });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/sortedratingmarkets", async (req, res) => {
  let success = false;
  try {
    let markets = await Market.find({}).sort({ marketRating: -1 });

    success = true;
    res.json({ success: success, markets: markets });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.get("/sortedtradingmarkets", async (req, res) => {
  let success = false;
  try {
    let markets = await Market.find({}).sort({ totalTradedInUSD: 1 });

    success = true;
    res.json({ success: success, markets: markets });
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.delete(
  "/deletemarket/:marketPlaceAddress",
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
      let market = await Market.findOneAndDelete({
        marketOwner: req.body.marketOwner,
      });

      if (
        !market ||
        market.marketPlaceAddress != req.params.marketPlaceAddress
      ) {
        return res.status(400).json({
          success: success,
          error: "Invalid marketplace for this owner",
        });
      }

      market = await Market.findOneAndDelete({
        marketOwner: req.body.marketOwner,
      });

      success = true;
      res.json({ success: success, market: market });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

module.exports = router;
