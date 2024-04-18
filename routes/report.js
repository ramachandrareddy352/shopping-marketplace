const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const Report = require("../models/Report");

// "/getissues"
// "/reportissue"

router.get("/getissues", async (req, res) => {
  let success = true;
  try {
    const issues = await Report.find({});
    res.json({ success: success, issues: issues });
  } catch (error) {
    success = false;
    console.error(error.message);
    res.status(500).send({ success: success, error: "Internal Server Error" });
  }
});

router.post(
  "/reportissue",
  [
    body("name", "Enter a valid name").isLength({ min: 3 }),
    body("email", "Enter a valid email").isEmail(),
    body("issue", "Enter a valid issue").isLength({ min: 5, max: 1000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    let success = false;

    if (!errors.isEmpty()) {
      return res.status(400).json({ success: success, error: errors.array() });
    }

    try {
      // Create a new new issue, single user can create multiple reports
      let report = await Report.findOne({
        issue: req.body.issue,
      });

      if (report) {
        return res.status(400).json({
          success: success,
          error: "This problem is already reported",
        });
      }

      report = await Report.create({
        name: req.body.name,
        email: req.body.email,
        issue: req.body.issue,
      });

      success = true;
      res.json({ success: success, report: report });
    } catch (error) {
      console.error(error.message);
      res
        .status(500)
        .send({ success: success, error: "Internal Server Error" });
    }
  }
);

module.exports = router;
