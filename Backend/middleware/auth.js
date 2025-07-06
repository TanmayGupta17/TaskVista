const jwt = require("jsonwebtoken");
const User = require("../models/user");

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user
    next();
  }
};

module.exports = {
  authenticateToken,
  optionalAuth,
};
