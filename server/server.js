require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');


const logger = require('./middleware/logger');
const requireJson = require('./middleware/requireJson');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const debugRoutes = require('./routes/debug');

require('./events/listeners');

// Practical 7: the secret must come from .env, never from the code.
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is missing. Add it to server/.env (see .env.example).');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware pipeline (order matters) ----
app.use(cors()); // allow the React dev server (localhost:5173)
app.use(express.json()); // parse JSON bodies -> req.body
app.use(logger); // log method, URL, timestamp
app.use(requireJson); // POST/PUT must send JSON

// ---- Routes ----
app.use('/auth', authRoutes); // public: register, login (and /me, protected inside)
app.use('/tasks', taskRoutes); // protected: auth middleware is applied inside the router

// Practical 9: cache statistics + cache clearing, for lab measurements only.
if (process.env.NODE_ENV !== 'production') app.use('/debug', debugRoutes);

// ---- Must be LAST: unknown routes, then the global error handler ----
app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
      console.error('MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

module.exports = app;