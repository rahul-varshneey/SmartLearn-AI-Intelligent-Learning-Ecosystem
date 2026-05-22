const Document = require('../models/Document');
const pdfParse = require('pdf-parse');
const { chunkText, generateSummary, generateEmbeddings } = require('../utils/ai');

const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    let extractedText = '';

    // Handle PDF extraction
    if (req.file.mimetype === 'application/pdf') {
      const data = await pdfParse(req.file.buffer);
      extractedText = data.text;
    } else if (req.file.mimetype === 'text/plain') {
      extractedText = req.file.buffer.toString('utf-8');
    } else {
      return res.status(400).json({ message: 'Unsupported file type. Please upload PDF or TXT.' });
    }

    // Chunk text and get embeddings
    const chunks = chunkText(extractedText);
    const summary = await generateSummary(extractedText);
    
    // We can do embeddings asynchronously or synchronously. For small chunks, sync is fine.
    // NOTE: For free tier limits, we might skip full embeddings until user asks for chat, but let's do it here.
    const embeddings = await generateEmbeddings(chunks);
    
    const chunkData = chunks.map((text, i) => ({
      text,
      embedding: embeddings[i]
    }));

    const doc = await Document.create({
      userId: req.user.id,
      filename: req.file.originalname,
      text: extractedText,
      summary,
      chunks: chunkData,
    });

    res.status(201).json(doc);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error processing document' });
  }
};

const getDocuments = async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.user.id }).select('-text -chunks');
    res.json(docs);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getDocumentById = async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.user.id }).select('-chunks'); // excluding embeddings to save bandwidth
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json(doc);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById
};
