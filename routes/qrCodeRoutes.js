const express = require("express");
const router = express.Router();
const QRCode = require("../models/QRCode");
const verifyToken = require("../middleware/auth");

router.post("/", verifyToken, async (req, res, next) => {
  const { userId, qrCodes } = req.body;

  if (userId !== req.userId) {
    return res.status(403).json({ message: "Unauthorized: User ID mismatch" });
  }

  if (!Array.isArray(qrCodes) || qrCodes.length === 0) {
    return res.status(400).json({ message: "qrCodes must be a non-empty array" });
  }

  try {
    const savedQRCodes = [];
    for (const qrCodeData of qrCodes) {
      const { fileUrl, qrCodeImage, qrName, category } = qrCodeData;
      if (!fileUrl || !qrCodeImage) {
        return res.status(400).json({ message: "Each QR code must have fileUrl and qrCodeImage" });
      }

      const newQRCode = new QRCode({
        userId,
        fileUrl,
        qrCodeImage,
        qrName,
        category,
      });

      const savedQRCode = await newQRCode.save();
      savedQRCodes.push(savedQRCode);
    }

    res.status(201).json({
      message: "QR codes saved successfully",
      qrCodeIds: savedQRCodes.map((qrCode) => qrCode._id),
    });
  } catch (err) {
    next(err);
  }
});

// Add GET endpoint to fetch QR codes for the authenticated user
router.get("/", verifyToken, async (req, res, next) => {
  try {
    const qrCodes = await QRCode.find({ userId: req.userId }).select("-__v"); // Exclude __v field if not needed
    res.json({ qrCodes });
  } catch (err) {
    next(err);
  }
});

// Delete QR Code
router.delete("/:id", verifyToken, async (req, res, next) => {
    const { id } = req.params;
  
    try {
      const qrCode = await QRCode.findOneAndDelete({ _id: id, userId: req.userId });
      if (!qrCode) {
        return res.status(404).json({ message: "QR code not found or unauthorized" });
      }
      res.json({ message: "QR code deleted successfully" });
    } catch (err) {
      next(err);
    }
  });

module.exports = router;