import { auth, db } from './firebaseConfig.js';
import { 
  getDoc, 
  doc, 
  updateDoc, 
  arrayUnion 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Redirect if not authenticated
auth.onAuthStateChanged((user) => {
  if (!user) {
    window.location.href = '/masuk';
  } else {
    loadUserData();
  }
});

const booksReadForm = document.getElementById('books-read-form');
const booksReadInput = document.getElementById('books-read-input');
const coursesTakenForm = document.getElementById('courses-taken-form');
const coursesTakenInput = document.getElementById('courses-taken-input');
const hobbiesInterestsForm = document.getElementById('hobbies-interests-form');
const hobbiesInterestsInput = document.getElementById('hobbies-interests-input');

const renderList = (listElement, emptyElement, items) => {
  if (!items || items.length === 0) {
    listElement.style.display = 'none';
    emptyElement.style.display = 'block';
    return;
  }

  listElement.style.display = 'block';
  emptyElement.style.display = 'none';
  listElement.innerHTML = '';

  items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    
    const deleteButton = document.createElement('button');
    deleteButton.textContent = '×';
    deleteButton.className = 'delete-btn';
    deleteButton.onclick = () => deleteItem(item, listElement.id);
    
    li.appendChild(deleteButton);
    listElement.appendChild(li);
  });
};

const deleteItem = async (item, listId) => {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "users", user.uid);
  const fieldMap = {
    'books-read-list': 'booksRead',
    'courses-taken-list': 'coursesTaken',
    'hobbies-interests-list': 'hobbiesInterests'
  };
  
  const field = fieldMap[listId];
  const userDoc = await getDoc(docRef);
  const currentItems = userDoc.data()[field] || [];
  const updatedItems = currentItems.filter(i => i !== item);
  
  await updateDoc(docRef, {
    [field]: updatedItems
  });
  
  loadUserData();
};

const loadUserData = async () => {
  const user = auth.currentUser;
  if (!user) {
    console.log("Tidak ada pengguna yang login.");
    return;
  }

  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    
    if (!userDoc.exists()) {
      console.log("Dokumen tidak ditemukan!");
      return;
    }

    const userData = userDoc.data();
    
    // Render all lists
    renderList(
      document.getElementById('books-read-list'),
      document.getElementById('books-read-empty'),
      userData.booksRead || []
    );
    
    renderList(
      document.getElementById('courses-taken-list'),
      document.getElementById('courses-taken-empty'),
      userData.coursesTaken || []
    );
    
    renderList(
      document.getElementById('hobbies-interests-list'),
      document.getElementById('hobbies-interests-empty'),
      userData.hobbiesInterests || []
    );
    
  } catch (error) {
    console.error("Error loading user data:", error);
  }
};

const addPersonalDevelopmentData = async (devType, inputElement) => {
  const user = auth.currentUser;
  if (!user) return;

  const docRef = doc(db, "users", user.uid);
  const devData = inputElement.value.trim();
  
  if (devData) {
    try {
      await updateDoc(docRef, {
        [devType]: arrayUnion(devData)
      });
      inputElement.value = '';
      loadUserData();
    } catch (error) {
      console.error("Error adding data:", error);
    }
  }
};

// Event listeners
booksReadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('booksRead', booksReadInput);
});

coursesTakenForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('coursesTaken', coursesTakenInput);
});

hobbiesInterestsForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  await addPersonalDevelopmentData('hobbiesInterests', hobbiesInterestsInput);
});