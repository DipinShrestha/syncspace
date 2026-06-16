// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      console.error(error);
      // BUG FIX: was missing 'return' here. Without it, after sending the 401
      // the function continued to the 'if (!token)' check below, which also
      // tried to send a response — causing an "headers already sent" crash.
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  // BUG FIX: changed to 'if (!token)' guard that only runs when no Bearer
  // header was present at all (token is still undefined).
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };