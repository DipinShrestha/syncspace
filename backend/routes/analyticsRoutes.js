const express = require('express');
const { getWorkspaceAnalytics } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:workspaceId', protect, getWorkspaceAnalytics);

module.exports = router;