// Dashboard.jsx
import React from "react";
import { FaBookOpen, FaClock, FaBolt, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

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

const Item = ({ title, meta }) => (
  <div className="item">
    <div className="item-title">{title}</div>
    <div className="item-meta">{meta}</div>
  </div>
);

const Dashboard = () => {
  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dash-head">
        <div>
          <h1 className="h2">Dashboard</h1>
          <p className="sub small">
            Welcome back—here’s the current study snapshot.
          </p>
        </div>
        <div className="dash-head-actions">
          <Link to="/upload" className="btn ghost">
            New upload
          </Link>
          <button className="btn primary">Quick review</button>
        </div>
      </header>

      {/* Stats */}
      <section className="dash-stats">
        <Stat
          icon={<FaBookOpen />}
          label="Docs studied"
          value="12"
          hint="+3 this week"
        />
        <Stat
          icon={<FaClock />}
          label="Focus time"
          value="6h 42m"
          hint="Past 7 days"
        />
        <Stat
          icon={<FaBolt />}
          label="Streak"
          value="5 days"
          hint="Keep it going"
        />
        <Stat
          icon={<FaCheckCircle />}
          label="Tasks done"
          value="18"
          hint="Out of 24"
        />
      </section>

      {/* Main grid */}
      <section className="dash-grid">
        <article className="dash-card wide">
          <h3 className="t3">Study progress</h3>
          <p className="p">Weekly trend and goal completion.</p>
          <div className="chart-placeholder">
            <div className="bar b1" />
            <div className="bar b2" />
            <div className="bar b3" />
            <div className="bar b4" />
            <div className="bar b5" />
            <div className="bar b6" />
            <div className="bar b7" />
          </div>
        </article>

        <article className="dash-card">
          <h3 className="t3">Flashcards due</h3>
          <p className="p">Cards scheduled for spaced repetition today.</p>
          <ul className="mini-list">
            <li>Data Structures — 12 due</li>
            <li>Operating Systems — 7 due</li>
            <li>DBMS — 4 due</li>
          </ul>
          <button className="btn primary small">Start review</button>
        </article>

        <article className="dash-card">
          <h3 className="t3">Recent activity</h3>
          <div className="list">
            <Item title="Uploaded: Graph Theory.pdf" meta="Today • 2:10 PM" />
            <Item
              title="Generated flashcards: OS Scheduling"
              meta="Yesterday • 8:45 PM"
            />
            <Item
              title="Summary created: Database Normalization"
              meta="Yesterday • 3:12 PM"
            />
          </div>
        </article>

        <article className="dash-card wide">
          <h3 className="t3">Upcoming tasks</h3>
          <ul className="mini-list">
            <li>Revise Dynamic Programming notes — Tomorrow</li>
            <li>Upload Midterm syllabus — Wed</li>
            <li>Practice OS MCQs — Fri</li>
          </ul>
          <div className="inline-actions">
            <button className="btn ghost small">Add task</button>
            <button className="btn primary small">View all</button>
          </div>
        </article>
      </section>
    </div>
  );
};

export default Dashboard;
