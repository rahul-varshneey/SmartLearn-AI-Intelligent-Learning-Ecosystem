const Quiz = require('../models/Quiz');
const Document = require('../models/Document');
const { ai } = require('../utils/ai');
const Analytics = require('../models/Analytics');

const generateQuiz = async (req, res) => {
  try {
    const { documentId, numQuestions = 5 } = req.body;

    const doc = await Document.findById(documentId);
    if (!doc) return res.status(404).json({ message: 'Document not found' });

    if (!ai) return res.status(500).json({ message: "AI not configured" });

    const prompt = `
      Create a ${numQuestions}-question multiple choice quiz based on the following text.
      Return strictly as a JSON array of objects.
      Each object must have:
      "type": "mcq",
      "questionText": The question string,
      "options": An array of 4 string options,
      "correctAnswer": The exact string of the correct option,
      "explanation": A brief explanation of why it is correct.

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

    const questions = JSON.parse(response.text);

    const quiz = await Quiz.create({
      documentId: doc._id,
      questions: questions,
    });

    res.status(201).json(quiz);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error generating quiz' });
  }
};

const submitQuiz = async (req, res) => {
  try {
    const { quizId, score } = req.body;

    const quiz = await Quiz.findByIdAndUpdate(quizId, { score }, { new: true });
    
    // Update Analytics model
    if (req.user && req.user.id) {
      await Analytics.findOneAndUpdate(
        { userId: req.user.id },
        { 
          $push: { 
            quizScores: { 
              quizId: quiz._id, 
              score: score, 
              total: quiz.questions.length 
            } 
          } 
        },
        { new: true, upsert: true }
      );
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error submitting quiz' });
  }
};

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  generateQuiz,
  submitQuiz,
  getQuizById
};
