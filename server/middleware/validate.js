// Server-side validation + sanitization (Practical 7).
// Each validator checks the input, and if it is valid REPLACES req.body with a
// clean object containing only the allowed, trimmed fields. That means unknown
// fields (and tricks like {"email": {"$gt": ""}}) never reach the database.

const isString = (v) => typeof v === 'string';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PRIORITIES = ['low', 'medium', 'high'];

const fail = (res, details) => res.status(400).json({ error: 'Validation failed', details });

// ---- register / login ----
exports.validateAuth = (req, res, next) => {
  const body = req.body || {};
  const details = [];

  const email = isString(body.email) ? body.email.trim().toLowerCase() : '';
  if (!EMAIL_REGEX.test(email)) {
    details.push({ field: 'email', message: 'A valid email is required' });
  }

  const password = body.password;
  if (!isString(password) || password.length < 6 || password.length > 72) {
    // 72 = bcrypt only uses the first 72 bytes of a password
    details.push({ field: 'password', message: 'Password must be 6 to 72 characters' });
  }

  if (details.length > 0) return fail(res, details);

  req.body = { email, password };
  next();
};

// ---- tasks ----
const buildTaskValidator = (isCreate) => (req, res, next) => {
  const body = req.body || {};
  const details = [];
  const clean = {};

  if (isCreate || body.title !== undefined) {
    if (!isString(body.title) || body.title.trim() === '') {
      details.push({ field: 'title', message: 'Title is required' });
    } else if (body.title.trim().length > 100) {
      details.push({ field: 'title', message: 'Title must be 100 characters or fewer' });
    } else {
      clean.title = body.title.trim();
    }
  }

  if (body.description !== undefined) {
    if (!isString(body.description) || body.description.length > 500) {
      details.push({ field: 'description', message: 'Description must be text up to 500 characters' });
    } else {
      clean.description = body.description.trim();
    }
  }

  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) {
      details.push({ field: 'priority', message: 'Priority must be low, medium or high' });
    } else {
      clean.priority = body.priority;
    }
  }

  if (body.completed !== undefined) {
    if (typeof body.completed !== 'boolean') {
      details.push({ field: 'completed', message: 'Completed must be true or false' });
    } else {
      clean.completed = body.completed;
    }
  }

  if (!isCreate && details.length === 0 && Object.keys(clean).length === 0) {
    details.push({ field: 'body', message: 'Provide at least one field to update' });
  }

  if (details.length > 0) return fail(res, details);

  req.body = clean;
  next();
};

exports.validateCreateTask = buildTaskValidator(true);
exports.validateUpdateTask = buildTaskValidator(false);
