const express = require("express");
const {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  smartAssigntask,
  getTasksByUser,
} = require("../controllers/taskController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all task routes
router.use(authenticateToken);

// Task CRUD routes
router.route("/").get(getAllTasks).post(createTask);

router.route("/:id").get(getTaskById).put(updateTask).delete(deleteTask);

// Special routes
router.put("/:id/smart-assign", smartAssigntask);
router.get("/user/:userId", getTasksByUser);

module.exports = router;
