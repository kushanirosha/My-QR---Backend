const mongoose = require("mongoose");

const pdfSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  pdf: { type: Buffer, required: true }, // Store the PDF as a Buffer
  contentType: { type: String, required: true }, // e.g., "application/pdf"
  filename: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Pdf", pdfSchema);