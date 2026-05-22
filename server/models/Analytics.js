const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    quizScores: [{
      quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
      score: Number,
      total: Number,
      date: { type: Date, default: Date.now }
    }],
    flashcardStats: {
      cardsReviewed: { type: Number, default: 0 },
      hardCards: { type: Number, default: 0 }, // dynamically updated
    },
    timeSpent: {
      type: Number, // in seconds or minutes
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Analytics', analyticsSchema);
