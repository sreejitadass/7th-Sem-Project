// server.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Env
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI; // e.g., .../learnsphere?retryWrites=true...
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "http://localhost:5173";

if (!MONGODB_URI) {
  console.error("Missing MONGODB_URI in .env");
  process.exit(1);
}

const app = express();

// Middleware (order matters)
app.use(cors({ origin: ALLOWED_ORIGIN })); // allow Vite dev origin [18]
app.use(express.json()); // parse JSON body [19]

// Health
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Note schema/model
const noteSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, index: true }, // optional
    userName: { type: String, required: true }, // REQUIRED
    title: { type: String, required: true, trim: true }, // REQUIRED
    content: { type: String, required: true, trim: true }, // REQUIRED
    createdAtLocal: { type: String }, // optional human-readable timestamp
  },
  { timestamps: true }
);
const Note = mongoose.model("Note", noteSchema);

// Create note
app.post("/api/notes", async (req, res) => {
  try {
    const { userName, clerkUserId, title, content, createdAtLocal } =
      req.body || {};
    if (!userName || !title || !content) {
      return res
        .status(400)
        .json({ error: "Missing required fields: userName, title, content" });
    }
    const note = await Note.create({
      userName,
      clerkUserId,
      title,
      content,
      createdAtLocal: createdAtLocal || new Date().toLocaleString(),
    });
    return res.status(201).json(note);
  } catch (e) {
    console.error("Create note error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// List notes by clerkUserId or userName (prefer clerkUserId)
app.get("/api/notes", async (req, res) => {
  try {
    const { clerkUserId, userName } = req.query;
    if (!clerkUserId && !userName) {
      return res
        .status(400)
        .json({ error: "Provide clerkUserId or userName to filter notes" });
    }
    const filter = clerkUserId ? { clerkUserId } : { userName };
    const notes = await Note.find(filter).sort({ createdAt: -1 });
    return res.json(notes);
  } catch (e) {
    console.error("List notes error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Get one
app.get("/api/notes/:id", async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: "Not found" });
    return res.json(note);
  } catch (e) {
    console.error("Get note error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete
app.delete("/api/notes/:id", async (req, res) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
  } catch (e) {
    console.error("Delete note error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Startup
async function start() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`API listening on http://127.0.0.1:${PORT}`);
    });
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
}
start();
