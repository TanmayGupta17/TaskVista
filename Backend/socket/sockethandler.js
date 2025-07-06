const jwt = require("jsonwebtoken");
const Task = require("../models/Task");
const ActionLog = require("../models/ActionLog");

// Socket authentication middleware
const authenticateSocket = (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
};

const setupSocketHandlers = (io) => {
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);

    // Join user to a room (for future multi-board support)
    socket.join("main-board");

    // Handle task updates
    socket.on("task-update", async (data) => {
      try {
        const { taskId, updates, version } = data;

        // Check for conflicts
        const currentTask = await Task.findById(taskId);
        if (currentTask.version !== version) {
          socket.emit("conflict-detected", {
            taskId,
            currentVersion: currentTask,
            incomingUpdates: updates,
          });
          return;
        }

        const updatedTask = await Task.findByIdAndUpdate(taskId, updates, {
          new: true,
        }).populate("assignedTo", "username");

        // Log the action
        await new ActionLog({
          action: "edit",
          taskId,
          userId: socket.userId,
          details: `Updated task: ${Object.keys(updates).join(", ")}`,
        }).save();

        // Broadcast to all clients
        socket.to("main-board").emit("task-updated", updatedTask);
        socket.emit("task-updated", updatedTask);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Handle task creation
    socket.on("create-task", async (taskData) => {
      try {
        const newTask = new Task({
          ...taskData,
          createdBy: socket.userId,
          assignedTo: taskData.assignedTo || socket.userId,
        });

        await newTask.save();
        await newTask.populate("assignedTo", "username");

        // Log the action
        await new ActionLog({
          action: "create",
          taskId: newTask._id,
          userId: socket.userId,
          details: `Created task: ${newTask.title}`,
        }).save();

        // Broadcast to all clients
        io.to("main-board").emit("task-created", newTask);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    // Handle task deletion
    socket.on("delete-task", async (taskId) => {
      try {
        const task = await Task.findById(taskId);
        if (!task) {
          socket.emit("error", { message: "Task not found" });
          return;
        }

        await Task.findByIdAndDelete(taskId);

        // Log the action
        await new ActionLog({
          action: "delete",
          taskId,
          userId: socket.userId,
          details: `Deleted task: ${task.title}`,
        }).save();

        // Broadcast to all clients
        io.to("main-board").emit("task-deleted", taskId);
      } catch (error) {
        socket.emit("error", { message: error.message });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
    });
  });
};

module.exports = { setupSocketHandlers };
