import { auth, db, messaging } from './firebaseConfig.js';
import { getDocs, addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import './auth.js';
import { renderSubActivities, addTaskForm, renderTasks, addSubActivityForm, checkExpiredDailyActivities, addDailyActivity } from './dailyActivities.js';
import { renderSubWeeklyPlans, addSubWeeklyPlanForm, checkExpiredWeeklyPlans, initWeeklyPlans, renderWeeklyPlans, loadWeeklyPlans } from './weeklyPlans.js'
import { 
  addExpense, 
  addIncome, 
  addBudget, 
  addReminder, 
  loadExpensesAndIncomes 
} from './financialManagement.js';

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const dailyActivitiesForm = document.getElementById('daily-activities-form');
const dailyActivitiesInput = document.getElementById('daily-activities-input');
const dailyActivitiesDate = document.getElementById('daily-activities-date');
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
export let userId = null;

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

// Fungsi checkAuth yang diperbarui
export const checkAuth = () => {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, user => {
      if (user) {
        userId = user.uid;
        resolve(user);
      } else {
        userId = null;
        reject('Tidak ada pengguna yang login.');
      }
    });
  });
};

export const renderList = (listElement, items, dataType, parentId = null, subParentId = null) => {
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
          <div class="item-content">
            <span class="item-name">${content}</span>
            <div class="item-actions">
              <button class="edit-btn" data-id="${item.id}" data-name="${item.name}" data-type="${dataType}" data-parent-id="${parentId || ''}" data-sub-parent-id="${subParentId || ''}">Edit</button>
              <button class="delete-btn" data-id="${item.id}" data-type="${dataType}">Hapus</button>
            </div>
          </div>`;
        
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

  const formatDateToIndonesian = (date) => {
    const [year, monthIndex, day] = date.split('-');
    const month = months[parseInt(monthIndex, 10) - 1];
    return `${parseInt(day, 10)} ${month} ${year}`;
  };

  const groupedItems = items.reduce((grouped, item) => {
    let groupKey;
    if (dataType === 'reminders') {
      groupKey = formatDateToIndonesian(item.date); // Format tanggal untuk reminders
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
        <div class="item-content">
          <span class="item-name">${content}</span>
          <div class="item-actions">
            <button class="edit-btn" data-id="${item.id}" data-name="${item.name}" data-type="${dataType}" data-parent-id="${parentId || ''}" data-sub-parent-id="${subParentId || ''}">Edit</button>
            <button class="delete-btn" data-id="${item.id}" data-type="${dataType}">Hapus</button>
          </div>
        </div>`;
      
      if (dataType === 'dailyActivities') {
        addSubActivityForm(li, item);
      } else if (dataType === 'weeklyPlans') {
        addSubWeeklyPlanForm(li, item);
      }

      listElement.appendChild(li);
    });
  }
};

expenseForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const expenseName = expenseInput.value;
  const expenseCategoryValue = expenseCategory.value;
  const expenseAmountValue = expenseAmount.value;

  if (expenseName.trim() && expenseAmountValue) {
    try {
      await addExpense(expenseName, expenseCategoryValue, parseFloat(expenseAmountValue));
      expenseInput.value = '';
      expenseCategory.value = '';
      expenseAmount.value = '';
    } catch (error) {
      console.error('Error adding expense:', error);
    }
  }
});

incomeForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const incomeName = incomeInput.value;
  const incomeCategoryValue = incomeCategory.value;
  const incomeAmountValue = incomeAmount.value;

  if (incomeName.trim() && incomeAmountValue) {
    try {
      await addIncome(incomeName, incomeCategoryValue, parseFloat(incomeAmountValue));
      incomeInput.value = '';
      incomeCategory.value = '';
      incomeAmount.value = '';
    } catch (error) {
      console.error('Error adding income:', error);
    }
  }
});

