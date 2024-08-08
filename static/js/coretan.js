// dashboard.js

import { auth, db, messaging } from './firebaseConfig.js';
import { getDocs, addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";
import './auth.js';

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const dailyActivitiesForm = document.getElementById('daily-activities-form');
const dailyActivitiesInput = document.getElementById('daily-activities-input');
const dailyActivitiesDate = document.getElementById('daily-activities-date');
const weeklyPlansForm = document.getElementById('weekly-plans-form');
const weeklyPlansInput = document.getElementById('weekly-plans-input');
const weeklyPlansDuration = document.getElementById('weekly-plans-duration');
const budgetForm = document.getElementById('budget-form');
const budgetInput = document.getElementById('budget-input');
const budgetMonth = document.getElementById('budget-month');
const budgetAmount = document.getElementById('budget-amount');
const expenseForm = document.getElementById('expense-form');
const expenseInput = document.getElementById('expense-input');
const expenseCategory = document.getElementById('expense-category');
const expenseAmount = document.getElementById('expense-amount');
const incomeForm = document.getElementById('income-form');
const incomeInput = document.getElementById('income-input');
const incomeCategory = document.getElementById('income-category');
const incomeAmount = document.getElementById('income-amount');
const reminderForm = document.getElementById('reminder-form');
const reminderInput = document.getElementById('reminder-input');
const reminderDate = document.getElementById('reminder-date');
const reminderTime = document.getElementById('reminder-time');
let userId = null;

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

const checkAuth = async () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, user => {
      if (user) {
        userId = user.uid;
        resolve(user);
        fetchAndRenderStatistics();
      } else {
        userId = null;
        reject('Tidak ada pengguna yang login.');
      }
    });
  });
};

const renderSubActivities = (parentElement, subActivities) => {
  const subActivityList = parentElement.querySelector('.sub-activity-list');
  subActivityList.innerHTML = '';

  subActivities.forEach(subActivity => {
    const li = document.createElement('li');
    li.setAttribute('data-id', subActivity.id);
    li.innerHTML = `
      ${subActivity.name}
      <button class="edit-sub-btn" data-id="${subActivity.id}" data-name="${subActivity.name}">Edit</button>
      <button class="delete-sub-btn" data-id="${subActivity.id}">Hapus</button>
    `;

    const taskTemplate = document.getElementById('task-template').content.cloneNode(true);
    const taskList = taskTemplate.querySelector('.task-list');
    li.appendChild(taskTemplate);

    const tasksRef = collection(doc(db, "users", userId, "dailyActivities", parentElement.getAttribute('data-id'), "subActivities", subActivity.id), "tasks");
    onSnapshot(tasksRef, (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderTasks(taskList, tasks, parentElement.getAttribute('data-id'), subActivity.id);
    });

    subActivityList.appendChild(li);

    // Dalam renderSubActivities, ketika mengedit sub-aktivitas
    li.querySelector('.edit-sub-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const subActivityId = e.target.getAttribute('data-id');
      const subActivityName = e.target.getAttribute('data-name');
      const activityId = parentElement.getAttribute('data-id');
      showEditPopup(subActivityId, 'subActivities', subActivityName, activityId); // Tambahkan activityId di sini
    });

    li.querySelector('.delete-sub-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const subActivityId = e.target.getAttribute('data-id');
      try {
        await deleteDoc(doc(db, "users", userId, "dailyActivities", parentElement.getAttribute('data-id'), "subActivities", subActivityId));
      } catch (error) {
        console.error(`Error deleting sub-activity with ID: ${subActivityId}`, error);
      }
    });
  });
  
  // Event listener untuk form task
  parentElement.querySelectorAll('.task-form').forEach(form => {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const subActivityId = form.closest('li').getAttribute('data-id');
    const taskInput = form.querySelector('.task-input');
    const taskName = taskInput.value.trim();

    if (taskName && subActivityId) {
      try {
        const subActivityRef = doc(db, "users", userId, "dailyActivities", parentElement.getAttribute('data-id'), "subActivities", subActivityId);
        const tasksRef = collection(subActivityRef, "tasks");

        await addDoc(tasksRef, { name: taskName });
        taskInput.value = '';
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  });
  });
};

