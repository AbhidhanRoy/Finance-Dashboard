import React, { useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import MonthRangePicker, { sliceRange, filterByRange } from "./MonthRangePicker";

function fmt(n) {
  return "₹" + Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function SummaryCard({ label, value, sub, color }) {
  return (
    <div className={`summary-card summary-card--${color}`}>
      <div className="summary-label">{label}</div>
      <div className="summary-value">{value}</div>
      {sub && <div className="summary-sub">{sub}</div>}
    </div>
  );
}

const CHART_COLORS = ["#4ade80","#22d3ee","#a78bfa","#f87171","#fbbf24","#60a5fa"];

function exportReport({ slicedLabels, monthlyData, totalIncome, totalExpenses, balance, savingsRate, topCats, rangeText }) {
  const rows = monthlyData.map((m, i) => `
    <tr>
      <td>${slicedLabels[i]}</td>
      <td style="color:#16a34a">₹${m.income.toLocaleString("en-IN")}</td>
      <td style="color:#dc2626">₹${m.expenses.toLocaleString("en-IN")}</td>
      <td style="color:${m.balance >= 0 ? "#16a34a" : "#dc2626"}">${m.balance >= 0 ? "+" : "-"}₹${Math.abs(m.balance).toLocaleString("en-IN")}</td>
    </tr>`).join("");

  const catRows = topCats.map(([cat, val]) =>
    `<tr><td>${cat}</td><td style="color:#dc2626">₹${val.toLocaleString("en-IN")}</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html><head><title>Dashboard Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
    .summary { display: flex; gap: 20px; margin-bottom: 28px; flex-wrap: wrap; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 20px; min-width: 140px; }
    .card-label { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
    .card-value { font-size: 20px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 12px; color: #666; border-bottom: 1px solid #e5e7eb; }
    td { padding: 9px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    h2 { font-size: 15px; margin-bottom: 10px; margin-top: 0; }
    @media print { body { padding: 16px; } }
  </style></head><body>
  <h1>Financial Dashboard Report</h1>
  <div class="sub">Period: ${rangeText} &nbsp;·&nbsp; Generated: ${new Date().toLocaleDateString("en-IN")}</div>
  <div class="summary">
    <div class="card"><div class="card-label">Net Balance</div><div class="card-value" style="color:${balance >= 0 ? "#16a34a" : "#dc2626"}">₹${Math.abs(balance).toLocaleString("en-IN")}</div></div>
    <div class="card"><div class="card-label">Total Income</div><div class="card-value" style="color:#16a34a">₹${totalIncome.toLocaleString("en-IN")}</div></div>
    <div class="card"><div class="card-label">Total Expenses</div><div class="card-value" style="color:#dc2626">₹${totalExpenses.toLocaleString("en-IN")}</div></div>
    <div class="card"><div class="card-label">Savings Rate</div><div class="card-value">${savingsRate}%</div></div>
  </div>
  <h2>Monthly Breakdown</h2>
  <table><thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net</th></tr></thead><tbody>${rows}</tbody></table>
  <h2>Top Spending Categories</h2>
  <table><thead><tr><th>Category</th><th>Total Spent</th></tr></thead><tbody>${catRows}</tbody></table>
  <script>window.onload = () => window.print();</script>
  </body></html>`;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const lineRef = useRef(null);
  const pieRef  = useRef(null);
  const lineChart = useRef(null);
  const pieChart  = useRef(null);

  const { fromKey, toKey, activeQuick } = state.dashboardRange;
  const setRange = (r) => dispatch({ type: "SET_DASHBOARD_RANGE", payload: r });

  const { keys: slicedKeys, labels: slicedLabels } = useMemo(() => sliceRange(fromKey, toKey), [fromKey, toKey]);
  const filteredTx = useMemo(() => filterByRange(state.transactions, fromKey, toKey), [state.transactions, fromKey, toKey]);

  const monthlyData = useMemo(() => slicedKeys.map(mk => {
    const inc = filteredTx.filter(t => t.type === "income"  && t.date.startsWith(mk)).reduce((s,t) => s + t.amount, 0);
    const exp = filteredTx.filter(t => t.type === "expense" && t.date.startsWith(mk)).reduce((s,t) => s + t.amount, 0);
    return { income: inc, expenses: exp, balance: inc - exp, savings: inc - exp };
  }), [filteredTx, slicedKeys]);

  const totalIncome   = filteredTx.filter(t => t.type === "income").reduce((s,t) => s + t.amount, 0);
  const totalExpenses = filteredTx.filter(t => t.type === "expense").reduce((s,t) => s + t.amount, 0);
  const balance       = totalIncome - totalExpenses;
  const savingsRate   = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0.0";

  const catData = {};
  filteredTx.filter(t => t.type === "expense").forEach(t => { catData[t.category] = (catData[t.category] || 0) + t.amount; });
  const topCats = Object.entries(catData).sort((a,b) => b[1]-a[1]).slice(0,6);

  const isDark    = state.darkMode;
  const gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textColor = isDark ? "#9aa3b0" : "#6b7a8d";

  useEffect(() => {
    if (!window.Chart) return;
    if (lineChart.current) lineChart.current.destroy();
    if (pieChart.current)  pieChart.current.destroy();

    // Line chart — Income + Expenses + Savings
    lineChart.current = new window.Chart(lineRef.current, {
      type: "line",
      data: {
        labels: slicedLabels,
        datasets: [
          { label: "Income",   data: monthlyData.map(m => m.income),   borderColor: "#4ade80", backgroundColor: "rgba(74,222,128,0.06)",  tension: 0.4, fill: true,  pointBackgroundColor: "#4ade80", pointRadius: slicedKeys.length > 8 ? 2 : 4 },
          { label: "Expenses", data: monthlyData.map(m => m.expenses), borderColor: "#f87171", backgroundColor: "rgba(248,113,113,0.06)", tension: 0.4, fill: true,  pointBackgroundColor: "#f87171", pointRadius: slicedKeys.length > 8 ? 2 : 4 },
          { label: "Savings",  data: monthlyData.map(m => m.savings),  borderColor: "#a78bfa", backgroundColor: "rgba(167,139,250,0.06)", tension: 0.4, fill: false, pointBackgroundColor: "#a78bfa", pointRadius: slicedKeys.length > 8 ? 2 : 4, borderDash: [5,3] },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => " " + ctx.dataset.label + ": " + fmt(ctx.parsed.y) } } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "'DM Mono', monospace" }, maxRotation: slicedKeys.length > 8 ? 45 : 0, autoSkip: false } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, font: { family: "'DM Mono', monospace" }, callback: v => "₹" + (v/1000).toFixed(0) + "k" } },
        },
      },
    });

    pieChart.current = new window.Chart(pieRef.current, {
      type: "doughnut",
      data: { labels: topCats.map(([k]) => k), datasets: [{ data: topCats.map(([,v]) => Math.round(v)), backgroundColor: CHART_COLORS, borderWidth: 0, hoverOffset: 6 }] },
      options: { responsive: true, maintainAspectRatio: false, cutout: "68%", plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => " " + fmt(ctx.parsed) } } } },
    });

    return () => { lineChart.current?.destroy(); pieChart.current?.destroy(); };
  }, [state.darkMode, state.transactions, fromKey, toKey]);

  const rangeText = `${slicedLabels[0]} → ${slicedLabels[slicedLabels.length - 1]}`;

  return (
    <div className="dashboard">
      <div className="section-header">
        <h2 className="section-title">Overview</h2>
        <button className="btn btn-ghost" onClick={() => exportReport({ slicedLabels, monthlyData, totalIncome, totalExpenses, balance, savingsRate, topCats, rangeText })}>
          ⤓ Export Report
        </button>
      </div>

      <MonthRangePicker fromKey={fromKey} toKey={toKey} activeQuick={activeQuick} onChange={setRange} />
      <div className="range-label-text" style={{ marginTop: 10 }}>
        Showing {slicedKeys.length} month{slicedKeys.length !== 1 ? "s" : ""}: {rangeText}
      </div>

      <div className="summary-grid" style={{ marginTop: 14 }}>
        <SummaryCard label="Total Balance"  value={fmt(balance)}       sub={balance >= 0 ? "▲ Positive" : "▼ Negative"} color={balance >= 0 ? "green" : "red"} />
        <SummaryCard label="Total Income"   value={fmt(totalIncome)}   sub={rangeText} color="blue" />
        <SummaryCard label="Total Expenses" value={fmt(totalExpenses)} sub={rangeText} color="red" />
        <SummaryCard label="Savings Rate"   value={savingsRate + "%"}  sub="Income saved" color="purple" />
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-header">
            <h3 className="chart-title">Income vs Expenses vs Savings</h3>
            <div className="chart-legend">
              <span className="legend-dot" style={{ background: "#4ade80" }}></span>Income
              <span className="legend-dot" style={{ background: "#f87171", marginLeft: 12 }}></span>Expenses
              <span className="legend-dot" style={{ background: "#a78bfa", marginLeft: 12 }}></span>Savings
            </div>
          </div>
          <div style={{ position: "relative", height: 240 }}><canvas ref={lineRef}></canvas></div>
        </div>

        <div className="chart-card">
          <div className="chart-header"><h3 className="chart-title">Spending Breakdown</h3></div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ position: "relative", height: 200, width: 200, flexShrink: 0 }}><canvas ref={pieRef}></canvas></div>
            <div className="pie-legend">
              {topCats.length === 0 && <p style={{ fontSize: 12, color: "var(--text3)" }}>No data</p>}
              {topCats.map(([cat, val], i) => (
                <div key={cat} className="pie-legend-item">
                  <span className="legend-dot" style={{ background: CHART_COLORS[i] }}></span>
                  <span className="pie-cat">{cat}</span>
                  <span className="pie-val">{fmt(val)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="chart-card" style={{ marginTop: 20 }}>
        <h3 className="chart-title" style={{ marginBottom: 16 }}>Monthly Balance</h3>
        <div className="monthly-bars">
          {monthlyData.map((m, i) => {
            const maxVal = Math.max(...monthlyData.map(x => Math.abs(x.balance)), 1);
            const pct    = Math.min(100, (Math.abs(m.balance) / maxVal) * 100);
            return (
              <div key={i} className="monthly-bar-group">
                <div className="monthly-bar-wrap">
                  <div className="monthly-bar" style={{ height: pct + "%", background: m.balance >= 0 ? "#4ade80" : "#f87171", minHeight: 4 }}></div>
                </div>
                <div className="monthly-bar-label">{slicedLabels[i]}</div>
                <div className="monthly-bar-val" style={{ color: m.balance >= 0 ? "#4ade80" : "#f87171" }}>
                  {m.balance >= 0 ? "+" : "-"}₹{Math.abs(Math.round(m.balance/100)*100).toLocaleString("en-IN")}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
