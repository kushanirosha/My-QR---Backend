require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");

const app = express();
const port = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET; 

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// Image Schema
const imageSchema = new mongoose.Schema({
  userId: String,
  image: Buffer,
  contentType: String,
});

const Image = mongoose.model("Image", imageSchema);

// Multer Storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

// ✅ Register User
app.post("/api/users/create", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error creating user", error: err.message });
  }
});

// ✅ Login User
app.post("/api/users/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Error logging in", error: err.message });
  }
});

// ✅ Upload Image Route
app.post("/api/upload", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    const newImage = new Image({
      filename: req.file.originalname,
      image: req.file.buffer,
      contentType: req.file.mimetype,
    });

    const savedImage = await newImage.save();
    res.status(201).json({ message: "File uploaded successfully", imageId: savedImage._id });
  } catch (error) {
    res.status(500).json({ message: "Error uploading file", error: error.message });
  }
});

// ✅ Get Image by ID
app.get("/api/image/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: "Image not found" });

    res.set("Content-Type", image.contentType);
    res.send(image.image);
  } catch (err) {
    res.status(500).json({ message: "Error fetching image", error: err.message });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
