const express = require('express');
const auth = require('../middleware/auth');
const { validateAuth } = require('../middleware/validate');
const c = require('../controllers/authController');

const router = express.Router();

router.post('/register', validateAuth, c.register);
router.post('/login', validateAuth, c.login);
router.get('/me', auth, c.me); // only this auth route needs a token

module.exports = router;
