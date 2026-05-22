const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { generateMindmap } = require('../controllers/mindmapController');

router.post('/', protect, generateMindmap);

module.exports = router;
