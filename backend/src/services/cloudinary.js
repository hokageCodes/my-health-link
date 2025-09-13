const { v2: cloudinary } = require("cloudinary");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (filePath, folder = "myhealthlink") => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: "auto",
    });
    return result; // contains url + public_id
  } catch (err) {
    throw new Error("Cloudinary upload failed: " + err.message);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    throw new Error("Cloudinary delete failed: " + err.message);
  }
};

module.exports = { uploadToCloudinary, deleteFromCloudinary };
