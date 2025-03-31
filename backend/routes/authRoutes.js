const express = require("express");
const { googleLogin, emailLogin } = require("../controllers/authController");
const router = express.Router();

// Auth routes
router.post("/google", googleLogin);
router.post("/login", emailLogin);

// Test route
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes working" });
});

module.exports = router;