import React from "react";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Dashboard from "./components/Dashboard";
import Transactions from "./components/Transactions";
import Insights from "./components/Insights";
import "./App.css";

function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-logo">◆</div>
      <div className="loading-text">Zorvyn</div>
      <div className="loading-bar-wrap">
        <div className="loading-bar"></div>
      </div>
      <div className="loading-sub">Fetching your financial data...</div>
    </div>
  );
}

function ErrorScreen({ message }) {
  return (
    <div className="loading-screen">
      <div className="loading-logo" style={{ color: "#f87171" }}>✕</div>
      <div className="loading-text">Something went wrong</div>
      <div className="loading-sub" style={{ color: "#f87171" }}>{message}</div>
      <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  );
}

function AppContent() {
  const { state } = useApp();

  if (state.loading) return <LoadingScreen />;
  if (state.apiError) return <ErrorScreen message={state.apiError} />;

  return (
    <div className={`app ${state.darkMode ? "dark" : "light"}`}>
      <Navbar />
      <main className="main-content">
        {state.activeTab === "dashboard" && <Dashboard />}
        {state.activeTab === "transactions" && <Transactions />}
        {state.activeTab === "insights" && <Insights />}
      </main>
      <footer className="footer">
        <span>Built by <strong>Abhidhan Roy</strong></span>
        <span className="footer-dot">·</span>
        <a href="mailto:you@email.com">abhidhanroy02072004@gmail.com</a>
        <span className="footer-dot">·</span>
        <a href="https://linkedin.com/in/Abhidhan-roy2004" target="_blank" rel="noreferrer">LinkedIn ↗</a>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
