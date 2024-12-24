// filterDashboard.js
export class DataFilter {
  constructor() {
    // Initialize filter states
    this.filters = {
      status: '',
      priority: '',
      dateFrom: null,
      dateTo: null
    };

    // Initialize data containers
    this.data = {
      dailyActivities: [],
      weeklyPlans: [],
      budget: [],
      reminders: [],
      expenses: [],
      incomes: []
    };

    // Keep original data for reset functionality
    this.originalData = { ...this.data };
    
    // Initialize DOM elements and callbacks
    this.listElements = this.initializeListElements();
    this.renderCallbacks = {};
    this.filterElements = this.initializeFilterElements();
    
    // Setup filter functionality
    this.setupEventListeners();
  }

  /**
   * Initialize list elements for each data type
   * @returns {Object} Map of data types to their list elements
   */
  initializeListElements() {
    try {
      const elements = {};
      Object.keys(this.data).forEach(key => {
        const elementId = `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}-list`;
        const element = document.getElementById(elementId);
        if (element) {
          elements[key] = element;
        } else {
          console.warn(`List element not found: ${elementId}`);
        }
      });
      return elements;
    } catch (error) {
      console.error('Error initializing list elements:', error);
      return {};
    }
  }

  /**
   * Initialize filter UI elements
   * @returns {Object} Map of filter types to their elements
   */
  initializeFilterElements() {
    const elements = {};
    const filterIds = {
      status: 'status-filter',
      priority: 'priority-filter',
      dateFrom: 'date-from',
      dateTo: 'date-to',
      applyBtn: 'apply-filter-btn',
      resetBtn: 'reset-filter'
    };

    Object.entries(filterIds).forEach(([key, id]) => {
      const element = document.getElementById(id);
      if (element) {
        elements[key] = element;
        // Store direct references for internal use
        this[key + 'Element'] = element;
      } else {
        console.warn(`Filter element not found: ${id}`);
      }
    });

    return elements;
  }

  /**
   * Setup event listeners for filter controls
   */
  setupEventListeners() {
    try {
      // Setup filter input listeners
      if (this.filterElements.status) {
        this.filterElements.status.addEventListener('change', () => {
          this.handleFilterChange('status', this.filterElements.status.value);
        });
      }

      if (this.filterElements.priority) {
        this.filterElements.priority.addEventListener('change', () => {
          this.handleFilterChange('priority', this.filterElements.priority.value);
        });
      }

      if (this.filterElements.dateFrom) {
        this.filterElements.dateFrom.addEventListener('change', () => {
          this.handleFilterChange('dateFrom', this.filterElements.dateFrom.value);
        });
      }

      if (this.filterElements.dateTo) {
        this.filterElements.dateTo.addEventListener('change', () => {
          this.handleFilterChange('dateTo', this.filterElements.dateTo.value);
        });
      }

      // Setup action button listeners
      if (this.filterElements.applyBtn) {
        this.filterElements.applyBtn.addEventListener('click', () => {
          this.applyFilters();
        });
      }

      if (this.filterElements.resetBtn) {
        this.filterElements.resetBtn.addEventListener('click', () => {
          this.resetFilters();
        });
      }
    } catch (error) {
      console.error('Error setting up filter listeners:', error);
    }
  }

  /**
   * Handle changes to filter inputs
   * @param {string} filterType - Type of filter being changed
   * @param {string} value - New filter value
   */
  handleFilterChange(filterType, value) {
    console.log(`${filterType} filter changed to:`, value);
    
    // Update filter state
    if (filterType === 'dateFrom' || filterType === 'dateTo') {
      this.filters[filterType] = value ? new Date(value) : null;
    } else {
      this.filters[filterType] = value;
    }

    // Enable/disable apply button based on filter state
    if (this.filterElements.applyBtn) {
      this.filterElements.applyBtn.disabled = !this.hasFilterChanged();
    }
  }

  /**
   * Check if any filters have been changed from their default state
   * @returns {boolean} Whether any filters are active
   */
  hasFilterChanged() {
    return Object.entries(this.filters).some(([key, value]) => {
      if (key === 'dateFrom' || key === 'dateTo') {
        return value !== null;
      }
      return value !== '';
    });
  }

