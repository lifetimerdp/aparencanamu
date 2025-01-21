import { auth, db } from './firebaseConfig.js';
import { getDoc, doc, updateDoc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const pengembanganForm = document.getElementById('pengembangan-form');
const kategoriSelect = document.getElementById('kategori-select');
const itemInput = document.getElementById('item-input');
const tanggalInput = document.getElementById('tanggal-input');
const deskripsiInput = document.getElementById('deskripsi-input');
const editModal = document.getElementById('edit-modal');
const editForm = document.getElementById('edit-form');
const editItemInput = document.getElementById('edit-item-input');
const editTanggalInput = document.getElementById('edit-tanggal-input');
const editDeskripsiInput = document.getElementById('edit-deskripsi-input');
const editItemId = document.getElementById('edit-item-id');
const editKategori = document.getElementById('edit-kategori');
const closeModal = document.querySelector('.close');
const cancelEdit = document.getElementById('cancel-edit');

const categories = [
    'booksRead',
    'coursesTaken',
    'hobbiesInterests',
    'keterampilan',
    'prestasi',
    'target',
    'sertifikasi',
    'catatan'
];

const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    return date.toISOString().split('T')[0];
};

const createItemData = (title, date, description = '') => ({
    id: generateId(),
    title,
    date: Timestamp.fromDate(new Date(date)),
    description,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
});

function getCategoryLabel(category) {
    const labels = {
        booksRead: 'Buku Dibaca',
        coursesTaken: 'Kursus Diikuti',
        hobbiesInterests: 'Hobi & Minat',
        keterampilan: 'Keterampilan',
        prestasi: 'Prestasi',
        target: 'Target',
        sertifikasi: 'Sertifikasi',
        catatan: 'Catatan'
    };
    return labels[category];
}

function createProgressSummary(userData) {
    const progressContainer = document.createElement('div');
    progressContainer.className = 'progress-container';
    
    const progressGrid = document.createElement('div');
    progressGrid.className = 'progress-grid';
    
    categories.forEach(category => {
        const items = userData[category] || [];
        const card = document.createElement('div');
        card.className = 'progress-card';
        
        const number = document.createElement('div');
        number.className = 'progress-number';
        number.textContent = items.length;
        
        const label = document.createElement('div');
        label.className = 'progress-label';
        label.textContent = getCategoryLabel(category);
        
        card.appendChild(number);
        card.appendChild(label);
        progressGrid.appendChild(card);
    });
    
    progressContainer.appendChild(progressGrid);
    return progressContainer;
}

const showEditModal = (item, kategori) => {
    editItemInput.value = item.title;
    editTanggalInput.value = formatDate(item.date);
    editDeskripsiInput.value = item.description || '';
    editItemId.value = item.id;
    editKategori.value = kategori;
    editModal.style.display = 'block';
};

const closeEditModal = () => {
    editModal.style.display = 'none';
    editForm.reset();
};

const renderList = (listElement, emptyElement, items, kategori) => {
    if (!items || items.length === 0) {
        listElement.style.display = 'none';
        emptyElement.style.display = 'block';
        return;
    }
    
    listElement.style.display = 'block';
    emptyElement.style.display = 'none';
    listElement.innerHTML = '';
    
    items.sort((a, b) => b.date.seconds - a.date.seconds).forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'item-card';
        li.style.animationDelay = `${index * 0.1}s`;
        
        const date = item.date.toDate().toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        li.innerHTML = `
            <div class="item-header">
                <h3>${item.title}</h3>
                <span class="date">${date}</span>
            </div>
            ${item.description ? `<p class="description">${item.description}</p>` : ''}
            <div class="item-actions">
                <button class="edit-btn" data-id="${item.id}">Edit</button>
                <button class="delete-btn" data-id="${item.id}">Hapus</button>
            </div>
        `;
        
        li.querySelector('.edit-btn').onclick = () => showEditModal(item, kategori);
        li.querySelector('.delete-btn').onclick = () => deleteItem(item, kategori);
        
        listElement.appendChild(li);
    });
};

