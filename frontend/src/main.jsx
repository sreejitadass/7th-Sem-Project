// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";
import { dark } from "@clerk/themes";

import App from "./App";

const PUBLISHABLE_KEY =
  "pk_test_b3Blbi1zZWFndWxsLTQzLmNsZXJrLmFjY291bnRzLmRldiQ";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        baseTheme: dark, // optional; uses Clerk’s dark baseline
        variables: {
          colorForeground: "#e9eaf1", // main text color
          colorNeutral: "#c9cbe0", // borders/hover neutrals on dark bg
          colorPrimary: "#a78bfa", // buttons/links accent
          colorPrimaryForeground: "#0b0b12", // text on primary buttons
          borderRadius: "10px",
          fontSize: "14px",
        },
      }}
      routerPush={(to) => window.history.pushState({}, "", to)}
      routerReplace={(to) => window.history.replaceState({}, "", to)}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </React.StrictMode>
);
