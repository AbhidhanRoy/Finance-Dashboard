export const CATEGORIES = [
  "Food & Dining", "Transport", "Shopping", "Entertainment",
  "Health", "Utilities", "Salary", "Freelance", "Investment", "Other"
];

export const ALL_MONTH_KEYS = [
  "2024-12",
  "2025-01","2025-02","2025-03","2025-04","2025-05","2025-06",
  "2025-07","2025-08","2025-09","2025-10","2025-11","2025-12",
  "2026-01","2026-02","2026-03",
];

export const ALL_MONTH_LABELS = [
  "Dec'24",
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec'25",
  "Jan'26","Feb'26","Mar'26",
];

const BANKS = ["HDFC Bank","ICICI Bank","SBI","Axis Bank","Kotak Bank","Yes Bank"];
const PAYMENT_MODES = ["UPI","NEFT","IMPS","RTGS","Debit Card","Credit Card","Net Banking"];
const STATUSES = ["Completed","Completed","Completed","Completed","Pending","Failed"];

const incomeItems = [
  { desc: "Monthly Salary",    cat: "Salary",     amt: 5800, from: "Employer Pvt Ltd",      to: "My Savings A/C" },
  { desc: "Freelance Project", cat: "Freelance",  amt: 1200, from: "Client Corp",            to: "My Current A/C" },
  { desc: "Dividend Payout",   cat: "Investment", amt: 340,  from: "Zerodha Broking",        to: "My Savings A/C" },
  { desc: "Bonus",             cat: "Salary",     amt: 800,  from: "Employer Pvt Ltd",      to: "My Savings A/C" },
  { desc: "Consulting Fee",    cat: "Freelance",  amt: 950,  from: "Startup XYZ",            to: "My Current A/C" },
  { desc: "Stock Returns",     cat: "Investment", amt: 620,  from: "Groww Investments",      to: "My Savings A/C" },
  { desc: "Side Project",      cat: "Freelance",  amt: 430,  from: "Fiverr Client",          to: "My Current A/C" },
];

const expenseItems = [
  { desc: "Grocery Store",       cat: "Food & Dining",  amt: 120, to: "Big Basket",           from: "My Savings A/C" },
  { desc: "Netflix",             cat: "Entertainment",  amt: 15,  to: "Netflix India",         from: "My Credit Card" },
  { desc: "Spotify",             cat: "Entertainment",  amt: 10,  to: "Spotify AB",            from: "My Credit Card" },
  { desc: "Uber Ride",           cat: "Transport",      amt: 22,  to: "Uber India",            from: "My Savings A/C" },
  { desc: "Electricity Bill",    cat: "Utilities",      amt: 85,  to: "BESCOM",                from: "My Savings A/C" },
  { desc: "Restaurant Dinner",   cat: "Food & Dining",  amt: 67,  to: "Zomato",               from: "My Savings A/C" },
  { desc: "Online Shopping",     cat: "Shopping",       amt: 145, to: "Flipkart",              from: "My Credit Card" },
  { desc: "Gym Membership",      cat: "Health",         amt: 40,  to: "Cult.fit",              from: "My Savings A/C" },
  { desc: "Internet Bill",       cat: "Utilities",      amt: 60,  to: "Jio Fiber",             from: "My Savings A/C" },
  { desc: "Coffee Shop",         cat: "Food & Dining",  amt: 18,  to: "Starbucks",             from: "My Savings A/C" },
  { desc: "Pharmacy",            cat: "Health",         amt: 35,  to: "Apollo Pharmacy",       from: "My Savings A/C" },
  { desc: "Fuel",                cat: "Transport",      amt: 55,  to: "HP Petrol Pump",        from: "My Savings A/C" },
  { desc: "Amazon Purchase",     cat: "Shopping",       amt: 89,  to: "Amazon India",          from: "My Credit Card" },
  { desc: "Movie Tickets",       cat: "Entertainment",  amt: 28,  to: "BookMyShow",            from: "My Savings A/C" },
  { desc: "Doctor Visit",        cat: "Health",         amt: 90,  to: "Fortis Hospital",       from: "My Savings A/C" },
  { desc: "Bus Pass",            cat: "Transport",      amt: 30,  to: "BMTC",                  from: "My Savings A/C" },
  { desc: "Clothing Store",      cat: "Shopping",       amt: 130, to: "Myntra",                from: "My Credit Card" },
  { desc: "Water Bill",          cat: "Utilities",      amt: 25,  to: "BWSSB",                 from: "My Savings A/C" },
  { desc: "Takeout Food",        cat: "Food & Dining",  amt: 44,  to: "Swiggy",               from: "My Savings A/C" },
  { desc: "Music Gear",          cat: "Shopping",       amt: 210, to: "Bajaao Music",          from: "My Credit Card" },
  { desc: "Insurance Premium",   cat: "Health",         amt: 180, to: "LIC India",             from: "My Savings A/C" },
  { desc: "Metro Card",          cat: "Transport",      amt: 45,  to: "Namma Metro",           from: "My Savings A/C" },
  { desc: "Books",               cat: "Shopping",       amt: 55,  to: "Amazon Books",          from: "My Credit Card" },
  { desc: "Gas Bill",            cat: "Utilities",      amt: 40,  to: "Indane Gas",            from: "My Savings A/C" },
  { desc: "Dentist",             cat: "Health",         amt: 110, to: "Smile Dental Clinic",   from: "My Savings A/C" },
  { desc: "Cab Fare",            cat: "Transport",      amt: 38,  to: "Ola Cabs",              from: "My Savings A/C" },
  { desc: "Dinner Out",          cat: "Food & Dining",  amt: 95,  to: "Barbeque Nation",       from: "My Savings A/C" },
  { desc: "Gaming Subscription", cat: "Entertainment",  amt: 20,  to: "Xbox Game Pass",        from: "My Credit Card" },
  { desc: "Home Supplies",       cat: "Other",          amt: 75,  to: "DMart",                 from: "My Savings A/C" },
  { desc: "Charity Donation",    cat: "Other",          amt: 50,  to: "GiveIndia",             from: "My Savings A/C" },
];