const addItem = async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) {
        alert('Silakan login terlebih dahulu');
        return;
    }
    
    const kategori = kategoriSelect.value;
    if (!kategori) {
        alert('Silakan pilih kategori');
        return;
    }
    
    try {
        const itemData = createItemData(
            itemInput.value.trim(),
            tanggalInput.value,
            deskripsiInput.value.trim()
        );
        
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(docRef);
        
        if (!userDoc.exists()) {
            await setDoc(docRef, { [kategori]: [itemData] });
        } else {
            const currentData = userDoc.data()[kategori] || [];
            await updateDoc(docRef, {
                [kategori]: [...currentData, itemData]
            });
        }
        
        pengembanganForm.reset();
        await loadUserData();
        alert('Data berhasil ditambahkan!');
    } catch (error) {
        console.error("Error menambah data:", error);
        alert("Gagal menambah data. Error: " + error.message);
    }
};

const updateItem = async (e) => {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) return;
    
    const itemId = editItemId.value;
    const kategori = editKategori.value;
    
    try {
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(docRef);
        const currentData = userDoc.data()[kategori] || [];
        
        const updatedData = currentData.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    title: editItemInput.value.trim(),
                    date: Timestamp.fromDate(new Date(editTanggalInput.value)),
                    description: editDeskripsiInput.value.trim(),
                    updatedAt: Timestamp.now()
                };
            }
            return item;
        });
        
        await updateDoc(docRef, { [kategori]: updatedData });
        closeEditModal();
        await loadUserData();
        alert('Data berhasil diperbarui!');
    } catch (error) {
        console.error("Error memperbarui data:", error);
        alert("Gagal memperbarui data. Error: " + error.message);
    }
};

const deleteItem = async (item, kategori) => {
    if (!confirm("Yakin ingin menghapus item ini?")) return;
    
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(docRef);
        const currentData = userDoc.data()[kategori] || [];
        const updatedData = currentData.filter(i => i.id !== item.id);
        
        await updateDoc(docRef, { [kategori]: updatedData });
        await loadUserData();
        alert('Data berhasil dihapus!');
    } catch (error) {
        console.error("Error menghapus data:", error);
        alert("Gagal menghapus data. Error: " + error.message);
    }
};

const loadUserData = async () => {
    const user = auth.currentUser;
    if (!user) {
        console.log("User tidak ditemukan");
        return;
    }
    
    try {
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(docRef);
        if (!userDoc.exists()) {
            console.log("Dokumen user belum ada");
            return;
        }
        
        const userData = userDoc.data();
        const container = document.querySelector('.container');
        const existingProgress = document.querySelector('.progress-container');
        const progressSummary = createProgressSummary(userData);
        
        // Insert after page title
        const pageTitle = document.querySelector('.page-title');
        if (existingProgress) {
            container.replaceChild(progressSummary, existingProgress);
        } else if (pageTitle) {
            pageTitle.insertAdjacentElement('afterend', progressSummary);
        }
        
        // Rest of the function remains the same...
        categories.forEach(kategori => {
            const listId = `${kategori.replace(/([A-Z])/g, '-$1').toLowerCase()}-list`;
            const emptyId = `${kategori.replace(/([A-Z])/g, '-$1').toLowerCase()}-empty`;
            const listElement = document.getElementById(listId);
            const emptyElement = document.getElementById(emptyId);
            
            if (!listElement || !emptyElement) {
                console.error(`Element tidak ditemukan untuk kategori ${kategori}`);
                return;
            }
            
            const items = userData[kategori] || [];
            renderList(listElement, emptyElement, items, kategori);
        });
    } catch (error) {
        console.error("Error memuat data:", error);
        alert("Gagal memuat data. Error: " + error.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    if (tanggalInput) {
        tanggalInput.value = today;
    }
    
    // Add event listeners
    if (pengembanganForm) {
        pengembanganForm.addEventListener('submit', addItem);
    }
    
    if (editForm) {
        editForm.addEventListener('submit', updateItem);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeEditModal);
    }
    
    if (cancelEdit) {
        cancelEdit.addEventListener('click', closeEditModal);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === editModal) {
            closeEditModal();
        }
    });
    
    // Check authentication and load data
    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = '/masuk';
        } else {
            loadUserData();
        }
    });
});