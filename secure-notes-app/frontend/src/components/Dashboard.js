import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Snackbar,
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";
import API_BASE_URL from "../config";

const Dashboard = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [editNoteId, setEditNoteId] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState("");
  const [snackbar, setSnackbar] = useState({ open: false, message: "" });

  // Fetch notes from the backend
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notes`, {
          method: "GET",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        const data = await response.json();
        if (response.ok) {
          setNotes(data.notes);
        } else {
          setSnackbar({ open: true, message: data.message });
        }
      } catch (error) {
        setSnackbar({ open: true, message: "Error fetching notes" });
      }
    };

    fetchNotes();
  }, []);

  // Add a new note
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      setSnackbar({ open: true, message: "Note content cannot be empty" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: newNote }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotes([...notes, data.note]);
        setNewNote("");
        setSnackbar({ open: true, message: "Note added successfully" });
      } else {
        setSnackbar({ open: true, message: data.message });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error adding note" });
    }
  };

  // Edit a note
  const handleEditNote = async (id) => {
    if (!editNoteContent.trim()) {
      setSnackbar({ open: true, message: "Note content cannot be empty" });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ content: editNoteContent }),
      });
      const data = await response.json();
      if (response.ok) {
        setNotes(notes.map((note) => (note._id === id ? data.note : note)));
        setEditNoteId(null);
        setEditNoteContent("");
        setSnackbar({ open: true, message: "Note updated successfully" });
      } else {
        setSnackbar({ open: true, message: data.message });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error updating note" });
    }
  };

  // Delete a note
  const handleDeleteNote = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await response.json();
      if (response.ok) {
        setNotes(notes.filter((note) => note._id !== id));
        setSnackbar({ open: true, message: "Note deleted successfully" });
      } else {
        setSnackbar({ open: true, message: data.message });
      }
    } catch (error) {
      setSnackbar({ open: true, message: "Error deleting note" });
    }
  };

  return (
    <Container>
      <Typography variant="h4" align="center" gutterBottom>
        Notes Dashboard
      </Typography>

      {/* Add Note Section */}
      <Box display="flex" gap={2} mb={4}>
        <TextField
          fullWidth
          label="New Note"
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <Button variant="contained" onClick={handleAddNote}>
          Add Note
        </Button>
      </Box>

      {/* Notes List */}
      {notes.map((note) => (
        <Card key={note._id} style={{ marginBottom: "16px" }}>
          <CardContent>
            {editNoteId === note._id ? (
              <TextField
                fullWidth
                value={editNoteContent}
                onChange={(e) => setEditNoteContent(e.target.value)}
              />
            ) : (
              <Typography>{note.content}</Typography>
            )}
          </CardContent>
          <CardActions>
            {editNoteId === note._id ? (
              <Button
                variant="contained"
                onClick={() => handleEditNote(note._id)}
              >
                Save
              </Button>
            ) : (
              <IconButton onClick={() => {
                setEditNoteId(note._id);
                setEditNoteContent(note.content);
              }}>
                <Edit />
              </IconButton>
            )}
            <IconButton onClick={() => handleDeleteNote(note._id)}>
              <Delete />
            </IconButton>
          </CardActions>
        </Card>
      ))}

      {/* Snackbar for Notifications */}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </Container>
  );
};

export default Dashboard;