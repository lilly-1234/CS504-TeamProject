const Note = require("../models/Notes");

// Get all notes for the logged-in user
exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.userId });
    res.status(200).json({ notes });
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error });
  }
};

// Add a new note
exports.addNote = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: "Note content is required" });
    }

    const note = new Note({
      content,
      userId: req.userId,
    });

    await note.save();
    res.status(201).json({ note });
  } catch (error) {
    res.status(500).json({ message: "Error adding note", error });
  }
};

// Update an existing note
exports.updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Note content is required" });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, userId: req.userId },
      { content },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ note });
  } catch (error) {
    res.status(500).json({ message: "Error updating note", error });
  }
};

// Delete a note
exports.deleteNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await Note.findOneAndDelete({ _id: id, userId: req.userId });

    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    res.status(200).json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting note", error });
  }
};