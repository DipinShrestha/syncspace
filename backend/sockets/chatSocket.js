// backend/sockets/chatSocket.js
const Message = require('../models/Message');
const Workspace = require('../models/Workspace');
const User = require('../models/User');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);

    // Join a workspace room
    socket.on('join-workspace', async (workspaceId, userId, callback) => {
      try {
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) return callback({ error: 'Workspace not found' });
        const isMember = workspace.members.some(m => m.user.toString() === userId);
        const isOwner = workspace.owner.toString() === userId;
        if (!isMember && !isOwner) return callback({ error: 'Not authorized' });

        // Leave previous rooms (except own socket id)
        const rooms = Array.from(socket.rooms);
        rooms.forEach(room => {
          if (room !== socket.id) socket.leave(room);
        });
        socket.join(workspaceId);
        socket.workspaceId = workspaceId;
        socket.userId = userId;
        console.log(`User ${userId} joined workspace ${workspaceId}`);
        callback({ success: true });
      } catch (err) {
        callback({ error: err.message });
      }
    });

    // Load previous messages
    socket.on('load-messages', async (workspaceId, callback) => {
      try {
        const messages = await Message.find({ workspace: workspaceId })
          .sort({ createdAt: 1 })
          .populate('sender', 'name email avatar')
          .limit(100);
        callback(messages);
      } catch (err) {
        callback({ error: err.message });
      }
    });

    // Send a new message
    socket.on('send-message', async (data, callback) => {
      try {
        const { workspaceId, text } = data;
        if (socket.workspaceId !== workspaceId) {
          return callback({ error: 'Not in correct workspace room' });
        }
        const message = await Message.create({
          workspace: workspaceId,
          sender: socket.userId,
          text,
        });
        const populated = await Message.findById(message._id).populate('sender', 'name email avatar');
        io.to(workspaceId).emit('new-message', populated);
        callback({ success: true, message: populated });
      } catch (err) {
        callback({ error: err.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
};