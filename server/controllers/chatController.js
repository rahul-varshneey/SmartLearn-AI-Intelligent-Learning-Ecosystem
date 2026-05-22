const Document = require('../models/Document');
const { generateEmbeddings, cosineSimilarity, ai } = require('../utils/ai');

const chatWithDocument = async (req, res) => {
  try {
    const { documentId, question } = req.body;

    if (!documentId || !question) {
      return res.status(400).json({ message: 'documentId and question are required' });
    }

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    // Step 1: Embed the user's question
    const queryEmbeddingObj = await generateEmbeddings([question]);
    const queryEmbedding = queryEmbeddingObj[0];

    // Step 2: Find top matching chunks
    let scoredChunks = doc.chunks.map(chunk => {
      const score = cosineSimilarity(queryEmbedding, chunk.embedding);
      return { text: chunk.text, score };
    });

    // Sort descending by score and take top 5 chunks
    scoredChunks.sort((a, b) => b.score - a.score);
    const topChunks = scoredChunks.slice(0, 5).map(c => c.text);

    const context = topChunks.join('\n\n---\n\n');

    // Step 3: Ask Gemini
    const prompt = `
      You are an intelligent learning assistant. Use the following context from an uploaded document to answer the user's question.
      If the answer is not in the context, tell the user that you don't know based on the provided document, but provide a general answer if helpful.

      Context:
      ${context}

      Question:
      ${question}
    `;

    if (!ai) {
      return res.json({ answer: "AI is not configured. Here are the top retrieved chunks:", context });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    res.json({ answer: response.text, citations: topChunks });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error in chat' });
  }
};

module.exports = {
  chatWithDocument
};
