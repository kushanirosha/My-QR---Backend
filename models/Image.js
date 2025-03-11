const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  image: { type: Buffer, required: true },
  contentType: { type: String, required: true },
});

module.exports = mongoose.model("Image", imageSchema);