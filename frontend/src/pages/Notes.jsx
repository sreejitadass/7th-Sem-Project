import React, { useState, useEffect } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { useAuth, useUser } from "@clerk/clerk-react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000";

const Notes = () => {
  const { userId, isLoaded } = useAuth();
  const { user } = useUser();

  const displayName = user?.firstName || "Anonymous";

  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState({ title: "", content: "" });
  const [editingNote, setEditingNote] = useState(null);

  // Fetch notes after Clerk is ready
  useEffect(() => {
    if (!isLoaded) return;
    const fetchNotes = async () => {
      try {
        const qs = userId
          ? `?clerkUserId=${encodeURIComponent(userId)}`
          : `?userName=${encodeURIComponent(displayName)}`;
        const res = await fetch(`${API_BASE}/api/notes${qs}`);
        if (!res.ok) throw new Error(`Fetch notes failed: ${res.status}`);
        const data = await res.json();
        setNotes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching notes:", err);
      }
    };
    fetchNotes();
  }, [isLoaded, userId, displayName]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNote((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdateNote = async (e) => {
    e.preventDefault();
    if (!isLoaded || !userId) {
      alert("Please sign in to add notes.");
      return;
    }

    const title = newNote.title.trim();
    const content = newNote.content.trim();
    if (!title || !content) return;

    const payload = {
      userName: displayName, // REQUIRED by backend
      clerkUserId: userId, // preferred for filtering
      title, // REQUIRED
      content, // REQUIRED
      createdAtLocal: new Date().toLocaleString(),
    };

    try {
      const res = await fetch(`${API_BASE}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Save failed ${res.status}: ${text}`);
      }
      const saved = await res.json();

      if (editingNote) {
        setNotes((prev) =>
          prev.map((n) =>
            (n._id || n.id) === (editingNote._id || editingNote.id) ? saved : n
          )
        );
        setEditingNote(null);
      } else {
        setNotes((prev) => [saved, ...prev]);
      }
      setNewNote({ title: "", content: "" });
    } catch (err) {
      console.error("Error saving note:", err);
      alert("Could not save note.");
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content });
  };

  const handleDeleteNote = async (idOrNote) => {
    const id =
      typeof idOrNote === "string" ? idOrNote : idOrNote._id || idOrNote.id;
    if (!id) return;
    try {
      const res = await fetch(`${API_BASE}/api/notes/${id}`, {
        method: "DELETE",
      });
      if (res.ok || res.status === 204) {
        setNotes((prev) => prev.filter((n) => (n._id || n.id) !== id));
      } else {
        alert("Delete failed.");
      }
    } catch (err) {
      console.error("Error deleting note:", err);
      alert("Delete failed.");
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
            {notes.map((note) => {
              const key = note._id || note.id;
              return (
                <div key={key} className="note-card">
                  <div className="note-content">
                    <h2 className="note-title">{note.title}</h2>
                    <p className="note-text">{note.content}</p>
                    <span className="note-date">
                      {note.createdAtLocal ||
                        note.date ||
                        new Date(note.createdAt).toLocaleString()}
                    </span>
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
                      onClick={() => handleDeleteNote(key)}
                      className="delete-button"
                      aria-label="Delete Note"
                      type="button"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              );
            })}
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
