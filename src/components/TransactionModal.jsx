import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { CATEGORIES } from "../data/transactions";

const BANKS = ["HDFC Bank","ICICI Bank","SBI","Axis Bank","Kotak Bank","Yes Bank"];
const PAYMENT_MODES = ["UPI","NEFT","IMPS","RTGS","Debit Card","Credit Card","Net Banking"];
const STATUSES = ["Completed","Pending","Failed"];

function randomTxnId() {
  return "TXN" + Math.random().toString(36).substring(2,10).toUpperCase();
}
function randomRef() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

export default function TransactionModal({ transaction, onClose }) {
  const { addTransaction, editTransaction } = useApp();
  const isEdit = !!transaction;

  const [form, setForm] = useState({
    description:  transaction?.description  || "",
    amount:       transaction?.amount       || "",
    category:     transaction?.category     || CATEGORIES[0],
    type:         transaction?.type         || "expense",
    date:         transaction?.date         || new Date().toISOString().split("T")[0],
    from:         transaction?.from         || "My Savings A/C",
    to:           transaction?.to           || "",
    bank:         transaction?.bank         || BANKS[0],
    paymentMode:  transaction?.paymentMode  || "UPI",
    status:       transaction?.status       || "Completed",
    txnId:        transaction?.txnId        || randomTxnId(),
    refNumber:    transaction?.refNumber    || randomRef(),
  });

  const [error, setError]   = useState("");
  const [saving, setSaving] = useState(false);
  const handle = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const submit = async () => {
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) return setError("Enter a valid amount.");
    setError("");
    setSaving(true);
    const payload = { id: transaction?.id || Date.now(), ...form, amount: parseFloat(form.amount) };
    try {
      if (isEdit) { await editTransaction(payload); } else { await addTransaction(payload); }
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal--wide">
        <div className="modal-header">
          <h3>{isEdit ? "Edit Transaction" : "Add Transaction"}</h3>
          <button className="icon-btn" onClick={onClose} disabled={saving}>✕</button>
        </div>

        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}

          {/* Row 1 — Description */}
          <div className="form-group">
            <label>Description</label>
            <input className="form-input" value={form.description}
              onChange={e => handle("description", e.target.value)}
              placeholder="e.g. Swiggy order" disabled={saving} />
          </div>

          {/* Row 2 — Amount, Date, Type */}
          <div className="form-row">
            <div className="form-group">
              <label>Amount (₹)</label>
              <input className="form-input" type="number" min="0" step="0.01"
                value={form.amount} onChange={e => handle("amount", e.target.value)}
                placeholder="0.00" disabled={saving} />
            </div>
            <div className="form-group">
              <label>Date</label>
              <input className="form-input" type="date" value={form.date}
                onChange={e => handle("date", e.target.value)} disabled={saving} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select className="form-input" value={form.type}
                onChange={e => handle("type", e.target.value)} disabled={saving}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>

          {/* Row 3 — Category, Status */}
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select className="form-input" value={form.category}
                onChange={e => handle("category", e.target.value)} disabled={saving}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select className="form-input" value={form.status}
                onChange={e => handle("status", e.target.value)} disabled={saving}>
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Row 4 — From, To */}
          <div className="form-row">
            <div className="form-group">
              <label>{form.type === "income" ? "Credited From" : "Debited From"}</label>
              <input className="form-input" value={form.from}
                onChange={e => handle("from", e.target.value)}
                placeholder="e.g. My Savings A/C" disabled={saving} />
            </div>
            <div className="form-group">
              <label>{form.type === "income" ? "Credited To" : "Paid To"}</label>
              <input className="form-input" value={form.to}
                onChange={e => handle("to", e.target.value)}
                placeholder="e.g. Swiggy" disabled={saving} />
            </div>
          </div>

          {/* Row 5 — Bank, Payment Mode */}
          <div className="form-row">
            <div className="form-group">
              <label>Bank</label>
              <select className="form-input" value={form.bank}
                onChange={e => handle("bank", e.target.value)} disabled={saving}>
                {BANKS.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select className="form-input" value={form.paymentMode}
                onChange={e => handle("paymentMode", e.target.value)} disabled={saving}>
                {PAYMENT_MODES.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>
          </div>

          {/* Row 6 — Transaction ID, Reference No (read-only on edit, auto on add) */}
          <div className="form-row">
            <div className="form-group">
              <label>Transaction ID</label>
              <input className="form-input tx-detail-mono" value={form.txnId}
                onChange={e => handle("txnId", e.target.value)}
                placeholder="Auto-generated" disabled={saving} />
            </div>
            <div className="form-group">
              <label>Reference No.</label>
              <input className="form-input tx-detail-mono" value={form.refNumber}
                onChange={e => handle("refNumber", e.target.value)}
                placeholder="Auto-generated" disabled={saving} />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button className="btn btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Transaction"}
          </button>
        </div>
      </div>
    </div>
  );
}
