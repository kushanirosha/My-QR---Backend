const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileUrl: { type: String, required: true },
  qrCodeImage: { type: String, required: true },
  qrName: { type: String },
  category: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("QRCode", qrCodeSchema);