const mongoose = require("mongoose");

const actionLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    enum: ["create", "edit", "delete", "assign", "move", "smart_assign"],
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  details: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ActionLog", actionLogSchema);
