const express = require("express");
const router = express.Router();
const notesController = require("../controllers/notesController");
const authMiddleware = require("../middleware/authMiddleware"); // Ensure user is authenticated

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Notes routes
router.get("/", notesController.getNotes); // Get all notes
router.post("/", notesController.addNote); // Add a new note
router.put("/:id", notesController.updateNote); // Update a note
router.delete("/:id", notesController.deleteNote); // Delete a note

module.exports = router;