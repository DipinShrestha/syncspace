const express = require('express');
const {
  createDocument,
  getDocumentsByWorkspace,
  getDocumentById,
  updateDocument,
  deleteDocument,
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createDocument);

router.get('/workspace/:workspaceId', protect, getDocumentsByWorkspace);

router.route('/:id')
  .get(protect, getDocumentById)
  .put(protect, updateDocument)
  .delete(protect, deleteDocument);

module.exports = router;