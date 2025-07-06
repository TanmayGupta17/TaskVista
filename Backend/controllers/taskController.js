const Task = require("../models/Task");
const User = require("../models/user");
const ActionLog = require("../models/ActionLog");
const { smartAssignTask } = require("../utils/smartAssign");

// Get all tasks
const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Get task by ID
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email");

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    console.error("Get task error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Create new task
const createTask = async (req, res) => {
  try {
    const { title, description, priority, assignedTo, status } = req.body;

    // Validation
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Check if task title already exists
    const existingTask = await Task.findOne({ title });
    if (existingTask) {
      return res.status(400).json({
        message: "Task with this title already exists",
      });
    }

    const taskData = {
      title,
      description: description || "",
      priority: priority || "Medium",
      status: status || "Todo",
      assignedTo: assignedTo || req.user.userId,
      createdBy: req.user.userId,
    };

    const task = new Task(taskData);
    await task.save();

    // Populate the task
    await task.populate("assignedTo", "username email");
    await task.populate("createdBy", "username email");

    // Log the action
    await new ActionLog({
      action: "create",
      taskId: task._id,
      userId: req.user.userId,
      details: `Created task: ${task.title}`,
    }).save();

    // Update user's active task count
    await User.findByIdAndUpdate(task.assignedTo._id, {
      $inc: { activeTasks: 1 },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error("Create task error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const { title, description, priority, status, assignedTo } = req.body;
    const taskId = req.params.id;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user can edit this task
    const canEdit =
      task.createdBy.toString() === req.user.userId ||
      task.assignedTo.toString() === req.user.userId;

    if (!canEdit) {
      return res.status(403).json({
        message: "Not authorized to edit this task",
      });
    }

    const oldAssignedTo = task.assignedTo;
    const oldStatus = task.status;

    // Update task fields
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();

    // Update user active task counts if assignment changed
    if (assignedTo && oldAssignedTo.toString() !== assignedTo) {
      await User.findByIdAndUpdate(oldAssignedTo, {
        $inc: { activeTasks: -1 },
      });
      await User.findByIdAndUpdate(assignedTo, { $inc: { activeTasks: 1 } });
    }

    // Update active task count if status changed to/from Done
    if (status && oldStatus !== status) {
      if (status === "Done" && oldStatus !== "Done") {
        await User.findByIdAndUpdate(task.assignedTo, {
          $inc: { activeTasks: -1 },
        });
      } else if (oldStatus === "Done" && status !== "Done") {
        await User.findByIdAndUpdate(task.assignedTo, {
          $inc: { activeTasks: 1 },
        });
      }
    }

    // Populate the updated task
    await task.populate("assignedTo", "username email");
    await task.populate("createdBy", "username email");

    // Log the action
    const changes = Object.keys(req.body).filter(
      (key) => req.body[key] !== undefined
    );
    await new ActionLog({
      action: "edit",
      taskId: task._id,
      userId: req.user.userId,
      details: `Updated task: ${changes.join(", ")}`,
    }).save();

    res.json(task);
  } catch (error) {
    console.error("Update task error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    // Check if user can delete this task
    const canDelete = task.createdBy.toString() === req.user.userId;

    if (!canDelete) {
      return res.status(403).json({
        message: "Not authorized to delete this task",
      });
    }

    // Update user's active task count if task was not done
    if (task.status !== "Done") {
      await User.findByIdAndUpdate(task.assignedTo, {
        $inc: { activeTasks: -1 },
      });
    }

    await Task.findByIdAndDelete(req.params.id);

    // Log the action
    await new ActionLog({
      action: "delete",
      taskId: task._id,
      userId: req.user.userId,
      details: `Deleted task: ${task.title}`,
    }).save();

    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// Smart assign task
const smartAssigntask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updatedTask = await smartAssignTask(taskId);

    // Log the action
    await new ActionLog({
      action: "smart_assign",
      taskId: updatedTask._id,
      userId: req.user.userId,
      details: `Smart assigned task to: ${updatedTask.assignedTo.username}`,
    }).save();

    res.json(updatedTask);
  } catch (error) {
    console.error("Smart assign error:", error);
    res.status(500).json({
      message: "Smart assignment failed",
      error: error.message,
    });
  }
};

// Get tasks by user
const getTasksByUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const tasks = await Task.find({ assignedTo: userId })
      .populate("assignedTo", "username email")
      .populate("createdBy", "username email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error("Get user tasks error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  smartAssigntask,
  getTasksByUser,
};
