const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['mcq', 'tf', 'short'],
    required: true
  },
  questionText: { type: String, required: true },
  options: [String], // for MCQ
  correctAnswer: { type: String, required: true }, // can be option text, 'true'/'false', or short string
  explanation: String,
});

const quizSchema = new mongoose.Schema(
  {
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
      required: true,
    },
    questions: [questionSchema],
    score: {
      type: Number,
      default: null, // null if not yet taken
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);
