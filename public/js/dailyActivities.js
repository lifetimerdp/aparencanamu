import { db } from './firebaseConfig.js';
import { getDocs, addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { checkAuth } from "./dashboard.js";
let userId = null;

const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
export const initUserId = async () => {
  try {
    const user = await checkAuth();
    if (user) {
      userId = user.uid;
      return userId;
    } else {
      userId = null;
      return null;
    }
  } catch (error) {
    console.error('Error initializing userId:', error);
    userId = null;
    return null;
  }
};

export const renderSubActivities = (parentElement, subActivities) => {
  const subActivityList = parentElement.querySelector('.sub-activity-list');
  const parentId = parentElement.getAttribute('data-id');
  if (!subActivityList) {
    console.error('Sub-activity list element not found');
    return;
  }
  subActivityList.innerHTML = ''; // Clear existing sub-activities

  const renderedSubActivities = new Set(); // To keep track of rendered sub-activities

  subActivities.forEach(subActivity => {
    if (subActivity.name && subActivity.name.trim() !== '' && !renderedSubActivities.has(subActivity.id)) {
      const li = document.createElement('li');
      li.setAttribute('data-id', subActivity.id);
      li.innerHTML = `
        <div class="item-content">
          <span class="item-name">${subActivity.name}</span>
          <div class="item-actions">
            <button class="edit-btn" data-id="${subActivity.id}" data-name="${subActivity.name}" data-type="subActivities" data-parent-id="${parentId}">Edit</button>
            <button class="delete-btn" data-id="${subActivity.id}" data-type="subActivities" data-parent-id="${parentId}">Hapus</button>
          </div>
        </div>
      `;

      const taskList = document.createElement('ul');
      taskList.className = 'task-list';
      li.appendChild(taskList);

      // Add task form for each sub-activity
      addTaskForm(li, parentId, subActivity.id);

      subActivityList.appendChild(li);

      // Load and render tasks for this sub-activity
      loadAndRenderTasks(taskList, parentId, subActivity.id);

      renderedSubActivities.add(subActivity.id); // Mark this sub-activity as rendered
    }
  });
};

const loadAndRenderTasks = (taskList, activityId, subActivityId) => {
  const tasksRef = collection(db, "users", userId, "dailyActivities", activityId, "subActivities", subActivityId, "tasks");
  onSnapshot(tasksRef, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTasks(taskList, tasks, activityId, subActivityId);
  });
};

export const renderTasks = (taskList, tasks, activityId, subActivityId) => {
  taskList.innerHTML = '';
  tasks.forEach(task => {
    const li = document.createElement('li');
    li.setAttribute('data-id', task.id);
    li.innerHTML = `
      <div class="item-content">
        <span class="item-name">${task.name}</span>
        <div class="item-actions">
          <button class="edit-btn" data-id="${task.id}" data-name="${task.name}" data-type="tasks" data-parent-id="${activityId}" data-sub-parent-id="${subActivityId}">Edit</button>
          <button class="delete-btn" data-id="${task.id}" data-type="tasks" data-parent-id="${activityId}" data-sub-parent-id="${subActivityId}">Hapus</button>
        </div>
      </div>
    `;
    taskList.appendChild(li);
  });
};

export const addTaskForm = (subActivityElement, activityId, subActivityId) => {
  const taskForm = document.createElement('form');
  taskForm.className = 'task-form';
  taskForm.innerHTML = `
    <input type="text" class="task-input" placeholder="Tambah tugas baru">
    <button type="submit">Tambah Tugas</button>
  `;

  subActivityElement.appendChild(taskForm);

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const taskInput = taskForm.querySelector('.task-input');
    const taskName = taskInput.value.trim();

    if (taskName && activityId && subActivityId) {
      try {
        const taskRef = collection(db, "users", userId, "dailyActivities", activityId, "subActivities", subActivityId, "tasks");

        await addDoc(taskRef, {
          name: taskName,
          completed: false
        });

        taskInput.value = '';
      } catch (error) {
        console.error('Error adding task:', error);
      }
    } else {
      console.error('Task name, activity ID, or sub-activity ID is missing.');
    }
  });
};

export const addSubActivityForm = (li, item) => {
  const subActivityForm = document.createElement('form');
  subActivityForm.className = 'sub-activity-form';
  subActivityForm.innerHTML = `
    <input type="text" class="sub-activity-input" placeholder="Tambah sub-aktivitas baru">
    <button type="submit">Tambah Sub-Aktivitas</button>
  `;
  li.appendChild(subActivityForm);

  const subActivitiesList = document.createElement('ul');
  subActivitiesList.className = 'sub-activity-list';
  li.appendChild(subActivitiesList);

  if (!userId) {
    console.error('User ID is not initialized');
    return;
  }

  const subActivitiesRef = collection(doc(db, "users", userId, "dailyActivities", item.id), "subActivities");
  
  subActivityForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const subActivityInput = subActivityForm.querySelector('.sub-activity-input');
    const subActivityName = subActivityInput.value.trim();
    
    if (subActivityName !== '') {
      try {
        await addDoc(subActivitiesRef, {
          name: subActivityName
        });
        subActivityInput.value = '';
      } catch (error) {
        console.error('Error adding sub-activity:', error);
      }
    }
  });

  onSnapshot(subActivitiesRef, (snapshot) => {
    const subActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderSubActivities(li, subActivities);
  });
};

export const checkExpiredDailyActivities = async () => {
  try {
    if (!userId) {
      console.error("User ID is not initialized");
      return;
    }

    const userDocRef = doc(db, "users", userId);
    const dailyActivitiesRef = collection(userDocRef, 'dailyActivities');
    const snapshot = await getDocs(dailyActivitiesRef);

    snapshot.forEach(async (doc) => {
      const activity = doc.data();
      if (!activity.date || typeof activity.date !== 'string') {
        console.error(`Invalid date format for activity ${doc.id}`);
        return;
      }

      const [day, month, year] = activity.date.split(' ');
      if (!day || !month || !year) {
        console.error(`Invalid date format for activity ${doc.id}: ${activity.date}`);
        return;
      }

      const monthIndex = months.indexOf(month);
      if (monthIndex === -1) {
        console.error(`Invalid month for activity ${doc.id}: ${month}`);
        return;
      }

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
  if (!userId) {
    await initUserId();
  }
  
  if (!userId) {
    console.error('User ID is still not initialized after attempt to initialize');
    return false;
  }

  if (activityName.trim()) {
    let dateToAdd = new Date();
    if (activityDate === 'tomorrow') {
      dateToAdd.setDate(dateToAdd.getDate() + 1);
    }
    const formattedDate = `${dateToAdd.getDate()} ${months[dateToAdd.getMonth()]} ${dateToAdd.getFullYear()}`;

    try {
      await addDoc(collection(doc(db, "users", userId), "dailyActivities"), {
        name: activityName.trim(),
        date: formattedDate,
        completed: false,
      });
      return true;
    } catch (error) {
      console.error('Error adding daily activity:', error);
      return false;
    }
  }
  return false;
};

document.addEventListener('DOMContentLoaded', async () => {
  await initUserId();
  // Kode lain yang perlu dijalankan setelah userId diinisialisasi
});