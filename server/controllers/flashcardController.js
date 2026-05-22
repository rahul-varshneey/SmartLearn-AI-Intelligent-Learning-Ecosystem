const Flashcard = require('../models/Flashcard');
const Document = require('../models/Document');
const { ai } = require('../utils/ai');
const Analytics = require('../models/Analytics');

const generateFlashcards = async (req, res) => {
  try {
    const { documentId } = req.body;

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (!ai) return res.status(500).json({ message: "AI not configured" });

    const prompt = `
      Extract 5-10 key concept-definition pairs from the following text to create flashcards.
      Return the output strictly as a JSON array of objects, where each object has a "question" (the concept or a question about it) and an "answer" (the definition or explanation).

      Text:
      ${doc.text.substring(0, 15000)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const parsedCards = JSON.parse(response.text);

    const savedCards = [];
    for (let card of parsedCards) {
      const newCard = await Flashcard.create({
        documentId: doc._id,
        question: card.question,
        answer: card.answer,
      });
      savedCards.push(newCard);
    }

    res.status(201).json(savedCards);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating flashcards' });
  }
};

const getFlashcardsByDoc = async (req, res) => {
  try {
    const cards = await Flashcard.find({ documentId: req.params.docId });
    res.json(cards);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const updateFlashcardDifficulty = async (req, res) => {
  try {
    const { id } = req.params;
    const { difficulty } = req.body;

    const card = await Flashcard.findByIdAndUpdate(id, { difficulty }, { new: true });
    
    // Update Analytics model
    if (req.user && req.user.id) {
      const updateData = { $inc: { 'flashcardStats.cardsReviewed': 1 } };
      if (difficulty === 'hard') {
        updateData.$inc['flashcardStats.hardCards'] = 1;
      }
      
      await Analytics.findOneAndUpdate(
        { userId: req.user.id },
        updateData,
        { new: true, upsert: true }
      );
    }

    res.json(card);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generateFlashcards,
  getFlashcardsByDoc,
  updateFlashcardDifficulty
};
