const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/document', require('./routes/document'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/flashcards', require('./routes/flashcards'));
app.use('/api/quiz', require('./routes/quiz'));
app.use('/api/mindmap', require('./routes/mindmap'));
app.use('/api/analytics', require('./routes/analytics'));

app.get('/', (req, res) => {
  res.send('SmartLearn AI API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
