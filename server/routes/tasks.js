const express = require('express');
const auth = require('../middleware/auth');
const validateId = require('../middleware/validateId');
const { validateCreateTask, validateUpdateTask } = require('../middleware/validate');
const c = require('../controllers/taskController');

const router = express.Router();

// Every route below this line requires a valid JWT.
router.use(auth);

router.get('/', c.getAllTasks);
router.post('/', validateCreateTask, c.createTask);

router.get('/:id', validateId, c.getTask);
router.put('/:id', validateId, validateUpdateTask, c.updateTask);
router.delete('/:id', validateId, c.deleteTask);

module.exports = router;
