const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Register user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Please provide username, email, and password",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists with this email or username",
      });
    }

    // Create new user
    const user = new User({ username, email, password });
    await user.save();

    const token = generateToken(user._id);

    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        activeTasks: user.activeTasks,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        message: "Please provide email and password",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        activeTasks: user.activeTasks,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get current user
const getMe = async (req, res) => {
  // try {
  //   const user = await User.findById(req.user._id).select("-password");
  //   if (!user) {
  //     return res.status(404).json({ message: "User not found" });
  //   }

  //   res.json({
  //     user: {
  //       id: user._id,
  //       username: user.username,
  //       email: user.email,
  //       activeTasks: user.activeTasks,
  //     },
  //   });
  // } catch (error) {
  //   console.error("Get user error:", error);
  //   res.status(500).json({
  //     message: "Server error",
  //     error: error.message,
  //   });
  // }
  try {
    const user = await User.findById(req.user.userId).select("-password");
    console.log("Fetched user:", user);
    console.log("User ID:", req.user.userId);
    console.log("User Object ID:", user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { register, login, getMe };
