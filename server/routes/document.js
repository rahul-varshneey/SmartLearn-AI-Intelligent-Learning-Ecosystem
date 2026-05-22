const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { uploadDocument, getDocuments, getDocumentById } = require('../controllers/documentController');

// Multer memory storage (we process buffers directly for pdf-parse)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/upload', protect, upload.single('file'), uploadDocument);
router.get('/', protect, getDocuments);
router.get('/:id', protect, getDocumentById);

module.exports = router;
