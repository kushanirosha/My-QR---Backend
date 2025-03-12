const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  image: { type: Buffer, required: true },
  contentType: { type: String, required: true },
  filename: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Image", imageSchema);