// Function to render tasks
const renderTasks = (taskList, tasks, activityId, subActivityId) => {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    li.innerHTML = `
      ${task.name}
      <button class="edit-task-btn" data-id="${task.id}" data-name="${task.name}" data-activity-id="${activityId}" data-sub-activity-id="${subActivityId}">Edit</button>
      <button class="delete-task-btn" data-id="${task.id}" data-activity-id="${activityId}" data-sub-activity-id="${subActivityId}">Hapus</button>
    `;
    taskList.appendChild(li);

    // Dalam renderTasks, ketika mengedit task
    li.querySelector('.edit-task-btn').addEventListener('click', async (e) => {
    e.stopPropagation();
    const taskId = e.target.getAttribute('data-id');
    const taskName = e.target.getAttribute('data-name');
    const activityId = e.target.getAttribute('data-activity-id');
    const subActivityId = e.target.getAttribute('data-sub-activity-id');
    showEditPopup(taskId, 'tasks', taskName, activityId, subActivityId); // Tambahkan subActivityId di sini
    });

    li.querySelector('.delete-task-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const taskId = e.target.getAttribute('data-id');
      try {
        await deleteDoc(doc(db, "users", userId, "dailyActivities", activityId, "subActivities", subActivityId, "tasks", taskId));
      } catch (error) {
        console.error(`Error deleting task with ID: ${taskId}`, error);
      }
    });
  });
};

// Function to render sub-weekly plans
const renderSubWeeklyPlans = (parentElement, subWeeklyPlans) => {
  const subWeeklyPlanList = parentElement.querySelector('.sub-weeklyPlan-list');
  subWeeklyPlanList.innerHTML = '';

  subWeeklyPlans.forEach(subPlan => {
    const li = document.createElement('li');
    li.setAttribute('data-id', subPlan.id);
    li.innerHTML = `
      ${subPlan.name}
      <button class="edit-sub-weeklyPlan-btn" data-id="${subPlan.id}" data-name="${subPlan.name}">Edit</button>
      <button class="delete-sub-weeklyPlan-btn" data-id="${subPlan.id}">Hapus</button>
    `;

    subWeeklyPlanList.appendChild(li);

    li.querySelector('.edit-sub-weeklyPlan-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const subPlanId = e.target.getAttribute('data-id');
      const subPlanName = e.target.getAttribute('data-name');
      const planId = parentElement.getAttribute('data-id');
      showEditPopup(subPlanId, 'subWeeklyPlans', subPlanName, planId);
    });

    li.querySelector('.delete-sub-weeklyPlan-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      const subPlanId = e.target.getAttribute('data-id');
      try {
        await deleteDoc(doc(db, "users", userId, "weeklyPlans", parentElement.getAttribute('data-id'), "subWeeklyPlans", subPlanId));
      } catch (error) {
        console.error(`Error deleting sub-weekly plan with ID: ${subPlanId}`, error);
      }
    });
  });
};

// Function to add sub-weekly plan form
const addSubWeeklyPlanForm = (li, plan) => {
  const subWeeklyPlanTemplate = document.getElementById('sub-weeklyPlan-template').content.cloneNode(true);
  const subWeeklyPlanLi = subWeeklyPlanTemplate.querySelector('li');
  subWeeklyPlanLi.setAttribute('data-id', plan.id);
  li.appendChild(subWeeklyPlanTemplate);

  const subWeeklyPlanForm = li.querySelector('.sub-weeklyPlan-form');

  if (!userId) {
    console.error('User ID is not initialized');
    return;
  }

  const subWeeklyPlansRef = collection(doc(db, "users", userId, "weeklyPlans", plan.id), "subWeeklyPlans");
  onSnapshot(subWeeklyPlansRef, (snapshot) => {
    const subWeeklyPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderSubWeeklyPlans(li, subWeeklyPlans);
  });

  subWeeklyPlanForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const subPlanName = subWeeklyPlanForm.querySelector('.sub-weeklyPlan-input').value.trim();

    if (subPlanName) {
      try {
        await addDoc(subWeeklyPlansRef, { name: subPlanName });
        subWeeklyPlanForm.querySelector('.sub-weeklyPlan-input').value = '';
      } catch (error) {
        console.error('Error adding sub-weekly plan:', error);
      }
    }
  });
};

