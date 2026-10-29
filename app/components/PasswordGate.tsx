"use client";

import { useState, useEffect, FormEvent } from "react";

interface PasswordGateProps {
  children: React.ReactNode;
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const CORRECT_PASSWORD = "3527";

  useEffect(() => {
    const stored = localStorage.getItem("wedding_auth");
    if (stored === "authenticated") {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      localStorage.setItem("wedding_auth", "authenticated");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setPassword("");
    }
  };

  if (isLoading) {
    return null;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="password-gate-overlay">
      <div className="password-gate-container">
        <div className="password-gate-content">
          <h1 className="password-gate-title">Ryan &amp; Eleanor</h1>
          <p className="password-gate-subtitle">March 6, 2027</p>
          <p className="password-gate-message">Please enter the password to view our wedding website</p>
          
          <form onSubmit={handleSubmit} className="password-gate-form">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="password-gate-input"
              autoFocus
            />
            <button type="submit" className="password-gate-button">
              Enter
            </button>
            {error && <p className="password-gate-error">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}