function randomTxnId() {
  return "TXN" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function randomRef() {
  return Math.floor(100000000000 + Math.random() * 900000000000).toString();
}

export const generateTransactions = () => {
  const transactions = [];
  let id = 1;

  ALL_MONTH_KEYS.forEach((mk, monthIndex) => {
    const [year, month] = mk.split("-").map(Number);

    const incomeCount = 2 + (monthIndex % 3 === 0 ? 1 : 0) + (monthIndex % 5 === 0 ? 1 : 0);
    const shuffledIncome = [...incomeItems].sort(() => Math.random() - 0.5).slice(0, incomeCount);

    shuffledIncome.forEach(item => {
      const day = 1 + Math.floor(Math.random() * 5);
      const date = `${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
      const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
      transactions.push({
        id: id++,
        txnId: randomTxnId(),
        refNumber: randomRef(),
        description: item.desc,
        category: item.cat,
        amount: Math.round(item.amt + (Math.random() - 0.5) * item.amt * 0.15),
        type: "income",
        date,
        from: item.from,
        to: item.to,
        bank,
        paymentMode: PAYMENT_MODES[Math.floor(Math.random() * PAYMENT_MODES.length)],
        status: "Completed",
        note: "",
      });
    });

    const expCount = 10 + Math.floor(Math.random() * 9);
    const shuffledExp = [...expenseItems].sort(() => Math.random() - 0.5).slice(0, expCount);

    shuffledExp.forEach(item => {
      const day = 1 + Math.floor(Math.random() * 27);
      const date = `${year}-${String(month).padStart(2,"0")}-${String(Math.min(day, 28)).padStart(2,"0")}`;
      const bank = BANKS[Math.floor(Math.random() * BANKS.length)];
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      transactions.push({
        id: id++,
        txnId: randomTxnId(),
        refNumber: randomRef(),
        description: item.desc,
        category: item.cat,
        amount: Math.round(item.amt + (Math.random() - 0.5) * item.amt * 0.2),
        type: "expense",
        date,
        from: item.from,
        to: item.to,
        bank,
        paymentMode: PAYMENT_MODES[Math.floor(Math.random() * PAYMENT_MODES.length)],
        status,
        note: "",
      });
    });
  });

  return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

export const TRANSACTIONS = generateTransactions();
