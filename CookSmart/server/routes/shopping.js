const express = require("express");
const { generateShoppingList } = require("../controllers/shoppingController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/generate", protect, generateShoppingList);

module.exports = router;
