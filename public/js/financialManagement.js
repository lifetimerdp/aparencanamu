import { auth, db } from './firebaseConfig.js';
import { doc, addDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { checkAuth, renderList } from './dashboard.js';

export const addExpense = async (name, category, amount) => {
  try {
    const user = await checkAuth();
    if (!user) throw new Error("User tidak terautentikasi");

    const expenseData = {
      name,
      category,
      amount,
      date: new Date(),
      userId: user.uid,
      status: "",
      priority: ""
    };

    const expensesRef = collection(db, "users", user.uid, "expenses");
    await addDoc(expensesRef, expenseData);
    console.log("Expense berhasil ditambahkan");
  } catch (error) {
    console.error("Error menambahkan expense:", error);
    throw error;
  }
};

export const addIncome = async (name, category, amount) => {
  try {
    const user = await checkAuth();
    if (!user) throw new Error("User tidak terautentikasi");

    const incomeData = {
      name,
      category,
      amount,
      date: new Date(),
      userId: user.uid,
      status: "",
      priority: ""
    };

    const incomesRef = collection(db, "users", user.uid, "incomes");
    await addDoc(incomesRef, incomeData);
    console.log("Income berhasil ditambahkan");
  } catch (error) {
    console.error("Error menambahkan income:", error);
    throw error;
  }
};

export const addBudget = async (name, month, amount) => {
  const user = await checkAuth();
  await addDoc(collection(doc(db, "users", user.uid), "budget"), {
    name,
    month,
    amount,
    status: "",
    priority: ""
  });
};

export const addReminder = async (name, date, time) => {
  const user = await checkAuth();
  const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  await addDoc(collection(doc(db, "users", user.uid), "reminders"), {
    name,
    date,
    time,
    timeZone: userTimeZone,
    notificationSent: false,
    status: "",
    priority: ""
  });
};

export const loadExpensesAndIncomes = async (userDocRef) => {
  try {
    // Memuat Pengeluaran
    const expensesRef = collection(userDocRef, 'expenses');
    onSnapshot(expensesRef, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderList(document.getElementById('expenses-list'), expenses, 'expenses');
    });

    // Memuat Pendapatan
    const incomesRef = collection(userDocRef, 'incomes');
    onSnapshot(incomesRef, (snapshot) => {
      const incomes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderList(document.getElementById('incomes-list'), incomes, 'incomes');
    });
  } catch (error) {
    console.error('Error saat memuat data keuangan:', error);
  }
};