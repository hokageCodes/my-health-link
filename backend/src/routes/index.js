const express = require("express");
const router = express.Router();

// Example placeholder
router.get("/", (req, res) => {
  res.json({ message: "API is running..." });
});

module.exports = router;
