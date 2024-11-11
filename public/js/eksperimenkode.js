import{auth,db,messaging}from "./firebaseConfig.js";
import{getDocs,addDoc,collection,doc,updateDoc,deleteDoc,onSnapshot,getDoc,arrayUnion,query,where}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import{onAuthStateChanged}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import "./auth.js";
import{renderSubActivities,addTaskForm,renderTasks,addSubActivityForm,checkExpiredDailyActivities,addDailyActivity,initUserId}from "./dailyActivities.js";
import{renderSubWeeklyPlans,addSubWeeklyPlanForm,checkExpiredWeeklyPlans,initWeeklyPlans,renderWeeklyPlans,loadWeeklyPlans}from "./weeklyPlans.js";
import{addExpense,addIncome,addBudget,addReminder,loadExpensesAndIncomes}from "./financialManagement.js";

// ... (kode lain tetap sama sampai bagian renderList)

export const renderList = (listElement, items, dataType, parentId=null, subParentId=null) => {
  if (!listElement) return;
  
  // Simpan referensi unsubscribe sebelumnya
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
        
        // Tambahkan class untuk transisi opacity
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
          
          // Buat subscription baru untuk subaktivitas
          const subActivitiesRef = collection(doc(db, "users", userId, "dailyActivities", item.id), "subActivities");
          const unsubscribe = onSnapshot(subActivitiesRef, (snapshot) => {
            const subActivities = snapshot.docs
              .map((doc) => ({id: doc.id, ...doc.data()}))
              .filter(subActivity => subActivity.status !== 'selesai');
            renderSubActivities(subActivitiesContainer, subActivities, item.id);
          });
          
          // Simpan fungsi unsubscribe di elemen
          li.setAttribute('data-unsubscribe', unsubscribe);
        } else if (dataType === 'weeklyPlans') {
          addSubWeeklyPlanForm(li, item);
        }
        
        listElement.appendChild(li);
      });
    });
  };

  // ... (sisa kode renderList tetap sama)
};

// Tambahkan CSS untuk transisi
const style = document.createElement('style');
style.textContent = `
  .list-item-transition {
    transition: opacity 0.3s ease;
  }
  
  .list-item-completing {
    opacity: 0.5;
  }
  
  .sub-activities-container {
    transition: opacity 0.3s ease;
  }
`;
document.head.appendChild(style);

// Modifikasi event listener untuk checkbox
document.addEventListener('change', async (e) => {
  if (e.target.classList.contains('status-checkbox')) {
    const id = e.target.getAttribute('data-id');
    const type = e.target.getAttribute('data-type');
    const status = e.target.checked ? 'selesai' : 'aktif';
    const listItem = e.target.closest('li');
    
    try {
      e.target.disabled = true;
      
      // Tambahkan class untuk transisi
      if (status === 'selesai') {
        listItem.classList.add('list-item-completing');
      } else {
        listItem.classList.remove('list-item-completing');
      }
      
      // Update status di Firestore
      const docRef = getDocRef(type, id);
      await updateDoc(docRef, { status });
      
      // Jika item selesai, hapus dari tampilan dengan animasi
      if (status === 'selesai') {
        setTimeout(() => {
          if (listItem && listItem.parentNode) {
            // Batalkan subscription sebelum menghapus elemen
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

// ... (sisa kode tetap sama)