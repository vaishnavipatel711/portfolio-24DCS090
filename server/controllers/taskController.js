const Task = require('../models/Task');
const cache = require('../utils/cache');

const notFoundError = () => {
  const err = new Error('Task not found');
  err.status = 404;
  return err;
};

// Every query includes { user: req.user.id } so a user can only ever
// see or change their OWN tasks, even if they guess another task's ID.
//
// Practical 9: reads check the cache first (cache-aside pattern):
//   HIT  -> return the cached data, no database query
//   MISS -> query MongoDB, store the result in the cache, return it
// Writes change MongoDB and then delete the cache entries they made stale.
//
// The X-Cache response header (HIT / MISS / BYPASS) makes this visible in Postman.
// BYPASS = caching is switched off (CACHE_ENABLED=false).
const cacheStatus = (miss) => (cache.enabled ? (miss ? 'MISS' : 'HIT') : 'BYPASS');

exports.getAllTasks = async (req, res, next) => {
  try {
    const key = cache.allKey(req.user.id);

    const cached = cache.get(key, 'all');
    if (cached !== undefined) {
      res.set('X-Cache', cacheStatus(false));
      return res.status(200).json(cached);
    }

    // .lean() returns plain JavaScript objects instead of full Mongoose documents:
    // faster, and safe to keep in the cache.
    const tasks = await Task.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    cache.set(key, tasks);

    res.set('X-Cache', cacheStatus(true));
    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
};

// Supplementary: the single-task endpoint is cached under its own key.
exports.getTask = async (req, res, next) => {
  try {
    const key = cache.oneKey(req.user.id, req.params.id);

    const cached = cache.get(key, 'one');
    if (cached !== undefined) {
      res.set('X-Cache', cacheStatus(false));
      return res.status(200).json(cached);
    }

    const task = await Task.findOne({ _id: req.params.id, user: req.user.id }).lean();
    if (!task) throw notFoundError(); // a 404 is deliberately NOT cached
    cache.set(key, task);

    res.set('X-Cache', cacheStatus(true));
    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.createTask = async (req, res, next) => {
  try {
    // req.body was validated and reduced to allowed fields by validateTask
    const task = await Task.create({ ...req.body, user: req.user.id });

    // A new task makes the cached "all tasks" list stale.
    // (No single-task entry can exist for a task that did not exist yet.)
    cache.del(cache.allKey(req.user.id));

    res.status(201).json(task);
  } catch (err) {
    next(err);
  }
};

exports.updateTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true },
    );
    if (!task) throw notFoundError();

    // Both the list and this task's own entry are now stale.
    cache.del(cache.allKey(req.user.id), cache.oneKey(req.user.id, req.params.id));

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
};

exports.deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!task) throw notFoundError();

    cache.del(cache.allKey(req.user.id), cache.oneKey(req.user.id, req.params.id));

    res.status(200).json({ message: 'Task deleted', id: task._id });
  } catch (err) {
    next(err);
  }
};