const express = require("express");
const {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserProfile,
} = require("../controllers/userController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all user routes
router.use(authenticateToken);

router.route("/").get(getAllUsers);

router.route("/:id").get(getUserById).put(updateUser).delete(deleteUser);

router.put("/profile", updateUserProfile);

module.exports = router;
