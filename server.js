const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve front-end static files (vital for hosting everything on one service)
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/student_records";
mongoose.connect(MONGO_URI)
  .then(() => console.log("Connected to MongoDB successfully!"))
  .catch(err => console.error("Database connection error:", err));

// MongoDB Schema & Model
const studentSchema = new mongoose.Schema({
  idNumber: Number,
  fullname: { type: String, required: true },
  school: { type: String, required: true },
  level: String,
  paymentMethod: String,
  email: { type: String, required: true },
  terms: Boolean,
  createdAt: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// API Endpoints

// 1. Get all registered students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ idNumber: 1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch records", error });
  }
});

// 2. Add a new student record
app.post('/api/students', async (req, res) => {
  try {
    // Generate a simple sequential auto-incrementing ID based on current count
    const count = await Student.countDocuments();
    
    const newStudent = new Student({
      idNumber: count + 1,
      fullname: req.body.fullname,
      school: req.body.school,
      level: req.body.level,
      paymentMethod: req.body.paymentMethod,
      email: req.body.email,
      terms: req.body.terms
    });

    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    res.status(400).json({ message: "Failed to save record", error });
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});