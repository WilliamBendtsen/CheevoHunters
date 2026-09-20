import { AuthProvider, RequireAuth } from "./auth/AuthContext";
import AuthPage from "./pages/AuthPage";
import React from "react";
import { Routes, Route } from "react-router-dom";
import HomeBrowse from "./pages/HomeBrowse";
import CreateSession from "./pages/CreateSession";
import GameDetail from "./pages/GameDetail";
import SessionDetail from "./pages/SessionDetail";
import UserDashboard from "./pages/UserDashboard";
import Header from "./components/Header";

export default function App() {
  return (
    <AuthProvider>
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/login" element={<AuthPage key="login" />} />
          <Route path="/signup" element={<AuthPage key="signup" signup />} />
          <Route path="/" element={<HomeBrowse />} />
          <Route path="/create" element={<RequireAuth><CreateSession /></RequireAuth>} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/session/:id" element={<SessionDetail />} />
          <Route path="/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />
        </Routes>
      </main>
    </div>
    </AuthProvider>
  );
}
