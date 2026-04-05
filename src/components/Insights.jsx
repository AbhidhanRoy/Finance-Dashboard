import React, { useEffect, useRef, useMemo } from "react";
import { useApp } from "../context/AppContext";
import MonthRangePicker, { sliceRange, filterByRange } from "./MonthRangePicker";

function fmt(n) {
  return "₹" + Math.abs(n).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}


function exportReport({ slicedLabels, monthly, sortedCats, totalIncome, totalExpenses, savingsRate, bestMonth, rangeText }) {
  const monthRows = monthly.map((m, i) => `
    <tr>
      <td>${slicedLabels[i]}</td>
      <td style="color:#16a34a">₹${m.income.toLocaleString("en-IN")}</td>
      <td style="color:#dc2626">₹${m.expenses.toLocaleString("en-IN")}</td>
      <td style="color:${m.income - m.expenses >= 0 ? "#16a34a" : "#dc2626"}">${m.income - m.expenses >= 0 ? "+" : "-"}₹${Math.abs(m.income - m.expenses).toLocaleString("en-IN")}</td>
    </tr>`).join("");

  const catRows = sortedCats.map(([cat, val]) =>
    `<tr><td>${cat}</td><td style="color:#dc2626">₹${val.toLocaleString("en-IN")}</td><td>${totalExpenses > 0 ? (val/totalExpenses*100).toFixed(1) : 0}%</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html><head><title>Insights Report</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #111; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #666; font-size: 13px; margin-bottom: 24px; }
    .kpis { display: flex; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
    .kpi { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 18px; }
    .kpi-label { font-size: 11px; text-transform: uppercase; color: #888; margin-bottom: 4px; }
    .kpi-value { font-size: 18px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th { background: #f9fafb; padding: 10px 12px; text-align: left; font-size: 12px; color: #666; border-bottom: 1px solid #e5e7eb; }
    td { padding: 9px 12px; border-bottom: 1px solid #f3f4f6; font-size: 13px; }
    h2 { font-size: 15px; margin-bottom: 10px; }
    @media print { body { padding: 16px; } }
  </style></head><body>
  <h1>Financial Insights Report</h1>
  <div class="sub">Period: ${rangeText} &nbsp;·&nbsp; Generated: ${new Date().toLocaleDateString("en-IN")}</div>
  <div class="kpis">
    <div class="kpi"><div class="kpi-label">Total Income</div><div class="kpi-value" style="color:#16a34a">₹${totalIncome.toLocaleString("en-IN")}</div></div>
    <div class="kpi"><div class="kpi-label">Total Expenses</div><div class="kpi-value" style="color:#dc2626">₹${totalExpenses.toLocaleString("en-IN")}</div></div>
    <div class="kpi"><div class="kpi-label">Savings Rate</div><div class="kpi-value">${savingsRate}%</div></div>
    <div class="kpi"><div class="kpi-label">Best Month</div><div class="kpi-value">${bestMonth.label}</div></div>
  </div>
  <h2>Monthly Comparison</h2>
  <table><thead><tr><th>Month</th><th>Income</th><th>Expenses</th><th>Net Savings</th></tr></thead><tbody>${monthRows}</tbody></table>
  <h2>Category Breakdown</h2>
  <table><thead><tr><th>Category</th><th>Total Spent</th><th>% of Expenses</th></tr></thead><tbody>${catRows}</tbody></table>
  <script>window.onload = () => window.print();</script>
  </body></html>`;
  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
}

export default function Insights() {

  const { state, dispatch } = useApp();
  const barRef   = useRef(null);
  const barChart = useRef(null);

  const { fromKey, toKey, activeQuick } = state.insightsRange;
  const setRange = (r) => dispatch({ type: "SET_INSIGHTS_RANGE", payload: r });

  const { keys: slicedKeys, labels: slicedLabels } = useMemo(() => sliceRange(fromKey, toKey), [fromKey, toKey]);
  const filteredTx = useMemo(() => filterByRange(state.transactions, fromKey, toKey), [state.transactions, fromKey, toKey]);

  const expenses = filteredTx.filter(t => t.type === "expense");
  const income   = filteredTx.filter(t => t.type === "income");

  const catTotals = {};
  expenses.forEach(t => { catTotals[t.category] = (catTotals[t.category] || 0) + t.amount; });
  const sortedCats = Object.entries(catTotals).sort((a,b) => b[1]-a[1]);
  const topCat = sortedCats[0];
  const lowCat = sortedCats[sortedCats.length - 1];

  const monthly = useMemo(() => slicedKeys.map((mk, i) => ({
    label:    slicedLabels[i],
    income:   income.filter(t   => t.date.startsWith(mk)).reduce((s,t) => s + t.amount, 0),
    expenses: expenses.filter(t => t.date.startsWith(mk)).reduce((s,t) => s + t.amount, 0),
  })), [slicedKeys, slicedLabels, income, expenses]);

  const bestMonth   = monthly.reduce((best, m) => (m.income - m.expenses) > best.net ? { net: m.income - m.expenses, label: m.label } : best, { net: -Infinity, label: "" });
  const avgIncome   = monthly.length ? monthly.reduce((s,m) => s + m.income,   0) / monthly.length : 0;
  const avgExpenses = monthly.length ? monthly.reduce((s,m) => s + m.expenses, 0) / monthly.length : 0;
  const totalIncome   = income.reduce((s,t) => s + t.amount, 0);
  const totalExpenses = expenses.reduce((s,t) => s + t.amount, 0);
  const savingsRate   = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome * 100).toFixed(1) : 0;

  const isDark    = state.darkMode;
  const gridColor = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const textColor = isDark ? "#9aa3b0" : "#6b7a8d";

  useEffect(() => {
    if (!window.Chart) return;
    if (barChart.current) barChart.current.destroy();
    barChart.current = new window.Chart(barRef.current, {
      type: "bar",
      data: {
        labels: slicedLabels,
        datasets: [
          { label: "Income",   data: monthly.map(m => Math.round(m.income)),   backgroundColor: "rgba(74,222,128,0.7)",  borderRadius: 4 },
          { label: "Expenses", data: monthly.map(m => Math.round(m.expenses)), backgroundColor: "rgba(248,113,113,0.7)", borderRadius: 4 },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => " " + fmt(ctx.parsed.y) } } },
        scales: {
          x: { grid: { color: gridColor }, ticks: { color: textColor, maxRotation: slicedKeys.length > 8 ? 45 : 0, autoSkip: false } },
          y: { grid: { color: gridColor }, ticks: { color: textColor, callback: v => "₹" + (v/1000).toFixed(0) + "k" } },
        },
      },
    });
    return () => barChart.current?.destroy();
  }, [state.darkMode, state.transactions, fromKey, toKey]);

  const rangeLabel = `${slicedLabels[0] || ""} → ${slicedLabels[slicedLabels.length - 1] || ""}`;

  const insights = [
    { icon: "◈", color: "#f87171", title: "Highest spending category", value: topCat ? topCat[0] : "—",       detail: topCat ? `Total: ${fmt(topCat[1])}` : "No data" },
    { icon: "◆", color: "#4ade80", title: "Best month (net savings)",  value: bestMonth.label || "—",         detail: bestMonth.net > -Infinity ? `Net: ${fmt(bestMonth.net)}` : "" },
    { icon: "⊕", color: "#60a5fa", title: "Avg monthly income",        value: fmt(avgIncome),                 detail: rangeLabel },
    { icon: "⊖", color: "#fbbf24", title: "Avg monthly expenses",      value: fmt(avgExpenses),               detail: rangeLabel },
    { icon: "◉", color: "#a78bfa", title: "Overall savings rate",      value: savingsRate + "%",              detail: Number(savingsRate) > 20 ? "Great discipline!" : "Room to improve" },
    { icon: "▲", color: "#22d3ee", title: "Lowest spending category",  value: lowCat ? lowCat[0] : "—",       detail: lowCat ? fmt(lowCat[1]) : "No data" },
  ];

  return (
    <div className="insights-page">
      <div className="section-header">
        <h2 className="section-title">Insights</h2>
        <button className="btn btn-ghost" onClick={() => exportReport({ slicedLabels, monthly, sortedCats, totalIncome, totalExpenses, savingsRate, bestMonth, rangeText: `${slicedLabels[0]} → ${slicedLabels[slicedLabels.length-1]}` })}>⤓ Export Report</button>
      </div>

      <MonthRangePicker fromKey={fromKey} toKey={toKey} activeQuick={activeQuick} onChange={setRange} />

      <div className="range-label-text" style={{ marginTop: 10 }}>
        Showing {slicedKeys.length} month{slicedKeys.length !== 1 ? "s" : ""}: {rangeLabel}
      </div>

      <div className="insights-grid" style={{ marginTop: 14 }}>
        {insights.map((ins, i) => (
          <div key={i} className="insight-card">
            <div className="insight-icon" style={{ color: ins.color, background: ins.color + "1a" }}>{ins.icon}</div>
            <div className="insight-content">
              <div className="insight-title">{ins.title}</div>
              <div className="insight-value" style={{ color: ins.color }}>{ins.value}</div>
              <div className="insight-detail">{ins.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-card" style={{ marginTop: 24 }}>
        <div className="chart-header">
          <h3 className="chart-title">Monthly Comparison</h3>
          <div className="chart-legend">
            <span className="legend-dot" style={{ background: "#4ade80" }}></span>Income
            <span className="legend-dot" style={{ background: "#f87171", marginLeft: 12 }}></span>Expenses
          </div>
        </div>
        <div style={{ position: "relative", height: 260 }}><canvas ref={barRef}></canvas></div>
      </div>

      <div className="cat-breakdown">
        <h3 className="chart-title" style={{ marginBottom: 16 }}>Category Breakdown</h3>
        {sortedCats.length === 0 ? (
          <p style={{ color: "var(--text3)", fontSize: 13 }}>No expense data for this period.</p>
        ) : sortedCats.map(([cat, val]) => {
          const pct = totalExpenses > 0 ? (val / totalExpenses * 100).toFixed(1) : 0;
          return (
            <div key={cat} className="cat-row">
              <div className="cat-row-label"><span>{cat}</span><span className="cat-row-pct">{pct}%</span></div>
              <div className="cat-bar-bg"><div className="cat-bar-fill" style={{ width: pct + "%" }}></div></div>
              <span className="cat-row-val">{fmt(val)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
