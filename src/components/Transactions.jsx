import React, { useState, useMemo } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/transactions";
import MonthRangePicker, { sliceRange, filterByRange } from "./MonthRangePicker";
import TransactionModal from "./TransactionModal";

function fmt(n) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const CAT_COLORS = {
  "Food & Dining": "#fbbf24", "Transport": "#60a5fa", "Shopping": "#a78bfa",
  "Entertainment": "#f472b6", "Health": "#4ade80",   "Utilities": "#22d3ee",
  "Salary": "#4ade80", "Freelance": "#34d399", "Investment": "#60a5fa", "Other": "#9aa3b0",
};

const STATUS_COLORS = {
  "Completed": { bg: "rgba(74,222,128,0.12)",  color: "#4ade80" },
  "Pending":   { bg: "rgba(251,191,36,0.12)",   color: "#fbbf24" },
  "Failed":    { bg: "rgba(248,113,113,0.12)",  color: "#f87171" },
};

const PAGE_SIZE = 30;

function ExpandedRow({ t, colSpan }) {
  const sc = STATUS_COLORS[t.status] || STATUS_COLORS["Completed"];
  return (
    <tr className="tx-expanded-row">
      <td colSpan={colSpan}>
        <div className="tx-details">
          <div className="tx-details-grid">
            <div className="tx-detail-item"><span className="tx-detail-label">Transaction ID</span><span className="tx-detail-value tx-detail-mono">{t.txnId}</span></div>
            <div className="tx-detail-item"><span className="tx-detail-label">Reference No.</span><span className="tx-detail-value tx-detail-mono">{t.refNumber}</span></div>
            <div className="tx-detail-item"><span className="tx-detail-label">{t.type === "income" ? "Credited From" : "Debited From"}</span><span className="tx-detail-value">{t.from}</span></div>
            <div className="tx-detail-item"><span className="tx-detail-label">{t.type === "income" ? "Credited To" : "Paid To"}</span><span className="tx-detail-value">{t.to}</span></div>
            <div className="tx-detail-item"><span className="tx-detail-label">Bank</span><span className="tx-detail-value">{t.bank}</span></div>
            <div className="tx-detail-item"><span className="tx-detail-label">Payment Mode</span><span className="tx-detail-value">{t.paymentMode}</span></div>
            <div className="tx-detail-item"><span className="tx-detail-label">Amount</span><span className="tx-detail-value" style={{ color: t.type === "income" ? "#4ade80" : "#f87171", fontWeight: 700 }}>{t.type === "income" ? "+" : "-"}{fmt(t.amount)}</span></div>
            <div className="tx-detail-item"><span className="tx-detail-label">Status</span><span className="tx-detail-value"><span className="cat-badge" style={{ background: sc.bg, color: sc.color }}>{t.status === "Completed" ? "✓" : t.status === "Pending" ? "⏳" : "✕"} {t.status}</span></span></div>
            <div className="tx-detail-item"><span className="tx-detail-label">Date</span><span className="tx-detail-value tx-detail-mono">{t.date}</span></div>
            <div className="tx-detail-item"><span className="tx-detail-label">Category</span><span className="tx-detail-value">{t.category}</span></div>
          </div>
        </div>
      </td>
    </tr>
  );
}

