function showEditPopup(id, type, currentData, parentId, subParentId) {
  const createInput = (key, value) => {
    const commonProps = `id="edit-${key}" ${key === 'createdAt' || key === 'endDate' ? 'disabled style="background-color: #f0f0f0;"' : ''}`;
    const inputs = {
      duration: `<select ${commonProps}>${[1,2,3].map(n => `<option value="${n}" ${value === n ? 'selected' : ''}>${n} Minggu</option>`).join('')}</select>`,
      date: type === 'weeklyPlans' ? 
        (() => {
          const date = new Date(value.split(' ').reverse().join('-'));
          return `<select ${commonProps}>${[-1,0,1].map(d => {
            const newDate = new Date(date);
            newDate.setDate(date.getDate() + d);
            const formatted = `${newDate.getDate()} ${months[newDate.getMonth()]} ${newDate.getFullYear()}`;
            return `<option value="${formatted}" ${d === 0 ? 'selected' : ''}>${formatted}</option>`;
          }).join('')}</select>`;
        })() :
        type === 'reminders' ? `<input type="date" ${commonProps} value="${value}" min="${new Date().toISOString().split('T')[0]}">` : '',
      category: (type === 'incomes' || type === 'expenses') ?
        (() => {
          const cats = type === 'incomes' ? categories.incomes : categories.expenses;
          const isCustom = !cats.includes(value);
          return `
            <select ${commonProps} onchange="this.nextElementSibling.style.display = this.value === 'custom' ? 'block' : 'none'">
              ${cats.map(c => `<option value="${c}" ${c === value ? 'selected' : ''}>${c}</option>`).join('')}
              <option value="custom" ${isCustom ? 'selected' : ''}>Kategori Kustom</option>
            </select>
            <input type="text" id="edit-${key}-custom" style="display: ${isCustom ? 'block' : 'none'}; margin-top: 5px;" 
              value="${isCustom ? value : ''}" placeholder="Masukkan kategori kustom">
          `;
        })() : '',
      amount: `<input type="text" ${commonProps} value="Rp. ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}"
        oninput="this.value = this.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')"
        onkeyup="if(this.value !== '') this.value = 'Rp. ' + this.value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, '.')">`,
      time: type === 'reminders' ? `<input type="time" ${commonProps} value="${value}">` : '',
      month: type === 'budget' ? `<select ${commonProps}>${months.map(m => `<option value="${m}" ${m === value ? 'selected' : ''}>${m}</option>`).join('')}</select>` : ''
    };
    
    return inputs[key] || `<input type="text" ${commonProps} value="${value}">`;
  };

  const popup = document.createElement('div');
  popup.className = 'edit-popup';
  Object.assign(popup.style, {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    zIndex: '1000'
  });

  const formContent = getOrderForType(type)
    .filter(key => currentData.hasOwnProperty(key) && key !== 'id' && key !== 'userId' && 
      !((type === 'incomes' && (key === 'date' || key === 'notes')) || 
        (type === 'reminders' && (key === 'timeZone' || key === 'notificationSent'))))
    .map(key => `
      <div>
        <label for="edit-${key}">${getLabelForKey(key, type)}:</label>
        ${createInput(key, currentData[key])}
      </div>
    `).join('');

  popup.innerHTML = `
    <div class="edit-popup-content">
      <h3>Edit ${getTypeName(type)}</h3>
      <form id="edit-form">
        ${formContent}
        <button type="submit">Simpan</button>
        <button type="button" id="cancel-edit">Batal</button>
      </form>
    </div>
  `;

  document.body.appendChild(popup);

  popup.querySelector('#cancel-edit').onclick = () => document.body.removeChild(popup);
  popup.querySelector('#edit-form').onsubmit = async (e) => {
    e.preventDefault();
    const updatedFields = getOrderForType(type)
      .filter(key => currentData.hasOwnProperty(key) && key !== 'id' && key !== 'userId')
      .reduce((acc, key) => {
        const input = document.getElementById(`edit-${key}`);
        if (input && !input.disabled) {
          if (key === 'amount') {
            acc[key] = parseFloat(input.value.replace(/[^\d]/g, ''));
          } else if (key === 'category' && input.value === 'custom') {
            acc[key] = document.getElementById(`edit-${key}-custom`).value.trim();
          } else if (key === 'duration') {
            acc[key] = parseInt(input.value);
          } else {
            acc[key] = input.value.trim();
          }
        }
        return acc;
      }, {});

    try {
      await editData(type, id, updatedFields, parentId, subParentId);
      document.body.removeChild(popup);
      alert('Perubahan berhasil disimpan');
    } catch (error) {
      console.error('Error saat menyimpan perubahan:', error);
      alert('Terjadi kesalahan saat menyimpan perubahan. Silakan coba lagi.');
    }
  };
}