import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaMagic,
  FaLayerGroup,
  FaClock,
  FaStar,
  FaQuestionCircle,
  FaCalendarAlt,
  FaStickyNote,
} from "react-icons/fa";
import "/Users/sreejitadas/7th-Sem-Project/frontend/index.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="lp">
      {/* Hero */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="h1">StudyBuddy</h1>
          <p className="sub">
            Your personalized companion for focused learning, quick summaries,
            and instant answers — without the clutter.
          </p>
          <div className="cta-row">
            <button
              className="btn primary"
              onClick={() => navigate("/dashboard")}
            >
              Dive into learning
            </button>
            <button className="btn ghost" onClick={() => navigate("/pricing")}>
              Explore plans
            </button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <h2 className="h2">Everything needed, nothing extra</h2>
        <div className="grid">
          <Feature
            icon={<FaFileAlt />}
            title="Smart doc analysis"
            text="Upload PDFs, DOCX, or TXT for instant insights."
          />
          <Feature
            icon={<FaMagic />}
            title="AI summaries"
            text="Grasp core concepts in minutes."
          />
          <Feature
            icon={<FaLayerGroup />}
            title="Flashcards"
            text="Auto-generated decks from study material."
          />
          <Feature
            icon={<FaClock />}
            title="Progress"
            text="Goals and real-time tracking."
          />
          <Feature
            icon={<FaStar />}
            title="Motivation"
            text="Daily nudges to keep going."
          />
          <Feature
            icon={<FaQuestionCircle />}
            title="Doubt solver"
            text="Accurate answers in seconds."
          />
          <Feature
            icon={<FaCalendarAlt />}
            title="Calendar sync"
            text="Plans that fit the schedule."
          />
          <Feature
            icon={<FaStickyNote />}
            title="Notes"
            text="Capture, organize, and revisit quickly."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="final-cta">
        <div className="final-card">
          <h3 className="h3">Make studying effortless</h3>
          <p className="sub small">
            Join learners using minimal, distraction-free tools.
          </p>
          <button className="btn primary" onClick={() => navigate("/pricing")}>
            Start now
          </button>
        </div>
      </section>
    </div>
  );
};

const Feature = ({ icon, title, text }) => (
  <div className="card">
    <div className="icn">{icon}</div>
    <h3 className="t3">{title}</h3>
    <p className="p">{text}</p>
  </div>
);

export default LandingPage;
