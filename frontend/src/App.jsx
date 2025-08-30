// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      {/* <Route
        path="/upload-documents"
        element={<div>Upload Documents Page</div>}
      />
      <Route path="/pricing" element={<div>Pricing Page</div>} />
      <Route path="/dashboard" element={<div>Dashboard Page</div>} /> */}
    </Routes>
  );
}

export default App;