// Adjust renderList function for weeklyPlans
const renderList = (listElement, items, dataType) => {
  if (!listElement) return;
  listElement.innerHTML = '';

  const renderGroupedItems = (groupedItems, createHeader) => {
    Object.keys(groupedItems).forEach(groupKey => {
      const header = createHeader(groupKey);
      listElement.appendChild(header);

      groupedItems[groupKey].forEach(item => {
        const li = document.createElement('li');
        let content = `${item.name}`;
        
        if (dataType === 'expenses' || dataType === 'incomes') {
          content += ` - ${formatRupiah(item.amount)}`;
        } else if (dataType === 'budget') {
          content += ` - ${formatRupiah(item.amount)}`;
        } else if (dataType === 'dailyActivities') {
          const dateToShow = formatDate(item.date);
          content += ` - ${dateToShow}`;
        }
        li.setAttribute('data-id', item.id);

        li.innerHTML = `
          ${content}
          <button class="edit-btn" data-id="${item.id}" data-name="${item.name}" data-type="${dataType}">Edit</button>
          <button class="delete-btn" data-id="${item.id}" data-type="${dataType}">Hapus</button>`;
        
        if (dataType === 'dailyActivities') {
          addSubActivityForm(li, item);
        } else if (dataType === 'weeklyPlans') {
          addSubWeeklyPlanForm(li, item);
        }

        listElement.appendChild(li);
      });
    });
  };

  const formatDate = (date) => {
    if (date === 'Hari Ini') {
      const today = new Date();
      return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    } else if (date === 'Besok') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return `${tomorrow.getDate()} ${months[tomorrow.getMonth()]} ${tomorrow.getFullYear()}`;
    } else {
      return date;
    }
  };

  const addSubActivityForm = (li, item) => {
    const subActivityTemplate = document.getElementById('sub-activity-template').content.cloneNode(true);
    const subActivityLi = subActivityTemplate.querySelector('li');
    subActivityLi.setAttribute('data-id', item.id); // Set data-id here
    li.appendChild(subActivityTemplate);

    const subActivityForm = li.querySelector('.sub-activity-form');

    if (!userId) {
      console.error('User ID is not initialized');
      return;
    }

    const subActivitiesRef = collection(doc(db, "users", userId, "dailyActivities", item.id), "subActivities");
    onSnapshot(subActivitiesRef, (snapshot) => {
      const subActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderSubActivities(li, subActivities);
    });
  };

  const groupedItems = items.reduce((grouped, item) => {
    let groupKey;
    if (dataType === 'reminders') {
      groupKey = item.date;
    } else if (dataType === 'budget') {
      groupKey = item.month;
    } else if (dataType === 'weeklyPlans') {
      groupKey = `${item.createdAt} - ${item.endDate}`;
    } else {
      groupKey = '';
    }

    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(item);
    return grouped;
  }, {});

  if (dataType === 'reminders' || dataType === 'budget' || dataType === 'weeklyPlans') {
    renderGroupedItems(groupedItems, (groupKey) => {
      const header = document.createElement('h3');
      header.textContent = groupKey;
      return header;
    });
  } else {
    items.forEach(item => {
      const li = document.createElement('li');
      let content = `${item.name}`;
      
      if (dataType === 'expenses' || dataType === 'incomes') {
        content += ` - ${formatRupiah(item.amount)}`;
      } else if (dataType === 'dailyActivities') {
        const dateToShow = formatDate(item.date);
        content += ` - ${dateToShow}`;
      }
      li.setAttribute('data-id', item.id);

      li.innerHTML = `
        ${content}
        <button class="edit-btn" data-id="${item.id}" data-name="${item.name}" data-type="${dataType}">Edit</button>
        <button class="delete-btn" data-id="${item.id}" data-type="${dataType}">Hapus</button>`;
      
      if (dataType === 'dailyActivities') {
        addSubActivityForm(li, item);
      } else if (dataType === 'weeklyPlans') {
        addSubWeeklyPlanForm(li, item);
      }

      listElement.appendChild(li);
    });
  }
};

