import React, { createContext, useContext, useReducer, useEffect } from "react";
import { fetchTransactions, createTransaction, updateTransaction, deleteTransaction } from "../data/api";
import { quickRangeKeys } from "../components/MonthRangePicker";

const AppContext = createContext();

function ls(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch { return fallback; }
}

const defaultRange = quickRangeKeys(6);

const initialState = {
  transactions: [],
  loading:  true,
  apiError: null,

  role:     ls("role",     "viewer"),
  darkMode: ls("darkMode", true),
  activeTab: ls("activeTab", "dashboard"),

  // shared search/type/category/sort filters (transactions table)
  filters: ls("filters", { type: "all", category: "all", search: "", sortBy: "date-desc" }),

  // per-page range state
  dashboardRange: ls("dashboardRange", { fromKey: defaultRange.fromKey, toKey: defaultRange.toKey, activeQuick: 6 }),
  insightsRange:  ls("insightsRange",  { fromKey: defaultRange.fromKey, toKey: defaultRange.toKey, activeQuick: 6 }),
  txRange:        ls("txRange",        { fromKey: defaultRange.fromKey, toKey: defaultRange.toKey, activeQuick: 6 }),

  // transactions pagination
  txPage: ls("txPage", 1),
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_TRANSACTIONS": return { ...state, transactions: action.payload, loading: false, apiError: null };
    case "SET_LOADING":      return { ...state, loading: action.payload };
    case "SET_ERROR":        return { ...state, apiError: action.payload, loading: false };
    case "SET_ROLE":         return { ...state, role: action.payload };
    case "TOGGLE_DARK":      return { ...state, darkMode: !state.darkMode };
    case "SET_TAB":          return { ...state, activeTab: action.payload };
    case "SET_FILTER":       return { ...state, filters: { ...state.filters, ...action.payload } };
    case "SET_DASHBOARD_RANGE": return { ...state, dashboardRange: action.payload };
    case "SET_INSIGHTS_RANGE":  return { ...state, insightsRange:  action.payload };
    case "SET_TX_RANGE":        return { ...state, txRange: action.payload, txPage: 1 };
    case "SET_TX_PAGE":         return { ...state, txPage: action.payload };
    case "ADD_TRANSACTION":    return { ...state, transactions: [action.payload, ...state.transactions] };
    case "EDIT_TRANSACTION":   return { ...state, transactions: state.transactions.map(t => t.id === action.payload.id ? action.payload : t) };
    case "DELETE_TRANSACTION": return { ...state, transactions: state.transactions.filter(t => t.id !== action.payload) };
    default: return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: "SET_LOADING", payload: true });
    fetchTransactions()
      .then(data => dispatch({ type: "SET_TRANSACTIONS", payload: data }))
      .catch(() => dispatch({ type: "SET_ERROR", payload: "Failed to load transactions." }));
  }, []);

  useEffect(() => { if (!state.loading && state.transactions.length > 0) localStorage.setItem("transactions", JSON.stringify(state.transactions)); }, [state.transactions, state.loading]);
  useEffect(() => { localStorage.setItem("role",           JSON.stringify(state.role));           }, [state.role]);
  useEffect(() => { localStorage.setItem("darkMode",       JSON.stringify(state.darkMode));       }, [state.darkMode]);
  useEffect(() => { localStorage.setItem("activeTab",      JSON.stringify(state.activeTab));      }, [state.activeTab]);
  useEffect(() => { localStorage.setItem("filters",        JSON.stringify(state.filters));        }, [state.filters]);
  useEffect(() => { localStorage.setItem("dashboardRange", JSON.stringify(state.dashboardRange)); }, [state.dashboardRange]);
  useEffect(() => { localStorage.setItem("insightsRange",  JSON.stringify(state.insightsRange));  }, [state.insightsRange]);
  useEffect(() => { localStorage.setItem("txRange",        JSON.stringify(state.txRange));        }, [state.txRange]);
  useEffect(() => { localStorage.setItem("txPage",         JSON.stringify(state.txPage));         }, [state.txPage]);
  useEffect(() => { document.documentElement.classList.toggle("dark", state.darkMode); }, [state.darkMode]);

  const addTransaction    = async (t) => { const c = await createTransaction(t); dispatch({ type: "ADD_TRANSACTION", payload: c }); };
  const editTransaction   = async (t) => { const u = await updateTransaction(t); dispatch({ type: "EDIT_TRANSACTION", payload: u }); };
  const removeTransaction = async (id) => { await deleteTransaction(id); dispatch({ type: "DELETE_TRANSACTION", payload: id }); };

  const filteredTransactions = state.transactions.filter(t => {
    const { type, category, search } = state.filters;
    if (type !== "all" && t.type !== type) return false;
    if (category !== "all" && t.category !== category) return false;
    if (search && !t.description.toLowerCase().includes(search.toLowerCase()) && !t.category.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    switch (state.filters.sortBy) {
      case "date-asc":    return new Date(a.date) - new Date(b.date);
      case "amount-desc": return b.amount - a.amount;
      case "amount-asc":  return a.amount - b.amount;
      default:            return new Date(b.date) - new Date(a.date);
    }
  });

  return (
    <AppContext.Provider value={{ state, dispatch, filteredTransactions, addTransaction, editTransaction, removeTransaction }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
