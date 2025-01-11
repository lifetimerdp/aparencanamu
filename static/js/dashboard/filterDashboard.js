import { months } from './utility.js';

export class DataFilter {
  constructor() {
    this.filters = {
      status: '',
      priority: '',
      dateFrom: null,
      dateTo: null
    };
    
    this.data = {
      dailyActivities: [],
      weeklyPlans: [],
      budget: [],
      reminders: [],
      expenses: [],
      incomes: []
    };
    
    this.originalData = { ...this.data };
    this.listElements = this.initializeListElements();
    this.renderCallbacks = {};
    this.filterElements = this.initializeFilterElements();
    this.setupEventListeners();
  }

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
        this[key + 'Element'] = element;
      } else {
        console.warn(`Filter element not found: ${id}`);
      }
    });

    return elements;
  }

  setupEventListeners() {
    try {
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

  handleFilterChange(filterType, value) {
    console.log(`${filterType} filter changed to:`, value);
    
    if (filterType === 'dateFrom' || filterType === 'dateTo') {
      this.filters[filterType] = value ? new Date(value) : null;
    } else {
      this.filters[filterType] = value;
    }

    if (this.filterElements.applyBtn) {
      this.filterElements.applyBtn.disabled = !this.hasFilterChanged();
    }
  }

  hasFilterChanged() {
    return Object.entries(this.filters).some(([key, value]) => {
      if (key === 'dateFrom' || key === 'dateTo') {
        return value !== null;
      }
      return value !== '';
    });
  }

  filterData(items, dataType) {
    if (!Array.isArray(items)) {
      console.warn('Array item tidak valid:', items);
      return [];
    }

    return items.filter(item => {
      if (!item) return false;
      
      const sekarang = new Date();
      let statusEfektif = item.status || 'active';
      let sudahKedaluwarsa = false;

      // Cek kedaluwarsa berdasarkan tipe data
      if (item.date) {
        const tanggalItem = new Date(item.date);
        sudahKedaluwarsa = tanggalItem.setHours(23, 59, 59, 999) < sekarang;
      } else if (item.endDate) {
        const [hari, bulan, tahun] = item.endDate.split(' ');
        const indeksBulan = months.indexOf(bulan);
        if (indeksBulan !== -1) {
          const tanggalAkhir = new Date(tahun, indeksBulan, parseInt(hari));
          sudahKedaluwarsa = tanggalAkhir.setHours(23, 59, 59, 999) < sekarang;
        }
      }

      // Update statusEfektif jika sudah kedaluwarsa
      if (sudahKedaluwarsa && statusEfektif !== 'completed') {
        statusEfektif = 'completed';
      }

      // Filter berdasarkan status
      const cocokStatus = !this.filters.status || (
        (this.filters.status === 'active' && statusEfektif === 'active') ||
        (this.filters.status === 'completed' && (statusEfektif === 'completed' || item.status === 'completed'))
      );

      // Filter berdasarkan prioritas
      const cocokPrioritas = !this.filters.priority || 
        item.priority?.toLowerCase() === this.filters.priority.toLowerCase();

      // Filter berdasarkan tanggal
      let cocokTanggal = true;
      if (item.date) {
        const tanggalItem = new Date(item.date);
        if (!isNaN(tanggalItem.getTime())) {
          if (this.filters.dateFrom) {
            const dateFrom = new Date(this.filters.dateFrom);
            dateFrom.setHours(0, 0, 0, 0);
            cocokTanggal = cocokTanggal && tanggalItem >= dateFrom;
          }
          if (this.filters.dateTo) {
            const dateTo = new Date(this.filters.dateTo);
            dateTo.setHours(23, 59, 59, 999);
            cocokTanggal = cocokTanggal && tanggalItem <= dateTo;
          }
        }
      }

      // Debug log untuk melihat proses filtering
      if (this.hasFilterChanged()) {
        console.log(`Memfilter item ${dataType}:`, {
          id: item.id,
          status: {
            asli: item.status,
            efektif: statusEfektif,
            filterValue: this.filters.status,
            cocok: cocokStatus
          },
          priority: {
            nilai: item.priority,
            cocok: cocokPrioritas
          },
          date: {
            nilai: item.date,
            cocok: cocokTanggal
          },
          sudahKedaluwarsa: sudahKedaluwarsa,
          hasilAkhir: cocokStatus && cocokPrioritas && cocokTanggal
        });
      }

      return cocokStatus && cocokPrioritas && cocokTanggal;
    });
  }

  applyFilters() {
    console.log('Applying filters:', this.filters);

    Object.entries(this.data).forEach(([dataType, items]) => {
      if (Array.isArray(items) && items.length) {
        try {
          const filteredData = this.filterData(items, dataType);
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

    if (this.filterElements.applyBtn) {
      this.filterElements.applyBtn.disabled = true;
    }
  }

  resetFilters() {
    console.log('Resetting filters');

    // Reset filter elements
    if (this.filterElements.status) this.filterElements.status.value = '';
    if (this.filterElements.dateFrom) this.filterElements.dateFrom.value = '';
    if (this.filterElements.dateTo) this.filterElements.dateTo.value = '';

    // Reset filter values
    this.filters = {
      status: '',
      priority: this.filters.priority,
      dateFrom: null,
      dateTo: null
    };

    // Restore original data while preserving priorities
    Object.entries(this.originalData).forEach(([dataType, originalItems]) => {
      if (originalItems && originalItems.length) {
        this.data[dataType] = originalItems.map(item => {
          const currentItem = this.data[dataType].find(current => current.id === item.id);
          return {
            ...item,
            priority: currentItem ? currentItem.priority : item.priority
          };
        });

        const listElement = this.listElements[dataType];
        if (listElement && this.renderCallbacks[dataType]) {
          console.log(`Restoring original ${dataType} data while preserving priorities`);
          listElement.innerHTML = '';
          this.renderCallbacks[dataType](listElement, this.data[dataType], dataType);
        }
      }
    });

    if (this.filterElements.applyBtn) {
      this.filterElements.applyBtn.disabled = !this.hasFilterChanged();
    }
  }

  setRenderCallback(dataType, callback) {
    if (typeof callback === 'function') {
      this.renderCallbacks[dataType] = callback;
    } else {
      console.error(`Invalid render callback for ${dataType}`);
    }
  }

  updateData(type, newData) {
    if (!this.data.hasOwnProperty(type)) {
      console.warn(`Invalid data type: ${type}`);
      return;
    }

    // Save original data if not exists
    if (!this.originalData[type]?.length) {
      this.originalData[type] = [...newData];
    }

    this.data[type] = newData;

    const listElement = this.listElements[type];
    if (listElement && this.renderCallbacks[type]) {
      const dataToRender = this.hasFilterChanged() ? 
        this.filterData(newData, type) : 
        newData;
      listElement.innerHTML = '';
      this.renderCallbacks[type](listElement, dataToRender, type);
    }
  }

  getFilteredData(type) {
    if (!this.data.hasOwnProperty(type)) {
      console.warn(`Invalid data type: ${type}`);
      return [];
    }
    return this.filterData(this.data[type], type);
  }
}