// Event listener untuk form Pengeluaran
expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const expenseName = expenseInput.value;
  const expenseCategoryValue = expenseCategory.value;
  const expenseAmountValue = expenseAmount.value;

  if (expenseName.trim() && expenseAmountValue) {
    try {
      await addDoc(collection(doc(db, "users", userId), "expenses"), {
        name: expenseName,
        category: expenseCategoryValue,
        amount: parseFloat(expenseAmountValue),
      });

      expenseInput.value = '';
      expenseCategory.value = '';
      expenseAmount.value = '';
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  }
});

// Event listener untuk form Pendapatan
incomeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const incomeName = incomeInput.value;
  const incomeCategoryValue = incomeCategory.value;
  const incomeAmountValue = incomeAmount.value;

  if (incomeName.trim() && incomeAmountValue) {
    try {
      await addDoc(collection(doc(db, "users", userId), "incomes"), {
        name: incomeName,
        category: incomeCategoryValue,
        amount: parseFloat(incomeAmountValue),
      });

      incomeInput.value = '';
      incomeCategory.value = '';
      incomeAmount.value = '';
    } catch (error) {
      console.error('Error adding income:', error);
    }
  }
});

// Event listener untuk tombol hapus Pengeluaran atau Pendapatan
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const dataType = e.target.getAttribute('data-type');
    const dataId = e.target.getAttribute('data-id');

    try {
      await deleteDoc(doc(db, "users", userId, dataType, dataId));
    } catch (error) {
      console.error(`Error deleting ${dataType}:`, error);
    }
  }
});

const showEditPopup = (id, type, name, parentId = null, subParentId = null) => {
  const typeName = getTypeName(type); // Ambil nama yang sesuai untuk tampilan

  const editPopup = document.createElement('div');
  editPopup.classList.add('edit-popup');

  editPopup.innerHTML = `
    <div class="edit-popup-content">
      <h3>Edit ${typeName}</h3> <!-- Gunakan typeName di sini -->
      <form id="edit-form">
        <input type="text" id="edit-input" value="${name}">
        <button type="submit">Simpan</button>
        <button type="button" id="cancel-edit">Batal</button>
      </form>
    </div>
  `;

  document.body.appendChild(editPopup);

  const editForm = document.getElementById('edit-form');
  const cancelEditButton = document.getElementById('cancel-edit');

  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedName = document.getElementById('edit-input').value.trim();

    if (updatedName) {
      await updateData(type, id, { name: updatedName }, parentId, subParentId); // Oper subParentId di sini
      document.body.removeChild(editPopup);
    }
  });

  cancelEditButton.addEventListener('click', () => {
    document.body.removeChild(editPopup);
  });
};

const getTypeName = (type) => {
  switch (type) {
    case 'dailyActivities':
      return 'Aktivitas Harian';
    case 'weeklyPlans':
      return 'Rencana Mingguan';
    case 'budget':
      return 'Anggaran';
    case 'expenses':
      return 'Pengeluaran';
    case 'incomes':
      return 'Pendapatan';
    case 'reminders':
      return 'Pengingat';
    default:
      return 'Item'; // Default fallback
  }
};