  /**
   * Apply filters to data
   * @param {Array} items - Array of items to filter
   * @param {string} dataType - Type of data being filtered
   * @returns {Array} Filtered items
   */
  filterData(items, dataType) {
    if (!Array.isArray(items)) {
      console.warn('Invalid items array:', items);
      return [];
    }

    return items.filter(item => {
      if (!item) return false;

      // Status filter
      const matchStatus = !this.filters.status || (
        (this.filters.status === 'active' && 
         item.status !== 'completed' && 
         item.status !== 'selesai') ||
        (this.filters.status === 'completed' && 
         (item.status === 'completed' || 
          item.status === 'selesai'))
      );

      // Priority filter
      const matchPriority = !this.filters.priority || 
        item.priority?.toLowerCase() === this.filters.priority.toLowerCase();

      // Date filter
      let matchDate = true;
      if (item.date) {
        const itemDate = new Date(item.date);
        if (!isNaN(itemDate.getTime())) {
          if (this.filters.dateFrom) {
            matchDate = matchDate && itemDate >= this.filters.dateFrom;
          }
          if (this.filters.dateTo) {
            matchDate = matchDate && itemDate <= this.filters.dateTo;
          }
        }
      }

      const matches = matchStatus && matchPriority && matchDate;
      
      // Debug logging
      if (this.hasFilterChanged()) {
        console.log(`Filtering ${dataType} item:`, {
          id: item.id,
          status: { value: item.status, matches: matchStatus },
          priority: { value: item.priority, matches: matchPriority },
          date: { value: item.date, matches: matchDate },
          finalResult: matches
        });
      }

      return matches;
    });
  }

  /**
   * Apply current filters to all data types
   */
  applyFilters() {
    console.log('Applying filters:', this.filters);

    Object.entries(this.data).forEach(([dataType, items]) => {
      if (Array.isArray(items) && items.length) {
        try {
          // Apply filters
          const filteredData = this.filterData(items, dataType);
          
          // Update UI
          const listElement = this.listElements[dataType];
          if (listElement && this.renderCallbacks[dataType]) {
            console.log(`Rendering filtered ${dataType}:`, filteredData.length);
            listElement.innerHTML = '';
            this.renderCallbacks[dataType](listElement, filteredData, dataType);
          }
        } catch (error) {
          console.error(`Error filtering ${dataType}:`, error);
        }
      }
    });

    // Update UI state
    if (this.filterElements.applyBtn) {
      this.filterElements.applyBtn.disabled = true;
    }
  }

  /**
   * Reset all filters to their default state
   */
  resetFilters() {
    console.log('Resetting filters');

    // Reset filter UI
    if (this.filterElements.status) this.filterElements.status.value = '';
    if (this.filterElements.priority) this.filterElements.priority.value = '';
    if (this.filterElements.dateFrom) this.filterElements.dateFrom.value = '';
    if (this.filterElements.dateTo) this.filterElements.dateTo.value = '';

    // Reset filter state
    this.filters = {
      status: '',
      priority: '',
      dateFrom: null,
      dateTo: null
    };

    // Restore original data
    Object.entries(this.originalData).forEach(([dataType, originalItems]) => {
      if (originalItems && originalItems.length) {
        this.data[dataType] = [...originalItems];
        
        const listElement = this.listElements[dataType];
        if (listElement && this.renderCallbacks[dataType]) {
          console.log(`Restoring original ${dataType} data`);
          listElement.innerHTML = '';
          this.renderCallbacks[dataType](listElement, this.data[dataType], dataType);
        }
      }
    });

    // Update UI state
    if (this.filterElements.applyBtn) {
      this.filterElements.applyBtn.disabled = true;
    }
  }

  /**
   * Set render callback for a data type
   * @param {string} dataType - Type of data
   * @param {Function} callback - Render callback function
   */
  setRenderCallback(dataType, callback) {
    if (typeof callback === 'function') {
      this.renderCallbacks[dataType] = callback;
      console.log(`Set render callback for ${dataType}`);
    } else {
      console.error(`Invalid render callback for ${dataType}`);
    }
  }

  /**
   * Update data for a specific type
   * @param {string} type - Type of data to update
   * @param {Array} newData - New data array
   */
  updateData(type, newData) {
    if (!this.data.hasOwnProperty(type)) {
      console.warn(`Invalid data type: ${type}`);
      return;
    }

    console.log(`Updating ${type} data:`, newData.length);

    // Store original data if not exists
    if (!this.originalData[type]?.length) {
      this.originalData[type] = [...newData];
    }

    // Update current data
    this.data[type] = newData;

    // Update UI
    const listElement = this.listElements[type];
    if (listElement && this.renderCallbacks[type]) {
      // Apply current filters if any are active
      const dataToRender = this.hasFilterChanged() ? 
        this.filterData(newData, type) : 
        newData;

      console.log(`Rendering ${type} data:`, dataToRender.length);
      listElement.innerHTML = '';
      this.renderCallbacks[type](listElement, dataToRender, type);
    }
  }

  /**
   * Get filtered data for a specific type
   * @param {string} type - Type of data to get
   * @returns {Array} Filtered data array
   */
  getFilteredData(type) {
    if (!this.data.hasOwnProperty(type)) {
      console.warn(`Invalid data type: ${type}`);
      return [];
    }

    return this.filterData(this.data[type], type);
  }
}