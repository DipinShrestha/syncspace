const Message = require('../models/Message');
const Workspace = require('../models/Workspace');

// This function will be called when a new Socket.io connection is established
const chatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Join a workspace room
    socket.on('join-workspace', async (workspaceId, userId, callback) => {
      try {
        // Verify user is a member of the workspace
        const workspace = await Workspace.findById(workspaceId);
        if (!workspace) {
          return callback({ error: 'Workspace not found' });
        }
        const isMember = workspace.members.some(m => m.user.toString() === userId);
        const isOwner = workspace.owner.toString() === userId;
        if (!isMember && !isOwner) {
          return callback({ error: 'Not authorized to join this workspace' });
        }

        // Leave any previous rooms (to avoid duplicates)
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

    // Handle sending a message
    socket.on('send-message', async (data, callback) => {
      try {
        const { workspaceId, text } = data;
        // Ensure socket is in the correct workspace
        if (socket.workspaceId !== workspaceId) {
          return callback({ error: 'Not in the correct workspace room' });
        }

        // Save message to database
        const message = await Message.create({
          workspace: workspaceId,
          sender: socket.userId,
          text,
        });

        // Populate sender info before broadcasting
        const populatedMessage = await Message.findById(message._id)
          .populate('sender', 'name email avatar');

        // Emit to all clients in the workspace room (including sender)
        io.to(workspaceId).emit('new-message', populatedMessage);
        callback({ success: true, message: populatedMessage });
      } catch (err) {
        console.error(err);
        callback({ error: err.message });
      }
    });

    // Load previous messages for a workspace
    socket.on('load-messages', async (workspaceId, callback) => {
      try {
        const messages = await Message.find({ workspace: workspaceId })
          .sort({ createdAt: 1 }) // oldest first
          .populate('sender', 'name email avatar')
          .limit(100); // limit to last 100 messages
        callback(messages);
      } catch (err) {
        callback({ error: err.message });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};

module.exports = chatSocket;