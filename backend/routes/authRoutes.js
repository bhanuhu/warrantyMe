const express = require("express");
const { googleLogin, emailLogin, signup } = require("../controllers/authController");
const router = express.Router();

// Auth routes
router.post("/google", googleLogin);
router.post("/login", emailLogin);
router.post("/signup", signup);  // 🔹 Add this line

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working" });
});

module.exports = router;