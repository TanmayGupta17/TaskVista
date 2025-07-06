const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 100,
      validate: {
        validator: function (v) {
          // Ensure title doesn't match column names
          const columnNames = ["todo", "in progress", "done"];
          return !columnNames.includes(v.toLowerCase());
        },
        message:
          "Task title cannot match column names (Todo, In Progress, Done)",
      },
    },
    description: {
      type: String,
      maxlength: 500,
    },
    status: {
      type: String,
      enum: ["Todo", "In Progress", "Done"],
      default: "Todo",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    lastModified: {
      type: Date,
      default: Date.now,
    },
    version: {
      type: Number,
      default: 1,
    },
    isBeingEdited: {
      type: Boolean,
      default: false,
    },
    editingUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Update lastModified on save
taskSchema.pre("save", function (next) {
  this.lastModified = new Date();
  this.version += 1;
  next();
});

module.exports = mongoose.model("Task", taskSchema);
