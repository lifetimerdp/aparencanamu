import { auth, db } from "./firebaseConfig.js";
import { getDoc, doc, updateDoc, setDoc, Timestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CATEGORIES = ["booksRead", "coursesTaken", "hobbiesInterests", "keterampilan", "prestasi", "target", "sertifikasi", "catatan"];
const CATEGORY_LABELS = {
    booksRead: "Buku Dibaca",
    coursesTaken: "Kursus Diikuti",
    hobbiesInterests: "Hobi & Minat",
    keterampilan: "Keterampilan",
    prestasi: "Prestasi",
    target: "Target",
    sertifikasi: "Sertifikasi",
    catatan: "Catatan"
};

const DOM = {
    form: document.getElementById("pengembangan-form"),
    kategoriSelect: document.getElementById("kategori-select"),
    itemInput: document.getElementById("item-input"),
    tanggalInput: document.getElementById("tanggal-input"),
    deskripsiInput: document.getElementById("deskripsi-input"),
    editModal: document.getElementById("edit-modal"),
    editForm: document.getElementById("edit-form"),
    editItemInput: document.getElementById("edit-item-input"),
    editTanggalInput: document.getElementById("edit-tanggal-input"),
    editDeskripsiInput: document.getElementById("edit-deskripsi-input"),
    editItemId: document.getElementById("edit-item-id"),
    editKategori: document.getElementById("edit-kategori"),
    closeModal: document.querySelector(".close"),
    cancelEdit: document.getElementById("cancel-edit"),
};

const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

const formatDate = (timestamp) => (timestamp ? timestamp.toDate().toISOString().split("T")[0] : "");

const createItemData = (title, date, description = "") => ({
    id: generateId(),
    title,
    date: Timestamp.fromDate(new Date(date)),
    description,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
});

const STATUS_OPTIONS = {
  'not-started': 'Belum Dimulai',
  'in-progress': 'Sedang Berjalan', 
  'completed': 'Selesai'
};

const TIMEFRAME_OPTIONS = {
  'short': 'Jangka Pendek',
  'long': 'Jangka Panjang'
};

const createTargetData = (
  title, 
  date, 
  description = "",
  timeframe = "short",
  status = "not-started",
  isMilestone = false,
  lessonLearned = "",
  referenceLink = "",
  progressNotes = "",
  relatedCategories = []
) => ({
  ...createItemData(title, date, description),
  timeframe,
  status,
  isMilestone,
  lessonLearned,
  referenceLink,
  progressNotes,
  relatedCategories
});

const filterAndSearchItems = (items, filters) => {
  if (!items) return [];
  
  return items.filter(item => {
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesTimeframe = !filters.timeframe || item.timeframe === filters.timeframe;
    const matchesSearch = !filters.search || 
      item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesTimeframe && matchesSearch;
  });
};

// Tambahkan fungsi untuk mengurutkan items
const sortItems = (items, sortType) => {
  if (!items) return [];
  
  const sortedItems = [...items];
  switch(sortType) {
    case 'date-desc':
      return sortedItems.sort((a, b) => b.date.seconds - a.date.seconds);
    case 'date-asc':
      return sortedItems.sort((a, b) => a.date.seconds - b.date.seconds);
    case 'status':
      return sortedItems.sort((a, b) => {
        const statusOrder = {'completed': 1, 'in-progress': 2, 'not-started': 3};
        return statusOrder[a.status] - statusOrder[b.status];
      });
    default:
      return sortedItems;
  }
};

const getCategoryLabel = (category) => CATEGORY_LABELS[category] || category;

function enhanceSuccessMessage(message, kategori = null, action = null, name = null) {
    const existingNotification = document.querySelector(".success-message");
    if (existingNotification) {
        existingNotification.remove();
    }

    const successElement = document.createElement("div");
    successElement.className = "success-message";

    const successMessages = {
        booksRead: [
            "1 buku baru membuka jendela pengetahuan barumu.",
            "Setiap buku adalah perjalanan ilmu yang menakjubkan.",
            "Membaca adalah investasi terbaik untuk dirimu.",
            "Satu buku, seribu pengalaman baru."
        ],
        coursesTaken: [
            "Kursus baru = Skill baru dikembangkan!",
            "Terus belajar, terus tumbuh.",
            "Pengetahuan adalah kekuatan, dan kamu baru saja mendapatkannya.",
            "Selamat pada langkah pembelajaran barumu!"
        ],
        hobbiesInterests: [
            "Hobi adalah jendela kebahagiaan dan kreativitasmu.",
            "Setiap minat baru adalah potensi tersembunyi.",
            "Kamu baru saja menambah warna pada kehidupanmu.",
            "Hobi membuat hidup terasa lebih berarti."
        ],
        keterampilan: [
            "Skill baru, kesempatan baru!",
            "Setiap keterampilan adalah senjata untuk masa depan.",
            "Kamu baru saja memperluas peta kemampuanmu.",
            "Terus asah, terus kembangkan potensimu."
        ],
        prestasi: [
            "Setiap prestasi adalah bukti kerja kerasmu.",
            "Kamu layak berbangga dengan pencapaianmu!",
            "Prestasi kecil hari ini, kesuksesan besar besok.",
            "Terus ukir prestasi, terus inspirasi."
        ],
        target: [
            "Target baru = Mimpi baru yang akan diwujudkan!",
            "Setiap target adalah kompas perjalananmu.",
            "Kamu baru saja membuat peta masa depanmu.",
            "Tetap fokus, target akan tercapai."
        ],
        sertifikasi: [
            "Sertifikasi baru, kredibilitas bertambah!",
            "Selamat pada pengakuan profesionalitasmu.",
            "Sertifikasi adalah bukti komitmen belajarmu.",
            "Terus kembangkan diri melalui sertifikasi."
        ],
        catatan: [
            "Catatan adalah jembatan antara pikiran dan aksi.",
            "Setiap catatan adalah langkah refleksi dirimu.",
            "Kamu baru saja merekam momen pertumbuhanmu.",
            "Terus catat, terus pelajari."
        ],
    };

    const actionMessages = {
        diperbarui: "telah diperbarui. Terus kembangkan dirimu!",
        dihapus: "telah dihapus. Tetap fokus pada tujuanmu!"
    };

    let successText;
    if (action && name) {
        const categoryLabel = getCategoryLabel(kategori);
        successText = `${categoryLabel} "${name}" ${actionMessages[action]}`;
    } else {
        const categoryMessages = successMessages[kategori] || [
            "Keren! Kamu baru saja menambahkan langkah maju dalam perkembanganmu.",
            "Setiap langkah kecil adalah kemajuan besar.",
            "Terus berkembang, terus tumbuh!"
        ];
        successText = categoryMessages[Math.floor(Math.random() * categoryMessages.length)];
    }

    successElement.textContent = successText;
    document.body.appendChild(successElement);

    setTimeout(() => {
        successElement.style.opacity = "0";
        setTimeout(() => {
            successElement.remove();
        }, 500);
    }, 3000);
}

const createProgressSummary = (userData) => {
    const progressGrid = document.createElement("div");
    progressGrid.className = "progress-grid";

    CATEGORIES.forEach((category) => {
        const items = userData[category] || [];
        const card = document.createElement("div");
        card.className = "progress-card";
        card.innerHTML = `
            <div class="progress-number">${items.length}</div>
            <div class="progress-label">${getCategoryLabel(category)}</div>
        `;
        progressGrid.appendChild(card);
    });

    const progressContainer = document.createElement("div");
    progressContainer.className = "progress-container";
    progressContainer.appendChild(progressGrid);
    return progressContainer;
};

const showEditModal = (item, kategori) => {
    DOM.editItemInput.value = item.title;
    DOM.editTanggalInput.value = formatDate(item.date);
    DOM.editDeskripsiInput.value = item.description || "";
    DOM.editItemId.value = item.id;
    DOM.editKategori.value = kategori;
    DOM.editModal.style.display = "block";

    if (kategori === 'target') {
        // Add target-specific fields to edit modal
        const existingTargetFields = DOM.editForm.querySelector('.target-fields');
        if (!existingTargetFields) {
            const targetFields = document.createElement('div');
            targetFields.className = 'target-fields active';
            targetFields.innerHTML = `
                <div class="milestone-checkbox">
                    <input type="checkbox" id="edit-milestone-check" ${item.isMilestone ? 'checked' : ''}>
                    <label for="edit-milestone-check">Tandai sebagai Milestone</label>
                </div>
                <select id="edit-milestone-type" ${!item.isMilestone ? 'disabled' : ''}>
                    <option value="">Pilih Tipe Milestone</option>
                    <option value="short" ${item.milestoneType === 'short' ? 'selected' : ''}>Jangka Pendek</option>
                    <option value="long" ${item.milestoneType === 'long' ? 'selected' : ''}>Jangka Panjang</option>
                </select>
                <select id="edit-status-select" required>
                    <option value="not-started" ${item.status === 'not-started' ? 'selected' : ''}>Belum Dimulai</option>
                    <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>Sedang Berjalan</option>
                    <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Selesai</option>
                </select>
                <div class="related-categories-select">
                    <label>Kategori Terkait:</label>
                    <select id="edit-related-categories" multiple>
                        ${CATEGORIES.filter(cat => cat !== 'target').map(cat => 
                            `<option value="${cat}" ${item.relatedCategories?.includes(cat) ? 'selected' : ''}>${CATEGORY_LABELS[cat]}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
            DOM.editForm.insertBefore(targetFields, DOM.editForm.querySelector('button'));

            document.getElementById('edit-milestone-check').addEventListener('change', (e) => {
                document.getElementById('edit-milestone-type').disabled = !e.target.checked;
            });
        }
    }
};

const closeEditModal = () => {
    DOM.editModal.style.display = "none";
    DOM.editForm.reset();
    const targetFields = DOM.editForm.querySelector('.target-fields');
    if (targetFields) {
        targetFields.remove();
    }
};

const renderList = (listElement, emptyElement, items, kategori) => {
    if (kategori === 'target') {
        renderTargetList(listElement, emptyElement, items);
        return;
    }

    if (!items || items.length === 0) {
        listElement.style.display = "none";
        emptyElement.style.display = "block";
        return;
    }

    listElement.style.display = "block";
    emptyElement.style.display = "none";
    listElement.innerHTML = "";

    items.sort((a, b) => b.date.seconds - a.date.seconds).forEach((item) => {
        const li = document.createElement("li");
        li.className = "item-card";
        const date = item.date.toDate().toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });

        li.innerHTML = `
            <div class="item-header">
                <h3>${item.title}</h3>
                <span class="date">${date}</span>
            </div>
            ${item.description ? `<p class="description">${item.description}</p>` : ""}
            <div class="item-actions">
                <button class="edit-btn" data-id="${item.id}">Edit</button>
                <button class="delete-btn" data-id="${item.id}">Hapus</button>
            </div>
        `;

        li.querySelector(".edit-btn").onclick = () => showEditModal(item, kategori);
        li.querySelector(".delete-btn").onclick = () => deleteItem(item, kategori);
        listElement.appendChild(li);
    });
};

