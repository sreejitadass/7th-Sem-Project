import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { useAuth } from "@clerk/clerk-react";

// localStorage helpers
const lsKey = (uid) => `ls_notes_${uid || "anonymous"}`;
const loadNotes = (uid) => {
  try {
    const raw = localStorage.getItem(lsKey(uid));
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
};
const saveNotes = (uid, arr) => {
  try {
    localStorage.setItem(lsKey(uid), JSON.stringify(arr));
  } catch {}
};

const Notes = () => {
  const { userId: clerkUserId } = useAuth();
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editingNote, setEditingNote] = useState(null);

  // Load notes on mount/change
  useEffect(() => {
    const uid = clerkUserId || "anonymous";
    setNotes(loadNotes(uid));
  }, [clerkUserId]);

  // Persist notes when they change
  useEffect(() => {
    const uid = clerkUserId || "anonymous";
    saveNotes(uid, notes);
  }, [notes, clerkUserId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateNote = (e) => {
    e.preventDefault();
    const title = newNote.title.trim();
    const content = newNote.content.trim();
    if (!title || !content) return;

    const uid = clerkUserId || "anonymous";
    const noteData = {
      id: editingNote?.id ?? Date.now() + Math.random(),
      clerkUserId: uid,
      title,
      content,
      date: new Date().toISOString().split("T")[0],
    };

    if (editingNote) {
      setNotes((prev) =>
        prev.map((n) => (n.id === editingNote.id ? noteData : n))
      );
      setEditingNote(null);
    } else {
      setNotes((prev) => [...prev, noteData]);
    }
    setNewNote({ title: "", content: "" });
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content });
  };

  const handleDeleteNote = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (editingNote?.id === id) {
      setEditingNote(null);
      setNewNote({ title: "", content: "" });
    }
  };

  return (
    <div className="notes-container">
      <div className="notes-header">
        <h1 className="notes-title">Your Notes</h1>
      </div>

      <div className="notes-content">
        <form onSubmit={handleAddOrUpdateNote} className="notes-form">
          <input
            type="text"
            name="title"
            value={newNote.title}
            onChange={handleInputChange}
            placeholder="Note Title"
            className="notes-input"
            required
          />
          <textarea
            name="content"
            value={newNote.content}
            onChange={handleInputChange}
            placeholder="Write your note here..."
            className="notes-textarea"
            required
          />
          <button
            type="submit"
            className="notes-button"
            aria-label={editingNote ? "Update Note" : "Add Note"}
          >
            <FaPlus className="plus-icon" />
            {editingNote ? "Update Note" : "Add Note"}
          </button>
          {editingNote && (
            <button
              type="button"
              onClick={() => {
                setEditingNote(null);
                setNewNote({ title: "", content: "" });
              }}
              className="notes-cancel-button"
              aria-label="Cancel Edit"
            >
              Cancel
            </button>
          )}
        </form>

        {notes.length > 0 ? (
          <div className="notes-list">
            {notes.map((note) => (
              <div key={note.id} className="note-card">
                <div className="note-content">
                  <h2 className="note-title">{note.title}</h2>
                  <p className="note-text">{note.content}</p>
                  <span className="note-date">{note.date}</span>
                </div>
                <div className="note-actions">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="edit-button"
                    aria-label="Edit Note"
                    type="button"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="delete-button"
                    aria-label="Delete Note"
                    type="button"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-notes-container">
            <p className="no-notes-text">No notes created yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
