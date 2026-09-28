const express = require("express");
const validateId = require("../middleware/validateId");
const c = require("../controllers/taskController");

const router = express.Router();

router.get("/", c.getAllTasks);
router.post("/", c.createTask);

// validateId is route-specific middleware: it only runs on routes that use :id
router.get("/:id", validateId, c.getTask);
router.put("/:id", validateId, c.updateTask);
router.delete("/:id", validateId, c.deleteTask);

module.exports = router;