const renderTargetList = (listElement, emptyElement, items) => {
  if (!items || items.length === 0) {
    listElement.style.display = "none";
    emptyElement.style.display = "block";
    return;
  }

  listElement.style.display = "block";
  emptyElement.style.display = "none";

  const journeyContainer = document.createElement('div');
  journeyContainer.className = 'journey-container';
  
  const journeyPath = document.createElement('div');
  journeyPath.className = 'journey-path';
  
  const journeyLine = document.createElement('div');
  journeyLine.className = 'journey-line';
  journeyPath.appendChild(journeyLine);

  items.forEach(item => {
    const journeyItem = document.createElement('div');
    journeyItem.className = `journey-item status-${item.status || 'not-started'} timeframe-${item.timeframe || 'short'}`;
    if (item.isMilestone) journeyItem.classList.add('milestone');

    const date = item.date.toDate().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    journeyItem.innerHTML = `
      <h3>${item.title}</h3>
      <span class="date">${date}</span>
      ${item.description ? `<p class="description">${item.description}</p>` : ''}
      <div class="target-details">
        <p class="timeframe">Jangka Waktu: ${TIMEFRAME_OPTIONS[item.timeframe]}</p>
        <p class="status">Status: ${STATUS_OPTIONS[item.status]}</p>
        ${item.lessonLearned ? `<p class="lesson">Pembelajaran: ${item.lessonLearned}</p>` : ''}
        ${item.referenceLink ? `<p class="reference">Referensi: <a href="${item.referenceLink}" target="_blank">Link</a></p>` : ''}
        ${item.progressNotes ? `<p class="progress">Progress: ${item.progressNotes}</p>` : ''}
      </div>
      ${item.relatedCategories?.length ? 
        `<div class="related-categories">
          ${item.relatedCategories.map(cat => 
            `<span class="category-tag">${CATEGORY_LABELS[cat]}</span>`
          ).join('')}
        </div>` : ''
      }
      <div class="item-actions">
        <button class="edit-btn" data-id="${item.id}">Edit</button>
        <button class="delete-btn" data-id="${item.id}">Hapus</button>
      </div>
    `;

    journeyPath.appendChild(journeyItem);
  });

  journeyContainer.appendChild(journeyPath);
  listElement.innerHTML = '';
  listElement.appendChild(journeyContainer);
};