// Fungsi umum untuk mengedit data
const editData = async (dataType, id, updatedFields, parentId = null, subParentId = null) => {
  try {
    const user = await checkAuth();
    if (!user) throw new Error('User tidak terautentikasi');

    let docRef;
    const userDocRef = doc(db, "users", user.uid);

    switch (dataType) {
      case 'dailyActivities':
      case 'weeklyPlans':
      case 'budget':
      case 'expenses':
      case 'incomes':
      case 'reminders':
        docRef = doc(userDocRef, dataType, id);
        break;
      case 'subActivities':
        if (!parentId) throw new Error('parentId diperlukan untuk subActivities');
        docRef = doc(userDocRef, "dailyActivities", parentId, "subActivities", id);
        break;
      case 'subWeeklyPlans':
        if (!parentId) throw new Error('parentId diperlukan untuk subWeeklyPlans');
        docRef = doc(userDocRef, "weeklyPlans", parentId, "subWeeklyPlans", id);
        break;
      case 'tasks':
        if (!parentId || !subParentId) throw new Error('parentId dan subParentId diperlukan untuk tasks');
        docRef = doc(userDocRef, "dailyActivities", parentId, "subActivities", subParentId, "tasks", id);
        break;
      default:
        throw new Error(`Tipe data tidak dikenal: ${dataType}`);
    }

    // Dapatkan data saat ini
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error(`Dokumen dengan ID ${id} tidak ditemukan`);
    }
    const currentData = docSnap.data();

    // Persiapkan data yang diperbarui
    const updatedData = { ...currentData, ...updatedFields };

    // Jika ini adalah rencana mingguan dan durasinya berubah, perbarui endDate
    if (dataType === 'weeklyPlans' && updatedFields.duration !== undefined) {
      const createdAtDate = new Date(currentData.createdAt.split(' ').reverse().join('-'));
      const endDate = new Date(createdAtDate);
      endDate.setDate(endDate.getDate() + (updatedFields.duration * 7) - 1);
      updatedData.endDate = `${endDate.getDate()} ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
    }

    // Periksa apakah ada perubahan yang diizinkan
    const hasChanges = Object.keys(updatedFields).some(key => {
      // Periksa apakah field ini diizinkan untuk diubah
      const isAllowedToChange = !(
        (dataType === 'dailyActivities' && (key === 'date' || key === 'completed')) ||
        (dataType === 'weeklyPlans' && (key === 'createdAt' || key === 'completed')) ||
        (dataType === 'reminders' && (key === 'timeZone' || key === 'notificationSent'))
      );
      return isAllowedToChange && currentData[key] !== updatedFields[key];
    });

    if (hasChanges) {
      await updateDoc(docRef, updatedData);
      console.log(`${dataType} dengan ID ${id} berhasil diperbarui`);
    } else {
      console.log(`Tidak ada perubahan yang diizinkan untuk ${dataType} dengan ID ${id}`);
    }

    return updatedData;
  } catch (error) {
    console.error(`Error mengupdate ${dataType}:`, error);
    throw error;
  }
};

// Fungsi untuk menampilkan popup editData
const showEditPopup = (id, type, currentData, parentId = null, subParentId = null) => {
  const typeName = getTypeName(type);
  const editPopup = document.createElement('div');
  editPopup.classList.add('edit-popup');

  let formContent = '';
  for (const key in currentData) {
    if (key !== 'id' && key !== 'userId') {
      // Periksa apakah field ini harus dikecualikan dari pengeditan
      const isExcluded = (
        (type === 'dailyActivities' && (key === 'date' || key === 'completed')) ||
        (type === 'weeklyPlans' && (key === 'createdAt' || key === 'completed')) ||
        (type === 'reminders' && (key === 'timeZone' || key === 'notificationSent')) ||
        (type === 'subActivities' && key === 'completed') ||
        (type === 'tasks' && key === 'completed')
      );

      if (!isExcluded) {
        let label = key;
        let inputType = 'text';
        let inputContent = '';

        // Menyesuaikan label dan tipe input
        switch(key) {
          case 'name':
            label = `Nama ${typeName}`;
            break;
          case 'duration':
            if (type === 'weeklyPlans') {
              label = 'Durasi';
              inputType = 'select';
              inputContent = `
                <select id="edit-${key}">
                  <option value="1" ${currentData[key] == 1 ? 'selected' : ''}>1 minggu</option>
                  <option value="2" ${currentData[key] == 2 ? 'selected' : ''}>2 minggu</option>
                </select>
              `;
            }
            break;
          case 'amount':
            inputType = 'number';
            break;
        }

        if (inputType === 'select') {
          formContent += `
            <div>
              <label for="edit-${key}">${label}:</label>
              ${inputContent}
            </div>
          `;
        } else {
          formContent += `
            <div>
              <label for="edit-${key}">${label}:</label>
              <input type="${inputType}" id="edit-${key}" value="${currentData[key]}">
            </div>
          `;
        }
      }
    }
  }

  editPopup.innerHTML = `
    <div class="edit-popup-content">
      <h3>Edit ${typeName}</h3>
      <form id="edit-form">
        ${formContent}
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
    const updatedFields = {};
    for (const key in currentData) {
      if (key !== 'id' && key !== 'userId') {
        const input = document.getElementById(`edit-${key}`);
        if (input && !input.disabled) {
          if (input.type === 'checkbox') {
            updatedFields[key] = input.checked;
          } else if (input.type === 'number') {
            updatedFields[key] = parseFloat(input.value);
          } else if (input.tagName.toLowerCase() === 'select') {
            updatedFields[key] = parseInt(input.value);
          } else {
            updatedFields[key] = input.value.trim();
          }
        }
      }
    }

    try {
      await editData(type, id, updatedFields, parentId, subParentId);
      document.body.removeChild(editPopup);
    } catch (error) {
      console.error('Error saat menyimpan perubahan:', error);
      alert('Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.');
    }
  });

  cancelEditButton.addEventListener('click', () => {
    document.body.removeChild(editPopup);
  });
};

