const multer = require("multer");
const path = require("path");

// Temp storage
const storage = multer.diskStorage({});

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const allowed = [".jpg", ".jpeg", ".png", ".pdf"];
  if (!allowed.includes(ext)) {
    return cb(new Error("Only images and PDFs are allowed"), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
