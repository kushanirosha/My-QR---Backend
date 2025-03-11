const express = require("express");
const router = express.Router();
const multer = require("multer");
const Image = require("../models/Image");

// Multer Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload Image
router.post("/upload", upload.single("image"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const newImage = new Image({
      userId: req.body.userId, // Assuming userId is sent in the request body
      image: req.file.buffer,
      contentType: req.file.mimetype,
    });

    const savedImage = await newImage.save();
    res.status(201).json({ message: "File uploaded successfully", imageId: savedImage._id });
  } catch (error) {
    next(error);
  }
});

// Get Image by ID
router.get("/image/:id", async (req, res, next) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }

    res.set("Content-Type", image.contentType);
    res.send(image.image);
  } catch (err) {
    next(err);
  }
});

module.exports = router;