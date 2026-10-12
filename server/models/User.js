const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true, // creates a unique index: two users cannot share an email
    lowercase: true,
    trim: true,
  },
  // Stores the bcrypt HASH, never the plain password.
  // select: false = queries do not return it unless we explicitly ask for it.
  password: { type: String, required: [true, 'Password is required'], select: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
