import { TRANSACTIONS } from "../data/transactions";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Simulates GET /api/transactions
export async function fetchTransactions() {
  await delay(1200);
  const cached = localStorage.getItem("transactions");
  if (cached) return JSON.parse(cached);
  return TRANSACTIONS;
}

// Simulates POST /api/transactions
export async function createTransaction(transaction) {
  await delay(400);
  return { ...transaction, id: Date.now() };
}

// Simulates PUT /api/transactions/:id
export async function updateTransaction(transaction) {
  await delay(400);
  return transaction;
}

// Simulates DELETE /api/transactions/:id
export async function deleteTransaction(id) {
  await delay(300);
  return { success: true, id };
}
