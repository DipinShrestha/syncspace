// backend/socketInstance.js
// Tiny shared holder for the Socket.io server instance.
// server.js creates `io` after routes/controllers are already required,
// so controllers can't `require('./server')` to get it (circular, and io
// wouldn't exist yet anyway). Instead, server.js calls setIO(io) once at
// startup, and any controller can call getIO() to emit events.
let io = null;

const setIO = (instance) => { io = instance; };
const getIO = () => io;

module.exports = { setIO, getIO };