// Fungsi untuk mendapatkan nama tipe data
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
    case 'subActivities':
      return 'Sub-aktivitas';
    case 'subWeeklyPlans':
      return 'Sub-rencana';
    case 'tasks':
      return 'Tugas';
    default:
      return 'Item';
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
      const unsubscribe = onSnapshot(subActivitiesRef, (snapshot) => {
        const subActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        renderSubActivities(activityElement, subActivities);
      });
      
      // Store the unsubscribe function to clean up later if needed
      activityElement.setAttribute('data-unsubscribe', unsubscribe);
    };
    
    // Tambahkan template untuk form task
    const taskTemplate = document.createElement('template');
    taskTemplate.id = 'task-template';
    taskTemplate.innerHTML = `
      <form class="task-form">
        <input type="text" class="task-input" placeholder="Tambah tugas baru">
        <button type="submit">Tambah Tugas</button>
      </form>
      <ul class="task-list"></ul>
    `;
    document.body.appendChild(taskTemplate);

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
        // Remove active class from all buttons
        appButtons.forEach(btn => btn.classList.remove('active'));
        // Add active class to clicked button
        button.classList.add('active');

        // Hide all sections
        appSections.forEach(section => {
          section.classList.remove('visible');
          setTimeout(() => {
            section.style.display = 'none';
          }, 300);
        });

        // Show selected section
        const targetId = button.getAttribute('data-target');
        const targetSection = document.getElementById(targetId);
        setTimeout(() => {
          targetSection.style.display = 'block';
          setTimeout(() => {
            targetSection.classList.add('visible');
          }, 50);
        }, 300);
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

    // Load expenses and incomes
    await loadExpensesAndIncomes(userDocRef);
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
  
            // Check if a sub-activity with the same name already exists
            const existingSubActivity = await getDocs(query(subActivitiesRef, where("name", "==", subActivityName)));
  
            if (existingSubActivity.empty) {
              // If no existing sub-activity with the same name, add a new one
              await addDoc(subActivitiesRef, {
                name: subActivityName
              });
  
              subActivityInput.value = '';
            } else {
              console.log('Sub-activity with this name already exists');
              // Optionally, you can show an error message to the user
            }
          } catch (error) {
            console.error('Error adding sub-activity:', error);
          }
        }
      }
    }
  });
});

dailyActivitiesForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const activityName = dailyActivitiesInput.value;
  const activityDate = dailyActivitiesDate.value;

  const success = await addDailyActivity(activityName, activityDate);

  if (success) {
    dailyActivitiesInput.value = '';
    dailyActivitiesDate.value = 'today';
  }
});

budgetForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const budgetName = budgetInput.value;
  const budgetMonthValue = budgetMonth.value;
  const budgetAmountValue = budgetAmount.value;

  if (budgetName.trim() && budgetAmountValue) {
    try {
      await addBudget(budgetName, budgetMonthValue, parseFloat(budgetAmountValue));
      budgetInput.value = '';
      budgetMonth.value = 'Januari';
      budgetAmount.value = '';
    } catch (error) {
      console.error('Error adding budget:', error);
    }
  }
});

reminderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const reminderName = reminderInput.value;
  const reminderDateValue = reminderDate.value;
  const reminderTimeValue = reminderTime.value;

  if (reminderName.trim()) {
    try {
      await addReminder(reminderName, reminderDateValue, reminderTimeValue);
      reminderInput.value = '';
      reminderDate.value = '';
      reminderTime.value = '';
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  }
});

