import { auth, db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc, updateDoc, Timestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const CATEGORIES = {
  target: { icon: "🎯", label: "Target" },
  booksRead: { icon: "📚", label: "Buku" },
  coursesTaken: { icon: "🎓", label: "Kursus" },
  hobbiesInterests: { icon: "🎨", label: "Hobi" },
  keterampilan: { icon: "🛠️", label: "Keterampilan" },
  prestasi: { icon: "🏆", label: "Prestasi" },
  sertifikasi: { icon: "📜", label: "Sertifikasi" },
  catatan: { icon: "📝", label: "Catatan" }
};

class DevelopmentManager {
  constructor() {
    this.currentStep = 0;
    this.formData = {};
    this.userData = {};
    this.editFormSubmitHandler = null;
    this.debounceTimer = null;
    this.currentFilter = null;
    this.init();
  }

  async init() {
    this.initDOM();
    this.setupEventListeners();
    this.authStateHandler();
    this.setDefaultDate();
    this.populateKategoriOptions();
    this.setupLiveValidation();
  }

  initDOM() {
    this.dom = {
      formWizard: document.querySelector(".form-wizard"),
      wizardPanels: document.querySelectorAll(".wizard-panel"),
      btnPrev: document.querySelectorAll(".btn-prev"),
      btnNext: document.querySelectorAll(".btn-next"),
      kategoriSelect: document.getElementById("kategori-select"),
      itemInput: document.getElementById("item-input"),
      tanggalInput: document.getElementById("tanggal-input"),
      deskripsiInput: document.getElementById("deskripsi-input"),
      dataGrid: document.getElementById("data-sections"),
      sectionTemplate: document.getElementById("section-template"),
      modal: document.getElementById("modal"),
      editForm: document.getElementById("edit-form"),
      globalSearch: document.getElementById("global-search"),
      resetFilter: document.getElementById("reset-filter"),
      exportCSV: document.getElementById("export-csv"),
      targetCategory: document.getElementById("target-category"),
      targetValue: document.getElementById("target-value"),
      btnSetTarget: document.querySelector(".btn-set-target")
    };
  }

  setupEventListeners() {
    document.querySelectorAll(".desktop-tabs a").forEach(tab => tab.addEventListener("click", e => {
      e.preventDefault();
      this.showSection(tab.getAttribute("href"));
    }));
    document.querySelector(".mobile-dropdown").addEventListener("change", e => this.showSection(e.target.value));
    this.dom.btnPrev.forEach(btn => btn.addEventListener("click", () => this.handlePrevStep()));
    this.dom.btnNext.forEach(btn => btn.addEventListener("click", () => this.handleNextStep()));
    document.getElementById("pengembangan-form").addEventListener("submit", e => this.handleFormSubmit(e));
    this.dom.dataGrid.addEventListener("click", e => this.handleDynamicElements(e));
    this.dom.dataGrid.addEventListener("input", e => this.handleSearchInput(e));
    this.dom.deskripsiInput.addEventListener("input", () => this.updateCharacterCount());
    this.dom.modal.querySelector(".btn-close").addEventListener("click", () => this.toggleModal());
    this.dom.globalSearch.addEventListener("input", e => this.handleGlobalSearch(e));
    this.dom.resetFilter.addEventListener("click", () => this.resetFilter());
    this.dom.exportCSV.addEventListener("click", () => this.exportToCSV());
    this.dom.btnSetTarget.addEventListener("click", e => {
      e.preventDefault();
      this.handleSetTarget();
    });
  }

  async authStateHandler() {
    auth.onAuthStateChanged(async user => {
      if (!user) return (window.location.href = "/masuk");
      this.userRef = doc(db, "users", user.uid);
      this.setupRealtimeListener();
    });
  }

  handleNextStep() {
    if (!this.validateStep()) return;
    this.currentStep++;
    this.updateWizard();
  }

  handlePrevStep() {
    this.currentStep--;
    this.updateWizard();
  }

  validateStep() {
    const currentPanel = this.dom.wizardPanels[this.currentStep];
    const requiredFields = currentPanel.querySelectorAll("[required]");
    let isValid = true;
    if (this.currentStep === 1) {
      const selectedDate = new Date(this.dom.tanggalInput.value);
      const today = new Date();
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      if (selectedDate > today) {
        this.showNotification("Tanggal tidak boleh di masa depan", "error");
        this.dom.tanggalInput.style.borderColor = "var(--error)";
        isValid = false;
      }
    }
    requiredFields.forEach(field => {
      if (!field.checkValidity()) {
        field.reportValidity();
        isValid = false;
      }
    });
    return isValid;
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    this.showLoading();
    try {
      const user = auth.currentUser;
      if (!user) return;
      const selectedDate = new Date(this.dom.tanggalInput.value);
      if (selectedDate > new Date()) throw new Error("Tanggal tidak boleh di masa depan");
      const itemData = {
        id: this.generateId(),
        title: this.dom.itemInput.value.trim(),
        date: Timestamp.fromDate(new Date(this.dom.tanggalInput.value)),
        description: this.dom.deskripsiInput.value.trim(),
        category: this.dom.kategoriSelect.value,
        createdAt: Timestamp.now()
      };
      await this.saveToFirebase(user.uid, itemData);
      this.resetForm();
      this.showNotification("Data berhasil disimpan!", "success");
      this.renderDataSections();
      this.renderChart();
    } catch (error) {
      this.showNotification(`Gagal menyimpan: ${error.message}`, "error");
    } finally {
      this.hideLoading();
    }
  }

  renderDataSections() {
    this.dom.dataGrid.innerHTML = "";
    Object.entries(CATEGORIES).forEach(([key, category]) => {
      const section = this.dom.sectionTemplate.content.cloneNode(true);
      section.querySelector(".section-title").textContent = `${category.icon} ${category.label}`;
      section.querySelector(".data-card").id = `${key}-section`;
      section.querySelector(".btn-add").dataset.category = key;
      this.dom.dataGrid.appendChild(section);
    });
    this.renderAllItems();
  }

  renderAllItems() {
    Object.keys(CATEGORIES).forEach(category => {
      const listElement = document.querySelector(`#${category}-section .item-list`);
      const emptyState = document.querySelector(`#${category}-section .empty-state`);
      const items = this.userData[category] || [];
      this.renderItems(listElement, emptyState, items, category);
    });
  }

  renderItems(listElement, emptyState, items, category) {
    listElement.innerHTML = "";
    if (items.length === 0) {
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";
    items.forEach(item => {
      const li = document.createElement("li");
      li.innerHTML = `
        <div>
          <h3>${item.title.length > 50 ? item.title.substring(0, 47) + "..." : item.title}</h3>
          <small>${item.date.toDate().toLocaleDateString("id-ID")}</small>
          ${item.description ? `<p class="item-desc">${item.description.length > 150 ? item.description.substring(0, 147) + "..." : item.description}</p>` : ""}
        </div>
        <div class="item-actions">
          <button class="btn-edit" data-id="${item.id}" data-category="${category}">✏️</button>
          <button class="btn-delete" data-id="${item.id}" data-category="${category}">🗑️</button>
        </div>
      `;
      listElement.appendChild(li);
    });
  }

  renderChart() {
    const chartContainer = document.querySelector("#progress-chart .chart-bars");
    chartContainer.innerHTML = "";
    const totalItems = Object.keys(CATEGORIES).reduce((acc, key) => acc + (this.userData[key]?.length || 0), 0);
    Object.entries(CATEGORIES).forEach(([key, category]) => {
      const count = this.userData[key]?.length || 0;
      const target = this.userData.targets?.[key] || 0;
      const percentage = target > 0 ? Math.min((count / target) * 100, 100) : totalItems > 0 ? (count / totalItems) * 100 : 0;
      const bar = document.createElement("div");
      bar.className = "chart-bar";
      bar.innerHTML = `
        <div class="bar-label">${category.icon} ${category.label}</div>
        <div class="bar-container">
          <div class="bar-fill" style="width: 0%" data-target-width="${percentage}%" data-progress="${target > 0 ? `${count}/${target}` : `${percentage.toFixed(0)}%`}"></div>
        </div>
        <div class="bar-value">${count} item</div>
      `;
      bar.addEventListener("click", () => this.filterByCategory(key));
      chartContainer.appendChild(bar);
    });
    this.animateChart();
  }

  animateChart() {
    const bars = document.querySelectorAll(".bar-fill");
    bars.forEach((bar, index) => {
      const targetWidth = bar.dataset.targetWidth;
      setTimeout(() => bar.style.width = targetWidth, 100 * index);
    });
  }

  filterByCategory(category) {
    if (this.currentFilter === category) {
      this.resetFilter();
      return;
    }
    this.currentFilter = category;
    this.dom.resetFilter.classList.remove("hidden");
    this.dom.globalSearch.value = "";
    document.querySelectorAll(".data-card").forEach(card => card.style.display = card.id === `${category}-section` ? "block" : "none");
    this.showNotification(`Menampilkan kategori: ${CATEGORIES[category].label}`);
  }

  resetFilter() {
    this.currentFilter = null;
    this.dom.resetFilter.classList.add("hidden");
    document.querySelectorAll(".data-card").forEach(card => card.style.display = "block");
    this.showNotification("Menampilkan semua kategori");
  }

  handleGlobalSearch(e) {
    const term = e.target.value.toLowerCase();
    Object.keys(CATEGORIES).forEach(category => {
      const items = this.userData[category] || [];
      const filtered = items.filter(item => item.title.toLowerCase().includes(term) || (item.description?.toLowerCase().includes(term)));
      const listElement = document.querySelector(`#${category}-section .item-list`);
      const emptyState = document.querySelector(`#${category}-section .empty-state`);
      const section = document.querySelector(`#${category}-section`);
      this.renderItems(listElement, emptyState, filtered, category);
      section.style.display = filtered.length > 0 ? 'block' : 'none';
    });
  }

  async handleSetTarget() {
    const category = this.dom.targetCategory.value;
    const value = this.dom.targetValue.value;
    if (!category || !value) {
      this.showNotification("Harap isi kategori dan nilai target", "error");
      return;
    }
    try {
      await updateDoc(this.userRef, { [`targets.${category}`]: Number(value) });
      this.showNotification("Target berhasil diperbarui");
      this.dom.targetValue.value = "";
    } catch (error) {
      this.showNotification(`Gagal update target: ${error.message}`, "error");
    }
  }

  renderTargetProgress() {
    const targetList = document.querySelector(".target-list");
    if (!targetList) return;
    targetList.innerHTML = "";
    Object.entries(this.userData.targets || {}).forEach(([key, target]) => {
      const current = this.userData[key]?.length || 0;
      const progress = Math.min((current / target) * 100, 100);
      const progressBar = document.createElement("div");
      progressBar.className = "target-progress-item";
      progressBar.innerHTML = `
        <div class="target-header">
          <span>${CATEGORIES[key].icon} ${CATEGORIES[key].label}</span>
          <span>${current}/${target}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
      `;
      targetList.appendChild(progressBar);
    });
  }

  exportToCSV() {
    const csvContent = [];
    csvContent.push("Kategori,Judul,Tanggal,Deskripsi\n");
    Object.keys(CATEGORIES).forEach(category => {
      const items = this.userData[category] || [];
      items.forEach(item => {
        csvContent.push(`"${CATEGORIES[category].label}","${item.title}","${item.date.toDate().toLocaleDateString("id-ID")}","${item.description || ""}"\n`);
      });
    });
    const blob = new Blob(csvContent, { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `backup-pengembangan-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }

  setupLiveValidation() {
    document.querySelectorAll("[required]").forEach(input => input.addEventListener("input", () => input.style.borderColor = input.checkValidity() ? "var(--border)" : "var(--error)"));
  }

  showNotification(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    const existing = toastContainer.querySelector(".notification");
    if (existing) existing.remove();
    const notification = document.createElement("div");
    notification.className = `notification ${type === "error" ? "error" : ""}`;
    notification.textContent = message;
    toastContainer.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }

  handleDynamicElements(e) {
    const target = e.target;
    if (target.classList.contains("btn-add")) this.handleAddItem(target.dataset.category);
    if (target.classList.contains("btn-edit")) this.handleEditItem(target.dataset.id, target.dataset.category);
    if (target.classList.contains("btn-delete")) this.handleDeleteItem(target.dataset.id, target.dataset.category);
  }

  handleSearchInput(e) {
    if (e.target.classList.contains("search-bar")) {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        const searchTerm = e.target.value.toLowerCase();
        const items = e.target.closest(".data-card").querySelectorAll(".item-list li");
        items.forEach(item => item.style.display = item.querySelector("h3").textContent.toLowerCase().includes(searchTerm) ? "flex" : "none");
      }, 300);
    }
  }

  updateCharacterCount() {
    const charCount = this.dom.deskripsiInput.value.length;
    this.dom.deskripsiInput.closest(".input-group").querySelector(".char-count").textContent = `${charCount}/500`;
  }

  handleAddItem(category) {
    this.dom.kategoriSelect.value = category;
    document.querySelector("#form-section").scrollIntoView({ behavior: "smooth" });
    this.handleNextStep();
  }

  async handleEditItem(itemId, category) {
    const item = this.userData[category]?.find(i => i.id === itemId);
    if (!item) return;
    const editFormHTML = `
      <div class="input-group">
        <label for="edit-title">Judul</label>
        <input id="edit-title" value="${item.title}" required>
      </div>
      <div class="input-group">
        <label for="edit-date">Tanggal</label>
        <input type="date" id="edit-date" value="${item.date.toDate().toISOString().split("T")[0]}" required>
      </div>
      <div class="input-group">
        <label for="edit-desc">Deskripsi</label>
        <textarea id="edit-desc">${item.description || ""}</textarea>
      </div>
      <input type="hidden" id="edit-item-id" value="${itemId}">
      <input type="hidden" id="edit-category" value="${category}">
      <div class="button-group">
        <button type="button" class="btn-cancel">Batal</button>
        <button type="submit" class="btn-submit">Simpan Perubahan</button>
      </div>
    `;
    this.toggleModal(editFormHTML);
    if (this.editFormSubmitHandler) this.dom.editForm.removeEventListener("submit", this.editFormSubmitHandler);
    this.dom.editForm.querySelector(".btn-cancel").addEventListener("click", () => this.toggleModal());
    this.editFormSubmitHandler = e => this.handleUpdateItem(e);
    this.dom.editForm.addEventListener("submit", this.editFormSubmitHandler);
  }

  async handleDeleteItem(itemId, category) {
    if (!confirm("Apakah Anda yakin ingin menghapus item ini?")) return;
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const filteredItems = this.userData[category].filter(item => item.id !== itemId);
      await updateDoc(userRef, { [category]: filteredItems });
      this.showNotification("Item berhasil dihapus", "success");
      const listElement = document.querySelector(`#${category}-section .item-list`);
      const emptyState = document.querySelector(`#${category}-section .empty-state`);
      this.renderItems(listElement, emptyState, filteredItems, category);
    } catch (error) {
      this.showNotification(`Gagal menghapus: ${error.message}`, "error");
    }
  }

  async saveToFirebase(uid, data) {
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    const category = data.category;
    const updateData = {
      [category]: userSnap.exists() ? [...(userSnap.data()[category] || []), data] : [data]
    };
    await setDoc(userRef, updateData, { merge: true });
  }

  async loadUserData(uid) {
    try {
      this.showSkeletonLoading();
      const userRef = doc(db, "users", uid);
      const userSnap = await getDoc(userRef);
      await new Promise(resolve => setTimeout(resolve, 500));
      this.userData = userSnap.exists() ? userSnap.data() : {};
      this.renderDataSections();
      this.renderChart();
      this.renderTargetProgress();
    } catch (error) {
      this.showNotification(`Gagal memuat data: ${error.message}`, "error");
    } finally {
      setTimeout(() => this.hideSkeletonLoading(), 500);
    }
  }

  resetForm() {
    this.currentStep = 0;
    this.updateWizard();
    this.dom.formWizard.querySelector("form").reset();
    this.setDefaultDate();
    this.updateCharacterCount();
  }

  setDefaultDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    this.dom.tanggalInput.value = `${year}-${month}-${day}`;
  }

  populateKategoriOptions() {
    const select = this.dom.kategoriSelect;
    select.innerHTML = '<option value="">Pilih Kategori...</option>';
    Object.entries(CATEGORIES).forEach(([value, category]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = `${category.icon} ${category.label}`;
      select.appendChild(option);
    });
  }

  showSection(sectionId) {
    document.querySelectorAll("section").forEach(section => section.classList.remove("active"));
    document.querySelector(sectionId).classList.add("active");
    document.querySelectorAll(".desktop-tabs a").forEach(tab => tab.classList.toggle("active", tab.getAttribute("href") === sectionId));
  }

  updateWizard() {
    const progress = ((this.currentStep + 1) / this.dom.wizardPanels.length) * 100;
    this.dom.formWizard.querySelector(".progress-bar").style.width = `${progress}%`;
    this.dom.wizardPanels.forEach((panel, index) => panel.classList.toggle("active", index === this.currentStep));
    if (this.currentStep === 2) this.updatePreview();
    const currentPanel = this.dom.wizardPanels[this.currentStep];
    const firstInput = currentPanel.querySelector("input, select, textarea");
    if (firstInput) firstInput.focus();
  }

  showLoading() {
    const button = this.dom.formWizard.querySelector(".btn-submit");
    button.innerHTML = `<div class="loading-spinner"></div>`;
    button.disabled = true;
  }

  hideLoading() {
    const button = this.dom.formWizard.querySelector(".btn-submit");
    button.innerHTML = "💾 Simpan";
    button.disabled = false;
  }

  updatePreview() {
    const previewContent = this.dom.formWizard.querySelector(".preview-content");
    previewContent.innerHTML = `
      <p><strong>Kategori:</strong> ${CATEGORIES[this.dom.kategoriSelect.value].label}</p>
      <p><strong>Judul:</strong> ${this.dom.itemInput.value}</p>
      <p><strong>Tanggal:</strong> ${new Date(this.dom.tanggalInput.value).toLocaleDateString("id-ID")}</p>
      ${this.dom.deskripsiInput.value ? `<p><strong>Deskripsi:</strong>${this.dom.deskripsiInput.value}</p>` : ""}
    `;
  }

  async handleUpdateItem(e) {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;
    try {
      const editDate = new Date(document.getElementById("edit-date").value);
      if (editDate > new Date()) {
        this.showNotification("Tanggal tidak boleh di masa depan", "error");
        return;
      }
      const updates = {
        title: document.getElementById("edit-title").value,
        date: Timestamp.fromDate(editDate),
        description: document.getElementById("edit-desc").value,
        updatedAt: Timestamp.now()
      };
      const category = document.getElementById("edit-category").value;
      const itemId = document.getElementById("edit-item-id").value;
      const updatedItems = this.userData[category].map(item => item.id === itemId ? { ...item, ...updates } : item);
      await updateDoc(this.userRef, { [category]: updatedItems });
      const listElement = document.querySelector(`#${category}-section .item-list`);
      const emptyState = document.querySelector(`#${category}-section .empty-state`);
      this.renderItems(listElement, emptyState, updatedItems, category);
      this.toggleModal();
      this.showNotification("Perubahan berhasil disimpan!", "success");
    } catch (error) {
      const category = document.getElementById("edit-category").value;
      const listElement = document.querySelector(`#${category}-section .item-list`);
      const emptyState = document.querySelector(`#${category}-section .empty-state`);
      this.renderItems(listElement, emptyState, this.userData[category], category);
      this.showNotification(`Gagal menyimpan perubahan: ${error.message}`, "error");
    }
  }

  async setupRealtimeListener() {
    this.showSkeletonLoading();
    onSnapshot(this.userRef, doc => {
      if (doc.exists()) {
        const newData = doc.data();
        let hasChanges = false;
        Object.entries(newData).forEach(([key, value]) => {
          if (CATEGORIES[key] || key === "targets") {
            const currentValue = JSON.stringify(this.userData[key]);
            const newValue = JSON.stringify(value);
            if (currentValue !== newValue) {
              this.userData[key] = value;
              hasChanges = true;
            }
          }
        });
        if (hasChanges) {
          this.renderDataSections();
          this.renderChart();
          this.renderTargetProgress();
          this.hideSkeletonLoading();
        }
        if (this.dom.globalSearch.value) this.handleGlobalSearch({ target: this.dom.globalSearch });
      }
    });
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  toggleModal(content) {
    this.dom.modal.style.display = this.dom.modal.style.display === "flex" ? "none" : "flex";
    if (content) this.dom.editForm.innerHTML = content;
    else this.dom.editForm.innerHTML = "";
  }

  showSkeletonLoading() {
    document.querySelectorAll(".item-list, .chart-bars, .target-list").forEach(container => {
      container.innerHTML = Array(3).fill().map(() => `
        <div class="skeleton ${container.classList.contains("item-list") ? "skeleton-item" : "skeleton-chart-bar"}"></div>
      `).join("");
    });
  }

  hideSkeletonLoading() {
    this.renderDataSections();
    this.renderChart();
    this.renderTargetProgress();
  }
}

const developmentManager = new DevelopmentManager();