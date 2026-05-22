const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateQuiz, submitQuiz, getQuizById } = require('../controllers/quizController');

router.post('/generate', protect, generateQuiz);
router.post('/submit', protect, submitQuiz);
router.get('/:id', protect, getQuizById);

module.exports = router;
