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
    <div>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<HomeBrowse />} />
          <Route path="/create" element={<CreateSession />} />
          <Route path="/games/:id" element={<GameDetail />} />
          <Route path="/session/:id" element={<SessionDetail />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
      </main>
    </div>
  );
}
