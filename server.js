const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/evconnect';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// MongoDB Schemas
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const stationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  connectors: [{ type: String }],
  maxKw: { type: Number },
  price: { type: Number },
  rating: { type: Number },
  freePorts: { type: Number },
  totalPorts: { type: Number },
  hours: { type: String },
  amenities: [{ type: String }],
  status: { type: String, default: 'available' }
});

const bookingSchema = new mongoose.Schema({
  bookingId: { type: String, required: true, unique: true },
  userEmail: { type: String, required: true },
  customerName: { type: String, required: true },
  stationName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  connector: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, default: 'confirmed' },
  createdAt: { type: Date, default: Date.now }
});

const feedbackSchema = new mongoose.Schema({
  feedbackId: { type: String, required: true, unique: true },
  bookingRef: { type: String },
  stationName: { type: String, required: true },
  rating: { type: Number, required: true },
  chargingSpeed: String,
  cleanliness: String,
  staffFriendliness: String,
  comments: String,
  recommend: String,
  userEmail: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Models
const User = mongoose.model('User', userSchema);
const Station = mongoose.model('Station', stationSchema);
const Booking = mongoose.model('Booking', bookingSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'evconnect-secret-key-2025';

// Routes

// User Registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Admin Login
app.post('/api/auth/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email, isAdmin: true });
    if (!user) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid admin credentials' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Stations
app.get('/api/stations', async (req, res) => {
  try {
    const stations = await Station.find();
    res.json(stations);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create Booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { userEmail, customerName, stationName, date, time, connector, amount } = req.body;

    const bookingId = 'EVC-' + Date.now().toString(36).toUpperCase().slice(-6);

    const booking = new Booking({
      bookingId,
      userEmail,
      customerName,
      stationName,
      date: new Date(date),
      time,
      connector,
      amount,
      status: 'confirmed'
    });

    await booking.save();
    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get All Bookings (Admin)
app.get('/api/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update Booking
app.put('/api/bookings/:id', async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete Booking
app.delete('/api/bookings/:id', async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Submit Feedback
app.post('/api/feedback', async (req, res) => {
  try {
    const { bookingRef, stationName, rating, chargingSpeed, cleanliness, staffFriendliness, comments, recommend, userEmail } = req.body;

    const feedbackId = 'FB-' + Date.now().toString(36).toUpperCase().slice(-6);

    const feedback = new Feedback({
      feedbackId,
      bookingRef,
      stationName,
      rating,
      chargingSpeed,
      cleanliness,
      staffFriendliness,
      comments,
      recommend,
      userEmail
    });

    await feedback.save();
    res.status(201).json({ message: 'Feedback submitted successfully', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get Feedback (Admin)
app.get('/api/feedback', async (req, res) => {
  try {
    const feedback = await Feedback.find().sort({ createdAt: -1 });
    res.json(feedback);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Seed initial stations data
app.post('/api/seed/stations', async (req, res) => {
  try {
    const stations = [
      {
        name: 'Colombo City Center',
        address: 'No. 123, Union Place, Colombo 02',
        connectors: ['CCS2', 'Type2', 'CHAdeMO'],
        maxKw: 150,
        price: 45,
        rating: 4.8,
        freePorts: 4,
        totalPorts: 6,
        hours: '24/7',
        amenities: ['Parking', 'WiFi', 'Café'],
        status: 'available'
      },
      {
        name: 'Kandy City Center',
        address: 'Kandy City Center, Dalada Veediya',
        connectors: ['CCS2', 'Type2'],
        maxKw: 100,
        price: 40,
        rating: 4.6,
        freePorts: 2,
        totalPorts: 4,
        hours: '6am–10pm',
        amenities: ['Parking', 'Restroom'],
        status: 'available'
      },
      {
        name: 'One Galleface Mall',
        address: 'Galle Road, Colombo 7',
        connectors: ['CCS2', 'Type2'],
        maxKw: 100,
        price: 45,
        rating: 4.7,
        freePorts: 3,
        totalPorts: 5,
        hours: '24/7',
        amenities: ['Parking', 'Shopping', 'WiFi'],
        status: 'available'
      },
      {
        name: 'Negombo Beach Road',
        address: 'Lewis Place, Negombo',
        connectors: ['CCS2', 'Type2'],
        maxKw: 100,
        price: 42,
        rating: 4.5,
        freePorts: 2,
        totalPorts: 4,
        hours: '7am–9pm',
        amenities: ['Parking', 'Beach access'],
        status: 'available'
      },
      {
        name: 'Matale Highway Stop',
        address: 'Kandy Road, Matale',
        connectors: ['CCS2', 'Type2', 'CHAdeMO'],
        maxKw: 150,
        price: 41,
        rating: 4.5,
        freePorts: 3,
        totalPorts: 8,
        hours: '24/7',
        amenities: ['Parking', 'Restroom', 'Café'],
        status: 'available'
      },
      {
        name: 'Galle Fort',
        address: 'Main Street, Galle',
        connectors: ['CCS2', 'Type2'],
        maxKw: 50,
        price: 45,
        rating: 4.4,
        freePorts: 1,
        totalPorts: 3,
        hours: '8am–8pm',
        amenities: ['Parking'],
        status: 'available'
      }
    ];

    await Station.insertMany(stations);
    res.json({ message: 'Stations seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Seed admin user
app.post('/api/seed/admin', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@evconnect.lk',
      phone: '+94 75 396 6006',
      password: hashedPassword,
      isAdmin: true
    });

    await admin.save();
    res.json({ message: 'Admin user seeded successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
