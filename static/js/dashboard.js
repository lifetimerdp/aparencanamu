import { auth, db, messaging } from "./firebaseConfig.js";
import { getDocs, addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc, arrayUnion, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import "./auth.js";
import { renderSubActivities, addTaskForm, renderTasks, addSubActivityForm, checkExpiredDailyActivities, addDailyActivity, initUserId } from "./dailyActivities.js";
import { renderSubWeeklyPlans, addSubWeeklyPlanForm, checkExpiredWeeklyPlans, initWeeklyPlans, renderWeeklyPlans, loadWeeklyPlans } from "./weeklyPlans.js";
import { addExpense, addIncome, addBudget, addReminder, loadExpensesAndIncomes } from "./financialManagement.js";
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const dailyActivitiesForm = document.getElementById("daily-activities-form");
const dailyActivitiesInput = document.getElementById("daily-activities-input");
const dailyActivitiesDate = document.getElementById("daily-activities-date");
const budgetForm = document.getElementById("budget-form");
const budgetInput = document.getElementById("budget-input");
const budgetMonth = document.getElementById("budget-month");
const budgetAmount = document.getElementById("budget-amount");
const expenseForm = document.getElementById("expense-form");
const expenseInput = document.getElementById("expense-input");
const expenseCategory = document.getElementById("expense-category");
const expenseAmount = document.getElementById("expense-amount");
const incomeForm = document.getElementById("income-form");
const incomeInput = document.getElementById("income-input");
const incomeCategory = document.getElementById("income-category");
const incomeAmount = document.getElementById("income-amount");
const reminderForm = document.getElementById("reminder-form");
const reminderInput = document.getElementById("reminder-input");
const reminderDate = document.getElementById("reminder-date");
const reminderTime = document.getElementById("reminder-time");
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
const PRIORITY_COLORS = {
  high: '#FF4B4B',
  medium: '#FFB23F',
  low: '#4CAF50'
};
const PRIORITY_LABELS = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah'
};
export const renderList = (listElement, items, dataType, parentId = null, subParentId = null) => {
  if (!listElement) return;
  listElement.innerHTML = "";
  
  const activeItems = items.filter(item => item.status !== 'selesai');
  
  const renderGroupedItems = (groupedItems, createHeader) => {
    Object.keys(groupedItems).forEach((groupKey) => {
      const header = createHeader(groupKey);
      listElement.appendChild(header);
      
      groupedItems[groupKey].forEach((item) => {
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
        li.style.borderLeft = `4px solid ${PRIORITY_COLORS[item.priority || 'low']}`;
        li.innerHTML = `
          <div class="item-content">
            <div class="item-left">
              <span class="item-name">${content}</span>
            </div>
            <div class="item-actions">
              <div class="priority-selector">
                <label for="priority-${item.id}" class="priority-label">Prioritas:</label>
                <select id="priority-${item.id}" class="priority-select" data-id="${item.id}" data-type="${dataType}">
                  <option value="high" ${item.priority === "high" ? "selected" : ""}>
                    ${PRIORITY_LABELS.high}
                  </option>
                  <option value="medium" ${item.priority === "medium" ? "selected" : ""}>
                    ${PRIORITY_LABELS.medium}
                  </option>
                  <option value="low" ${(item.priority === "low" || !item.priority) ? "selected" : ""}>
                    ${PRIORITY_LABELS.low}
                  </option>
                </select>
              </div>
              <button class="edit-btn" data-id="${item.id}" data-name="${item.name}" 
                data-type="${dataType}" data-parent-id="${parentId || ''}" 
                data-sub-parent-id="${subParentId || ''}">Edit</button>
              <button class="delete-btn" data-id="${item.id}" data-type="${dataType}">Hapus</button>
              <input type="checkbox" 
                class="status-checkbox" 
                ${item.status === 'selesai' ? 'checked' : ''}
                data-id="${item.id}" 
                data-type="${dataType}">
            </div>
          </div>
        `;
        
        if (dataType === 'dailyActivities') {
          addSubActivityForm(li, item);
        } else if (dataType === 'weeklyPlans') {
          addSubWeeklyPlanForm(li, item);
        }
        
        listElement.appendChild(li);
      });
    });
  };
  
  // Format the date
  const formatDate = (date) => {
    if (date === "Hari Ini") {
      const today = new Date();
      return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
    } else if (date === "Besok") {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return `${tomorrow.getDate()} ${months[tomorrow.getMonth()]} ${tomorrow.getFullYear()}`;
    } else {
      return date;
    }
  };

  const formatDateToIndonesian = (date) => {
    const [year, monthIndex, day] = date.split("-");
    const month = months[parseInt(monthIndex, 10) - 1];
    return `${parseInt(day, 10)} ${month} ${year}`;
  };

  // Group items
  const groupedItems = items.reduce((grouped, item) => {
    let groupKey;
    if (dataType === "reminders") {
      groupKey = formatDateToIndonesian(item.date);
    } else if (dataType === "budget") {
      groupKey = item.month;
    } else if (dataType === "weeklyPlans") {
      groupKey = `${item.createdAt} - ${item.endDate}`;
    } else {
      groupKey = "";
    }
    
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(item);
    return grouped;
  }, {});

  if (dataType === "reminders" || dataType === "budget" || dataType === "weeklyPlans") {
    renderGroupedItems(groupedItems, (groupKey) => {
      const header = document.createElement("h3");
      header.textContent = groupKey;
      return header;
    });
  } else {
    items.forEach((item) => {
      const li = document.createElement("li");
      let content = `${item.name}`;
      
      if (dataType === "expenses" || dataType === "incomes") {
        content += ` - ${formatRupiah(item.amount)}`;
      } else if (dataType === "budget") {
        content += ` - ${formatRupiah(item.amount)}`;
      } else if (dataType === "dailyActivities") {
        const dateToShow = formatDate(item.date);
        content += ` - ${dateToShow}`;
      }
      
      li.setAttribute("data-id", item.id);
      li.style.borderLeft = `4px solid ${PRIORITY_COLORS[item.priority || "low"]}`;
      li.innerHTML = `
        <div class="item-content">
          <div class="item-left">
            <span class="item-name">${content}</span>
          </div>
          <div class="item-actions">
            <div class="priority-selector">
              <select class="priority-select" data-id="${item.id}" data-type="${dataType}">
                <option value="high" ${item.priority === "high" ? "selected" : ""}>
                  ${PRIORITY_LABELS.high}
                </option>
                <option value="medium" ${item.priority === "medium" ? "selected" : ""}>
                  ${PRIORITY_LABELS.medium}
                </option>
                <option value="low" ${(item.priority === "low" || !item.priority) ? "selected" : ""}>
                  ${PRIORITY_LABELS.low}
                </option>
              </select>
            </div>
            <button class="edit-btn" data-id="${item.id}" data-name="${item.name}" 
              data-type="${dataType}" data-parent-id="${parentId || ""}" 
              data-sub-parent-id="${subParentId || ""}">Edit</button>
            <button class="delete-btn" data-id="${item.id}" data-type="${dataType}">Hapus</button>
            <input type="checkbox" 
              class="status-checkbox" 
              ${item.status === "selesai" ? "checked" : ""}
              data-id="${item.id}" 
              data-type="${dataType}">
          </div>
        </div>
      `;
      
      if (dataType === "dailyActivities") {
        addSubActivityForm(li, item);
      } else if (dataType === "weeklyPlans") {
        addSubWeeklyPlanForm(li, item);
      }
      
      listElement.appendChild(li);
    });
  }
};
document.addEventListener('change', async (e) => {
  if (e.target.classList.contains('status-checkbox')) {
    const id = e.target.getAttribute('data-id');
    const type = e.target.getAttribute('data-type');
    const status = e.target.checked ? 'selesai' : 'aktif';
    
    try {
      const docRef = getDocRef(type, id);
      await updateDoc(docRef, { status });
      
      // If status is 'selesai', animate and remove the item
      if (status === 'selesai') {
        const listItem = e.target.closest('li');
        listItem.style.animation = 'fadeOut 0.5s';
        setTimeout(() => {
          listItem.remove();
        }, 500);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      e.target.checked = !e.target.checked; // Revert checkbox if update fails
    }
  }
  
  if (e.target.classList.contains('priority-select')) {
    const id = e.target.getAttribute('data-id');
    const type = e.target.getAttribute('data-type');
    const priority = e.target.value;
    
    try {
      const docRef = getDocRef(type, id);
      await updateDoc(docRef, { priority });
      
      // Update the visual indicator
      const listItem = e.target.closest('li');
      listItem.style.borderLeft = `4px solid ${PRIORITY_COLORS[priority]}`;
    } catch (error) {
      console.error('Error updating priority:', error);
    }
  }
});
incomeForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const incomeName = incomeInput.value;
  const incomeCategoryValue = incomeCategory.value;
  const incomeAmountValue = incomeAmount.value;

  if (incomeName.trim() && incomeCategoryValue.trim() && incomeAmountValue) {
    try {
      await addIncome(incomeName, incomeCategoryValue, parseFloat(incomeAmountValue));
      incomeInput.value = "";
      incomeCategory.value = "";
      incomeAmount.value = "";
    } catch (error) {
      console.error("Error adding income:", error);
      alert("Terjadi kesalahan saat menambahkan pendapatan. Silakan coba lagi.");
    }
  } else {
    alert("Mohon isi semua field pendapatan.");
  }
});
expenseForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const expenseName = expenseInput.value;
  const expenseCategoryValue = expenseCategory.value;
  const expenseAmountValue = expenseAmount.value;

  if (expenseName.trim() && expenseCategoryValue.trim() && expenseAmountValue) {
    try {
      await addExpense(expenseName, expenseCategoryValue, parseFloat(expenseAmountValue));
      expenseInput.value = "";
      expenseCategory.value = "";
      expenseAmount.value = "";
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Terjadi kesalahan saat menambahkan pengeluaran. Silakan coba lagi.");
    }
  } else {
    alert("Mohon isi semua field pengeluaran.");
  }
});
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
            updatedData.endDate = `${endDate.getDate()} ${months[endDate.getMonth()]} ${endDate.getFullYear()}`;
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

  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const unformatNumber = (str) => {
    return parseFloat(str.replace(/[^\d]/g, ''));
  };

  let formContent = '';
  const order = getOrderForType(type);
  const categories = {
    incomes: ['Gaji', 'Bonus', 'Investasi', 'Penjualan', 'Hadiah', 'Lainnya'],
    expenses: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya']
  };

  order.forEach(key => {
    if (currentData.hasOwnProperty(key) && key !== 'id' && key !== 'userId') {
      const isExcluded = (
        (type === 'incomes' && (key === 'date' || key === 'notes')) ||
        (type === 'reminders' && (key === 'timeZone' || key === 'notificationSent'))
      );

      if (!isExcluded) {
        let label = getLabelForKey(key, type);
        let inputContent = '';

        switch (key) {
          case 'createdAt':
          case 'endDate':
            // Make these fields read-only
            inputContent = `
              <input type="text" id="edit-${key}" 
                value="${currentData[key]}" 
                disabled
                style="background-color: #f0f0f0;">
            `;
            break;

          case 'duration':
            // Convert duration to dropdown with 1-3 weeks
            inputContent = `
              <select id="edit-${key}">
                <option value="1" ${currentData[key] === 1 ? 'selected' : ''}>1 Minggu</option>
                <option value="2" ${currentData[key] === 2 ? 'selected' : ''}>2 Minggu</option>
                <option value="3" ${currentData[key] === 3 ? 'selected' : ''}>3 Minggu</option>
              </select>
            `;
            break;

          case 'date':
            if (type === 'weeklyPlans') {
              // Add date selector for ±1 day from original date
              const originalDate = new Date(currentData[key].split(' ').reverse().join('-'));
              const prevDay = new Date(originalDate);
              prevDay.setDate(prevDay.getDate() - 1);
              const nextDay = new Date(originalDate);
              nextDay.setDate(nextDay.getDate() + 1);

              const formatDateOption = (date) => {
                return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
              };

              inputContent = `
                <select id="edit-${key}">
                  <option value="${formatDateOption(prevDay)}">${formatDateOption(prevDay)}</option>
                  <option value="${formatDateOption(originalDate)}" selected>${formatDateOption(originalDate)}</option>
                  <option value="${formatDateOption(nextDay)}">${formatDateOption(nextDay)}</option>
                </select>
              `;
            } else if (type === 'reminders') {
              inputContent = `
                <input type="date" id="edit-${key}" 
                  value="${currentData[key]}" 
                  min="${new Date().toISOString().split('T')[0]}">
              `;
            }
            break;

          case 'category':
            if (type === 'incomes' || type === 'expenses') {
              const categoryList = type === 'incomes' ? categories.incomes : categories.expenses;
              const currentCategory = currentData[key];
              const isCustom = !categoryList.includes(currentCategory);
              inputContent = `
                <select id="edit-${key}" onchange="this.nextElementSibling.style.display = this.value === 'custom' ? 'block' : 'none'">
                  ${categoryList.map(cat => `<option value="${cat}" ${cat === currentCategory ? 'selected' : ''}>${cat}</option>`).join('')}
                  <option value="custom" ${isCustom ? 'selected' : ''}>Kategori Kustom</option>
                </select>
                <input type="text" id="edit-${key}-custom" 
                  style="display: ${isCustom ? 'block' : 'none'}; margin-top: 5px;" 
                  value="${isCustom ? currentCategory : ''}" 
                  placeholder="Masukkan kategori kustom">
              `;
            }
            break;

          case 'amount':
            inputContent = `
              <div style="position: relative;">
                <input type="text" id="edit-${key}" 
                  value="Rp. ${formatNumber(currentData[key])}"
                  oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
                  onkeyup="if(this.value !== '') this.value = 'Rp. ' + this.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')">
              </div>
            `;
            break;

          case 'time':
            if (type === 'reminders') {
              inputContent = `
                <input type="time" id="edit-${key}" 
                  value="${currentData[key]}">
              `;
            }
            break;

          case 'month':
            if (type === 'budget') {
              inputContent = `
                <select id="edit-${key}">
                  ${months.map((month, index) => `
                    <option value="${month}" ${month === currentData[key] ? 'selected' : ''}>${month}</option>
                  `).join('')}
                </select>
              `;
            }
            break;

          default:
            inputContent = `
              <input type="text" id="edit-${key}" value="${currentData[key]}">
            `;
        }

        if (inputContent) {
          formContent += `
            <div>
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
        <button type="submit">Simpan</button>
        <button type="button" id="cancel-edit">Batal</button>
      </form>
    </div>
  `;

  document.body.appendChild(editPopup);

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
          if (key === 'amount') {
            updatedFields[key] = unformatNumber(input.value);
          } else if (key === 'category') {
            const selectedValue = input.value;
            if (selectedValue === 'custom') {
              const customInput = document.getElementById(`edit-${key}-custom`);
              updatedFields[key] = customInput.value.trim();
            } else {
              updatedFields[key] = selectedValue;
            }
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
function getOrderForType(type) {
  switch (type) {
    case 'dailyActivities':
      return ['name', 'date'];
    case 'weeklyPlans':
      return ['name', 'createdAt', 'endDate', 'duration'];
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
    case 'createdAt':
      return 'Dibuat tanggal';
    case 'endDate':
      return 'Berakhir tanggal';
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
dailyActivitiesForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const activityName = dailyActivitiesInput.value;
    const activityDate = dailyActivitiesDate.value;
    const success = await addDailyActivity(activityName, activityDate);
    if (success) {
        dailyActivitiesInput.value = "";
        dailyActivitiesDate.value = "today";
    }
});
budgetForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const budgetName = budgetInput.value;
    const budgetMonthValue = budgetMonth.value;
    const budgetAmountValue = budgetAmount.value;
    if (budgetName.trim() && budgetAmountValue) {
        try {
            await addBudget(budgetName, budgetMonthValue, parseFloat(budgetAmountValue));
            budgetInput.value = "";
            budgetMonth.value = "Januari";
            budgetAmount.value = "";
        } catch (error) {
            console.error("Error adding budget:", error);
        }
    }
});
reminderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const reminderName = reminderInput.value;
    const reminderDateValue = reminderDate.value;
    const reminderTimeValue = reminderTime.value;
    if (reminderName.trim()) {
        try {
            await addReminder(reminderName, reminderDateValue, reminderTimeValue);
            reminderInput.value = "";
            reminderDate.value = "";
            reminderTime.value = "";
        } catch (error) {
            console.error("Error adding reminder:", error);
        }
    }
});
const deleteData = async (dataType, dataId, parentId, subParentId) => {
    console.log("Deleting:", { dataType, dataId, parentId, subParentId, userId });
    try {
        const userDocRef = doc(db, "users", userId);
        
        // Function to delete all subcollections of a document
        const deleteSubcollections = async (docRef) => {
            const collections = await getDocs(collection(docRef, "_"));
            const subcollectionNames = collections.docs.map(doc => doc.id);
            
            for (const subcollName of subcollectionNames) {
                const subcollRef = collection(docRef, subcollName);
                const subcollDocs = await getDocs(subcollRef);
                
                for (const doc of subcollDocs.docs) {
                    // Recursively delete subcollections of subcollections
                    await deleteSubcollections(doc.ref);
                    await deleteDoc(doc.ref);
                }
            }
        };

        // Handle specific data types
        switch (dataType) {
            case "dailyActivities": {
                const activityRef = doc(userDocRef, "dailyActivities", dataId);
                
                // Delete all subActivities first
                const subActivitiesRef = collection(activityRef, "subActivities");
                const subActivities = await getDocs(subActivitiesRef);
                
                for (const subActivity of subActivities.docs) {
                    // Delete all tasks for each subActivity
                    const tasksRef = collection(subActivity.ref, "tasks");
                    const tasks = await getDocs(tasksRef);
                    
                    for (const task of tasks.docs) {
                        await deleteDoc(task.ref);
                    }
                    await deleteDoc(subActivity.ref);
                }
                
                // Finally delete the main activity
                await deleteDoc(activityRef);
                break;
            }
            
            case "weeklyPlans": {
                const planRef = doc(userDocRef, "weeklyPlans", dataId);
                
                // Delete all subWeeklyPlans
                const subPlansRef = collection(planRef, "subWeeklyPlans");
                const subPlans = await getDocs(subPlansRef);
                
                for (const subPlan of subPlans.docs) {
                    await deleteDoc(subPlan.ref);
                }
                
                // Delete the main plan
                await deleteDoc(planRef);
                break;
            }
            
            case "subActivities": {
                if (!parentId) throw new Error("parentId required for subActivities");
                const subActivityRef = doc(userDocRef, "dailyActivities", parentId, "subActivities", dataId);
                
                // Delete all tasks first
                const tasksRef = collection(subActivityRef, "tasks");
                const tasks = await getDocs(tasksRef);
                
                for (const task of tasks.docs) {
                    await deleteDoc(task.ref);
                }
                
                // Then delete the subActivity
                await deleteDoc(subActivityRef);
                break;
            }
            
            case "tasks": {
                if (!parentId || !subParentId) throw new Error("parentId and subParentId required for tasks");
                const taskRef = doc(userDocRef, "dailyActivities", parentId, "subActivities", subParentId, "tasks", dataId);
                await deleteDoc(taskRef);
                break;
            }
            
            default: {
                // For other types (budget, expenses, incomes, reminders) that don't have subcollections
                const docRef = doc(userDocRef, dataType, dataId);
                await deleteDoc(docRef);
                break;
            }
        }

        console.log(`${dataType} dengan ID ${dataId} dan semua sub-datanya berhasil dihapus`);
        
        // Verify deletion
        const verifyRef = getDocRef(dataType, dataId, parentId, subParentId);
        const verifySnap = await getDoc(verifyRef);
        
        if (!verifySnap.exists()) {
            console.log("Verifikasi: dokumen berhasil dihapus");
        } else {
            console.warn("Verifikasi: dokumen masih ada setelah dihapus, mungkin karena caching");
        }
    } catch (error) {
        console.error(`Error menghapus ${dataType}:`, error);
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