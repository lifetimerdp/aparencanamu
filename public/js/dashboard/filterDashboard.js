export class DataFilter {
  constructor() {
    this.filters = {
      search: '',
      status: '',
      priority: '',
      type: '',
      dateFrom: '',
      dateTo: '',
      timeFrom: '',
      timeTo: ''
    };
    
    this.data = {
      dailyActivities: [],
      weeklyPlans: [],
      budget: [],
      reminders: [],
      expenses: [],
      incomes: []
    };
    
    this.listElements = {
      dailyActivities: document.getElementById('daily-activities-list'),
      weeklyPlans: document.getElementById('weekly-plans-list'),
      budget: document.getElementById('budget-list'),
      reminders: document.getElementById('reminders-list'),
      expenses: document.getElementById('expenses-list'),
      incomes: document.getElementById('incomes-list')
    };
    
    this.initializeFilters();
    this.setupEventListeners();
  }

  initializeFilters() {
    this.searchFilter = document.getElementById('search-filter');
    this.statusFilter = document.getElementById('status-filter');
    this.priorityFilter = document.getElementById('priority-filter');
    this.typeFilter = document.getElementById('type-filter');
    this.dateFromFilter = document.getElementById('date-from');
    this.dateToFilter = document.getElementById('date-to');
    this.timeFromFilter = document.getElementById('time-from');
    this.timeToFilter = document.getElementById('time-to');
    this.applyFilterBtn = document.getElementById('apply-filter');
    this.resetFilterBtn = document.getElementById('reset-filter');
  }

  setupEventListeners() {
    // Debounce search filter to prevent too many rerenders
    let searchTimeout;
    this.searchFilter.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => this.applyFilters(), 300);
    });

    this.applyFilterBtn.addEventListener('click', () => this.applyFilters());
    this.resetFilterBtn.addEventListener('click', () => this.resetFilters());
    
    // Add listeners for other filter changes
    [this.statusFilter, this.priorityFilter, this.typeFilter, 
     this.dateFromFilter, this.dateToFilter, this.timeFromFilter, 
     this.timeToFilter].forEach(filter => {
      filter.addEventListener('change', () => this.applyFilters());
    });
  }

  updateFilters() {
    this.filters = {
      search: this.searchFilter.value.toLowerCase(),
      status: this.statusFilter.value,
      priority: this.priorityFilter.value,
      type: this.typeFilter.value,
      dateFrom: this.dateFromFilter.value,
      dateTo: this.dateToFilter.value,
      timeFrom: this.timeFromFilter.value,
      timeTo: this.timeToFilter.value
    };
  }

  resetFilters() {
    this.searchFilter.value = '';
    this.statusFilter.value = '';
    this.priorityFilter.value = '';
    this.typeFilter.value = '';
    this.dateFromFilter.value = '';
    this.dateToFilter.value = '';
    this.timeFromFilter.value = '';
    this.timeToFilter.value = '';
    this.updateFilters();
    this.applyFilters();
  }

  updateData(type, newData) {
    this.data[type] = newData;
    this.applyFilters();
  }

  filterData(items) {
    return items.filter(item => {
      // Search filter
      if (this.filters.search) {
        const searchableFields = ['name', 'category', 'notes'].filter(field => item[field]);
        const matchesSearch = searchableFields.some(field => 
          item[field].toLowerCase().includes(this.filters.search)
        );
        if (!matchesSearch) return false;
      }

      // Status filter
      if (this.filters.status && item.status !== this.filters.status) {
        return false;
      }

      // Priority filter
      if (this.filters.priority && item.priority !== this.filters.priority) {
        return false;
      }

      // Type filter
      if (this.filters.type && !item.type?.includes(this.filters.type)) {
        return false;
      }

      // Date filter
      if ((this.filters.dateFrom || this.filters.dateTo) && item.date) {
        const itemDate = new Date(item.date);
        if (this.filters.dateFrom && itemDate < new Date(this.filters.dateFrom)) {
          return false;
        }
        if (this.filters.dateTo && itemDate > new Date(this.filters.dateTo)) {
          return false;
        }
      }

      // Time filter
      if ((this.filters.timeFrom || this.filters.timeTo) && item.time) {
        const itemTime = item.time;
        if (this.filters.timeFrom && itemTime < this.filters.timeFrom) {
          return false;
        }
        if (this.filters.timeTo && itemTime > this.filters.timeTo) {
          return false;
        }
      }

      return true;
    });
  }

  applyFilters() {
    this.updateFilters();
    
    Object.keys(this.data).forEach(dataType => {
      if (this.data[dataType].length > 0) {
        const filteredData = this.filterData(this.data[dataType]);
        const listElement = this.listElements[dataType];
        
        if (listElement && this.renderCallbacks[dataType]) {
          // Clear existing content
          listElement.innerHTML = '';
          
          // Apply the render callback with the filtered data
          this.renderCallbacks[dataType](listElement, filteredData, dataType);
          
          // Reattach event listeners after rendering
          this.reattachEventListeners(listElement);
        }
      }
    });
  }

  reattachEventListeners(listElement) {
    // Reattach event listeners for edit buttons
    listElement.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dataType = btn.getAttribute('data-type');
        const dataId = btn.getAttribute('data-id');
        const parentId = btn.getAttribute('data-parent-id') || '';
        const subParentId = btn.getAttribute('data-sub-parent-id') || '';
        // Trigger edit functionality
        this.triggerEdit(dataType, dataId, parentId, subParentId);
      });
    });

    // Reattach event listeners for delete buttons
    listElement.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const dataType = btn.getAttribute('data-type');
        const dataId = btn.getAttribute('data-id');
        const parentId = btn.getAttribute('data-parent-id');
        const subParentId = btn.getAttribute('data-sub-parent-id');
        // Trigger delete functionality
        this.triggerDelete(dataType, dataId, parentId, subParentId);
      });
    });

    // Reattach event listeners for status checkboxes
    listElement.querySelectorAll('.status-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const id = checkbox.getAttribute('data-id');
        const type = checkbox.getAttribute('data-type');
        const status = checkbox.checked ? 'selesai' : 'aktif';
        // Trigger status update
        this.triggerStatusUpdate(id, type, status, checkbox);
      });
    });
  }

  renderCallbacks = {};
  setRenderCallback(dataType, callback) {
    this.renderCallbacks[dataType] = callback;
  }
}