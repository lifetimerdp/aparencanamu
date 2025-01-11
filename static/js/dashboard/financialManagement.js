import { auth, db } from '../firebaseConfig.js';
import { doc, addDoc, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { checkAuth, renderList } from './dashboard.js';
import { DataFilter } from './filterDashboard.js';

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
      status: "active",
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
      status: "active",
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
    status: "active",
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
    status: "active",
    priority: ""
  });
};

export const loadExpensesAndIncomes = async (userDocRef) => {
  try {
    const dataFilter = new DataFilter();
    dataFilter.setRenderCallback('expenses', renderList);
    dataFilter.setRenderCallback('incomes', renderList);
    const expensesRef = collection(userDocRef, "expenses");
    onSnapshot(expensesRef, (snapshot) => {
        const expenses = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const expensesList = document.getElementById('expenses-list');
        renderList(expensesList, expenses, 'expenses');
        dataFilter.updateData('expenses', expenses);
    });
    
    const incomesRef = collection(userDocRef, "incomes");
    onSnapshot(incomesRef, (snapshot) => {
        const incomes = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
        }));
        
        const incomesList = document.getElementById('incomes-list');
        renderList(incomesList, incomes, 'incomes');
        dataFilter.updateData('incomes', incomes);
    });
  } catch (error) {
    console.error('Error saat memuat data keuangan:', error);
  }
};