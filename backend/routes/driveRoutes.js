const express = require("express");
const { uploadToDrive } = require("../controllers/driveController");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// Upload document to Google Drive
router.post("/save", verifyToken, uploadToDrive);

module.exports = router;