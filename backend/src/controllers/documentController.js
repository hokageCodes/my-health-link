const Document = require("../models/Document");
const { success, error } = require("../utils/response");
const cloudinary = require("../services/cloudinary");
const Tesseract = require("tesseract.js");
const QRCode = require("qrcode");
const crypto = require("crypto");

// ===================== UPLOAD DOCUMENT =====================
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return error(res, "No file uploaded", 400);

    const { title, category, description } = req.body;

    // Upload to Cloudinary
    const result = await cloudinary.uploadToCloudinary(req.file.path, `myhealthlink/${req.user._id}`);

    // OCR (extract text)
    let extractedText = "";
    if (req.file.mimetype.includes("image") || req.file.mimetype.includes("pdf")) {
      try {
        const ocrResult = await Tesseract.recognize(req.file.path, "eng");
        extractedText = ocrResult.data.text;
      } catch (e) {
        console.warn("OCR failed:", e.message);
      }
    }

    const doc = await Document.create({
      user: req.user._id,
      title,
      description,
      category,
      fileUrl: result.url,
      fileType: req.file.mimetype,
      extractedText,
      tags: [category, req.file.mimetype.split("/")[1]], // simple auto-tags
    });

    return success(res, "Document uploaded", doc);
  } catch (err) {
    return error(res, "Failed to upload document", 500, err.message);
  }
};

// ===================== GET USER DOCUMENTS =====================
exports.getDocuments = async (req, res) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (category) query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { extractedText: { $regex: search, $options: "i" } },
      ];
    }

    const docs = await Document.find(query)
      .sort({ uploadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Document.countDocuments(query);

    return success(res, "Documents fetched", {
      docs,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    return error(res, "Failed to fetch documents", 500, err.message);
  }
};

// ===================== DELETE DOCUMENT =====================
exports.deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findOne({ _id: id, user: req.user._id });
    if (!doc) return error(res, "Document not found", 404);

    await cloudinary.deleteFromCloudinary(doc.fileUrl);
    await doc.remove();

    return success(res, "Document deleted");
  } catch (err) {
    return error(res, "Failed to delete document", 500, err.message);
  }
};

// ===================== GENERATE SHARE LINK =====================
exports.generateShareLink = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await Document.findOne({ _id: id, user: req.user._id });
    if (!doc) return error(res, "Document not found", 404);

    const token = crypto.randomBytes(20).toString("hex");
    doc.shareToken = token;
    doc.shareTokenExpires = Date.now() + 1000 * 60 * 60; // 1 hour
    await doc.save();

    const shareUrl = `${process.env.FRONTEND_URL}/share/${token}`;
    const qrCode = await QRCode.toDataURL(shareUrl);

    return success(res, "Share link generated", { shareUrl, qrCode });
  } catch (err) {
    return error(res, "Failed to generate share link", 500, err.message);
  }
};

// ===================== ACCESS SHARED DOCUMENT =====================
exports.getSharedDocument = async (req, res) => {
  try {
    const { token } = req.params;
    const doc = await Document.findOne({ shareToken: token, shareTokenExpires: { $gt: Date.now() } });
    if (!doc) return error(res, "Invalid or expired link", 404);

    return success(res, "Shared document fetched", doc);
  } catch (err) {
    return error(res, "Failed to fetch shared document", 500, err.message);
  }
};