const updateData = async (dataType, id, updatedObject, parentId = null, subParentId = null) => {
  try {
    const user = await checkAuth();
    const userDocRef = doc(db, "users", user.uid);

    let docRef;
    if (dataType === 'tasks') {
      if (!parentId || !subParentId) throw new Error('Parent ID dan Sub-Parent ID diperlukan untuk tasks');
      docRef = doc(userDocRef, "dailyActivities", parentId, "subActivities", subParentId, "tasks", id);
    } else if (dataType === 'subActivities') {
      if (!parentId) throw new Error('Parent ID diperlukan untuk subActivities');
      docRef = doc(userDocRef, "dailyActivities", parentId, "subActivities", id);
    } else if (dataType === 'subWeeklyPlans') {
      if (!parentId) throw new Error('Parent ID diperlukan untuk subWeeklyPlans');
      docRef = doc(userDocRef, "weeklyPlans", parentId, "subWeeklyPlans", id);
    } else {
      docRef = doc(userDocRef, dataType, id);
    }

    await updateDoc(docRef, updatedObject);
  } catch (error) {
    console.error(`Error updating ${dataType} with ID: ${id}`, error);
  }
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const user = await checkAuth();
    const userDocRef = doc(db, "users", user.uid); // pastikan userId sudah diambil dari user.uid

    // Fungsi untuk memuat dan merender sub-aktivitas
    const loadAndRenderSubActivities = (activityElement, activityId) => {
      if (!activityId) {
        console.error('Activity ID is null or undefined.');
        return;
      }
      const subActivitiesRef = collection(doc(db, "users", userId, "dailyActivities", activityId), "subActivities");
      onSnapshot(subActivitiesRef, (snapshot) => {
        const subActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderSubActivities(activityElement, subActivities);
      });
    };

    // Periksa aktivitas harian yang sudah kadaluarsa
    await checkExpiredDailyActivities();

    // Listen for real-time updates on daily activities
    const dailyActivitiesRef = collection(userDocRef, 'dailyActivities');
    onSnapshot(dailyActivitiesRef, (snapshot) => {
      const dailyActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderList(document.getElementById('daily-activities-list'), dailyActivities, 'dailyActivities');
    });

    // Listen for real-time updates on weekly plans
    const weeklyPlansRef = collection(userDocRef, 'weeklyPlans');
    onSnapshot(weeklyPlansRef, (snapshot) => {
      const weeklyPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderList(document.getElementById('weekly-plans-list'), weeklyPlans, 'weeklyPlans');
    });

    // Listen for real-time updates on budget
    const budgetRef = collection(userDocRef, 'budget');
    onSnapshot(budgetRef, (snapshot) => {
      const budget = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderList(document.getElementById('budget-list'), budget, 'budget');
    });

    // Listen for real-time updates on financial reminders
    const remindersRef = collection(userDocRef, 'reminders');
    onSnapshot(remindersRef, (snapshot) => {
      const reminders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderList(document.getElementById('reminders-list'), reminders, 'reminders');
    });

    // Event listeners for application buttons
    const appButtons = document.querySelectorAll('.app-btn');
    const appSections = document.querySelectorAll('.app-section');

    appButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Tambahkan class 'hidden' ke semua section aplikasi
        appSections.forEach(section => {
          section.classList.add('hidden');
        });

        // Hapus class 'hidden' dari section yang dipilih
        const targetId = button.getAttribute('data-target');
        document.getElementById(targetId).classList.remove('hidden');
      });
    });

    // Event listeners for selector buttons in financial management
    const selectors = document.querySelectorAll('.selector-btn');
    const sections = document.querySelectorAll('.financial-section');

    selectors.forEach(selector => {
      selector.addEventListener('click', () => {
        // Tambahkan class 'hidden' ke semua section keuangan
        sections.forEach(section => {
          section.classList.add('hidden');
        });

        // Hapus class 'hidden' dari section yang dipilih
        const targetId = selector.getAttribute('data-target');
        document.getElementById(targetId).classList.remove('hidden');
      });
    });

    // Memuat data Pengeluaran dan Pendapatan dari Firestore
    const loadExpensesAndIncomes = async (userDocRef) => {
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
        console.error('Error loading financial data:', error);
      }
    };

    // Load expenses and incomes
    loadExpensesAndIncomes(userDocRef);
  } catch (error) {
    console.error('Error loading user data:', error);
  }
  
  // Event listener untuk form tambah sub-aktivitas
  document.addEventListener('submit', async (e) => {
  if (e.target.classList.contains('sub-activity-form')) {
    e.preventDefault();
    const liElement = e.target.closest('li');
    if (liElement) {
      const activityId = liElement.getAttribute('data-id');
      const subActivityInput = e.target.querySelector('.sub-activity-input');
      const subActivityName = subActivityInput.value.trim();

      if (subActivityName && activityId) {
        try {
          const user = await checkAuth();
          if (!userId) {
            userId = user.uid;
          }

          const dailyActivityRef = doc(db, "users", userId, "dailyActivities", activityId);
          const subActivitiesRef = collection(dailyActivityRef, "subActivities");

          // Tambahkan sub-aktivitas ke Firestore
          await addDoc(subActivitiesRef, {
            name: subActivityName
          });

          subActivityInput.value = ''; // Reset input setelah submit
        } catch (error) {
          console.error('Error adding sub-activity:', error);
        }
      } else {
        console.error('Sub-activity name or activity ID is missing.');
      }
    } else {
      console.error('Parent activity element not found.');
    }
  }
  });
});

dailyActivitiesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const activityName = dailyActivitiesInput.value;
  const activityDate = dailyActivitiesDate.value;

  if (activityName.trim()) {
    let dateToAdd = new Date();
    if (activityDate === 'tomorrow') {
      dateToAdd.setDate(dateToAdd.getDate() + 1);
    }
    const formattedDate = `${dateToAdd.getDate()} ${months[dateToAdd.getMonth()]} ${dateToAdd.getFullYear()}`;
    
    try {
      await addDoc(collection(doc(db, "users", userId), "dailyActivities"), {
        name: activityName,
        date: formattedDate,
        completed: false,
      });

      dailyActivitiesInput.value = '';
      dailyActivitiesDate.value = 'today';
    } catch (error) {
      console.error('Error adding daily activity:', error);
    }
  }
});

const checkExpiredDailyActivities = async () => {
  try {
    const userDocRef = doc(db, "users", userId);
    const dailyActivitiesRef = collection(userDocRef, 'dailyActivities');
    const snapshot = await getDocs(dailyActivitiesRef);

    snapshot.forEach(async (doc) => {
      const activity = doc.data();
      const [day, month, year] = activity.date.split(' ');
      const activityDate = new Date(year, months.indexOf(month), day);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to the beginning of the day

      if (activityDate < today && !activity.completed) {
        await updateDoc(doc.ref, { completed: true });
      }
    });
  } catch (error) {
    console.error("Error checking expired daily activities: ", error);
  }
};

const checkExpiredWeeklyPlans = async () => {
  try {
    const userDocRef = doc(db, "users", userId);
    const weeklyPlansRef = collection(userDocRef, 'weeklyPlans');
    const snapshot = await getDocs(weeklyPlansRef);

    snapshot.forEach(async (doc) => {
      const plan = doc.data();
      const [day, month, year] = plan.endDate.split(' ');
      const planEndDate = new Date(year, months.indexOf(month), day);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to the beginning of the day

      if (planEndDate < today && !plan.completed) {
        console.log(`Marking plan as completed: ${plan.name}`);
        await updateDoc(doc.ref, { completed: true });
      }
    });
  } catch (error) {
    console.error("Error checking expired weekly plans: ", error);
  }
};

