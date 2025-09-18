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

// UploadDoc schema/model
const uploadDocSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, index: true }, // who uploaded
    userName: { type: String, required: true }, // display name
    title: { type: String, required: true, trim: true }, // typically file name
    folder: {
      type: String,
      required: true,
      trim: true,
      default: "Uncategorized",
    },
    size: { type: Number, default: 0 }, // bytes
    type: { type: String, default: "" }, // MIME type string
    url: { type: String, default: "" }, // preview URL or CDN URL (optional)
    createdAtLocal: { type: String }, // optional human-readable timestamp
  },
  { timestamps: true } // createdAt/updatedAt auto-managed [web:525][web:667][web:663]
);
const UploadDoc = mongoose.model("UploadDoc", uploadDocSchema);

// Create one
// Body: { userName, clerkUserId?, title, folder, size?, type?, url? }
app.post("/api/uploads", async (req, res) => {
  try {
    const {
      userName,
      clerkUserId,
      title,
      folder,
      size,
      type,
      url,
      createdAtLocal,
    } = req.body || {};
    if (!userName || !title || !folder) {
      return res
        .status(400)
        .json({ error: "Missing required fields: userName, title, folder" });
    }
    const doc = await UploadDoc.create({
      userName,
      clerkUserId,
      title,
      folder,
      size: Number(size) || 0,
      type: type || "",
      url: url || "",
      createdAtLocal: createdAtLocal || new Date().toLocaleString(),
    });
    return res.status(201).json(doc);
  } catch (e) {
    console.error("Create upload doc error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// List by user and optional folder
// /api/uploads?clerkUserId=...&folder=...  or /api/uploads?userName=...&folder=...
app.get("/api/uploads", async (req, res) => {
  try {
    const { clerkUserId, userName, folder, limit } = req.query;
    if (!clerkUserId && !userName) {
      return res
        .status(400)
        .json({ error: "Provide clerkUserId or userName to list uploads" });
    }
    const filter = clerkUserId ? { clerkUserId } : { userName };
    if (folder) filter.folder = folder;
    const lim = Math.max(1, Math.min(parseInt(limit || "10", 10), 100));
    const docs = await UploadDoc.find(filter)
      .sort({ createdAt: -1 })
      .limit(lim);
    return res.json({ uploads: docs });
  } catch (e) {
    console.error("List upload docs error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Update basic metadata (title, folder) for a document
app.put("/api/uploads/:id", async (req, res) => {
  try {
    const { title, folder } = req.body || {};
    const update = {};
    if (typeof title === "string") update.title = title.trim();
    if (typeof folder === "string") update.folder = folder.trim();
    const doc = await UploadDoc.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!doc) return res.status(404).json({ error: "Not found" });
    return res.json(doc);
  } catch (e) {
    console.error("Update upload doc error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Delete one
app.delete("/api/uploads/:id", async (req, res) => {
  try {
    const deleted = await UploadDoc.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
  } catch (e) {
    console.error("Delete upload doc error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Streaks: one doc per user to track consecutive study days
const streakSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, required: true, unique: true, index: true },
    lastStudyDate: { type: String, required: true }, // "YYYY-MM-DD"
    currentStreak: { type: Number, default: 1 },
    bestStreak: { type: Number, default: 1 },
  },
  { timestamps: true }
);
const Streak = mongoose.model("Streak", streakSchema);

// POST /api/streak/ping: call whenever a study action happens to update streak
app.post("/api/streak/ping", async (req, res) => {
  try {
    const { clerkUserId } = req.body || {};
    if (!clerkUserId)
      return res.status(400).json({ error: "clerkUserId required" });
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;

    let s = await Streak.findOne({ clerkUserId });
    if (!s) {
      s = await Streak.create({
        clerkUserId,
        lastStudyDate: todayStr,
        currentStreak: 1,
        bestStreak: 1,
      });
      return res.status(201).json(s);
    }

    if (s.lastStudyDate === todayStr) {
      return res.json(s);
    }

    const last = new Date(s.lastStudyDate + "T00:00:00");
    const diffDays = Math.round((today - last) / 86400000);

    if (diffDays === 1) {
      s.currentStreak += 1;
    } else if (diffDays > 1) {
      s.currentStreak = 1;
    }
    s.bestStreak = Math.max(s.bestStreak, s.currentStreak);
    s.lastStudyDate = todayStr;
    await s.save();
    return res.json(s);
  } catch (e) {
    console.error("streak ping error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/streak?clerkUserId=...
app.get("/api/streak", async (req, res) => {
  try {
    const { clerkUserId } = req.query;
    if (!clerkUserId)
      return res.status(400).json({ error: "clerkUserId required" });
    const s = await Streak.findOne({ clerkUserId });
    return res.json(s || null);
  } catch (e) {
    console.error("streak get error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Todos: simple tasks for the dashboard
const todoSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, index: true, required: true },
    title: { type: String, required: true, trim: true },
    done: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Todo = mongoose.model("Todo", todoSchema);

// GET /api/todos?clerkUserId=...
app.get("/api/todos", async (req, res) => {
  try {
    const { clerkUserId } = req.query;
    if (!clerkUserId)
      return res.status(400).json({ error: "clerkUserId required" });
    const items = await Todo.find({ clerkUserId }).sort({
      done: 1,
      order: 1,
      createdAt: -1,
    });
    return res.json(items);
  } catch (e) {
    console.error("todos get error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/todos
app.post("/api/todos", async (req, res) => {
  try {
    const { clerkUserId, title } = req.body || {};
    if (!clerkUserId || !title)
      return res.status(400).json({ error: "clerkUserId and title required" });
    const created = await Todo.create({ clerkUserId, title });
    return res.status(201).json(created);
  } catch (e) {
    console.error("todos create error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/todos/:id (toggle or rename)
app.patch("/api/todos/:id", async (req, res) => {
  try {
    const update = {};
    if (typeof req.body.done === "boolean") update.done = req.body.done;
    if (typeof req.body.title === "string")
      update.title = req.body.title.trim();
    const item = await Todo.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    return res.json(item);
  } catch (e) {
    console.error("todos patch error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// DELETE /api/todos/:id
app.delete("/api/todos/:id", async (req, res) => {
  try {
    const del = await Todo.findByIdAndDelete(req.params.id);
    if (!del) return res.status(404).json({ error: "Not found" });
    return res.status(204).send();
  } catch (e) {
    console.error("todos delete error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Planner: upcoming study items with due dates
const plannerSchema = new mongoose.Schema(
  {
    clerkUserId: { type: String, index: true, required: true },
    title: { type: String, required: true, trim: true },
    dueAt: { type: Date, required: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);
const Planner = mongoose.model("Planner", plannerSchema);

// GET /api/planner/upcoming?clerkUserId=...&limit=3
app.get("/api/planner/upcoming", async (req, res) => {
  try {
    const { clerkUserId, limit } = req.query;
    if (!clerkUserId)
      return res.status(400).json({ error: "clerkUserId required" });
    const lim = Math.max(1, Math.min(parseInt(limit || "3", 10), 10));
    const items = await Planner.find({
      clerkUserId,
      dueAt: { $gte: new Date() },
    })
      .sort({ dueAt: 1 })
      .limit(lim);
    return res.json(items);
  } catch (e) {
    console.error("planner get error:", e);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Stats endpoint
app.get("/api/stats", async (req, res) => {
  try {
    const { clerkUserId } = req.query;
    if (!clerkUserId)
      return res.status(400).json({ error: "clerkUserId required" });

    const uploads = await UploadDoc.countDocuments({ clerkUserId });
    const todos = await Todo.countDocuments({ clerkUserId, done: true });
    const focusTime = "0h 0m"; // Placeholder; implement tracking if needed

    return res.json({
      docsStudied: uploads,
      focusTime: focusTime,
      tasksDone: todos,
    });
  } catch (e) {
    console.error("stats get error:", e);
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
