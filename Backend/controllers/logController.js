const ActionLog = require("../models/ActionLog");

// Get all logs
const getAllLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const logs = await ActionLog.find()
      .populate("userId", "username")
      .populate("taskId", "title")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ActionLog.countDocuments();

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get logs error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get logs by task
const getLogsByTask = async (req, res) => {
  try {
    const taskId = req.params.taskId;

    const logs = await ActionLog.find({ taskId })
      .populate("userId", "username")
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (error) {
    console.error("Get task logs error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get logs by user
const getLogsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    const logs = await ActionLog.find({ userId })
      .populate("taskId", "title")
      .sort({ timestamp: -1 });

    res.json(logs);
  } catch (error) {
    console.error("Get user logs error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Clear logs (admin function)
const clearLogs = async (req, res) => {
  try {
    const { olderThan } = req.query;

    let filter = {};
    if (olderThan) {
      const date = new Date(olderThan);
      filter.timestamp = { $lt: date };
    }

    const result = await ActionLog.deleteMany(filter);

    res.json({
      message: "Logs cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear logs error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllLogs,
  getLogsByTask,
  getLogsByUser,
  clearLogs,
};
