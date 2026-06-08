const express = require('express');
const {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
  removeMember,
} = require('../controllers/workspaceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createWorkspace)
  .get(protect, getWorkspaces);

router.route('/:id')
  .get(protect, getWorkspaceById)
  .put(protect, updateWorkspace)
  .delete(protect, deleteWorkspace);

router.post('/:id/members', protect, addMember);
router.delete('/:workspaceId/members/:userId', protect, removeMember); // moved after router definition

module.exports = router;