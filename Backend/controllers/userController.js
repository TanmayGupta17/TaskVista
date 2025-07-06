const User = require("../models/user");

// Get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ username: 1 });

    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { username, email } = req.body;
    const userId = req.params.id;

    // Check if user can update (only self or admin)
    if (req.user.userId !== userId) {
      return res.status(403).json({
        message: "Not authorized to update this user",
      });
    }

    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    // Check if username or email already exists
    if (username || email) {
      const existingUser = await User.findOne({
        _id: { $ne: userId },
        $or: [
          ...(username ? [{ username }] : []),
          ...(email ? [{ email }] : []),
        ],
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Username or email already exists",
        });
      }
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Check if user can delete (only self)
    if (req.user.userId !== userId) {
      return res.status(403).json({
        message: "Not authorized to delete this user",
      });
    }

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: "Current password is required to change password",
        });
      }

      const isCurrentPasswordValid = await user.comparePassword(
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          message: "Current password is incorrect",
        });
      }

      user.password = newPassword;
    }

    // Update other fields
    if (username) user.username = username;
    if (email) user.email = email;

    await user.save();

    const updatedUser = await User.findById(userId).select("-password");

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile,
};
