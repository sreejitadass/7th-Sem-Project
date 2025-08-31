import { SignIn, SignUp } from "@clerk/clerk-react";
import React from "react";

export const SignUpPage = () => (
  <div className="auth auth--center">
    <SignUp
      appearance={{ elements: { rootBox: "cl-rootBox", card: "cl-card" } }}
      forceRedirectUrl="/dashboard"
      fallbackRedirectUrl="/dashboard"
    />
  </div>
);

export const SignInPage = () => (
  <div className="auth auth--center">
    <SignIn
      appearance={{ elements: { rootBox: "cl-rootBox", card: "cl-card" } }}
      forceRedirectUrl="/dashboard"
      fallbackRedirectUrl="/dashboard"
    />
  </div>
);
