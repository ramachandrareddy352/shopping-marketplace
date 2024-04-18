const connectToMongo = require("./db");
const express = require("express");
var cors = require("cors");

connectToMongo();
const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

app.get("/api", (req, res) => {
  res.send("Hello World!");
});

// Available Routes
app.use("/api/item", require("./routes/item"));
app.use("/api/market", require("./routes/market"));
app.use("/api/marketReview", require("./routes/marketReview"));
app.use("/api/mycart", require("./routes/mycart"));
app.use("/api/product", require("./routes/product"));
app.use("/api/productReview", require("./routes/productReview"));
app.use("/api/report", require("./routes/report"));

app.listen(port, () => {
  console.log(
    `shopping marketplace backend listening at http://127.0.0.1:${port}`
  );
});

// create  a item transcation report pdf to download
