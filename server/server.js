require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const logger = require('./middleware/logger');
const requireJson = require('./middleware/requireJson');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5000;

// ---- Middleware pipeline (order matters) ----
app.use(cors()); // Practical 6: allow the React dev server (localhost:5173)
app.use(express.json()); // parse JSON bodies -> req.body
app.use(logger); // Practical 4: log method, URL, timestamp
app.use(requireJson); // Practical 4 supplementary: POST/PUT need JSON

// ---- Routes ----
app.use('/tasks', taskRoutes);

// ---- Must be LAST: unknown routes, then the global error handler ----
app.use(notFound);
app.use(errorHandler);

// Practical 5: connect to MongoDB, then start listening
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

module.exports = app;
