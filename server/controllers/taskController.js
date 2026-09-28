const Task = require("../models/Task");

// Only these fields may be set by a client
const pick = (body = {}) => {
  const out = {};
  for (const key of ["title", "description", "completed", "priority"]) {
    if (body[key] !== undefined) out[key] = body[key];
  }
  return out;
};

const notFoundError = () => {
  const err = new Error("Task not found");
  err.status = 404;
  return err;
};

exports.getAllTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

exports.getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) throw notFoundError();
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    const task = await Task.create(pick(req.body));
    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, pick(req.body), {
      new: true, // return the updated document
      runValidators: true, // enforce schema rules on updates too
    });
    if (!task) throw notFoundError();
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) throw notFoundError();
    res.status(200).json({ message: "Task deleted", id: task._id });
  } catch (err) {
    next(err);
  }
};