// Fungsi deleteData yang diperbarui
const deleteData = async (dataType, dataId, parentId, subParentId) => {
  console.log('Deleting:', { dataType, dataId, parentId, subParentId, userId });
  try {
    const docRef = getDocRef(dataType, dataId, parentId, subParentId);
    console.log('Document reference:', docRef.path);
    await deleteDoc(docRef);
    console.log(`${dataType} dengan ID ${dataId} berhasil dihapus`);
    
    // Tambahkan delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Periksa apakah dokumen masih ada
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      console.log('Dokumen berhasil dihapus dan tidak ada lagi');
    } else {
      console.warn('Dokumen masih ada setelah dihapus, mungkin karena caching');
    }
  } catch (error) {
    console.error(`Error deleting ${dataType}:`, error);
    if (error.code === 'permission-denied') {
      console.error('Error izin saat menghapus dokumen:', error);
      // Periksa apakah dokumen masih ada
      try {
        const docRef = getDocRef(dataType, dataId, parentId, subParentId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
          console.log('Dokumen sudah terhapus meskipun ada error izin');
          // Mungkin Anda ingin memperbarui UI di sini
        } else {
          console.warn('Dokumen masih ada setelah mencoba menghapus');
        }
      } catch (checkError) {
        console.error('Error saat memeriksa dokumen setelah error izin:', checkError);
      }
    }
    throw error;
  }
};

// Fungsi getDocRef yang diperbarui
const getDocRef = (dataType, dataId, parentId, subParentId) => {
  if (!userId) {
    throw new Error('User ID is not set. User might not be authenticated.');
  }
  const userDocRef = doc(db, "users", userId);
  switch (dataType) {
    case 'dailyActivities':
    case 'weeklyPlans':
    case 'budget':
    case 'expenses':
    case 'incomes':
    case 'reminders':
      return doc(userDocRef, dataType, dataId);
    case 'subActivities':
      return doc(userDocRef, "dailyActivities", parentId, "subActivities", dataId);
    case 'subWeeklyPlans':
      return doc(userDocRef, "weeklyPlans", parentId, "subWeeklyPlans", dataId);
    case 'tasks':
      return doc(userDocRef, "dailyActivities", parentId, "subActivities", subParentId, "tasks", dataId);
    default:
      throw new Error(`Tipe data tidak dikenal: ${dataType}`);
  }
};

// Event listener untuk tombol edit
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('edit-btn')) {
    const dataType = e.target.getAttribute('data-type');
    const dataId = e.target.getAttribute('data-id');
    const parentId = e.target.getAttribute('data-parent-id');
    const subParentId = e.target.getAttribute('data-sub-parent-id');

    console.log('Edit button clicked:', { dataType, dataId, parentId, subParentId });

    try {
      await checkAuth(); // Pastikan user terautentikasi sebelum mengedit
      const docRef = getDocRef(dataType, dataId, parentId, subParentId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const currentData = docSnap.data();
        showEditPopup(dataId, dataType, currentData, parentId, subParentId);
      } else {
        console.log('Dokumen tidak ditemukan');
      }
    } catch (error) {
      console.error('Error in editData:', error);
      // Handle error appropriately, maybe show a message to the user
    }
  }
});

// Event listener untuk tombol delete yang diperbarui
document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('delete-btn')) {
    const dataType = e.target.getAttribute('data-type');
    const dataId = e.target.getAttribute('data-id');
    const parentId = e.target.getAttribute('data-parent-id');
    const subParentId = e.target.getAttribute('data-sub-parent-id');

    console.log('Delete button clicked:', { dataType, dataId, parentId, subParentId });

    try {
      await checkAuth(); // Pastikan user terautentikasi sebelum menghapus
      await deleteData(dataType, dataId, parentId, subParentId);
    } catch (error) {
      console.error('Error in deleteData:', error);
      // Handle error appropriately, maybe show a message to the user
    }
  }
});

// 1. Deklarasi Variabel Global
const publicVapidKey = 'BKgrl4UTlsunc8_A1RQLkdVohqqLAuRcit1hRk3BnQBly9ScUO839i0zmerOHd7jX_w5AiIAMTdyhn695UniPTg';

// 2. Fungsi Utilitas
function convertBase64ToUint8Array(base64String) {
    console.debug('Mengonversi Vapid Key dari Base64 ke Uint8Array...');
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    console.debug('Konversi Vapid Key selesai:', outputArray);
    return outputArray;
}

