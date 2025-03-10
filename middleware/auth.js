const jwt = require("jsonwebtoken");
const SECRET_KEY = "your_jwt_secret"; // Same secret key as in server.js

module.exports = (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1]; // Extract token from header
  if (!token) return res.status(401).json({ message: "Access denied. No token provided." });

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified; // Attach user info to request
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};
