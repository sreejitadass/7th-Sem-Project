// Dashboard.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  FaBookOpen,
  FaClock,
  FaBolt,
  FaCheckCircle,
  FaPlus,
  FaPlay,
  FaPause,
  FaStop,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";

const DB_BASE = import.meta.env.VITE_DB_API || "http://127.0.0.1:3000";

const AFFIRMATIONS = [
  "I can do hard things.",
  "Progress over perfection.",
  "Focus. Breathe. Continue.",
  "Small steps lead to big wins.",
  "Consistency beats intensity.",
  "My effort compounds over time.",
  "I am capable and resilient.",
  "I’m building my future today.",
  "Learning is my superpower.",
  "One page at a time.",
];

const AffirmationBanner = () => {
  const pick = useMemo(() => {
    const idx = Math.floor(Math.random() * AFFIRMATIONS.length);
    return `“${AFFIRMATIONS[idx]}”`;
  }, []);
  return (
    <div className="dash-banner center">
      <span className="dash-banner-text italic">{pick}</span>
    </div>
  );
};

const Stat = ({ icon, label, value, hint }) => (
  <div className="dash-card stat">
    <div className="stat-top">
      <div className="icn">{icon}</div>
      <div className="stat-val">{value}</div>
    </div>
    <div className="stat-label">{label}</div>
    {hint && <div className="stat-hint">{hint}</div>}
  </div>
);

const Item = ({ title, meta, onClick }) => (
  <div className="item" onClick={onClick}>
    <div className="item-title">{title}</div>
    <div className="item-meta">{meta}</div>
  </div>
);

const StudyTimer = () => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let interval;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((prev) => prev + 1);
      }, 1000);
    } else if (!isActive && !isPaused) {
      setTime(0);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused]);

  const handleStart = () => setIsActive(true);
  const handlePause = () => setIsPaused(!isPaused);
  const handleStop = () => {
    setIsActive(false);
    setIsPaused(false);
    // Optionally save session to backend
    // axios.post(`${DB_BASE}/study-session`, { duration: time, userId: user.id });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="dash-card timer-card">
      <h3 className="t3">Study Timer</h3>
      <p className="p muted">Pomodoro-style focus sessions</p>
      <div className="timer-display">{formatTime(time)}</div>
      <div className="timer-controls">
        {!isActive ? (
          <button className="btn primary small" onClick={handleStart}>
            <FaPlay /> Start
          </button>
        ) : isPaused ? (
          <button className="btn primary small" onClick={handlePause}>
            <FaPlay /> Resume
          </button>
        ) : (
          <button className="btn ghost small" onClick={handlePause}>
            <FaPause /> Pause
          </button>
        )}
        {isActive && (
          <button className="btn ghost small" onClick={handleStop}>
            <FaStop /> Stop
          </button>
        )}
      </div>
    </div>
  );
};

