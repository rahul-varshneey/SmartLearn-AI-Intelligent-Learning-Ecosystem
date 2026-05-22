const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserAnalytics } = require('../controllers/analyticsController');

router.get('/', protect, getUserAnalytics);

module.exports = router;
