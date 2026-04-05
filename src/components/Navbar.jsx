import React from "react";
import { useApp } from "../context/AppContext";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "transactions", label: "Transactions", icon: "↕" },
  { id: "insights", label: "Insights", icon: "◈" },
];

export default function Navbar() {
  const { state, dispatch } = useApp();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">◆</span>
        <span className="brand-name">Zorvyn</span>
      </div>

      <div className="navbar-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${state.activeTab === tab.id ? "active" : ""}`}
            onClick={() => dispatch({ type: "SET_TAB", payload: tab.id })}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="navbar-controls">
        <select
          className="role-select"
          value={state.role}
          onChange={e => dispatch({ type: "SET_ROLE", payload: e.target.value })}
          title="Switch role"
        >
          <option value="viewer">👁 Viewer</option>
          <option value="admin">⚙ Admin</option>
        </select>

        <button
          className="icon-btn"
          onClick={() => dispatch({ type: "TOGGLE_DARK" })}
          title="Toggle dark mode"
        >
          {state.darkMode ? "☀" : "☾"}
        </button>
      </div>
    </nav>
  );
}
