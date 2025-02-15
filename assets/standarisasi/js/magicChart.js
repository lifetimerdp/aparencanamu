import { db, auth, getDoc, doc } from '/js/firebaseConfig.js';

class MagicChart {
  constructor(container) {
    this.container = container;
    this.canvas = container.querySelector('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.tooltip = container.querySelector('.magic-chart-tooltip');
    this.errorContainer = container.querySelector('.magic-chart-error');
    this.config = {
      collection: container.dataset.collection || 'users',
      docId: container.dataset.docId,
      fields: container.dataset.fields.split(','),
      colors: container.dataset.colors?.split(',') || ['#4BC0C0', '#36A2EB'],
      title: container.dataset.title || ''
    };
    this.init();
  }

  async init() {
    this.showLoading();
    
    try {
      if (this.config.docId === "auto") {
        await this.handleAutoDocId();
      }

      await this.loadFirebaseData();
      this.setupCanvas();
      this.drawChart();
      this.addEventListeners();
    } catch (error) {
      this.showError(error.message);
    } finally {
      this.hideLoading();
    }
  }

  async handleAutoDocId() {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          this.config.docId = user.uid;
          unsubscribe();
          resolve();
        } else {
          unsubscribe();
          reject(new Error('User belum login. Silakan login terlebih dahulu.'));
        }
      });
    });
  }

  async loadFirebaseData() {
    const docRef = doc(db, this.config.collection, this.config.docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Dokumen tidak ditemukan di koleksi ${this.config.collection}`);
    }

    const userData = docSnap.data();
    this.prepareChartData(userData);
  }

  prepareChartData(userData) {
    this.config.labels = this.config.fields;
    this.config.data = this.config.fields.map(field => {
      const value = userData[field];
      
      if (Array.isArray(value)) {
        return value.length; // Hitung jumlah item untuk array
      } else if (typeof value === 'number') {
        return value; // Ambil nilai langsung untuk angka
      } else if (typeof value === 'string') {
        return 1; // Treat strings as boolean (exists = 1)
      }
      return 0; // Default untuk tipe data lain
    });
  }

  setupCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
  }

  drawChart() {
    this.clearCanvas();
    
    const padding = 40;
    const maxValue = Math.max(...this.config.data);
    const chartWidth = this.canvas.width / window.devicePixelRatio - padding * 2;
    const chartHeight = this.canvas.height / window.devicePixelRatio - padding * 2;
    const barHeight = 30;
    const gap = 15;

    // Draw title
    if (this.config.title) {
      this.ctx.fillStyle = '#333';
      this.ctx.font = '18px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(
        this.config.title, 
        this.canvas.width / (2 * window.devicePixelRatio), 
        padding - 20
      );
    }

    // Draw bars
    this.config.data.forEach((value, index) => {
      const y = padding + (barHeight + gap) * index;
      const width = (value / maxValue) * chartWidth;
      
      // Draw bar
      this.ctx.fillStyle = this.config.colors[index % this.config.colors.length];
      this.ctx.fillRect(padding, y, width, barHeight);
      
      // Draw label
      this.ctx.fillStyle = '#333';
      this.ctx.font = '14px Arial';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        this.config.labels[index], 
        padding + 5, 
        y + barHeight / 2
      );
      
      // Draw value
      this.ctx.fillStyle = '#fff';
      this.ctx.fillText(
        value.toString(), 
        padding + width - 30, 
        y + barHeight / 2
      );
    });

    // Draw axis
    this.ctx.beginPath();
    this.ctx.moveTo(padding, padding + chartHeight);
    this.ctx.lineTo(padding + chartWidth, padding + chartHeight);
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  addEventListeners() {
    const resizeObserver = new ResizeObserver(() => {
      this.setupCanvas();
      this.drawChart();
    });
    resizeObserver.observe(this.container);

    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const padding = 40;
    const barHeight = 30;
    const gap = 15;
    
    const index = Math.floor((y - padding) / (barHeight + gap));
    
    if (index >= 0 && index < this.config.data.length) {
      this.tooltip.style.opacity = '1';
      this.tooltip.style.left = `${x + 15}px`;
      this.tooltip.style.top = `${y}px`;
      this.tooltip.textContent = `${this.config.labels[index]}: ${this.config.data[index]}`;
    } else {
      this.tooltip.style.opacity = '0';
    }
  }

  showLoading() {
    this.container.classList.add('loading');
  }

  hideLoading() {
    this.container.classList.remove('loading');
  }

  showError(message) {
    this.errorContainer.textContent = message;
    this.errorContainer.style.display = 'block';
    this.canvas.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.magic-chart-container').forEach(container => {
    new MagicChart(container);
  });
});