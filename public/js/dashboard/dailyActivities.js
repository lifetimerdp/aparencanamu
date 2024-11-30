import { db } from '../firebaseConfig.js';
import { getDocs, addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { checkAuth } from "./dashboard.js";

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
let userId = null;

// Helper functions
const createElementWithHTML = (tag, className, html) => {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (html) element.innerHTML = html;
  return element;
};

const getFirestoreRef = (path) => {
  return collection(db, "users", userId, ...path);
};

// Main functions
export const initUserId = async () => {
  try {
    const user = await checkAuth();
    userId = user?.uid || null;
    return userId;
  } catch (error) {
    console.error('Error initializing userId:', error);
    return null;
  }
};

export const renderSubActivities = (parentElement, subActivities) => {
  if (!parentElement) return;
  // Gunakan Set untuk memastikan ID unik
  const uniqueSubActivities = Array.from(new Set(
    subActivities
      .filter(sa => sa.status !== 'selesai')
      .map(sa => sa.id)
  )).map(id => subActivities.find(sa => sa.id === id));

  let subActivityList = parentElement.querySelector('.sub-activity-list') || (() => {
    const list = createElementWithHTML('ul', 'sub-activity-list');
    parentElement.appendChild(list);
    return list;
  })();

  subActivityList.innerHTML = '';
  uniqueSubActivities.forEach(subActivity => {
        if (!subActivity.name?.trim()) return;

        const parentId = parentElement.closest('[data-id]')?.getAttribute('data-id') || '';
        
        const li = createElementWithHTML('li', '', `
            <div class="item-content">
                <span class="item-name">${subActivity.name}</span>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${subActivity.id}" 
                        data-name="${subActivity.name}" 
                        data-type="subActivities" 
                        data-parent-id="${parentId}">Edit</button>
                    <button class="delete-btn" data-id="${subActivity.id}" 
                        data-type="subActivities" 
                        data-parent-id="${parentId}">Hapus</button>
                </div>
            </div>
        `);
        
        li.setAttribute('data-id', subActivity.id);
        
        const taskList = createElementWithHTML('ul', 'task-list');
        li.appendChild(taskList);

        if (parentId) {
            addTaskForm(li, parentId, subActivity.id);
            loadAndRenderTasks(taskList, parentId, subActivity.id);
        }

        subActivityList.appendChild(li);
    });
};

const loadAndRenderTasks = (taskList, activityId, subActivityId) => {
  onSnapshot(
    getFirestoreRef(['dailyActivities', activityId, 'subActivities', subActivityId, 'tasks']),
    (snapshot) => {
      const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderTasks(taskList, tasks, activityId, subActivityId);
    }
  );
};

export const renderTasks = (taskList, tasks, activityId, subActivityId) => {
  // Gunakan Set untuk memastikan ID unik
  const uniqueTasks = Array.from(new Set(
    tasks
      .filter(task => !task.completed)
      .map(task => task.id)
  )).map(id => tasks.find(task => task.id === id));

  taskList.innerHTML = '';
  uniqueTasks.forEach(task => {
    const li = createElementWithHTML('li', '', `
        <div class="item-content">
            <span class="item-name">${task.name}</span>
            <div class="item-actions">
                <button class="edit-btn" data-id="${task.id}" data-name="${task.name}" 
                    data-type="tasks" data-parent-id="${activityId}" 
                    data-sub-parent-id="${subActivityId}">Edit</button>
                <button class="delete-btn" data-id="${task.id}" data-type="tasks" 
                    data-parent-id="${activityId}" 
                    data-sub-parent-id="${subActivityId}">Hapus</button>
            </div>
        </div>
    `);
    
    li.setAttribute('data-id', task.id);
    taskList.appendChild(li);
  });
};

export const addTaskForm = (subActivityElement, activityId, subActivityId) => {
  const taskForm = createElementWithHTML('form', 'task-form', `
    <input type="text" class="task-input" placeholder="Tambah tugas baru">
    <button type="submit">Tambah Tugas</button>
  `);

  subActivityElement.appendChild(taskForm);
  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskName = taskForm.querySelector('.task-input').value.trim();
    
    if (taskName && activityId && subActivityId) {
      try {
        await addDoc(
          getFirestoreRef(['dailyActivities', activityId, 'subActivities', subActivityId, 'tasks']),
          { name: taskName, completed: false }
        );
        taskForm.querySelector('.task-input').value = '';
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  });
};

const createSubActivityForm = (li, item) => {
  const container = createElementWithHTML('div', 'sub-activities-container');
  const form = createElementWithHTML('form', 'sub-activity-form', `
    <input type="text" class="sub-activity-input" placeholder="Tambah sub-aktivitas baru">
    <button type="submit">Tambah Sub-Aktivitas</button>
  `);
  container.appendChild(form);
  li.appendChild(container);

  const subActivitiesRef = getFirestoreRef(['dailyActivities', item.id, 'subActivities']);
  form.addEventListener('submit', async(e) => {
    e.preventDefault();
    const subActivityName = form.querySelector('.sub-activity-input').value.trim();
    if (subActivityName) {
      try {
        await addDoc(subActivitiesRef, { name: subActivityName });
        form.querySelector('.sub-activity-input').value = '';
      } catch (error) {
        console.error('Error adding sub-activity:', error);
      }
    }
  });
  
  onSnapshot(subActivitiesRef, (snapshot) => {
    const subActivities = snapshot.docs.map(doc => ({
      id: doc.id, 
      ...doc.data()
    })).filter(sa => sa.status !== 'selesai');  // Tambahkan filter

    renderSubActivities(container, subActivities);
  });
};

export const addSubActivityForm = (li, item) => {
  // Pastikan userId sudah diinisialisasi
  if (!userId) {
    initUserId().then(() => {
      // Jalankan logika setelah userId diinisialisasi
      createSubActivityForm(li, item);
    });
    return;
  }
  createSubActivityForm(li, item);
};

export const checkExpiredDailyActivities = async () => {
  if (!userId) return;

  try {
    const snapshot = await getDocs(collection(doc(db, "users", userId), 'dailyActivities'));
    snapshot.forEach(async (doc) => {
      const activity = doc.data();
      if (!activity.date || typeof activity.date !== 'string') return;

      const [day, month, year] = activity.date.split(' ');
      const monthIndex = months.indexOf(month);
      if (monthIndex === -1) return;

      const activityDate = new Date(year, monthIndex, parseInt(day));
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (activityDate < today && !activity.completed) {
        await updateDoc(doc.ref, { completed: true });
      }
    });
  } catch (error) {
    console.error("Error checking expired daily activities: ", error);
  }
};

export const addDailyActivity = async (activityName, activityDate) => {
  if (!userId && !(await initUserId())) return false;
  if (!activityName.trim()) return false;

  const dateToAdd = new Date();
  if (activityDate === 'tomorrow') dateToAdd.setDate(dateToAdd.getDate() + 1);
  
  const formattedDate = `${dateToAdd.getDate()} ${months[dateToAdd.getMonth()]} ${dateToAdd.getFullYear()}`;
  
  try {
    await addDoc(getFirestoreRef(['dailyActivities']), {
      name: activityName.trim(),
      date: formattedDate,
      status: "",
      priority: "",
      completed: false,
    });
    return true;
  } catch (error) {
    console.error('Error adding daily activity:', error);
    return false;
  }
};

document.addEventListener('DOMContentLoaded', initUserId);