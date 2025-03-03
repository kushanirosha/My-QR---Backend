const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs'); // For password hashing
const jwt = require('jsonwebtoken'); // For authentication

const app = express();
const port = 5000;
const SECRET_KEY = "your_jwt_secret"; // Change this to a strong secret

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB Atlas
const mongoURI = 'mongodb+srv://kushandissanayake74:mY0SFdo0Smn3L3rx@my-qr.9ewbk.mongodb.net/my-qr?retryWrites=true&w=majority';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.log('Error connecting to MongoDB Atlas:', err));

// Create User Schema
const userSchema = new mongoose.Schema({
  username: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model('User', userSchema);

// ✅ Create User Endpoint (Register)
app.post('/api/users/create', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // Hash password
    const newUser = new User({ username, email, password: hashedPassword });

    await newUser.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error creating user', error: err });
  }
});

// ✅ Login Endpoint
app.post('/api/users/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, SECRET_KEY, { expiresIn: '1h' });

    res.json({ token, userId: user._id });
  } catch (err) {
    res.status(500).json({ message: 'Error logging in', error: err });
  }
});

//  Get User QR Codes (Example for Dashboard)
// app.get('/api/users/qrcodes', async (req, res) => {
//   const { userId } = req.query;

//   try {
//     const qrCodes = await QRCode.find({ userId });
//     res.json(qrCodes);
//   } catch (err) {
//     res.status(500).json({ message: 'Error fetching QR codes', error: err });
//   }
// });

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
