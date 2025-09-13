const Observation = require("../models/Observation");
const { success, error } = require("../utils/response");
const { uploadToCloudinary, deleteFromCloudinary } = require("../services/cloudinary");

// ===================== CREATE =====================
exports.createObservation = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    let attachments = [];
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.path, "observations"))
      );
      attachments = uploads.map(u => ({
        url: u.secure_url,
        public_id: u.public_id,
        type: u.resource_type
      }));
    }

    const observation = await Observation.create({
      user: req.user._id,
      title,
      description,
      category,
      attachments
    });

    return success(res, "Observation created", { observation });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};
// ===================== LIST (with search/filter/paginate) =====================
exports.getObservations = async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    const query = { user: req.user.id };

    if (category) query.category = category;
    if (search) query.$or = [
      { title: new RegExp(search, "i") },
      { description: new RegExp(search, "i") },
    ];

    const total = await Observation.countDocuments(query);
    const observations = await Observation.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    return success(res, "Observations fetched", {
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      observations,
    });
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// ===================== GET ONE =====================
exports.getObservation = async (req, res) => {
  try {
    const observation = await Observation.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!observation) return error(res, "Observation not found", 404);

    return success(res, "Observation fetched", observation);
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// ===================== UPDATE =====================
exports.updateObservation = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const observation = await Observation.findOne({ _id: id, user: req.user.id });
    if (!observation) return error(res, "Observation not found", 404);

    // Handle new uploads
    if (req.files && req.files.length > 0) {
      const uploads = await Promise.all(
        req.files.map(file => uploadToCloudinary(file.path, `observations/${req.user.id}`))
      );
      const newAttachments = uploads.map(up => ({
        url: up.url,
        public_id: up.public_id,
        type: fileTypeFromUrl(up.url),
      }));
      observation.attachments.push(...newAttachments);
    }

    // Update fields
    observation.title = updates.title || observation.title;
    observation.description = updates.description || observation.description;
    observation.category = updates.category || observation.category;
    observation.date = updates.date || observation.date;

    await observation.save();

    return success(res, "Observation updated", observation);
  } catch (err) {
    return error(res, "Server error", 500, err.message);
  }
};

// ===================== DELETE WHOLE OBSERVATION =====================
exports.deleteObservation = async (req, res) => {
  try {
    const { id } = req.params;

    const observation = await Observation.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!observation) return error(res, "Observation not found", 404);

    // Delete all attachments from Cloudinary
    if (observation.attachments && observation.attachments.length > 0) {
      await Promise.all(
        observation.attachments.map(att =>
          att.public_id ? deleteFromCloudinary(att.public_id) : null
        )
      );
    }

    await observation.deleteOne();

    return success(res, "Observation deleted", {});
  } catch (err) {
    return error(res, "Failed to delete observation", 500, err.message);
  }
};



// ===================== DELETE SINGLE ATTACHMENT =====================
exports.deleteAttachment = async (req, res) => {
  try {
    const { id, fileId } = req.params;

    const observation = await Observation.findOne({
      _id: id,
      user: req.user.id,
    });

    if (!observation) return error(res, "Observation not found", 404);

    const file = observation.attachments.find(f => f._id.toString() === fileId);
    if (!file) return error(res, "Attachment not found", 404);

    // Delete from Cloudinary
    if (file.public_id) {
      await deleteFromCloudinary(file.public_id);
    }

    // Remove from observation’s attachments
    observation.attachments = observation.attachments.filter(
      f => f._id.toString() !== fileId
    );

    await observation.save();

    return success(res, "Attachment deleted", observation);
  } catch (err) {
    return error(res, "Failed to delete attachment", 500, err.message);
  }
};



// ===================== HELPER =====================
function fileTypeFromUrl(url) {
  if (url.match(/\.(jpeg|jpg|png|gif)$/i)) return "image";
  if (url.match(/\.(pdf)$/i)) return "pdf";
  return "other";
}


