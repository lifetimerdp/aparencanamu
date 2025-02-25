// Magic Loading Event Handler
document.querySelectorAll('.magic-loading').forEach(container => {
  const showContent = () => {
    container.classList.add('ml-loaded')
    container.querySelector('.ml-loading').classList.add('d-none')
    container.querySelector('.ml-error').classList.add('d-none')
    container.querySelector('.ml-content').classList.remove('d-none')
  }

  const showError = (message) => {
    container.querySelector('.ml-error p').textContent = message
    container.querySelector('.ml-loading').classList.add('d-none')
    container.querySelector('.ml-error').classList.remove('d-none')
  }

  // Event Listeners
  container.addEventListener('ml-show', showContent)
  container.addEventListener('ml-error', (e) => showError(e.detail.message))
  
  // Auto-init untuk konten yang sudah siap
  if(container.querySelector('.ml-content').children.length > 0) {
    showContent()
  }
})