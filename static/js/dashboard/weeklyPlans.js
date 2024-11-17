import { auth, db } from '../firebaseConfig.js';
import { getDocs, addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { checkAuth } from './dashboard.js';

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const weeklyPlansForm = document.getElementById('weekly-plans-form');
const weeklyPlansInput = document.getElementById('weekly-plans-input');
const weeklyPlansDuration = document.getElementById('weekly-plans-duration');
let userId = null;

const initializeAuth = async () => {
  try {
    const user = await checkAuth();
    if (user) {
      userId = user.uid;
      return true;
    } else {
      console.error('User not authenticated');
      return false;
    }
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
};

// Function to render sub-weekly plans
export const renderSubWeeklyPlans = (parentElement, subWeeklyPlans) => {
  const subWeeklyPlanList = parentElement.querySelector('.sub-weeklyPlan-list');
  subWeeklyPlanList.innerHTML = '';

  subWeeklyPlans.forEach(subPlan => {
    const li = document.createElement('li');
    li.classList.add('sub-weeklyPlan-item');
    li.setAttribute('data-id', subPlan.id);
    li.innerHTML = `
      <div class="item-content">
        <span class="item-name">${subPlan.name}</span>
        <div class="item-actions">
          <button class="edit-btn" data-id="${subPlan.id}" data-name="${subPlan.name}" data-type="subWeeklyPlans" data-parent-id="${parentElement.getAttribute('data-id')}">Edit</button>
          <button class="delete-btn" data-id="${subPlan.id}" data-type="subWeeklyPlans" data-parent-id="${parentElement.getAttribute('data-id')}">Hapus</button>
        </div>
      </div>
    `;

    subWeeklyPlanList.appendChild(li);
  });
};

// Function to add sub-weekly plan form
export const addSubWeeklyPlanForm = (li, plan) => {
  const subWeeklyPlanTemplate = document.getElementById('sub-weeklyPlan-template').content.cloneNode(true);
  const subWeeklyPlanForm = subWeeklyPlanTemplate.querySelector('.sub-weeklyPlan-form');
  const subWeeklyPlanList = subWeeklyPlanTemplate.querySelector('.sub-weeklyPlan-list');
  
  li.appendChild(subWeeklyPlanTemplate);

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

export const checkExpiredWeeklyPlans = async () => {
  if (!await initializeAuth()) return;

  try {
    const userDocRef = doc(db, "users", userId);
    const weeklyPlansRef = collection(userDocRef, 'weeklyPlans');
    const snapshot = await getDocs(weeklyPlansRef);

    snapshot.forEach(async (doc) => {
      const plan = doc.data();
      if (plan.endDate) {
        const [day, month, year] = plan.endDate.split(' ');
        
        if (month && months.includes(month)) {
          const monthIndex = months.indexOf(month);
          const planEndDate = new Date(year, monthIndex, day);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (planEndDate < today && !plan.completed) {
            await updateDoc(doc.ref, { completed: true });
          }
        } else {
          console.error(`Invalid or missing month in plan with ID ${doc.id}: ${month}`);
        }
      } else {
        console.error(`Plan with ID ${doc.id} has no endDate`);
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

export const initWeeklyPlans = async () => {
  if (!await initializeAuth()) return;

  weeklyPlansForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const planName = weeklyPlansInput.value;
    const planDuration = parseInt(weeklyPlansDuration.value);

    if (planName.trim()) {
      try {
        const createdAt = new Date();
        const createdAtFormatted = `${createdAt.getDate()} ${months[createdAt.getMonth()]} ${createdAt.getFullYear()}`;
        const endDate = durationToEndDate(planDuration);
        
        await addDoc(collection(doc(db, "users", userId), "weeklyPlans"), {
          name: planName,
          duration: planDuration,
          createdAt: createdAtFormatted,
          endDate: endDate,
          status: "",
          priority: "",
          completed: false,
        });

        weeklyPlansInput.value = '';
        weeklyPlansDuration.value = '1';
      } catch (error) {
        console.error('Error adding weekly plan:', error);
      }
    }
  });
};

export const renderWeeklyPlans = (weeklyPlans) => {
  const weeklyPlansList = document.getElementById('weekly-plans-list');
  weeklyPlansList.innerHTML = '';

  const groupedPlans = weeklyPlans.reduce((grouped, plan) => {
    const key = `${plan.createdAt} - ${plan.endDate}`;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(plan);
    return grouped;
  }, {});

  Object.keys(groupedPlans).forEach(groupKey => {
    const header = document.createElement('h3');
    header.textContent = groupKey;
    weeklyPlansList.appendChild(header);

    groupedPlans[groupKey].forEach(plan => {
      const li = document.createElement('li');
      li.setAttribute('data-id', plan.id);
      li.innerHTML = `
        ${plan.name}
        <button class="edit-btn" data-id="${plan.id}" data-name="${plan.name}" data-type="weeklyPlans">Edit</button>
        <button class="delete-btn" data-id="${plan.id}" data-type="weeklyPlans">Hapus</button>
      `;
      
      addSubWeeklyPlanForm(li, plan);
      weeklyPlansList.appendChild(li);
    });
  });
};

export const loadWeeklyPlans = async () => {
  if (!await initializeAuth()) return;

  try {
    const userDocRef = doc(db, "users", userId);
    const weeklyPlansRef = collection(userDocRef, 'weeklyPlans');
    
    onSnapshot(weeklyPlansRef, (snapshot) => {
      const weeklyPlans = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderWeeklyPlans(weeklyPlans);
      checkExpiredWeeklyPlans();
    });
  } catch (error) {
    console.error('Error loading weekly plans:', error);
  }
};

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
  if (await initializeAuth()) {
    initWeeklyPlans();
    loadWeeklyPlans();
  } else {
    console.error('Failed to initialize authentication');
  }
});