const durationToEndDate = (duration) => {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + (duration * 7) - 1); // Mengurangi satu hari dari durasi
  const endDateFormat = `${endDate.getDate()} ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
  return endDateFormat;
};

weeklyPlansForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const planName = weeklyPlansInput.value;
  const planDuration = parseInt(weeklyPlansDuration.value); // Ambil nilai duration sebagai integer

  if (planName.trim()) {
    try {
      const createdAt = new Date(); // Waktu pembuatan rencana mingguan
      const createdAtFormatted = `${createdAt.getDate()} ${months[createdAt.getMonth()]} ${createdAt.getFullYear()}`; // Format createdAt
      const endDate = durationToEndDate(planDuration); // Hitung tanggal akhir berdasarkan durasi
      
      await addDoc(collection(doc(db, "users", userId), "weeklyPlans"), {
        name: planName,
        duration: planDuration, // Simpan durasi sebagai integer
        createdAt: createdAtFormatted, // Simpan waktu pembuatan dalam format yang diinginkan
        endDate: endDate, // Simpan tanggal akhir
        completed: false,
      });

      weeklyPlansInput.value = '';
      weeklyPlansDuration.value = '1';
    } catch (error) {
      console.error('Error adding weekly plan:', error);
    }
  }
});

// Event listener untuk form Anggaran
budgetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const budgetName = budgetInput.value;
  const budgetMonthValue = budgetMonth.value;
  const budgetAmountValue = budgetAmount.value;

  if (budgetName.trim() && budgetAmountValue) {
    try {
      await addDoc(collection(doc(db, 'users', userId), 'budget'), {
        name: budgetName,
        month: budgetMonthValue, // Gunakan bulan dalam bahasa Indonesia
        amount: parseFloat(budgetAmountValue),
      });

      // Atur ulang nilai form
      budgetInput.value = '';
      budgetMonth.value = 'Januari'; // Set bulan default (misalnya Januari dalam bahasa Indonesia)
      budgetAmount.value = '';

    } catch (error) {
      console.error('Error adding budget:', error);
    }
  }
});

reminderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const reminderName = reminderInput.value;
  const reminderDateValue = new Date(reminderDate.value);
  const reminderTimeValue = reminderTime.value; // Dapatkan waktu dari input

  if (reminderName.trim() && reminderDateValue && reminderTimeValue) {
    const reminderDateTime = new Date(`${reminderDateValue.toDateString()} ${reminderTimeValue}`); // Gabungkan tanggal dan waktu

    const formattedDate = `${reminderDateTime.getDate()} ${months[reminderDateTime.getMonth()]} ${reminderDateTime.getFullYear()}`;
    const formattedTime = reminderDateTime.toTimeString().split(' ')[0]; // Format waktu HH:mm:ss

    try {
      await addDoc(collection(doc(db, "users", userId), "reminders"), {
        name: reminderName,
        date: formattedDate,
        time: formattedTime, // Simpan waktu ke Firestore
      });

      reminderInput.value = '';
      reminderDate.value = '';
      reminderTime.value = ''; // Reset input waktu setelah submit
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  }
});

// Delete functionality
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const dataType = e.target.getAttribute('data-type');
    const dataId = e.target.getAttribute('data-id');

    try {
      await deleteData(dataType, dataId);
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  }
});

const deleteData = async (dataType, id) => {
  try {
    const user = await checkAuth();
    const userDocRef = doc(db, "users", userId);
    const docRef = doc(userDocRef, dataType, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
  }
};

// Edit functionality
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const dataType = e.target.getAttribute('data-type');
    const dataId = e.target.getAttribute('data-id');
    const dataName = e.target.getAttribute('data-name');

    showEditPopup(dataId, dataType, dataName);
  }
});

// Fungsi untuk menghitung statistik dan memperbarui elemen HTML
const fetchAndRenderStatistics = async () => {
  try {
    if (!userId) return;

    // Mendapatkan referensi ke koleksi yang diperlukan
    const dailyActivitiesRef = collection(db, "users", userId, "dailyActivities");
    const weeklyPlansRef = collection(db, "users", userId, "weeklyPlans");
    const incomesRef = collection(db, "users", userId, "incomes");
    const expensesRef = collection(db, "users", userId, "expenses");
    const remindersRef = collection(db, "users", userId, "reminders");

    // Mengambil data dari Firestore
    const [dailyActivitiesSnap, weeklyPlansSnap, incomesSnap, expensesSnap, remindersSnap] = await Promise.all([
      getDocs(dailyActivitiesRef),
      getDocs(weeklyPlansRef),
      getDocs(incomesRef),
      getDocs(expensesRef),
      getDocs(remindersRef)
    ]);

    // Menghitung total aktivitas harian yang sudah selesai
    const completedActivitiesCount = dailyActivitiesSnap.docs.filter(doc => doc.data().completed).length;
    document.getElementById('completed-activities-count').innerText = completedActivitiesCount;

    // Menghitung total rencana mingguan yang belum selesai
    const pendingPlansCount = weeklyPlansSnap.docs.filter(doc => {
      const plan = doc.data();
      const [day, month, year] = plan.endDate.split(' ');
      const planEndDate = new Date(year, months.indexOf(month), day);
      return !plan.completed && planEndDate >= new Date(); // Rencana yang belum selesai
    }).length;
    document.getElementById('pending-plans-count').innerText = pendingPlansCount;

    // Menghitung total pendapatan
    const totalIncome = incomesSnap.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
    document.getElementById('total-income-count').innerText = formatRupiah(totalIncome);

    // Menghitung total pengeluaran
    const totalExpense = expensesSnap.docs.reduce((sum, doc) => sum + doc.data().amount, 0);
    document.getElementById('total-expense-count').innerText = formatRupiah(totalExpense);

    // Menghitung total pengingat aktif
    const activeRemindersCount = remindersSnap.size;
    document.getElementById('active-reminders-count').innerText = activeRemindersCount;

  } catch (error) {
    console.error('Error fetching statistics:', error);
  }
};

// Memantau perubahan data untuk memperbarui statistik secara real-time
const monitorDataChanges = () => {
  if (!userId) return;

  const dailyActivitiesRef = collection(db, "users", userId, "dailyActivities");
  const weeklyPlansRef = collection(db, "users", userId, "weeklyPlans");
  const incomesRef = collection(db, "users", userId, "incomes");
  const expensesRef = collection(db, "users", userId, "expenses");
  const remindersRef = collection(db, "users", userId, "reminders");

  onSnapshot(dailyActivitiesRef, fetchAndRenderStatistics);
  onSnapshot(weeklyPlansRef, () => {
    fetchAndRenderStatistics();
    checkExpiredWeeklyPlans(); // Periksa rencana mingguan saat ada perubahan
  });
  onSnapshot(incomesRef, fetchAndRenderStatistics);
  onSnapshot(expensesRef, fetchAndRenderStatistics);
  onSnapshot(remindersRef, fetchAndRenderStatistics);
};

// Fungsi untuk memantau pengingat dan mengirim notifikasi
const monitorReminders = () => {
  if (!userId) return;

  const remindersRef = collection(db, "users", userId, "reminders");

  onSnapshot(remindersRef, (snapshot) => {
    snapshot.forEach(doc => {
      const reminder = doc.data();
      const reminderDateTime = new Date(`${reminder.date} ${reminder.time}`);
      const now = new Date();

      // Periksa apakah waktu pengingat sudah tercapai
      if (reminderDateTime <= now) {
        sendLocalFCMNotification(reminder.name, reminder.date, reminder.time);
      }
    });
  });
};

// Fungsi untuk mengirim notifikasi lokal
const sendLocalFCMNotification = (title, date, time) => {
  const notificationTitle = `Pengingat: ${title}`;
  const notificationOptions = {
    body: `Jangan lupa pengingat Anda pada ${date} pukul ${time}`,
    icon: 'path-to-your-icon.png' // Ganti dengan path ikon notifikasi Anda
  };

  // Periksa apakah notifikasi diperbolehkan dan kirim notifikasi
  if (Notification.permission === "granted") {
    new Notification(notificationTitle, notificationOptions);
  } else {
    console.error("Notifikasi tidak diizinkan oleh pengguna.");
  }
};

// Mulai ketika autentikasi sudah dicek
checkAuth().then(() => {
  monitorDataChanges();
  checkExpiredWeeklyPlans();
  monitorReminders();
}).catch(console.error);

// Minta izin untuk mengirim notifikasi dan ambil token FCM
const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Izin notifikasi diberikan.");
      const token = await getToken(messaging, {
        vapidKey: "BLkleGJm7ErQhO6BVhEO7RmgAcUoiNP3z46Cb4ei1Hn4L1FwDmz5CgJ3rg-C_e-pFQahbXlgxUDn06rIW1WOOiY",
        serviceWorkerRegistration: await navigator.serviceWorker.ready, // Gunakan service worker yang telah didaftarkan
      });
      console.log("Token FCM:", token);
      // Simpan token ke Firestore atau backend Anda
      await saveTokenToFirestore(token);
    } else {
      console.error("Izin notifikasi ditolak.");
    }
  } catch (error) {
    console.error("Error mendapatkan token FCM:", error);
  }
};

// Simpan token FCM ke Firestore
const saveTokenToFirestore = async (token) => {
  const userId = await checkAuth(); // Pastikan pengguna sudah terautentikasi
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, { fcmToken: token }, { merge: true });
  } catch (error) {
    console.error("Error menyimpan token FCM:", error);
  }
};

// Panggil fungsi ini ketika diperlukan
requestNotificationPermission();

// Tangani pesan foreground
onMessage(messaging, (payload) => {
  console.log("Pesan diterima. ", payload);
  // Kustomisasi notifikasi di sini
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon
  };

  if (Notification.permission === "granted") {
    new Notification(notificationTitle, notificationOptions);
  }
});

// Daftarkan Service Worker untuk Firebase Messaging
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/js/firebase-messaging-sw.js', { scope: '/js/' })
  .then((registration) => {
    console.log('Service Worker registered with scope:', registration.scope);
  }).catch((error) => {
    console.error('Service Worker registration failed:', error);
  });
}