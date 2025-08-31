// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage.jsx";
import Pricing from "./pages/Pricing.jsx";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { SignInPage, SignUpPage } from "./pages/AuthPages.jsx";

const Protect = ({ children }) => {
  const { isSignedIn } = useAuth();
  return isSignedIn ? children : <Navigate to="/sign-in" replace />;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route
          path="/dashboard"
          element={
            <Protect>
              <Dashboard />
            </Protect>
          }
        />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
      </Routes>
    </>
  );
}

export default App;
