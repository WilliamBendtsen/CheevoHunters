import React from "react";
import { NavLink } from "react-router-dom";

export default function Header() {
  return (
    <header className="site-header">
      <div className="header-left">
        <NavLink to="/" className="brand" aria-label="CheevoHunters home">
          <span className="brand-mark">CH</span>
          <span>CheevoHunters</span>
        </NavLink>

        <nav className="primary-nav" aria-label="Primary navigation">
          <NavLink to="/" end>
            Browse Games
          </NavLink>
          <NavLink to="/create">Create Session</NavLink>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </nav>
      </div>

      <div className="header-right">
        <label className="site-search">
          <span className="search-icon" aria-hidden="true" />
          <input type="search" placeholder="Search games, tags, sessions..." />
        </label>
        <button className="icon-button" type="button" aria-label="Notifications">
          <span aria-hidden="true">!</span>
        </button>
        <NavLink to="/dashboard" className="profile-link" aria-label="Open profile">
          <span className="avatar">PP</span>
          <span>PixelPulse</span>
        </NavLink>
      </div>
    </header>
  );
}
