const express = require("express");
const router = express.Router();
const multer = require("multer");
const Image = require("../models/Image");
const verifyToken = require("../middleware/auth");

// Multer Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Image (protected route)
router.post("/upload", verifyToken, upload.single("image"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const newImage = new Image({
      userId: req.userId, // Associate with the logged-in user
      image: req.file.buffer,
      contentType: req.file.mimetype,
      filename: req.file.originalname,
    });

    const savedImage = await newImage.save();
    res.status(201).json({
      message: "File uploaded successfully",
      imageId: savedImage._id,
    });
  } catch (error) {
    next(error);
  }
});

// Get Image by ID (protected route)
router.get("/image/:id", verifyToken, async (req, res, next) => {
  try {
    const image = await Image.findOne({ _id: req.params.id, userId: req.userId });
    if (!image) return res.status(404).json({ message: "Image not found" });

    res.set("Content-Type", image.contentType);
    res.send(image.image);
  } catch (err) {
    next(err);
  }
});

module.exports = router;