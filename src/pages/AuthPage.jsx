import React, { useState } from "react";
import { Link, Navigate, useLocation } from "react-router-dom";
import { signIn, signUp } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function AuthPage({ signup = false }) {
  const { user, setUser, status, refresh } = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const from = location.state?.from;
  const destination = typeof from === "string" && from.startsWith("/") && !from.startsWith("//") && !["/login", "/signup"].includes(from) ? from : "/dashboard";
  if (status === "loading") return <p className="api-state">Loading account...</p>;
  if (status === "error") return <div className="api-state" role="alert">Could not connect to your account. <button onClick={refresh}>Try again</button></div>;
  if (user) return <Navigate to={destination} replace />;

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError("");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { setUser(await (signup ? signUp(values) : signIn(values))); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <section className="auth-page">
    <form className="auth-card" onSubmit={submit}>
      <span className="auth-eyebrow">CHEEVOHUNTERS</span>
      <h1>{signup ? "Create your account" : "Welcome back"}</h1>
      <p>{signup ? "Find your party. Chase your next achievement." : "Log in to plan your next session."}</p>
      <fieldset disabled={busy}>
        {signup ? <>
          <label>Username<input name="username" autoComplete="username" required minLength={3} maxLength={24} pattern="[A-Za-z0-9_]{3,24}" aria-describedby="username-help" /></label>
          <small id="username-help">3–24 letters, numbers, or underscores.</small>
          <label>Email<input name="email" type="email" autoComplete="email" required maxLength={254} /></label>
        </> : <label>Email or username<input name="identifier" autoComplete="username" required maxLength={254} autoCapitalize="none" spellCheck={false} /></label>}
        <label>Password<input name="password" type="password" autoComplete={signup ? "new-password" : "current-password"} required minLength={signup ? 8 : 1} maxLength={128} aria-describedby={signup ? "password-help" : undefined} /></label>
        {signup && <small id="password-help">At least 8 characters. A few words together work well.</small>}
        {error && <p className="auth-error" role="alert">{error}</p>}
        <button className="primary-action" type="submit">{busy ? "Please wait..." : signup ? "Create account" : "Log in"}</button>
      </fieldset>
      <p className="auth-switch">{signup ? "Already have an account?" : "New to CheevoHunters?"} <Link to={signup ? "/login" : "/signup"} state={location.state}>{signup ? "Log in" : "Sign up"}</Link></p>
    </form>
  </section>;
}
