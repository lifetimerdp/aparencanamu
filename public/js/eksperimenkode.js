import { auth, db, messaging } from "./firebaseConfig.js";
import {
  getDocs,
  addDoc,
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDoc,
  arrayUnion,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import "./auth.js";
import {
  renderSubActivities,
  addTaskForm,
  renderTasks,
  addSubActivityForm,
  checkExpiredDailyActivities,
  addDailyActivity,
  initUserId
} from "./dailyActivities.js";
import {
  renderSubWeeklyPlans,
  addSubWeeklyPlanForm,
  checkExpiredWeeklyPlans,
  initWeeklyPlans,
  renderWeeklyPlans,
  loadWeeklyPlans
} from "./weeklyPlans.js";
import {
  addExpense,
  addIncome,
  addBudget,
  addReminder,
  loadExpensesAndIncomes
} from "./financialManagement.js";

const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember"
];

const formatRupiah = (amount) => {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
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

const renderList = (listElement, items, dataType, parentId = null, subParentId = null) => {
  if (!listElement) return;
  const previousUnsubscribe = listElement.getAttribute('data-unsubscribe');
  if (previousUnsubscribe) {
    previousUnsubscribe();
  }

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
        li.style.borderLeft = `4px solid ${item.priority ? PRIORITY_COLORS[item.priority] : '#ccc'}`;
        li.classList.add('list-item-transition');
        li.innerHTML = `
          <div class="item-content">
            <div class="item-left">
              <span class="item-name">${content}</span>
            </div>
            <div class="item-actions">
              <div class="priority-selector">
                <select class="priority-select" data-id="${item.id}" data-type="${dataType}">
                  <option value="">Pilih Prioritas</option>
                  <option value="high" ${item.priority === "high" ? "selected" : ""}>
                    ${PRIORITY_LABELS.high}
                  </option>
                  <option value="medium" ${item.priority === "medium" ? "selected" : ""}>
                    ${PRIORITY_LABELS.medium}
                  </option>
                  <option value="low" ${item.priority === "low" ? "selected" : ""}>
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
          const subActivitiesContainer = document.createElement('div');
          subActivitiesContainer.classList.add('sub-activities-container');
          li.appendChild(subActivitiesContainer);
          addSubActivityForm(li, item);
          const subActivitiesRef = collection(doc(db, "users", userId, "dailyActivities", item.id), "subActivities");
          const unsubscribe = onSnapshot(subActivitiesRef, (snapshot) => {
            const subActivities = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })).filter(subActivity => subActivity.status !== 'selesai');
            renderSubActivities(subActivitiesContainer, subActivities, item.id);
          });
          li.setAttribute('data-unsubscribe', unsubscribe);
        } else if (dataType === 'weeklyPlans') {
          addSubWeeklyPlanForm(li, item);
        }
        listElement.appendChild(li);
      });
    });
  };

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
    activeItems.forEach((item) => {
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
      li.style.borderLeft = `4px solid ${item.priority ? PRIORITY_COLORS[item.priority] : '#ccc'}`;
      li.innerHTML = `
        <div class="item-content">
          <div class="item-left">
            <span class="item-name">${content}</span>
          </div>
          <div class="item-actions">
            <div class="priority-selector">
              <select class="priority-select" data-id="${item.id}" data-type="${dataType}">
                <option value="">Pilih Prioritas</option>
                <option value="high" ${item.priority === "high" ? "selected" : ""}>
                  ${PRIORITY_LABELS.high}
                </option>
                <option value="medium" ${item.priority === "medium" ? "selected" : ""}>
                  ${PRIORITY_LABELS.medium}
                </option>
                <option value="low" ${item.priority === "low" ? "selected" : ""}>
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

const showEditPopup = (id, type, currentData, parentId, subParentId) => {
  // Implementasi lengkap fungsi showEditPopup
};

const getOrderForType = (type) => {
  // Implementasi lengkap fungsi getOrderForType
};

const getLabelForKey = (key, type) => {
  // Implementasi lengkap fungsi getLabelForKey
};

const getTypeName = (type) => {
  // Implementasi lengkap fungsi getTypeName
};

const getDocRef = (dataType, dataId, parentId, subParentId) => {
  // Implementasi lengkap fungsi getDocRef
};

const deleteData = async (dataType, dataId, parentId, subParentId) => {
  // Implementasi lengkap fungsi deleteData
};

document.addEventListener('DOMContentLoaded', async () => {
  // Implementasi lengkap event handler DOMContentLoaded
});

document.addEventListener('submit', async (e) => {
  // Implementasi lengkap event handler submit
});

document.addEventListener('click', async (e) => {
  // Implementasi lengkap event handler click untuk edit dan delete
});