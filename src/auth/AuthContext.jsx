import React, { createContext, useContext, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCurrentUser, signOut } from "../api/client";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  async function refresh() {
    setStatus("loading");
    try { setUser(await getCurrentUser()); setStatus("ready"); }
    catch (error) {
      if (error.status === 401) { setUser(null); setStatus("ready"); }
      else setStatus("error");
    }
  }
  useEffect(() => { refresh(); }, []);
  useEffect(() => {
    const expired = () => { setUser(null); setStatus("ready"); };
    window.addEventListener("auth-expired", expired);
    return () => window.removeEventListener("auth-expired", expired);
  }, []);
  async function logout() { await signOut(); setUser(null); }
  return <AuthContext.Provider value={{ user, setUser, status, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function RequireAuth({ children }) {
  const { user, status, refresh } = useAuth();
  const location = useLocation();
  if (status === "loading") return <p className="api-state">Loading account...</p>;
  if (status === "error") return <div className="api-state" role="alert">Could not load your account. <button onClick={refresh}>Try again</button></div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  return children;
}
