const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/multer");
const {
  uploadDocument,
  getDocuments,
  deleteDocument,
  generateShareLink,
  getSharedDocument,
} = require("../controllers/documentController");

// Upload a document
router.post("/", protect, upload.single("file"), uploadDocument);

// Get all user documents (with search/filter/pagination)
router.get("/", protect, getDocuments);

// Delete a document
router.delete("/:id", protect, deleteDocument);

// Generate share link & QR
router.post("/:id/share", protect, generateShareLink);

// Access shared document (public, no auth)
router.get("/share/:token", getSharedDocument);

module.exports = router;
