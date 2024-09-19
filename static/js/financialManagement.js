import { auth, db } from './firebaseConfig.js';
import { doc, addDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { checkAuth, renderList } from './coretan.js';

export const addExpense = async (name, category, amount) => {
  const user = await checkAuth();
  await addDoc(collection(doc(db, "users", user.uid), "expenses"), {
    name,
    category,
    amount
  });
};

export const addIncome = async (name, category, amount) => {
  const user = await checkAuth();
  await addDoc(collection(doc(db, "users", user.uid), "incomes"), {
    name,
    category,
    amount
  });
};

export const addBudget = async (name, month, amount) => {
  const user = await checkAuth();
  await addDoc(collection(doc(db, "users", user.uid), "budget"), {
    name,
    month,
    amount
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
    notificationSent: false
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