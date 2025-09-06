// Dashboard.jsx
import React, { useMemo } from "react";
import { FaBookOpen, FaClock, FaBolt, FaCheckCircle } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react"; // NEW

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

const Item = ({ title, meta }) => (
  <div className="item">
    <div className="item-title">{title}</div>
    <div className="item-meta">{meta}</div>
  </div>
);

const Dashboard = () => {
  const { user, isSignedIn } = useUser(); // NEW
  const first = user?.firstName || "there"; // NEW

  return (
    <div className="dashboard">
      {/* Affirmation banner ABOVE heading */}
      <AffirmationBanner />

      {/* Header */}
      <header className="dash-head">
        <div>
          <h3>Welcome back, {first}! Here’s your current study snapshot.</h3>
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