const addItem = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
        alert("Silakan login terlebih dahulu");
        return;
    }

    const kategori = DOM.kategoriSelect.value;
    if (!kategori) {
        alert("Silakan pilih kategori");
        return;
    }

    try {
        let itemData;
        if (kategori === 'target') {
            itemData = createTargetData(
                DOM.itemInput.value.trim(),
                DOM.tanggalInput.value,
                DOM.deskripsiInput.value.trim(),
                document.getElementById('status-select').value,
                document.getElementById('milestone-check').checked,
                document.getElementById('milestone-type').value,
                Array.from(document.getElementById('related-categories').selectedOptions)
                    .map(option => option.value)
            );
        } else {
            itemData = createItemData(
                DOM.itemInput.value.trim(),
                DOM.tanggalInput.value,
                DOM.deskripsiInput.value.trim()
            );
        }

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

        DOM.form.reset();
        const targetFields = document.querySelector('.target-fields');
        if (targetFields) {
            targetFields.classList.remove('active');
        }
        enhanceSuccessMessage("Keren! Kamu baru saja menambahkan langkah maju dalam perkembanganmu.", kategori);
        await loadUserData();
    } catch (error) {
        console.error("Error menambah data:", error);
        alert("Gagal menambah data. Error: " + error.message);
    }
};

