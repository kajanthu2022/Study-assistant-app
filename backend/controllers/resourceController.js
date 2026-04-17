const Resource = require("../models/Resource");
const path = require("path");
const { sendSuccess, sendCreated } = require("../utils/response");

const uploadResource = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const resource = await Resource.create({
      title: req.body.title,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: path.extname(req.file.originalname),
      userId: req.user.id
    });

    sendCreated(res, resource, "Resource uploaded successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getResources = async (req, res) => {
  try {
    const resources = await Resource.find({ userId: req.user.id });
    sendSuccess(res, resources, "Resources retrieved successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { title: req.body.title },
      { new: true }
    );
    if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
    sendSuccess(res, resource, "Resource updated successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    if (!resource) return res.status(404).json({ success: false, message: "Resource not found" });
    sendSuccess(res, null, "Resource deleted successfully");
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { uploadResource, getResources, updateResource, deleteResource };