// 3. Fungsi untuk Meminta Izin Notifikasi
async function requestNotificationPermission() {
    const permission = Notification.permission;

    if (permission === 'granted') {
        return true;
    } else if (permission === 'denied') {
        console.warn('Izin notifikasi telah ditolak oleh pengguna.');
        return false;
    } else {
        console.debug('Meminta izin notifikasi kepada pengguna...');
        const newPermission = await Notification.requestPermission();
        console.debug('Hasil permintaan izin:', newPermission);
        return newPermission === 'granted';
    }
}

// 4. Fungsi untuk Mendaftar dan Mengatur Subscription
async function registerServiceWorkerAndSubscribe() {
    try {
        const registration = await navigator.serviceWorker.register('/js/push-notification.js', {
            scope: '/js/'
        });
        await registration.update();
        let pushSubscription = await registration.pushManager.getSubscription();

        if (!pushSubscription) {
            console.debug('Push subscription belum ada, melakukan subscribe...');
            pushSubscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertBase64ToUint8Array(publicVapidKey)
            });

            if (pushSubscription) {
                console.debug('Push subscription baru berhasil dibuat:', pushSubscription);
            } else {
                console.error('Push subscription tidak berhasil dibuat.');
                throw new Error('Failed to create push subscription.');
            }
        } else {
          // push subscription sudah ada
        }

        return pushSubscription;
    } catch (error) {
        console.error('Terjadi kesalahan saat mendaftarkan atau berlangganan push notification:', error);
        throw error;
    }
}

// 5. Fungsi untuk Mengirim Push Notification
async function sendPushNotification(subscription, reminderId, userId, reminderName) {
    try {
        console.debug(`Mengirim push notification untuk pengingat: ${reminderName}...`);
        console.debug('Data yang akan dikirim ke server:', {
            subscription: subscription,
            title: 'Pengingat!',
            message: `Waktunya untuk: ${reminderName}`,
            reminderId: reminderId,
            userId: userId
        });

        const response = await fetch('http://185.81.29.87:3000/send-notification', {
            method: 'POST',
            body: JSON.stringify({
                subscription: subscription,
                title: 'Pengingat!',
                message: `Waktunya untuk: ${reminderName}`,
                reminderId: reminderId,  // Tambahkan reminderId
                userId: userId            // Tambahkan userId
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.debug('Status response dari server:', response.status);
        if (response.ok) {
            console.debug('Push notification berhasil dikirim.');
        } else {
            const responseText = await response.text();
            console.error('Gagal mengirim push notification:', response.statusText, responseText);
        }
    } catch (error) {
        console.error('Terjadi kesalahan dalam proses pengiriman push notification:', error);
    }
}

// 6. Fungsi untuk Memantau Pengingat
const monitorReminders = (pushSubscription) => {
    const remindersRef = collection(db, "users", userId, "reminders");

    onSnapshot(remindersRef, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added') {
                const reminder = change.doc.data();
                const reminderId = change.doc.id;

                // Cek apakah push notification sudah dikirim
                if (!reminder.notificationSent) {
                    console.debug('Push notification belum dikirim untuk pengingat ini.');
                    if (pushSubscription) {
                        console.debug('Push subscription tersedia, mengirim notifikasi...');
                        await sendPushNotification(pushSubscription, reminderId, userId, reminder.name);

                        // Setelah notifikasi berhasil dikirim, perbarui field notificationSent
                        const reminderDocRef = doc(db, "users", userId, "reminders", reminderId);
                        await updateDoc(reminderDocRef, {
                            notificationSent: true
                        });
                        console.debug(`Field notificationSent diperbarui untuk pengingat ${reminder.name}`);
                    } else {
                        console.debug('Push subscription tidak tersedia.');
                    }
                } else {
                    // Push notification sudah dikirim sebelumnya untuk pengingat ini
                }
            }
        });
    });
};

// 7. Fungsi untuk Autentikasi dan Inisialisasi
checkAuth().then(async () => {
    checkExpiredWeeklyPlans();

    if ('serviceWorker' in navigator) {
        try {
            const permissionGranted = await requestNotificationPermission();
            if (!permissionGranted) {
                console.warn('Izin notifikasi tidak diberikan oleh pengguna. Menghentikan proses.');
                return;
            }

            let pushSubscription = await registerServiceWorkerAndSubscribe();
            if (pushSubscription) {
                monitorReminders(pushSubscription);
            } else {
                console.error('Push subscription tidak tersedia setelah inisialisasi.');
            }
        } catch (error) {
            console.error('Kesalahan saat melakukan inisialisasi push subscription:', error);
        }
    }
}).catch(console.error);