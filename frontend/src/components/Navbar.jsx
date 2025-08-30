import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen((v) => !v);
  const close = () => setOpen(false);

  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to="/" className="brand" onClick={close}>
          <span className="logo-dot" />
          StudyBuddy
        </Link>

        <button
          className="nav-toggle"
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={toggle}
        >
          <span className="bar" />
          <span className="bar" />
          <span className="bar" />
        </button>

        <nav className={`nav-links ${open ? "open" : ""}`} aria-label="Primary">
          <NavLink to="/dashboard" className="nav-link" onClick={close}>
            Dashboard
          </NavLink>
          <NavLink to="/pricing" className="nav-link" onClick={close}>
            Pricing
          </NavLink>
          <NavLink to="/upload-documents" className="nav-link" onClick={close}>
            Upload
          </NavLink>
          <NavLink to="/about" className="nav-link" onClick={close}>
            About
          </NavLink>

          <div className="nav-cta">
            <Link to="/signup" className="btn small primary" onClick={close}>
              Get started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
