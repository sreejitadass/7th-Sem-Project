import React from "react";

const About = () => {
  return (
    <div className="about">
      {/* Hero */}
      <section className="about-hero">
        <div className="about-inner">
          <h1 className="h1">About LearnSphere</h1>
          <p className="sub">
            Building calm, focused tools that help learners understand faster,
            stay motivated, and make steady progress—without the noise.
          </p>
        </div>
      </section>
      {/* Pillars */}
      <section className="about-pillars">
        <div className="pillars-grid">
          <article className="about-card">
            <h3 className="t3">Clarity</h3>
            <p className="p">
              Minimal interfaces and clear language so study time goes into
              learning—not UI wrangling.
            </p>
          </article>
          <article className="about-card">
            <h3 className="t3">Focus</h3>
            <p className="p">
              AI that summarizes, organizes, and schedules—leaving room for deep
              work.
            </p>
          </article>
          <article className="about-card">
            <h3 className="t3">Momentum</h3>
            <p className="p">
              Goals, streaks, and review cycles that keep progress visible and
              motivating.
            </p>
          </article>
        </div>
      </section>
      {/* Snapshot */}
      <section className="about-snapshot">
        <div className="snapshot-grid">
          <div className="snap">
            <div className="snap-k">2025</div>
            <div className="snap-l">founded</div>
          </div>
          <div className="snap">
            <div className="snap-k">8k+</div>
            <div className="snap-l">notes organized</div>
          </div>
          <div className="snap">
            <div className="snap-k">120k+</div>
            <div className="snap-l">flashcards reviewed</div>
          </div>
          <div className="snap">
            <div className="snap-k">99.9%</div>
            <div className="snap-l">uptime</div>
          </div>
        </div>
      </section>
      {/* Values row */}
      <section className="about-values">
        <div className="values">
          <article className="about-card">
            <h3 className="t3">Privacy-first</h3>
            <p className="p">
              Files stay secure; controls are transparent and simple.
            </p>
          </article>
          <article className="about-card">
            <h3 className="t3">Accessible</h3>
            <p className="p">
              Readable contrast, focus states, and keyboard-friendly flows.
            </p>
          </article>
          <article className="about-card">
            <h3 className="t3">Continuous</h3>
            <p className="p">
              Small, steady improvements guided by learner feedback.
            </p>
          </article>
        </div>
      </section>
      <section className="faq-section about-faq">
        <div className="faq-container">
          <h2 className="h2">Frequently asked questions</h2>
          <p className="sub small">
            Answers to common questions about LearnSphere’s focus, data
            handling, and plans.
          </p>

          <div className="faq-grid two-col">
            <details className="faq-item" open>
              <summary>What is LearnSphere focused on?</summary>
              <p>
                A minimal study workflow: upload, summarize, review with spaced
                repetition, and track momentum—without distractions.
              </p>
            </details>

            <details className="faq-item">
              <summary>Do notes and files stay private?</summary>
              <p>
                Content is processed securely; deletion/export controls live in
                Settings. Team workspaces use role-based access.
              </p>
            </details>

            <details className="faq-item">
              <summary>Is there a free plan?</summary>
              <p>
                Yes—Starter includes limited uploads, basic summaries, and
                community support. Upgrade anytime to unlock advanced tools.
              </p>
            </details>

            <details className="faq-item">
              <summary>Can study groups use it?</summary>
              <p>
                The Team plan adds shared libraries, roles, analytics, and SSO
                for cohorts and clubs.
              </p>
            </details>

            <details className="faq-item">
              <summary>Does it integrate with calendars?</summary>
              <p>
                Yes—sync study schedules with a calendar so reviews and
                deadlines stay visible.
              </p>
            </details>

            <details className="faq-item">
              <summary>How is pricing handled for India?</summary>
              <p>
                Prices display in ₹ with local digit grouping; annual billing
                offers a discount and is charged upfront.
              </p>
            </details>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
