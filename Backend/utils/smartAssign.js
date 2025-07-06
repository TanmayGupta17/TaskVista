const User = require("../models/user");
const Task = require("../models/Task");

const smartAssignTask = async (taskId) => {
  try {
    // Get all users and their current active task counts
    const users = await User.aggregate([
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "assignedTo",
          pipeline: [{ $match: { status: { $in: ["Todo", "In Progress"] } } }],
          as: "activeTasks",
        },
      },
      {
        $addFields: {
          activeTaskCount: { $size: "$activeTasks" },
        },
      },
      {
        $sort: { activeTaskCount: 1 },
      },
      {
        $limit: 1,
      },
    ]);

    if (users.length === 0) {
      throw new Error("No users available for assignment");
    }

    const userWithFewestTasks = users[0];

    // Update the task with the new assignment
    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { assignedTo: userWithFewestTasks._id },
      { new: true }
    ).populate("assignedTo", "username email");

    return updatedTask;
  } catch (error) {
    throw new Error(`Smart assignment failed: ${error.message}`);
  }
};

module.exports = { smartAssignTask };
