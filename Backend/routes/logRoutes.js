const express = require("express");
const {
  getAllLogs,
  getLogsByTask,
  getLogsByUser,
  clearLogs,
} = require("../controllers/logController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Apply authentication middleware to all log routes
router.use(authenticateToken);

router.get("/", getAllLogs);
router.get("/task/:taskId", getLogsByTask);
router.get("/user/:userId", getLogsByUser);
router.delete("/clear", clearLogs);

module.exports = router;