const ToDoList = ({ todos, onToggle, onAdd }) => {
  const [newTodo, setNewTodo] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAdd(newTodo);
      setNewTodo("");
    }
  };

  return (
    <div className="dash-card todo-card">
      <h3 className="t3">To-Do List</h3>
      <form onSubmit={handleAdd} className="todo-add">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a task..."
          className="input small"
        />
        <button type="submit" className="btn primary small">
          <FaPlus />
        </button>
      </form>
      <ul className="mini-list">
        {todos.map((todo, idx) => (
          <li
            key={idx}
            className={`todo-item ${todo.done ? "completed" : ""}`}
            onClick={() => onToggle(idx)}
          >
            {todo.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

const Dashboard = () => {
  const { user, isSignedIn } = useUser();
  const first = user?.firstName || "there";
  const clerkUserId = user?.id;

  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState({
    docsStudied: 0,
    focusTime: "0h 0m",
    tasksDone: 0,
  });
  const [recentUploads, setRecentUploads] = useState([]);
  const [todos, setTodos] = useState([]);
  const [planner, setPlanner] = useState([]);

  useEffect(() => {
    if (!isSignedIn || !clerkUserId) return;

    const fetchData = async () => {
      try {
        const [streakRes, statsRes, uploadsRes, todosRes, plannerRes] =
          await Promise.all([
            axios.get(`${DB_BASE}/api/streak?clerkUserId=${clerkUserId}`),
            axios.get(`${DB_BASE}/api/stats?clerkUserId=${clerkUserId}`),
            axios.get(
              `${DB_BASE}/api/uploads?clerkUserId=${clerkUserId}&limit=4`
            ),
            axios.get(`${DB_BASE}/api/todos?clerkUserId=${clerkUserId}`),
            axios.get(
              `${DB_BASE}/api/planner/upcoming?clerkUserId=${clerkUserId}`
            ),
          ]);

        setStreak(streakRes.data?.currentStreak || 0);
        setStats(
          statsRes.data || { docsStudied: 0, focusTime: "0h 0m", tasksDone: 0 }
        );
        setRecentUploads(uploadsRes.data.uploads || []);
        setTodos(todosRes.data || []);
        setPlanner(plannerRes.data || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, [isSignedIn, clerkUserId]);

  const handleToggleTodo = async (idx) => {
    const updatedTodos = [...todos];
    const todo = updatedTodos[idx];
    todo.done = !todo.done;
    setTodos(updatedTodos);

    try {
      await axios.patch(`${DB_BASE}/api/todos/${todo._id}`, {
        done: todo.done,
      });
      // Recalculate tasksDone locally or refetch stats
      const tasksDone = updatedTodos.filter((t) => t.done).length;
      setStats((prev) => ({ ...prev, tasksDone }));
    } catch (error) {
      console.error("Error updating todo:", error);
      // Revert local state on failure
      todo.done = !todo.done;
      setTodos([...updatedTodos]);
    }
  };

  const handleAddTodo = (text) => {
    const newTodo = { title: text, done: false, _id: Date.now().toString() }; // Temporary _id
    setTodos([...todos, newTodo]);

    // Optionally add to backend
    axios
      .post(`${DB_BASE}/api/todos`, { clerkUserId, title: text })
      .then((res) => {
        // Replace temporary _id with server-generated _id
        setTodos((prev) =>
          prev.map((t) => (t._id === newTodo._id ? res.data : t))
        );
      })
      .catch((error) => {
        console.error("Error adding todo:", error);
        // Remove the todo if backend fails
        setTodos((prev) => prev.filter((t) => t._id !== newTodo._id));
      });
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="dashboard">
      <AffirmationBanner />

      <header className="dash-head">
        <div>
          <h2 className="h2">
            Welcome back, {first}! Here’s your current study snapshot.
          </h2>
          <p className="sub">Stay consistent and watch your progress grow.</p>
        </div>
      </header>

      <section className="dash-stats">
        <Stat
          icon={<FaBookOpen />}
          label="Docs studied"
          value={stats.docsStudied.toString()}
          hint="this week"
        />
        <Stat
          icon={<FaClock />}
          label="Focus time"
          value={stats.focusTime}
          hint="Past 7 days"
        />
        <Stat
          icon={<FaBolt />}
          label="Streak"
          value={`${streak} days`}
          hint="Keep it going!"
        />
        <Stat
          icon={<FaCheckCircle />}
          label="Tasks done"
          value={stats.tasksDone.toString()}
        />
      </section>

      <section className="dash-grid">
        <article className="dash-card">
          <h3 className="t3">Recent uploads</h3>
          <p className="p">Your latest documents for quick access.</p>
          <div className="list">
            {recentUploads.map((upload, idx) => (
              <Item
                key={idx}
                title={`Uploaded: ${upload.title}`}
                meta={`${formatDate(upload.createdAt)} • ${
                  upload.size || "N/A"
                }`}
                onClick={() => {
                  /* Navigate to doc */
                }}
              />
            ))}
          </div>
          {recentUploads.length === 0 && (
            <p className="no-content-text">
              No recent uploads. <Link to="/upload">Add one now</Link>.
            </p>
          )}
        </article>

        <StudyTimer />

        <ToDoList
          todos={todos}
          onToggle={handleToggleTodo}
          onAdd={handleAddTodo}
        />

        <article className="dash-card wide">
          <h3 className="t3">Upcoming activities</h3>
          <ul className="mini-list">
            {planner.map((activity, idx) => (
              <li key={idx}>
                {activity.title} — {formatDate(activity.dueAt)}
              </li>
            ))}
          </ul>
          {planner.length === 0 && (
            <p className="no-content-text">
              No upcoming activities. Add some to your planner.
            </p>
          )}
          <div className="inline-actions">
            <button className="btn ghost small">Add activity</button>
            <button className="btn primary small">View planner</button>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
