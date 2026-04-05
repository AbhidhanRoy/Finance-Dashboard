import React from "react";
import { ALL_MONTH_KEYS } from "../data/transactions";

const QUICK_RANGES = [
  { label: "1M",  months: 1   },
  { label: "3M",  months: 3   },
  { label: "6M",  months: 6   },
  { label: "12M", months: 12  },
  { label: "All", months: 999 },
];

function monthLabel(mk) {
  return new Date(mk + "-01").toLocaleString("en-IN", { month: "short", year: "numeric" });
}

// Returns { fromKey, toKey } for a quick range
export function quickRangeKeys(months) {
  if (months === 999) return { fromKey: ALL_MONTH_KEYS[0], toKey: ALL_MONTH_KEYS[ALL_MONTH_KEYS.length - 1] };
  const to   = ALL_MONTH_KEYS[ALL_MONTH_KEYS.length - 1];
  const from = ALL_MONTH_KEYS[Math.max(0, ALL_MONTH_KEYS.length - months)];
  return { fromKey: from, toKey: to };
}

// Filter transactions by fromKey → toKey (inclusive)
export function filterByRange(transactions, fromKey, toKey) {
  return transactions.filter(t => t.date >= fromKey && t.date.slice(0, 7) <= toKey);
}

// Get sliced keys and labels between from and to
export function sliceRange(fromKey, toKey) {
  const start = ALL_MONTH_KEYS.indexOf(fromKey);
  const end   = ALL_MONTH_KEYS.indexOf(toKey);
  if (start === -1 || end === -1 || start > end) return { keys: [], labels: [] };
  const keys   = ALL_MONTH_KEYS.slice(start, end + 1);
  const labels = keys.map(mk => monthLabel(mk));
  return { keys, labels };
}

export default function MonthRangePicker({ fromKey, toKey, activeQuick, onChange }) {
  // onChange({ fromKey, toKey, activeQuick })

  const handleQuick = (months) => {
    const { fromKey: f, toKey: t } = quickRangeKeys(months);
    onChange({ fromKey: f, toKey: t, activeQuick: months });
  };

  const handleFrom = (e) => {
    const f = e.target.value;
    // ensure from <= to
    const t = f > toKey ? f : toKey;
    onChange({ fromKey: f, toKey: t, activeQuick: null });
  };

  const handleTo = (e) => {
    const t = e.target.value;
    const f = t < fromKey ? t : fromKey;
    onChange({ fromKey: f, toKey: t, activeQuick: null });
  };

  return (
    <div className="mrp-wrap">
      {/* Quick range buttons */}
      <div className="range-toggle">
        {QUICK_RANGES.map(r => (
          <button
            key={r.months}
            className={`range-btn ${activeQuick === r.months ? "active" : ""}`}
            onClick={() => handleQuick(r.months)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* From → To month selects */}
      <div className="mrp-selects">
        <div className="mrp-field">
          <span className="mrp-label">From</span>
          <select className="form-input mrp-select" value={fromKey} onChange={handleFrom}>
            {ALL_MONTH_KEYS.map(mk => (
              <option key={mk} value={mk}>{monthLabel(mk)}</option>
            ))}
          </select>
        </div>
        <span className="mrp-arrow">→</span>
        <div className="mrp-field">
          <span className="mrp-label">To</span>
          <select className="form-input mrp-select" value={toKey} onChange={handleTo}>
            {ALL_MONTH_KEYS.filter(mk => mk >= fromKey).map(mk => (
              <option key={mk} value={mk}>{monthLabel(mk)}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
