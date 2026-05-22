const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { chatWithDocument } = require('../controllers/chatController');

router.post('/', protect, chatWithDocument);

module.exports = router;
