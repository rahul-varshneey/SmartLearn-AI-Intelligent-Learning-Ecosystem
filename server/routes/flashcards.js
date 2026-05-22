const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateFlashcards, getFlashcardsByDoc, updateFlashcardDifficulty } = require('../controllers/flashcardController');

router.post('/generate', protect, generateFlashcards);
router.get('/:docId', protect, getFlashcardsByDoc);
router.put('/update/:id', protect, updateFlashcardDifficulty);

module.exports = router;
