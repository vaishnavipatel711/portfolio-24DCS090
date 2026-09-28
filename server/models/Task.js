const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  // trim: true removes surrounding whitespace on create AND update
  title: { type: String, required: [true, "Title is required"], trim: true },
  description: { type: String, trim: true },
  completed: { type: Boolean, default: false },
  priority: {
    type: String,
    enum: { values: ["low", "medium", "high"], message: "Priority must be low, medium or high" },
    default: "medium",
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Task", taskSchema);
