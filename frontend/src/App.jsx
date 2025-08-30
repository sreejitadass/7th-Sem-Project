// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Pricing from "./pages/Pricing.jsx";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  );
}

export default App;