const updateItem = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    const itemId = DOM.editItemId.value;
    const kategori = DOM.editKategori.value;
    const itemName = DOM.editItemInput.value.trim();

    try {
        const docRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(docRef);
        const currentData = userDoc.data()[kategori] || [];

        let updatedData;
        if (kategori === 'target') {
            updatedData = currentData.map(item => 
                item.id === itemId ? {
                    ...item,
                    title: itemName,
                    date: Timestamp.fromDate(new Date(DOM.editTanggalInput.value)),
                    description: DOM.editDeskripsiInput.value.trim(),
                    status: document.getElementById('edit-status-select').value,
                    isMilestone: document.getElementById('edit-milestone-check').checked,
                    milestoneType: document.getElementById('edit-milestone-type').value,
                    relatedCategories: Array.from(document.getElementById('edit-related-categories').selectedOptions)
                        .map(option => option.value),
                    updatedAt: Timestamp.now()
                } : item
            );
        } else {
            updatedData = currentData.map(item =>
                item.id === itemId ? {
                    ...item,
                    title: itemName,
                    date: Timestamp.fromDate(new Date(DOM.editTanggalInput.value)),
                    description: DOM.editDeskripsiInput.value.trim(),
                    updatedAt: Timestamp.now()
                } : item
            );
        }

        await updateDoc(docRef, { [kategori]: updatedData });
        closeEditModal();
        enhanceSuccessMessage(null, kategori, "diperbarui", itemName);
        await loadUserData();
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
        const updatedData = currentData.filter((i) => i.id !== item.id);

        await updateDoc(docRef, { [kategori]: updatedData });
        enhanceSuccessMessage(null, kategori, "dihapus", item.title);
        await loadUserData();
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
        const container = document.querySelector(".container");
        const existingProgressContainers = document.querySelectorAll(".progress-container");
        existingProgressContainers.forEach((el) => el.remove());

        const progressSummary = createProgressSummary(userData);
        const pageTitle = document.querySelector(".page-title");
        if (pageTitle) {
            pageTitle.insertAdjacentElement("afterend", progressSummary);
        }

        CATEGORIES.forEach((kategori) => {
            const listId = `${kategori.replace(/([A-Z])/g, "-$1").toLowerCase()}-list`;
            const emptyId = `${kategori.replace(/([A-Z])/g, "-$1").toLowerCase()}-empty`;
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

// Add target-specific fields when "Target" is selected
DOM.kategoriSelect.addEventListener('change', (e) => {
    const targetFields = document.querySelector('.target-fields');
    if (e.target.value === 'target') {
        if (!targetFields) {
            const fields = document.createElement('div');
            fields.className = 'target-fields active';
            fields.innerHTML = `
                <div class="milestone-checkbox">
                    <input type="checkbox" id="milestone-check">
                    <label for="milestone-check">Tandai sebagai Milestone</label>
                </div>
                <select id="milestone-type" disabled>
                    <option value="">Pilih Tipe Milestone</option>
                    <option value="short">Jangka Pendek</option>
                    <option value="long">Jangka Panjang</option>
                </select>
                <select id="status-select" required>
                    <option value="not-started">Belum Dimulai</option>
                    <option value="in-progress">Sedang Berjalan</option>
                    <option value="completed">Selesai</option>
                </select>
                <div class="related-categories-select">
                    <label>Kategori Terkait:</label>
                    <select id="related-categories" multiple>
                        ${CATEGORIES.filter(cat => cat !== 'target').map(cat => 
                            `<option value="${cat}">${CATEGORY_LABELS[cat]}</option>`
                        ).join('')}
                    </select>
                </div>
            `;
            DOM.form.insertBefore(fields, DOM.form.querySelector('button'));

            document.getElementById('milestone-check').addEventListener('change', (e) => {
                document.getElementById('milestone-type').disabled = !e.target.checked;
            });
        } else {
            targetFields.classList.add('active');
        }
    } else if (targetFields) {
        targetFields.classList.remove('active');
    }
});

document.addEventListener("DOMContentLoaded", () => {
		const searchInput = document.getElementById('search-input');
	  const filterStatus = document.getElementById('filter-status');
	  const filterTimeframe = document.getElementById('filter-timeframe');
	  const sortSelect = document.getElementById('sort-select');
	  const exportPdfBtn = document.getElementById('export-pdf');
	
	  const applyFiltersAndSort = async () => {
	    const filters = {
	      search: searchInput.value,
	      status: filterStatus.value,
	      timeframe: filterTimeframe.value
	    };
	    
	    const sortType = sortSelect.value;
	    const userData = await getUserData();
	    
	    if (userData?.target) {
	      const filteredItems = filterAndSearchItems(userData.target, filters);
	      const sortedItems = sortItems(filteredItems, sortType);
	      const targetList = document.getElementById('target-list');
	      const targetEmpty = document.getElementById('target-empty');
	      renderTargetList(targetList, targetEmpty, sortedItems);
	    }
	  };
	
	  // Tambahkan event listeners untuk filter dan pencarian
	  [searchInput, filterStatus, filterTimeframe, sortSelect].forEach(element => {
	    element?.addEventListener('input', applyFiltersAndSort);
	  });
	
	  // Tambahkan fungsi export PDF
	  exportPdfBtn?.addEventListener('click', () => {
	    window.print();
	  });
    const today = new Date().toISOString().split("T")[0];
    if (DOM.tanggalInput) {
        DOM.tanggalInput.value = today;
    }

    if (DOM.form) {
        DOM.form.addEventListener("submit", addItem);
    }

    if (DOM.editForm) {
        DOM.editForm.addEventListener("submit", updateItem);
    }

    if (DOM.closeModal) {
        DOM.closeModal.addEventListener("click", closeEditModal);
    }

    if (DOM.cancelEdit) {
        DOM.cancelEdit.addEventListener("click", closeEditModal);
    }

    window.addEventListener("click", (e) => {
        if (e.target === DOM.editModal) {
            closeEditModal();
        }
    });

    auth.onAuthStateChanged((user) => {
        if (!user) {
            window.location.href = "/masuk";
        } else {
            loadUserData();
        }
    });
});

const findItemById = (itemId, kategori) => {
    const userData = auth.currentUser 
        ? JSON.parse(localStorage.getItem(`userData_${auth.currentUser.uid}`))
        : null;
    
    if (userData && userData[kategori]) {
        return userData[kategori].find((item) => item.id === itemId);
    }
    return null;
};