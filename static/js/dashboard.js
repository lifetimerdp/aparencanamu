import { auth, db, messaging } from "./firebaseConfig.js";
import { getDocs, addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import "./auth.js";
import { renderSubActivities, addTaskForm, renderTasks, addSubActivityForm, checkExpiredDailyActivities, addDailyActivity, initUserId } from "./dailyActivities.js";
import { renderSubWeeklyPlans, addSubWeeklyPlanForm, checkExpiredWeeklyPlans, initWeeklyPlans, renderWeeklyPlans, loadWeeklyPlans } from "./weeklyPlans.js";
import { addExpense, addIncome, addBudget, addReminder, loadExpensesAndIncomes } from "./financialManagement.js";
const CONFIG = {
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
  forms: {
    dailyActivities: document.getElementById("daily-activities-form"),
    budget: document.getElementById("budget-form"),
    expense: document.getElementById("expense-form"),
    income: document.getElementById("income-form"),
    reminder: document.getElementById("reminder-form")
  },
  inputs: {
    dailyActivities: {
      name: document.getElementById("daily-activities-input"),
      date: document.getElementById("daily-activities-date")
    },
    budget: {
      name: document.getElementById("budget-input"),
      month: document.getElementById("budget-month"),
      amount: document.getElementById("budget-amount")
    },
    expense: {
      name: document.getElementById("expense-input"),
      category: document.getElementById("expense-category"),
      amount: document.getElementById("expense-amount")
    },
    income: {
      name: document.getElementById("income-input"),
      category: document.getElementById("income-category"),
      amount: document.getElementById("income-amount")
    },
    reminder: {
      name: document.getElementById("reminder-input"),
      date: document.getElementById("reminder-date"),
      time: document.getElementById("reminder-time")
    }
  }
};
export let userId = null;
const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
};
export const checkAuth = () => {
    return new Promise((resolve, reject) => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                userId = user.uid;
                try {
                    resolve(user);
                } catch (error) {
                    console.error("Error checking expired daily activities:", error);
                    reject(error);
                }
            } else {
                userId = null;
                reject("Tidak ada pengguna yang login.");
            }
        });
    });
};
// Helper function untuk membuat elemen list item
const createListItem = (item, dataType, parentId = null, subParentId = null) => {
  const li = document.createElement("li");
  let content = item.name;

  // Tambahkan format khusus berdasarkan tipe data
  if (dataType === "expenses" || dataType === "incomes" || dataType === "budget") {
    content += ` - ${formatRupiah(item.amount)}`;
  } else if (dataType === "dailyActivities") {
    const dateToShow = formatDate(item.date);
    content += ` - ${dateToShow}`;
  }

  li.setAttribute("data-id", item.id);
  li.innerHTML = `
    <div class="item-content">
      <span class="item-name">${content}</span>
      <div class="item-actions">
        <button class="edit-btn" 
          data-id="${item.id}" 
          data-name="${item.name}" 
          data-type="${dataType}" 
          data-parent-id="${parentId || ""}" 
          data-sub-parent-id="${subParentId || ""}">
          Edit
        </button>
        <button class="delete-btn" 
          data-id="${item.id}" 
          data-type="${dataType}">
          Hapus
        </button>
      </div>
    </div>
  `;

  // Tambahkan form sub-activity atau sub-weekly-plan jika diperlukan
  if (dataType === "dailyActivities") {
    addSubActivityForm(li, item);
  } else if (dataType === "weeklyPlans") {
    addSubWeeklyPlanForm(li, item);
  }

  return li;
};
export const renderList = (listElement, items, dataType, parentId = null, subParentId = null) => {
  if (!listElement) return;
  listElement.innerHTML = "";

  const createListItem = (item, groupKey = "") => {
    const li = document.createElement("li");
    let content = item.name;

    // Add additional content based on data type
    if (["expenses", "incomes", "budget"].includes(dataType)) {
      content += ` - ${formatRupiah(item.amount)}`;
    } else if (dataType === "dailyActivities") {
      const dateToShow = formatDate(item.date);
      content += ` - ${dateToShow}`;
    }

    li.setAttribute("data-id", item.id);
    li.innerHTML = `
      <div class="item-content">
        <span class="item-name">${content}</span>
        <div class="item-actions">
          <button class="edit-btn" 
            data-id="${item.id}" 
            data-name="${item.name}" 
            data-type="${dataType}" 
            data-parent-id="${parentId || ""}" 
            data-sub-parent-id="${subParentId || ""}">Edit</button>
          <button class="delete-btn" 
            data-id="${item.id}" 
            data-type="${dataType}">Hapus</button>
        </div>
      </div>`;

    // Add form handlers for specific data types
    if (dataType === "dailyActivities") {
      addSubActivityForm(li, item);
    } else if (dataType === "weeklyPlans") {
      addSubWeeklyPlanForm(li, item);
    }

    return li;
  };

  const formatDate = (date) => {
    if (date === "Hari Ini") {
      const today = new Date();
      return `${today.getDate()} ${CONFIG.months[today.getMonth()]} ${today.getFullYear()}`;
    } else if (date === "Besok") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return `${tomorrow.getDate()} ${CONFIG.months[tomorrow.getMonth()]} ${tomorrow.getFullYear()}`;
    }
    return date;
  };

  const formatDateToIndonesian = (date) => {
    const [year, monthIndex, day] = date.split("-");
    const month = CONFIG.months[parseInt(monthIndex, 10) - 1];
    return `${parseInt(day, 10)} ${month} ${year}`;
  };

  // Handle grouped items (reminders, budget, weeklyPlans)
  if (["reminders", "budget", "weeklyPlans"].includes(dataType)) {
    const groupedItems = items.reduce((grouped, item) => {
      let groupKey;
      if (dataType === "reminders") {
        groupKey = formatDateToIndonesian(item.date);
      } else if (dataType === "budget") {
        groupKey = item.month;
      } else if (dataType === "weeklyPlans") {
        groupKey = `${item.createdAt} - ${item.endDate}`;
      }

      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(item);
      return grouped;
    }, {});

    // Render grouped items
    Object.entries(groupedItems).forEach(([groupKey, groupItems]) => {
      const header = document.createElement("h3");
      header.textContent = groupKey;
      listElement.appendChild(header);

      groupItems.forEach(item => {
        listElement.appendChild(createListItem(item, groupKey));
      });
    });
  } else {
    // Render ungrouped items
    items.forEach(item => {
      listElement.appendChild(createListItem(item));
    });
  }
};
// Helper function to handle form submissions
const handleFormSubmission = async (formData) => {
  const { 
    formType, 
    nameInput, 
    categoryInput = null, 
    amountInput = null, 
    monthInput = null, 
    dateInput = null,
    timeInput = null 
  } = formData;

  if (!nameInput.trim()) {
    alert(`Mohon isi nama ${getTypeName(formType).toLowerCase()}.`);
    return false;
  }

  try {
    let success = false;
    switch (formType) {
      case 'incomes':
        if (!categoryInput?.trim() || !amountInput) {
          alert('Mohon isi semua field pendapatan.');
          return false;
        }
        success = await addIncome(nameInput, categoryInput, parseFloat(amountInput));
        break;

      case 'expenses': 
        if (!categoryInput?.trim() || !amountInput) {
          alert('Mohon isi semua field pengeluaran.');
          return false;
        }
        success = await addExpense(nameInput, categoryInput, parseFloat(amountInput));
        break;

      case 'budget':
        if (!monthInput?.trim() || !amountInput) {
          alert('Mohon isi semua field anggaran.');
          return false;
        }
        success = await addBudget(nameInput, monthInput, parseFloat(amountInput));
        break;

      case 'reminders':
        if (!dateInput?.trim() || !timeInput?.trim()) {
          alert('Mohon isi semua field pengingat.');
          return false;
        }
        success = await addReminder(nameInput, dateInput, timeInput);
        break;

      case 'dailyActivities':
        if (!dateInput?.trim()) {
          alert('Mohon isi tanggal aktivitas.');
          return false;
        }
        success = await addDailyActivity(nameInput, dateInput);
        break;

      default:
        console.error('Form type tidak dikenali:', formType);
        return false;
    }

    if (success) {
      // Clear form inputs
      const inputs = {
        nameInput: '',
        categoryInput: categoryInput ? '' : null,
        amountInput: amountInput ? '' : null,
        monthInput: monthInput ? 'Januari' : null,
        dateInput: dateInput ? (formType === 'dailyActivities' ? 'today' : '') : null,
        timeInput: timeInput ? '' : null
      };

      return inputs;
    }

    return false;

  } catch (error) {
    console.error(`Error adding ${formType}:`, error);
    alert(`Terjadi kesalahan saat menambahkan ${getTypeName(formType).toLowerCase()}. Silakan coba lagi.`);
    return false;
  }
};
// Event handler setup function
const setupFormHandler = (formElement, formType) => {
  formElement.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nameInput = formElement.querySelector(`#${formType}-input`);
    const categoryInput = formElement.querySelector(`#${formType}-category`);
    const amountInput = formElement.querySelector(`#${formType}-amount`);
    const monthInput = formElement.querySelector(`#${formType}-month`);
    const dateInput = formElement.querySelector(`#${formType}-date`);
    const timeInput = formElement.querySelector(`#${formType}-time`);

    const formData = {
      formType,
      nameInput: nameInput.value,
      categoryInput: categoryInput?.value,
      amountInput: amountInput?.value,
      monthInput: monthInput?.value,
      dateInput: dateInput?.value,
      timeInput: timeInput?.value
    };

    const clearedInputs = await handleFormSubmission(formData);

    if (clearedInputs) {
      // Clear all inputs that exist
      nameInput.value = clearedInputs.nameInput;
      if (categoryInput) categoryInput.value = clearedInputs.categoryInput;
      if (amountInput) amountInput.value = clearedInputs.amountInput;
      if (monthInput) monthInput.value = clearedInputs.monthInput;
      if (dateInput) dateInput.value = clearedInputs.dateInput;
      if (timeInput) timeInput.value = clearedInputs.timeInput;
    }
  });
};
const setupFormHandlers = () => {
  Object.entries(CONFIG.forms).forEach(([formType, form]) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = getFormData(formType);
      const success = await handleFormSubmission(formData);
      if (success) {
        clearFormInputs(formType);
      }
    });
  });
};
const editData = async (dataType, id, updatedFields, parentId = null, subParentId = null) => {
    try {
        const user = await checkAuth();
        if (!user) throw new Error("User tidak terautentikasi");
        let docRef;
        const userDocRef = doc(db, "users", user.uid);
        switch (dataType) {
            case "dailyActivities":
            case "weeklyPlans":
            case "budget":
            case "expenses":
            case "incomes":
            case "reminders":
                docRef = doc(userDocRef, dataType, id);
                break;
            case "subActivities":
                if (!parentId) throw new Error("parentId diperlukan untuk subActivities");
                docRef = doc(userDocRef, "dailyActivities", parentId, "subActivities", id);
                break;
            case "subWeeklyPlans":
                if (!parentId) throw new Error("parentId diperlukan untuk subWeeklyPlans");
                docRef = doc(userDocRef, "weeklyPlans", parentId, "subWeeklyPlans", id);
                break;
            case "tasks":
                if (!parentId || !subParentId) throw new Error("parentId dan subParentId diperlukan untuk tasks");
                docRef = doc(userDocRef, "dailyActivities", parentId, "subActivities", subParentId, "tasks", id);
                break;
            default:
                throw new Error(`Tipe data tidak dikenal: ${dataType}`);
        }
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            throw new Error(`Dokumen dengan ID ${id} tidak ditemukan`);
        }
        const currentData = docSnap.data();
        const updatedData = { ...currentData, ...updatedFields };
        if (dataType === "weeklyPlans" && updatedFields.duration !== undefined) {
            const createdAtDate = new Date(currentData.createdAt.split(" ").reverse().join("-"));
            const endDate = new Date(createdAtDate);
            endDate.setDate(endDate.getDate() + updatedFields.duration * 7 - 1);
            updatedData.endDate = `${endDate.getDate()} ${CONFIG.months[endDate.getMonth()]} ${endDate.getFullYear()}`;
        }
        const hasChanges = Object.keys(updatedFields).some((key) => {
            const isAllowedToChange = !(
                (dataType === "dailyActivities" && (key === "date" || key === "completed")) ||
                (dataType === "weeklyPlans" && (key === "createdAt" || key === "completed")) ||
                (dataType === "reminders" && (key === "timeZone" || key === "notificationSent"))
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
function showEditPopup(id, type, currentData, parentId, subParentId) {
  const typeName = getTypeName(type);
  const editPopup = document.createElement('div');
  editPopup.classList.add('edit-popup');
  editPopup.style.position = 'fixed';
  editPopup.style.top = '50%';
  editPopup.style.left = '50%';
  editPopup.style.transform = 'translate(-50%, -50%)';
  editPopup.style.backgroundColor = 'white';
  editPopup.style.padding = '20px';
  editPopup.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
  editPopup.style.zIndex = '1000';

  let formContent = '';
  const order = getOrderForType(type);

  order.forEach(key => {
    if (currentData.hasOwnProperty(key) && key !== 'id' && key !== 'userId') {
      const isExcluded = (
        (type === 'dailyActivities' && key === 'completed') ||
        (type === 'tasks' && key === 'completed') ||
        (type === 'weeklyPlans' && key === 'completed') ||
        (type === 'incomes' && (key === 'date' || key === 'notes')) ||
        (type === 'reminders' && (key === 'timeZone' || key === 'notificationSent'))
      );

      if (!isExcluded) {
        let label = getLabelForKey(key, type);
        let inputContent = '';

        switch (key) {
          case 'duration':
            if (type === 'weeklyPlans') {
              inputContent = `
                <select id="edit-${key}">
                  <option value="1" ${currentData[key] === 1 ? 'selected' : ''}>1 Minggu</option>
                  <option value="2" ${currentData[key] === 2 ? 'selected' : ''}>2 Minggu</option>
                  <option value="3" ${currentData[key] === 3 ? 'selected' : ''}>3 Minggu</option>
                </select>
              `;
            }
            break;

          case 'category':
            if (type === 'incomes') {
              inputContent = `
                <select id="edit-${key}" class="category-selector" data-current-value="${currentData[key]}">
                  <option value="Gaji" ${currentData[key] === 'Gaji' ? 'selected' : ''}>Gaji</option>
                  <option value="Passive income" ${currentData[key] === 'Passive income' ? 'selected' : ''}>Passive income</option>
                  <option value="Uang kos-kosan" ${currentData[key] === 'Uang kos-kosan' ? 'selected' : ''}>Uang kos-kosan</option>
                  <option value="custom">Tulis kategori kustom</option>
                </select>
                <input type="text" id="custom-${key}" class="custom-category" 
                       style="display: ${!['Gaji', 'Passive income', 'Uang kos-kosan'].includes(currentData[key]) ? 'block' : 'none'}" 
                       value="${!['Gaji', 'Passive income', 'Uang kos-kosan'].includes(currentData[key]) ? currentData[key] : ''}"
                       placeholder="Tulis kategori kustom">
              `;
            } else if (type === 'expenses') {
              inputContent = `
                <select id="edit-${key}" class="category-selector" data-current-value="${currentData[key]}">
                  <option value="Uang jajan" ${currentData[key] === 'Uang jajan' ? 'selected' : ''}>Uang jajan</option>
                  <option value="Bayar apartemen" ${currentData[key] === 'Bayar apartemen' ? 'selected' : ''}>Bayar apartemen</option>
                  <option value="Uang spend bulanan" ${currentData[key] === 'Uang spend bulanan' ? 'selected' : ''}>Uang spend bulanan</option>
                  <option value="Uang kebutuhan bulanan" ${currentData[key] === 'Uang kebutuhan bulanan' ? 'selected' : ''}>Uang kebutuhan bulanan</option>
                  <option value="custom">Tulis kategori kustom</option>
                </select>
                <input type="text" id="custom-${key}" class="custom-category" 
                       style="display: ${!['Uang jajan', 'Bayar apartemen', 'Uang spend bulanan', 'Uang kebutuhan bulanan'].includes(currentData[key]) ? 'block' : 'none'}" 
                       value="${!['Uang jajan', 'Bayar apartemen', 'Uang spend bulanan', 'Uang kebutuhan bulanan'].includes(currentData[key]) ? currentData[key] : ''}"
                       placeholder="Tulis kategori kustom">
              `;
            }
            break;

          case 'amount':
            inputContent = `
              <div class="amount-input-wrapper" style="position: relative;">
                <span style="position: absolute; left: 8px; top: 40%; transform: translateY(-50%);">Rp.</span>
                <input type="text" id="edit-${key}" value="${formatNumber(currentData[key])}" 
                       style="padding-left: 40px;"
                       oninput="this.value = formatNumberInput(this.value)">
              </div>
            `;
            break;

          case 'date':
            if (type === 'reminders') {
              inputContent = `<input type="date" id="edit-${key}" value="${currentData[key]}">`;
            }
            break;

          case 'time':
            if (type === 'reminders') {
              const timeZoneLabel = getTimeZoneLabel(currentData.timeZone || 'Asia/Makassar');
              label = `${label} (${timeZoneLabel})`;
              inputContent = `<input type="time" id="edit-${key}" value="${currentData[key]}">`;
            }
            break;

          case 'month':
            if (type === 'budget') {
              inputContent = `
                <select id="edit-${key}">
                  ${CONFIG.months.map(month => `
                    <option value="${month}" ${currentData[key] === month ? 'selected' : ''}>${month}</option>
                  `).join('')}
                </select>
              `;
            }
            break;

          default:
            inputContent = `<input type="text" id="edit-${key}" value="${currentData[key]}">`;
        }

        if (inputContent) {
          formContent += `
            <div class="form-group">
              <label for="edit-${key}">${label}:</label>
              ${inputContent}
            </div>
          `;
        }
      }
    }
  });

  editPopup.innerHTML = `
    <div class="edit-popup-content">
      <h3>Edit ${typeName}</h3>
      <form id="edit-form">
        ${formContent}
        <div class="button-group">
          <button type="submit">Simpan</button>
          <button type="button" id="cancel-edit">Batal</button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(editPopup);

  // Handle category selector changes
  const categorySelectors = editPopup.querySelectorAll('.category-selector');
  categorySelectors.forEach(selector => {
    const currentValue = selector.getAttribute('data-current-value');
    const customInput = selector.parentElement.querySelector('.custom-category');
    
    // Set initial state
    if (customInput && !['Gaji', 'Passive income', 'Uang kos-kosan', 'Uang jajan', 'Bayar apartemen', 'Uang spend bulanan', 'Uang kebutuhan bulanan'].includes(currentValue)) {
      selector.value = 'custom';
      customInput.style.display = 'block';
      customInput.value = currentValue;
    } else {
      selector.value = currentValue;
    }

    selector.addEventListener('change', (e) => {
      if (customInput) {
        customInput.style.display = e.target.value === 'custom' ? 'block' : 'none';
        if (e.target.value !== 'custom') {
          customInput.value = '';
        }
      }
    });
  });

  function getTimeZoneLabel(timeZone) {
    const timeZoneMap = {
      'Asia/Jakarta': 'WIB',
      'Asia/Makassar': 'WITA',
      'Asia/Jayapura': 'WIT'
    };
    return timeZoneMap[timeZone] || 'WITA';
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function formatNumberInput(value) {
    value = value.replace(/\./g, '').replace(/[^\d]/g, '');
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  window.formatNumberInput = formatNumberInput;

  const cancelButton = editPopup.querySelector('#cancel-edit');
  cancelButton.addEventListener('click', () => {
    document.body.removeChild(editPopup);
  });

  const editForm = editPopup.querySelector('#edit-form');
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const updatedFields = {};

    order.forEach(key => {
      if (currentData.hasOwnProperty(key) && key !== 'id' && key !== 'userId') {
        const input = document.getElementById(`edit-${key}`);
        if (input && !input.disabled) {
          if (key === 'category') {
            const customInput = document.getElementById(`custom-${key}`);
            updatedFields[key] = input.value === 'custom' ? customInput.value : input.value;
          } else if (key === 'amount') {
            updatedFields[key] = parseFloat(input.value.replace(/\./g, ''));
          } else if (key === 'duration') {
            updatedFields[key] = parseInt(input.value);
          } else {
            updatedFields[key] = input.value.trim();
          }
        }
      }
    });

    try {
      await editData(type, id, updatedFields, parentId, subParentId);
      document.body.removeChild(editPopup);
      alert('Perubahan berhasil disimpan');
    } catch (error) {
      console.error('Error saat menyimpan perubahan:', error);
      alert('Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.');
    }
  });
}

// Helper functions
function getOrderForType(type) {
  switch (type) {
    case 'dailyActivities':
      return ['name', 'date'];
    case 'weeklyPlans':
      return ['name', 'duration'];
    case 'incomes':
      return ['name', 'category', 'amount'];
    case 'expenses':
      return ['name', 'category', 'amount'];
    case 'reminders':
      return ['name', 'date', 'time'];
    case 'budget':
      return ['name', 'month', 'amount'];
    default:
      return ['name'];
  }
}

function getLabelForKey(key, type) {
  switch (key) {
    case 'name':
      return `Nama ${getTypeName(type)}`;
    case 'date':
      return 'Tanggal';
    case 'time':
      return 'Waktu';
    case 'duration':
      return 'Durasi';
    case 'category':
      return 'Kategori';
    case 'amount':
      return 'Jumlah';
    case 'month':
      return 'Bulan';
    default:
      return key.charAt(0).toUpperCase() + key.slice(1);
  }
}
const getTypeName = (type) => {
    switch (type) {
        case "dailyActivities":
            return "Aktivitas Harian";
        case "weeklyPlans":
            return "Rencana Mingguan";
        case "budget":
            return "Anggaran";
        case "expenses":
            return "Pengeluaran";
        case "incomes":
            return "Pendapatan";
        case "reminders":
            return "Pengingat";
        case "subActivities":
            return "Sub-aktivitas";
        case "subWeeklyPlans":
            return "Sub-rencana";
        case "tasks":
            return "Tugas";
        default:
            return "Item";
    }
};
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await initUserId();
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await checkAuth();
        const userDocRef = doc(db, "users", user.uid);
        setupFormHandlers();
        const loadAndRenderSubActivities = (activityElement, activityId) => {
            if (!activityId) {
                console.error("Activity ID is null or undefined.");
                return;
            }
            const subActivitiesRef = collection(doc(db, "users", userId, "dailyActivities", activityId), "subActivities");
            const unsubscribe = onSnapshot(subActivitiesRef, (snapshot) => {
                const subActivities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
                renderSubActivities(activityElement, subActivities);
            });
            activityElement.setAttribute("data-unsubscribe", unsubscribe);
        };
        const taskTemplate = document.createElement("template");
        taskTemplate.id = "task-template";
        taskTemplate.innerHTML = `

      <form class="task-form">

        <input type="text" class="task-input" placeholder="Tambah tugas baru">

        <button type="submit">Tambah Tugas</button>

      </form>

      <ul class="task-list"></ul>

    `;
        document.body.appendChild(taskTemplate);
        await checkExpiredDailyActivities();
        const dailyActivitiesRef = collection(userDocRef, "dailyActivities");
        onSnapshot(dailyActivitiesRef, (snapshot) => {
            const dailyActivities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            renderList(document.getElementById("daily-activities-list"), dailyActivities, "dailyActivities");
        });
        const weeklyPlansRef = collection(userDocRef, "weeklyPlans");
        onSnapshot(weeklyPlansRef, (snapshot) => {
            const weeklyPlans = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            renderList(document.getElementById("weekly-plans-list"), weeklyPlans, "weeklyPlans");
        });
        const budgetRef = collection(userDocRef, "budget");
        onSnapshot(budgetRef, (snapshot) => {
            const budget = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            renderList(document.getElementById("budget-list"), budget, "budget");
        });
        const remindersRef = collection(userDocRef, "reminders");
        onSnapshot(remindersRef, (snapshot) => {
            const reminders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            renderList(document.getElementById("reminders-list"), reminders, "reminders");
        });
        const appButtons = document.querySelectorAll(".app-btn");
        const appSections = document.querySelectorAll(".app-section");
        appButtons.forEach((button) => {
            button.addEventListener("click", () => {
                appButtons.forEach((btn) => btn.classList.remove("active"));
                button.classList.add("active");
                appSections.forEach((section) => {
                    section.classList.remove("visible");
                    setTimeout(() => {
                        section.style.display = "none";
                    }, 300);
                });
                const targetId = button.getAttribute("data-target");
                const targetSection = document.getElementById(targetId);
                setTimeout(() => {
                    targetSection.style.display = "block";
                    setTimeout(() => {
                        targetSection.classList.add("visible");
                    }, 50);
                }, 300);
            });
        });
        const selectors = document.querySelectorAll(".selector-btn");
        const sections = document.querySelectorAll(".financial-section");
        selectors.forEach((selector) => {
            selector.addEventListener("click", () => {
                sections.forEach((section) => {
                    section.classList.add("hidden");
                });
                const targetId = selector.getAttribute("data-target");
                document.getElementById(targetId).classList.remove("hidden");
            });
        });
        await loadExpensesAndIncomes(userDocRef);
    } catch (error) {
        console.error("Error loading user data:", error);
    }
    document.addEventListener("submit", async (e) => {
        if (e.target.classList.contains("sub-activity-form")) {
            e.preventDefault();
            const liElement = e.target.closest("li");
            if (liElement) {
                const activityId = liElement.getAttribute("data-id");
                const subActivityInput = e.target.querySelector(".sub-activity-input");
                const subActivityName = subActivityInput.value.trim();
                if (subActivityName && activityId) {
                    try {
                        const user = await checkAuth();
                        if (!userId) {
                            userId = user.uid;
                        }
                        const dailyActivityRef = doc(db, "users", userId, "dailyActivities", activityId);
                        const subActivitiesRef = collection(dailyActivityRef, "subActivities");
                        const existingSubActivity = await getDocs(query(subActivitiesRef, where("name", "==", subActivityName)));
                        if (existingSubActivity.empty) {
                            await addDoc(subActivitiesRef, { name: subActivityName });
                            subActivityInput.value = "";
                        } else {
                            console.log("Sub-activity with this name already exists");
                        }
                    } catch (error) {
                        console.error("Error adding sub-activity:", error);
                    }
                }
            }
        }
    });
});
const deleteData = async (dataType, dataId, parentId, subParentId) => {
    console.log("Deleting:", { dataType, dataId, parentId, subParentId, userId });
    try {
        const docRef = getDocRef(dataType, dataId, parentId, subParentId);
        console.log("Document reference:", docRef.path);
        await deleteDoc(docRef);
        console.log(`${dataType} dengan ID ${dataId} berhasil dihapus`);
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) {
            console.log("Dokumen berhasil dihapus dan tidak ada lagi");
        } else {
            console.warn("Dokumen masih ada setelah dihapus, mungkin karena caching");
        }
    } catch (error) {
        console.error(`Error deleting ${dataType}:`, error);
        if (error.code === "permission-denied") {
            console.error("Error izin saat menghapus dokumen:", error);
            try {
                const docRef = getDocRef(dataType, dataId, parentId, subParentId);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) {
                    console.log("Dokumen sudah terhapus meskipun ada error izin");
                } else {
                    console.warn("Dokumen masih ada setelah mencoba menghapus");
                }
            } catch (checkError) {
                console.error("Error saat memeriksa dokumen setelah error izin:", checkError);
            }
        }
        throw error;
    }
};
const getDocRef = (dataType, dataId, parentId, subParentId) => {
    if (!userId) {
        throw new Error("User ID is not set. User might not be authenticated.");
    }
    const userDocRef = doc(db, "users", userId);
    switch (dataType) {
        case "dailyActivities":
        case "weeklyPlans":
        case "budget":
        case "expenses":
        case "incomes":
        case "reminders":
            return doc(userDocRef, dataType, dataId);
        case "subActivities":
            return doc(userDocRef, "dailyActivities", parentId, "subActivities", dataId);
        case "subWeeklyPlans":
            return doc(userDocRef, "weeklyPlans", parentId, "subWeeklyPlans", dataId);
        case "tasks":
            return doc(userDocRef, "dailyActivities", parentId, "subActivities", subParentId, "tasks", dataId);
        default:
            throw new Error(`Tipe data tidak dikenal: ${dataType}`);
    }
};
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
        e.preventDefault();
        const dataType = e.target.getAttribute("data-type");
        const dataId = e.target.getAttribute("data-id");
        const parentId = e.target.getAttribute("data-parent-id") || "";
        const subParentId = e.target.getAttribute("data-sub-parent-id") || "";
        console.log("Edit button clicked:", { dataType, dataId, parentId, subParentId });
        try {
            await checkAuth();
            const docRef = getDocRef(dataType, dataId, parentId, subParentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const currentData = docSnap.data();
                showEditPopup(dataId, dataType, currentData, parentId, subParentId);
            } else {
                console.log("Dokumen tidak ditemukan");
                alert("Data tidak ditemukan. Mungkin telah dihapus.");
            }
        } catch (error) {
            console.error("Error in editData:", error);
            alert("Terjadi kesalahan saat mengambil data. Silakan coba lagi.");
        }
    }
});
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("delete-btn")) {
        const dataType = e.target.getAttribute("data-type");
        const dataId = e.target.getAttribute("data-id");
        const parentId = e.target.getAttribute("data-parent-id");
        const subParentId = e.target.getAttribute("data-sub-parent-id");
        console.log("Delete button clicked:", { dataType, dataId, parentId, subParentId });
        try {
            await checkAuth();
            await deleteData(dataType, dataId, parentId, subParentId);
        } catch (error) {
            console.error("Error in deleteData:", error);
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