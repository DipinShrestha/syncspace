const Workspace = require('../models/Workspace');
const Board = require('../models/Board');
const Card = require('../models/Card');
const Message = require('../models/Message');
const Document = require('../models/Document');
const User = require('../models/User');

// @desc    Get analytics data for a workspace
// @route   GET /api/analytics/:workspaceId
// @access  Private
const getWorkspaceAnalytics = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: 'Workspace not found' });
    const isMember = workspace.members.some(m => m.user.toString() === req.user.id);
    if (!isMember && workspace.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get all boards in this workspace
    const boards = await Board.find({ workspace: workspaceId });
    const boardIds = boards.map(b => b._id);
    const cards = await Card.find({ board: { $in: boardIds } });
    
    // Get messages
    const messages = await Message.find({ workspace: workspaceId });
    
    // Get documents
    const documents = await Document.find({ workspace: workspaceId });

    // Task stats per member
    const tasksByMember = {};
    cards.forEach(card => {
      if (!card.assignedTo) return;
      const userId = card.assignedTo.toString();
      if (!tasksByMember[userId]) tasksByMember[userId] = { assigned: 0, completed: 0 };
      tasksByMember[userId].assigned++;
      if (card.list === 'done') tasksByMember[userId].completed++;
    });

    // Messages per member
    const messagesByMember = {};
    messages.forEach(msg => {
      const userId = msg.sender.toString();
      messagesByMember[userId] = (messagesByMember[userId] || 0) + 1;
    });

    // Document edits per member
    const editsByMember = {};
    documents.forEach(doc => {
      if (doc.lastEditedBy) {
        const userId = doc.lastEditedBy.toString();
        editsByMember[userId] = (editsByMember[userId] || 0) + 1;
      }
    });

    // Fetch member names
    const memberIds = workspace.members.map(m => m.user);
    const users = await User.find({ _id: { $in: memberIds } }).select('name email');
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u.name; });

    const memberStats = memberIds.map(userId => {
      const uid = userId.toString();
      return {
        userId: uid,
        name: userMap[uid] || 'Unknown',
        tasksAssigned: tasksByMember[uid]?.assigned || 0,
        tasksCompleted: tasksByMember[uid]?.completed || 0,
        completionRate: tasksByMember[uid]?.assigned ? ((tasksByMember[uid].completed / tasksByMember[uid].assigned) * 100).toFixed(0) : 0,
        messagesSent: messagesByMember[uid] || 0,
        documentsEdited: editsByMember[uid] || 0,
      };
    });

    // Summary
    const totalCards = cards.length;
    const completedCards = cards.filter(c => c.list === 'done').length;
    const totalMessages = messages.length;
    const totalDocuments = documents.length;

    res.json({
      summary: {
        totalTasks: totalCards,
        completedTasks: completedCards,
        completionRate: totalCards ? ((completedCards / totalCards) * 100).toFixed(0) : 0,
        totalMessages,
        totalDocuments,
      },
      members: memberStats,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWorkspaceAnalytics };