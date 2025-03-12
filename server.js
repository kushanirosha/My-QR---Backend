require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const imageRoutes = require("./routes/imageRoutes");
const qrCodeRoutes = require("./routes/qrCodeRoutes");
const errorMiddleware = require("./middleware/error");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.log("Error connecting to MongoDB Atlas:", err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api", imageRoutes);
app.use("/api/qrcodes", qrCodeRoutes);

// Error Handling Middleware
app.use(errorMiddleware);

// Start Server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});