export default function Transactions() {
  const { state, dispatch, filteredTransactions, removeTransaction } = useApp();
  const [modal, setModal]           = useState(null);
  const [deleting, setDeleting]     = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const isAdmin = state.role === "admin";

  const { fromKey, toKey, activeQuick } = state.txRange;
  const page = state.txPage;
  const setRange = (r) => dispatch({ type: "SET_TX_RANGE", payload: r });
  const setPage  = (v) => dispatch({ type: "SET_TX_PAGE", payload: typeof v === "function" ? v(page) : v });
  const handleFilter = (payload) => { dispatch({ type: "SET_FILTER", payload }); dispatch({ type: "SET_TX_PAGE", payload: 1 }); };

  const { labels: slicedLabels } = useMemo(() => sliceRange(fromKey, toKey), [fromKey, toKey]);

  const timeFiltered = useMemo(() =>
    filterByRange(filteredTransactions, fromKey, toKey),
    [filteredTransactions, fromKey, toKey]
  );

  const totalPages = Math.max(1, Math.ceil(timeFiltered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = timeFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const totalIncome   = timeFiltered.filter(t => t.type === "income").reduce((s,t)  => s + t.amount, 0);
  const totalExpenses = timeFiltered.filter(t => t.type === "expense").reduce((s,t) => s + t.amount, 0);
  const net           = totalIncome - totalExpenses;

  const exportCSV = () => {
    const rows = [["Date","Description","Category","Type","Amount","TxnID","From","To","Bank","Mode","Status"]];
    timeFiltered.forEach(t => rows.push([t.date, t.description, t.category, t.type, t.amount, t.txnId, t.from, t.to, t.bank, t.paymentMode, t.status]));
    const csv = rows.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    a.download = "transactions.csv";
    a.click();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this transaction?")) return;
    setDeleting(id);
    await removeTransaction(id);
    setDeleting(null);
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const colSpan = isAdmin ? 6 : 5;

  return (
    <div className="transactions-page">
      {modal && <TransactionModal transaction={modal === "new" ? null : modal} onClose={() => setModal(null)} />}

      <div className="section-header">
        <h2 className="section-title">Transactions</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost" onClick={exportCSV}>⤓ Export</button>
          {isAdmin && <button className="btn btn-primary" onClick={() => setModal("new")}>+ Add</button>}
        </div>
      </div>

      {!isAdmin && <div className="role-banner">👁 Viewer mode — switch to Admin to add or edit transactions</div>}

      <MonthRangePicker fromKey={fromKey} toKey={toKey} activeQuick={activeQuick} onChange={setRange} />

      <div className="range-label-text" style={{ marginTop: 10 }}>
        {slicedLabels[0]} → {slicedLabels[slicedLabels.length - 1]}
      </div>

      <div className="tx-period-summary" style={{ marginTop: 10 }}>
        <div className="tx-period-stat"><span className="tx-period-label">Income</span><span className="tx-period-val tx-period-val--income">+{fmt(totalIncome)}</span></div>
        <div className="tx-period-divider"></div>
        <div className="tx-period-stat"><span className="tx-period-label">Expenses</span><span className="tx-period-val tx-period-val--expense">-{fmt(totalExpenses)}</span></div>
        <div className="tx-period-divider"></div>
        <div className="tx-period-stat"><span className="tx-period-label">Net</span><span className="tx-period-val" style={{ color: net >= 0 ? "#4ade80" : "#f87171" }}>{net >= 0 ? "+" : ""}{fmt(net)}</span></div>
      </div>

      <div className="filter-bar">
        <input className="form-input search-input" placeholder="Search transactions..." value={state.filters.search} onChange={e => handleFilter({ search: e.target.value })} />
        <select className="form-input" value={state.filters.type} onChange={e => handleFilter({ type: e.target.value })}>
          <option value="all">All Types</option><option value="income">Income</option><option value="expense">Expense</option>
        </select>
        <select className="form-input" value={state.filters.category} onChange={e => handleFilter({ category: e.target.value })}>
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="form-input" value={state.filters.sortBy} onChange={e => handleFilter({ sortBy: e.target.value })}>
          <option value="date-desc">Newest First</option><option value="date-asc">Oldest First</option>
          <option value="amount-desc">Highest Amount</option><option value="amount-asc">Lowest Amount</option>
        </select>
      </div>

      {timeFiltered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">◈</div>
          <p>No transactions found</p>
          <span>Try a different date range or adjust your filters</span>
        </div>
      ) : (
        <>
          <p className="tx-expand-hint">Click any row to view full transaction details</p>
          <div className="tx-table-wrap">
            <table className="tx-table">
              <thead>
                <tr>
                  <th>Date</th><th>Description</th><th>Category</th><th>Type</th><th>Amount</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {paginated.map(t => (
                  <React.Fragment key={t.id}>
                    <tr className={`tx-row ${deleting === t.id ? "tx-row--deleting" : ""} ${expandedId === t.id ? "tx-row--expanded" : ""}`} onClick={() => toggleExpand(t.id)} style={{ cursor: "pointer" }}>
                      <td className="tx-date">{t.date}</td>
                      <td className="tx-desc"><span>{t.description}</span><span className="tx-expand-chevron">{expandedId === t.id ? "▲" : "▼"}</span></td>
                      <td><span className="cat-badge" style={{ background: (CAT_COLORS[t.category] || "#9aa3b0") + "22", color: CAT_COLORS[t.category] || "#9aa3b0" }}>{t.category}</span></td>
                      <td><span className={`type-badge type-badge--${t.type}`}>{t.type === "income" ? "▲ Income" : "▼ Expense"}</span></td>
                      <td className={`tx-amount tx-amount--${t.type}`}>{t.type === "income" ? "+" : "-"}{fmt(t.amount)}</td>
                      {isAdmin && (
                        <td className="tx-actions" onClick={e => e.stopPropagation()}>
                          <button className="action-btn" onClick={() => setModal(t)} title="Edit">✎</button>
                          <button className="action-btn action-btn--del" onClick={() => handleDelete(t.id)} disabled={deleting === t.id} title="Delete">{deleting === t.id ? "…" : "✕"}</button>
                        </td>
                      )}
                    </tr>
                    {expandedId === t.id && <ExpandedRow t={t} colSpan={colSpan} />}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <span className="tx-count">{(safePage-1)*PAGE_SIZE+1}–{Math.min(safePage*PAGE_SIZE, timeFiltered.length)} of {timeFiltered.length} transactions</span>
            <div className="page-btns">
              <button className="page-btn" onClick={() => setPage(p => p-1)} disabled={safePage === 1}>← Prev</button>
              {pageNumbers.map((p, i) => p === "..." ? <span key={i} className="page-ellipsis">…</span> :
                <button key={p} className={`page-btn ${safePage === p ? "active" : ""}`} onClick={() => setPage(p)}>{p}</button>
              )}
              <button className="page-btn" onClick={() => setPage(p => p+1)} disabled={safePage === totalPages}>Next →</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
