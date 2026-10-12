const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password } = req.body; // already validated + cleaned by validateAuth

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    // bcrypt adds a random salt automatically; 10 = cost factor (deliberately slow)
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: 'Registered successfully', user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // password has select:false, so we must ask for it explicitly here
    const user = await User.findOne({ email }).select('+password');

    // Same message for "no such email" and "wrong password" so attackers
    // cannot use the response to find out which emails are registered.
    const invalid = () => res.status(401).json({ error: 'Invalid email or password' });
    if (!user) return invalid();

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return invalid();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user: { id: user._id, email: user.email } });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me  (protected: req.user comes from the decoded JWT)
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'User no longer exists' });
    res.status(200).json({ id: user._id, email: user.email, createdAt: user.createdAt });
  } catch (err) {
    next(err);
  }
};
