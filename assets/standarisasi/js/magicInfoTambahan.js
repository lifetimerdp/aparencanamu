import { db, doc, getDoc } from '/js/firebaseConfig.js';

class MagicTooltip {
  constructor(trigger) {
    this.trigger = trigger;
    this.init();
  }

  async init() {
    await this.fetchContent();
    this.setupEvents();
  }

  async fetchContent() {
    try {
      const docPath = `magicKomponen/magicInfoTambahan/${this.trigger.dataset.category}/${this.trigger.dataset.document}`;
      const docRef = doc(db, docPath);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        this.content = docSnap.data().contentStatic;
        this.createTooltip();
      }
    } catch (error) {
      console.error('Error fetching tooltip:', error);
    }
  }

  createTooltip() {
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'magic-tooltip';
    this.tooltip.id = this.trigger.getAttribute('aria-describedby');
    this.tooltip.setAttribute('role', 'tooltip');
    this.tooltip.innerHTML = this.content;

    document.body.appendChild(this.tooltip);
    this.positionTooltip();
  }

  positionTooltip() {
    const triggerRect = this.trigger.getBoundingClientRect();
    const tooltipRect = this.tooltip.getBoundingClientRect();

    switch (this.trigger.dataset.position) {
      case 'top':
        this.tooltip.style.top = `${triggerRect.top - tooltipRect.height - 10}px`;
        this.tooltip.style.left = `${triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`;
        break;
      case 'bottom':
        this.tooltip.style.top = `${triggerRect.bottom + 10}px`;
        this.tooltip.style.left = `${triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`;
        break;
      case 'left':
        this.tooltip.style.left = `${triggerRect.left - tooltipRect.width - 10}px`;
        this.tooltip.style.top = `${triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)}px`;
        break;
      case 'right':
        this.tooltip.style.left = `${triggerRect.right + 10}px`;
        this.tooltip.style.top = `${triggerRect.top + (triggerRect.height / 2) - (tooltipRect.height / 2)}px`;
        break;
      default: // auto
        this.tooltip.style.top = `${triggerRect.bottom + 10}px`;
        this.tooltip.style.left = `${triggerRect.left + (triggerRect.width / 2) - (tooltipRect.width / 2)}px`;
    }
  }

  show() {
    this.tooltip.classList.add('visible');
  }

  hide() {
    this.tooltip.classList.remove('visible');
  }

  toggle() {
    this.tooltip.classList.toggle('visible');
  }

  setupEvents() {
    switch (this.trigger.dataset.trigger) {
      case 'hover':
        this.trigger.addEventListener('mouseenter', () => this.show());
        this.trigger.addEventListener('mouseleave', () => this.hide());
        break;
      case 'click':
        this.trigger.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle();
        });
        break;
      case 'focus':
        this.trigger.addEventListener('focus', () => this.show());
        this.trigger.addEventListener('blur', () => this.hide());
        break;
    }

    // Handle keyboard
    this.trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.hide();
    });
  }
}

// Inisialisasi semua tooltip
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.magic-trigger').forEach((trigger) => {
    new MagicTooltip(trigger);
  });
});