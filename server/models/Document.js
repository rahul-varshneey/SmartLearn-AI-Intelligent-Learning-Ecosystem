const mongoose = require('mongoose');

const chunkSchema = new mongoose.Schema({
  text: String,
  embedding: [Number], // For vector search
});

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    summary: {
      short: String,
      detailed: String,
      bulletPoints: [String],
      keyConcepts: [String]
    },
    chunks: [chunkSchema] // Contains smaller pieces of text with their embeddings
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
