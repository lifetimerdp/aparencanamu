import { auth, db, messaging } from "../firebaseConfig.js";
import { getDocs, addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc, arrayUnion, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { writeBatch } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import "../auth.js";
import {
  formatRupiah,
  formatDate,
  formatDateToIndonesian,
  formatNumber,
  unformatNumber,
  getTypeName,
  getOrderForType,
  getLabelForKey,
  getDocRef,
  months,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  categories
} from "./utility.js"
import { DataFilter } from './filterDashboard.js';
import { 
  addSubActivityForm, 
  renderSubActivities, 
  addTaskForm, 
  renderTasks, 
  checkExpiredDailyActivities, 
  addDailyActivity, 
  initUserId 
} from "./dailyActivities.js";
import { renderSubWeeklyPlans, addSubWeeklyPlanForm, checkExpiredWeeklyPlans, initWeeklyPlans, renderWeeklyPlans, loadWeeklyPlans } from "./weeklyPlans.js";
import { addExpense, addIncome, addBudget, addReminder, loadExpensesAndIncomes } from "./financialManagement.js";
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
const periksaDanPerbaruiStatusKedaluwarsa = async (items, dataType) => {
  if (!items || !Array.isArray(items)) return items;
  
  const sekarang = new Date();
  const pembaruan = [];
  
  items.forEach(item => {
    // Periksa hanya jika status bukan 'completed'
    if (item.status !== 'completed') {
      let sudahKedaluwarsa = false;
      let tanggalItem;
      
      try {
        switch (dataType) {
          case 'dailyActivities':
            if (item.date) {
              tanggalItem = new Date(item.date);
              // Set ke akhir hari untuk perbandingan yang akurat
              tanggalItem.setHours(23, 59, 59, 999);
              sudahKedaluwarsa = tanggalItem < sekarang;
            }
            break;
            
          case 'weeklyPlans':
            if (item.endDate) {
              const [hari, bulan, tahun] = item.endDate.split(' ');
              const indeksBulan = months.indexOf(bulan);
              if (indeksBulan !== -1) {
                tanggalItem = new Date(tahun, indeksBulan, parseInt(hari));
                tanggalItem.setHours(23, 59, 59, 999);
                sudahKedaluwarsa = tanggalItem < sekarang;
              }
            }
            break;
            
          case 'budget':
            if (item.month) {
              const tahunSekarang = sekarang.getFullYear();
              const indeksBulan = months.indexOf(item.month);
              if (indeksBulan !== -1) {
                // Set tanggal ke akhir bulan
                tanggalItem = new Date(tahunSekarang, indeksBulan + 1, 0, 23, 59, 59, 999);
                sudahKedaluwarsa = tanggalItem < sekarang;
              }
            }
            break;
            
          case 'reminders':
            if (item.date && item.time) {
              const [jam, menit] = item.time.split(':');
              tanggalItem = new Date(item.date);
              tanggalItem.setHours(parseInt(jam), parseInt(menit), 59, 999);
              sudahKedaluwarsa = tanggalItem < sekarang;
            }
            break;
        }
        
        // Jika item sudahKedaluwarsa dan belum completed, tambahkan ke daftar pembaruan
        if (sudahKedaluwarsa) {
          console.log(`Item ${dataType} dengan ID ${item.id} telah kedaluwarsa`);
          pembaruan.push({
            id: item.id,
            update: { status: 'completed' }
          });
        }
      } catch (error) {
        console.error(`Error saat memeriksa kedaluwarsa untuk ${dataType} ID ${item.id}:`, error);
      }
    }
  });

  // Lakukan pembaruan status ke Firestore
  if (pembaruan.length > 0) {
    try {
      const userDocRef = doc(db, "users", userId);
      const batch = writeBatch(db);

      pembaruan.forEach(({ id, update }) => {
        const docRef = doc(userDocRef, dataType, id);
        batch.update(docRef, update);
      });

      await batch.commit();
      console.log(`Berhasil memperbarui ${pembaruan.length} item ${dataType} yang kedaluwarsa`);

      // Update items array dengan status yang baru
      pembaruan.forEach(({ id, update }) => {
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
          items[index] = { ...items[index], ...update };
        }
      });
    } catch (error) {
      console.error(`Error saat memperbarui item ${dataType} yang kedaluwarsa:`, error);
    }
  }

  return items;
};
export const renderList = async (listElement, items, dataType, parentId = null, subParentId = null) => {
  if (!listElement) return;
  const itemDiperbarui = await periksaDanPerbaruiStatusKedaluwarsa(items, dataType);
  
  const previousUnsubscribe = listElement.getAttribute('data-unsubscribe');
  if (typeof previousUnsubscribe === 'function') {
    previousUnsubscribe();
  }
  
  listElement.innerHTML = '';

  const createPrioritySelector = (item, dataType) => `
    <div class="priority-selector">
      <select 
        class="priority-select" 
        data-id="${item.id}" 
        data-type="${dataType}"
        style="border-color: ${item.priority ? PRIORITY_COLORS[item.priority] : '#ccc'}"
      >
        <option value="">Pilih Prioritas</option>
        ${Object.entries(PRIORITY_LABELS).map(([key, label]) => 
          `<option value="${key}" ${item.priority === key ? "selected" : ""}
            style="background-color: ${PRIORITY_COLORS[key]}40">${label}</option>`
        ).join('')}
      </select>
    </div>
  `;

  const formatDateTime = (date) => {
    if (!date) return '';
    
    // Handle both Firestore Timestamp and regular Date objects
    const d = date instanceof Date ? date : 
             date.toDate ? date.toDate() : 
             new Date(date);
    
    if (isNaN(d.getTime())) return '';
    
    return d.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const createItemContent = (item) => {
    let content = item.name;
    
    if (dataType === 'expenses' || dataType === 'incomes' || dataType === 'budget') {
      content += ` - ${formatRupiah(item.amount)}`;
      
      // Menambahkan waktu pembuatan untuk pendapatan dan pengeluaran
      if ((dataType === 'expenses' || dataType === 'incomes') && item.date) {
        content += `
          <br>
          <span class="created-date">
            Dibuat pada: ${formatDateTime(item.date)}
          </span>`;
      }
    } else if (dataType === 'reminders') {
      const reminderDate = new Date(item.date);
      const formattedDate = reminderDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric'
      });
      content += `<br><span class="reminder-datetime">Waktu: ${formattedDate}, ${item.time}</span>`;
    }

    return `
      <div class="item-content">
        <div class="item-left">
          <span class="item-name ${item.status === 'completed' ? 'completed-item' : ''}">${content}</span>
        </div>
        <div class="item-actions">
          ${createPrioritySelector(item, dataType)}
          <button class="edit-btn" 
            data-id="${item.id}" 
            data-name="${item.name}" 
            data-type="${dataType}" 
            data-parent-id="${parentId || ''}" 
            data-sub-parent-id="${subParentId || ''}"
          >Edit</button>
          <button class="delete-btn" 
            data-id="${item.id}" 
            data-type="${dataType}"
          >Hapus</button>
          <input type="checkbox" 
            class="status-checkbox" 
            ${item.status === 'completed' ? 'checked' : ''}
            data-id="${item.id}" 
            data-type="${dataType}"
          >
        </div>
      </div>
    `;
  };

  const setupDailyActivity = (li, item) => {
    if (!li.querySelector('.sub-activity-form')) {
      addSubActivityForm(li, item);
    }
  };

  const createListItem = (item) => {
    const li = document.createElement('li');
    li.setAttribute('data-id', item.id);
    li.setAttribute('data-status', item.status || 'active');
    li.style.borderLeft = `4px solid ${item.priority ? PRIORITY_COLORS[item.priority] : '#ccc'}`;
    li.classList.add('list-item-transition');
    
    if (item.status === 'completed') {
      li.classList.add('completed-item');
    }
    
    li.innerHTML = createItemContent(item);
    
    if (dataType === 'dailyActivities') {
      setupDailyActivity(li, item);
    } else if (dataType === 'weeklyPlans') {
      addSubWeeklyPlanForm(li, item);
    }
    
    const checkbox = li.querySelector('.status-checkbox');
    if (checkbox) {
      checkbox.addEventListener('change', async (e) => {
        const status = e.target.checked ? 'completed' : 'active';
        try {
          const docRef = getDocRef(dataType, item.id);
          await updateDoc(docRef, { status });
          if (status === 'completed') {
            li.classList.add('completed-item');
          } else {
            li.classList.remove('completed-item');
          }
        } catch (error) {
          console.error('Error updating status:', error);
          e.target.checked = !e.target.checked;
        }
      });
    }
    
    return li;
  };

  const renderGroupedItems = (items) => {
    const groupedItems = items.reduce((grouped, item) => {
      let groupKey = '';
      switch (dataType) {
        case "reminders":
          groupKey = formatDateToIndonesian(item.date);
          break;
        case "budget":
          groupKey = item.month;
          break;
        case "weeklyPlans":
          groupKey = `${item.createdAt} - ${item.endDate}`;
          break;
        default:
          groupKey = '';
      }
      return {
        ...grouped,
        [groupKey]: [...(grouped[groupKey] || []), item]
      };
    }, {});

    Object.entries(groupedItems).forEach(([groupKey, groupItems]) => {
      if (groupKey) {
        const header = document.createElement("h3");
        header.textContent = groupKey;
        listElement.appendChild(header);
      }
      groupItems.forEach(item => {
        const listItem = createListItem(item);
        listElement.appendChild(listItem);
      });
    });
  };

  try {
    if (dataType === "reminders" || dataType === "budget" || dataType === "weeklyPlans") {
      renderGroupedItems(itemDiperbarui);
    } else {
      itemDiperbarui.forEach(item => {
        const listItem = createListItem(item);
        listElement.appendChild(listItem);
      });
    }

    const items = listElement.querySelectorAll('li');
    items.forEach((item, index) => {
      setTimeout(() => {
        item.classList.add('visible');
      }, index * 100);
    });
  } catch (error) {
    console.error('Error rendering list:', error);
    listElement.innerHTML = '<p class="error-message">Terjadi kesalahan saat menampilkan data.</p>';
  }
};
document.addEventListener('change', async (e) => {
  if (e.target.classList.contains('status-checkbox')) {
    const id = e.target.getAttribute('data-id');
    const type = e.target.getAttribute('data-type');
    // Ubah status sesuai format Firestore
    const status = e.target.checked ? 'completed' : 'active';
    const listItem = e.target.closest('li');

    try {
      e.target.disabled = true;
      if (status === 'completed') {
        listItem.classList.add('list-item-completing');
      } else {
        listItem.classList.remove('list-item-completing');
      }

      const docRef = getDocRef(type, id);
      await updateDoc(docRef, { status });

      if (status === 'completed') {
        setTimeout(() => {
          if (listItem && listItem.parentNode) {
            const unsubscribe = listItem.getAttribute('data-unsubscribe');
            if (unsubscribe) {
              unsubscribe();
            }
            listItem.parentNode.removeChild(listItem);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      e.target.checked = !e.target.checked;
      listItem.classList.remove('list-item-completing');
      alert('Gagal mengubah status. Silakan coba lagi.');
    } finally {
      e.target.disabled = false;
    }
  }
});
document.addEventListener('focus', (e) => {
  if (e.target.classList.contains('priority-select')) {
    e.target.setAttribute('data-previous-value', e.target.value);
  }
}, true);
document.addEventListener('change', async (e) => {
  if (e.target.classList.contains('priority-select')) {
    const id = e.target.getAttribute('data-id');
    const type = e.target.getAttribute('data-type');
    const newPriority = e.target.value;
    const previousValue = e.target.getAttribute('data-previous-value');

    try {
      e.target.disabled = true;
      const docRef = getDocRef(type, id);
      
      // Update di Firestore
      await updateDoc(docRef, {
        priority: newPriority
      });

      // Update tampilan
      const listItem = e.target.closest('li');
      if (listItem) {
        listItem.style.borderLeft = `4px solid ${newPriority ? PRIORITY_COLORS[newPriority] : '#ccc'}`;
      }

      console.log(`Priority updated for ${type} ${id} to ${newPriority}`);
    } catch (error) {
      console.error('Error updating priority:', error);
      e.target.value = previousValue;
      alert('Gagal mengubah prioritas. Silakan coba lagi.');
    } finally {
      e.target.disabled = false;
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
      const isAllowedToChange = !((dataType === "dailyActivities" && (key === "date" || key === "completed")) || (dataType === "weeklyPlans" && (key === "createdAt" || key === "completed")) || (dataType === "reminders" && (key === "timeZone" || key === "notificationSent")));
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
  const createInput = (key, value) => {
    const commonProps = `id="edit-${key}" ${key === 'createdAt' || key === 'endDate' ? 'disabled style="background-color: #f0f0f0;"' : ''}`;
    
    const inputs = {
      duration: `<select ${commonProps}>${[1,2,3].map(n => 
        `<option value="${n}" ${value===n?'selected':''}>${n} Minggu</option>`).join('')}</select>`,
      
      date: type === 'weeklyPlans' ? 
        (() => {
          // Pastikan value adalah string dan ada sebelum mencoba split
          let date;
          try {
            if (typeof value === 'string') {
              // Jika format adalah "DD Bulan YYYY"
              const parts = value.split(' ');
              if (parts.length === 3) {
                const monthIndex = months.indexOf(parts[1]);
                if (monthIndex !== -1) {
                  date = new Date(parts[2], monthIndex, parseInt(parts[0]));
                }
              }
            }
            // Jika parsing gagal, gunakan tanggal sekarang
            if (!date || isNaN(date.getTime())) {
              date = new Date();
            }
          } catch (error) {
            console.error('Error parsing date:', error);
            date = new Date();
          }

          return `<select ${commonProps}>${[-1,0,1].map(d => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + d);
            const formatted = `${newDate.getDate()} ${months[newDate.getMonth()]} ${newDate.getFullYear()}`;
            return `<option value="${formatted}" ${d===0?'selected':''}>${formatted}</option>`;
          }).join('')}</select>`;
        })() :
        type === 'reminders' ?
          `<input type="date" ${commonProps} value="${value}" min="${new Date().toISOString().split('T')[0]}">` :
          '',
      
      category: (type === 'incomes' || type === 'expenses') ?
        (() => {
          const cats = type === 'incomes' ? categories.incomes : categories.expenses;
          const isCustom = !cats.includes(value);
          return `
            <select ${commonProps} onchange="this.nextElementSibling.style.display = this.value === 'custom' ? 'block' : 'none'">
              ${cats.map(c => `<option value="${c}" ${c===value?'selected':''}>${c}</option>`).join('')}
              <option value="custom" ${isCustom ? 'selected' : ''}>Kategori Kustom</option>
            </select>
            <input type="text" id="edit-${key}-custom" style="display: ${isCustom ? 'block' : 'none'}; margin-top: 5px;" 
              value="${isCustom ? value : ''}" placeholder="Masukkan kategori kustom">
          `;
        })() : '',
      
      amount: `<input type="text" ${commonProps} value="Rp. ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}"
        oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
        onkeyup="if(this.value !== '') this.value = 'Rp. ' + this.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')">`,
      
      time: type === 'reminders' ? `<input type="time" ${commonProps} value="${value}">` : '',
      
      month: type === 'budget' ? 
        `<select ${commonProps}>${months.map(m => `<option value="${m}" ${m===value?'selected':''}>${m}</option>`).join('')}</select>` : ''
    };

    return inputs[key] || `<input type="text" ${commonProps} value="${value}">`;
  };

  const popup = document.createElement('div');
  popup.className = 'edit-popup';
  Object.assign(popup.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    zIndex: '1000'
  });

  const formContent = getOrderForType(type)
    .filter(key => 
      currentData.hasOwnProperty(key) && 
      key !== 'id' && 
      key !== 'userId' &&
      !((type === 'incomes' && (key === 'date' || key === 'notes')) ||
        (type === 'reminders' && (key === 'timeZone' || key === 'notificationSent')))
    )
    .map(key => `
      <div>
        <label for="edit-${key}">${getLabelForKey(key, type)}:</label>
        ${createInput(key, currentData[key])}
      </div>
    `).join('');

  popup.innerHTML = `
    <div class="edit-popup-content">
      <h3>Edit ${getTypeName(type)}</h3>
      <form id="edit-form">
        ${formContent}
        <button type="submit">Simpan</button>
        <button type="button" id="cancel-edit">Batal</button>
      </form>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector('#cancel-edit').onclick = () => document.body.removeChild(popup);

  popup.querySelector('#edit-form').onsubmit = async (e) => {
    e.preventDefault();
    const updatedFields = getOrderForType(type)
      .filter(key => 
        currentData.hasOwnProperty(key) && 
        key !== 'id' && 
        key !== 'userId'
      )
      .reduce((acc, key) => {
        const input = document.getElementById(`edit-${key}`);
        if (input && !input.disabled) {
          if (key === 'amount') {
            acc[key] = parseFloat(input.value.replace(/[^\d]/g, ''));
          } else if (key === 'category' && input.value === 'custom') {
            acc[key] = document.getElementById(`edit-${key}-custom`).value.trim();
          } else if (key === 'duration') {
            acc[key] = parseInt(input.value);
          } else {
            acc[key] = input.value.trim();
          }
        }
        return acc;
      }, {});

    try {
      await editData(type, id, updatedFields, parentId, subParentId);
      document.body.removeChild(popup);
      alert('Perubahan berhasil disimpan');
    } catch (error) {
      console.error('Error saat menyimpan perubahan:', error);
      alert('Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.');
    }
  };
}
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await initUserId();
        if (!userId) {
            throw new Error("User not authenticated");
        }
        const user = await checkAuth();
        const userDocRef = doc(db, "users", user.uid);
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
        const dataFilter = new DataFilter();
        dataFilter.setRenderCallback('dailyActivities', renderList);
        dataFilter.setRenderCallback('weeklyPlans', renderList);
        dataFilter.setRenderCallback('budget', renderList);
        dataFilter.setRenderCallback('reminders', renderList);
        dataFilter.setRenderCallback('expenses', renderList);
        dataFilter.setRenderCallback('incomes', renderList);
    
        const dailyActivitiesRef = collection(userDocRef, "dailyActivities");
        onSnapshot(dailyActivitiesRef, (snapshot) => {
            const dailyActivities = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const dailyActivitiesList = document.getElementById('daily-activities-list');
            renderList(dailyActivitiesList, dailyActivities, 'dailyActivities');
            dataFilter.updateData('dailyActivities', dailyActivities);
        });
        
        const weeklyPlansRef = collection(userDocRef, "weeklyPlans");
        onSnapshot(weeklyPlansRef, (snapshot) => {
            const weeklyPlans = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const weeklyPlansList = document.getElementById('weekly-plans-list');
            renderList(weeklyPlansList, weeklyPlans, 'weeklyPlans');
            dataFilter.updateData('weeklyPlans', weeklyPlans);
        });
        
        const budgetRef = collection(userDocRef, "budget");
        onSnapshot(budgetRef, (snapshot) => {
            const budget = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const budgetList = document.getElementById('budget-list');
            renderList(budgetList, budget, 'budget');
            dataFilter.updateData('budget', budget);
        });
        
        const remindersRef = collection(userDocRef, "reminders");
        onSnapshot(remindersRef, (snapshot) => {
            const reminders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            
            const remindersList = document.getElementById('reminders-list');
            renderList(remindersList, reminders, 'reminders');
            dataFilter.updateData('reminders', reminders);
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
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("edit-btn")) {
        e.preventDefault();
        const dataType = e.target.getAttribute("data-type");
        const dataId = e.target.getAttribute("data-id");
        const parentId = e.target.getAttribute("data-parent-id") || "";
        const subParentId = e.target.getAttribute("data-sub-parent-id") || "";
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
        const registration = await navigator.serviceWorker.register('/js/dashboard/push-notification.js', {
            scope: '/js/dashboard/'
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