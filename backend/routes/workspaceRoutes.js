// @desc    Add a member to workspace by email
// @route   POST /api/workspaces/:workspaceId/members
// @access  Private (workspace owner or admin)
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const workspaceId = req.params.workspaceId || req.params.id;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });

    // Check if current user is owner or admin
    const isOwner = workspace.owner.toString() === req.user.id;
    const isAdmin = workspace.members.some(m => m.user.toString() === req.user.id && m.role === 'admin');
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Find user by email
    const User = require('../models/User');
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    // Check if already a member
    const alreadyMember = workspace.members.some(m => m.user.toString() === userToAdd._id.toString());
    if (alreadyMember) return res.status(400).json({ message: 'User already in workspace' });

    workspace.members.push({ user: userToAdd._id, role: 'member' });
    await workspace.save();

    res.status(200).json({ message: 'Member added', workspace });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};