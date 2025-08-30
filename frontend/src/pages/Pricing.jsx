import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "/Users/sreejitadas/7th-Sem-Project/frontend/index.css";

const tiers = [
  {
    id: "starter",
    name: "Starter",
    blurb: "For focused individual study",
    monthly: 0,
    annual: 0,
    cta: "Start free",
    features: [
      "Upload 3 documents/month",
      "AI summaries (short)",
      "Basic flashcards",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    blurb: "Most popular for serious learners",
    monthly: 399,
    annual: 319, // per month billed yearly (~20% off)
    cta: "Go Pro",
    popular: true,
    features: [
      "Unlimited uploads",
      "Advanced AI summaries",
      "Smart flashcards & spaced repetition",
      "Progress tracking & goals",
      "Priority support",
    ],
  },
  {
    id: "team",
    name: "Team",
    blurb: "For study groups & cohorts",
    monthly: 999,
    annual: 799,
    cta: "Contact sales",
    features: [
      "All Pro features",
      "Seats & roles (5+)",
      "Shared libraries & notes",
      "Admin analytics",
      "SSO & workspace controls",
    ],
  },
];

const Pricing = () => {
  const navigate = useNavigate();
  const [cycle, setCycle] = useState("monthly"); // or "annual"
  const isAnnual = cycle === "annual";

  const headerNote = useMemo(
    () =>
      isAnnual
        ? "Save 20% with annual billing"
        : "Switch to annual to save 20%",
    [isAnnual]
  );

  const handleSelect = (tierId) => {
    if (tierId === "team") {
      navigate("/contact-sales");
    } else if (tierId === "starter") {
      navigate("/signup");
    } else {
      navigate("/checkout?plan=" + tierId + "&cycle=" + cycle);
    }
  };

  return (
    <div className="pricing">
      <section className="hero">
        <div className="hero-inner">
          <h1 className="h1">Simple, transparent pricing</h1>
          <p className="sub">
            Choose a plan that fits the study workflow—upgrade anytime.
          </p>

          <div className="toggle">
            <button
              className={`toggle-btn ${!isAnnual ? "active" : ""}`}
              onClick={() => setCycle("monthly")}
              aria-pressed={!isAnnual}
            >
              Monthly
            </button>
            <button
              className={`toggle-btn ${isAnnual ? "active" : ""}`}
              onClick={() => setCycle("annual")}
              aria-pressed={isAnnual}
            >
              Annual
              <span className="save">Save 20%</span>
            </button>
          </div>
          <div className="note">{headerNote}</div>
        </div>
      </section>

      <section className="tiers">
        <div className="cards">
          {tiers.map((t) => {
            const price = isAnnual ? t.annual : t.monthly;
            const per =
              t.monthly === 0
                ? "Free forever"
                : isAnnual
                ? "per month, billed yearly"
                : "per month";

            return (
              <article
                key={t.id}
                className={`card ${t.popular ? "popular" : ""}`}
              >
                {t.popular && <div className="badge">Most popular</div>}
                <h3 className="t3">{t.name}</h3>
                <p className="blurb">{t.blurb}</p>

                <div className="price">
                  {price === 0 ? (
                    <span className="free">₹0</span>
                  ) : (
                    <>
                      <span className="currency">₹</span>
                      <span className="amount">
                        {price.toLocaleString("en-IN")}
                      </span>
                    </>
                  )}
                </div>
                <div className="per">{per}</div>

                <button
                  className="btn primary"
                  onClick={() => handleSelect(t.id)}
                >
                  {t.cta}
                </button>

                <ul className="list">
                  {t.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="faq">
        <div className="faq-inner">
          <h4 className="h4">Pricing FAQ</h4>
          <details>
            <summary>How does annual billing work?</summary>
            <p>
              Annual shows a ~20% lower monthly rate and is billed upfront for
              12 months.
            </p>
          </details>
          <details>
            <summary>Can plans be changed later?</summary>
            <p>
              Upgrades and downgrades take effect at the next billing cycle;
              pro‑rated where applicable.
            </p>
          </details>
          <details>
            <summary>Is there a student discount?</summary>
            <p>
              Eligible students can apply for an additional discount during
              checkout.
            </p>
          </details>
        </div>
      </section>
    </div>
  );
};

export default Pricing;
