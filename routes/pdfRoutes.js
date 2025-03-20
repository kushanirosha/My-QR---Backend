const express = require("express");
const router = express.Router();
const multer = require("multer");
const Pdf = require("../models/Pdf");
const verifyToken = require("../middleware/auth");

// Multer Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload PDF (protected route)
router.post("/upload", verifyToken, upload.single("pdf"), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const newPdf = new Pdf({
      userId: req.userId, // Associate with the logged-in user
      pdf: req.file.buffer,
      contentType: req.file.mimetype,
      filename: req.file.originalname,
    });

    const savedPdf = await newPdf.save();
    res.status(201).json({
      message: "PDF uploaded successfully",
      pdfId: savedPdf._id,
    });
  } catch (error) {
    next(error);
  }
});

// Get PDF by ID (protected route)
router.get("/pdf/:id", verifyToken, async (req, res, next) => {
  try {
    const pdf = await Pdf.findOne({ _id: req.params.id, userId: req.userId });
    if (!pdf) return res.status(404).json({ message: "PDF not found" });

    res.set("Content-Type", pdf.contentType);
    res.send(pdf.pdf);
  } catch (err) {
    next(err);
  }
});

module.exports = router;