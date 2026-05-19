const Workspace = require('../models/Workspace');

// @desc    Create a new workspace
// @route   POST /api/workspaces
// @access  Private
const createWorkspace = async (req, res) => {
  try {
    const { name, description } = req.body;
    const workspace = await Workspace.create({
      name,
      description,
      owner: req.user.id,
      members: [{ user: req.user.id, role: 'admin' }],
    });
    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all workspaces for the logged-in user
// @route   GET /api/workspaces
// @access  Private
const getWorkspaces = async (req, res) => {
  try {
    // Find workspaces where user is owner or member
    const workspaces = await Workspace.find({
      $or: [
        { owner: req.user.id },
        { 'members.user': req.user.id }
      ]
    }).populate('owner', 'name email').populate('members.user', 'name email');
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single workspace by ID
// @route   GET /api/workspaces/:id
// @access  Private (only members)
const getWorkspaceById = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members.user', 'name email');
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    // Check if user is member or owner
    const isMember = workspace.members.some(m => m.user._id.toString() === req.user.id);
    if (workspace.owner._id.toString() !== req.user.id && !isMember) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update workspace
// @route   PUT /api/workspaces/:id
// @access  Private (admin or owner)
const updateWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    // Only owner or admin can update
    const isAdmin = workspace.members.some(m => m.user.toString() === req.user.id && m.role === 'admin');
    if (workspace.owner.toString() !== req.user.id && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const { name, description } = req.body;
    workspace.name = name || workspace.name;
    workspace.description = description || workspace.description;
    const updated = await workspace.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/workspaces/:id
// @access  Private (owner only)
const deleteWorkspace = async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    if (workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only owner can delete' });
    }
    await workspace.deleteOne();
    res.json({ message: 'Workspace removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a member to workspace
// @route   POST /api/workspaces/:id/members
// @access  Private (admin or owner)
const addMember = async (req, res) => {
  try {
    const { userId, role } = req.body;
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    const isAdmin = workspace.members.some(m => m.user.toString() === req.user.id && m.role === 'admin');
    if (workspace.owner.toString() !== req.user.id && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    // Check if user already a member
    const alreadyMember = workspace.members.some(m => m.user.toString() === userId);
    if (alreadyMember) {
      return res.status(400).json({ message: 'User already in workspace' });
    }
    workspace.members.push({ user: userId, role: role || 'member' });
    await workspace.save();
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createWorkspace,
  getWorkspaces,
  getWorkspaceById,
  updateWorkspace,
  deleteWorkspace,
  addMember,
};