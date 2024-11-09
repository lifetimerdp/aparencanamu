export const renderList = (listElement, items, dataType, parentId = null, subParentId = null) => {
  if (!listElement) return;
  listElement.innerHTML = "";
  
  const activeItems = items.filter(item => item.status !== 'selesai');
  
  const renderGroupedItems = (groupedItems, createHeader) => {
    Object.keys(groupedItems).forEach((groupKey) => {
      const header = createHeader(groupKey);
      listElement.appendChild(header);
      
      groupedItems[groupKey].forEach((item) => {
        const li = document.createElement('li');
        let content = `${item.name}`;
        
        if (dataType === 'expenses' || dataType === 'incomes') {
          content += ` - ${formatRupiah(item.amount)}`;
        } else if (dataType === 'budget') {
          content += ` - ${formatRupiah(item.amount)}`;
        } else if (dataType === 'dailyActivities') {
          const dateToShow = formatDate(item.date);
          content += ` - ${dateToShow}`;
        }
        
        li.setAttribute('data-id', item.id);
        li.style.borderLeft = `4px solid ${PRIORITY_COLORS[item.priority || 'low']}`;
        li.innerHTML = `
          <div class="item-content">
            <div class="item-left">
              <span class="item-name">${content}</span>
            </div>
            <div class="item-actions">
              <button class="edit-btn" data-id="${item.id}" data-name="${item.name}" 
                data-type="${dataType}" data-parent-id="${parentId || ''}" 
                data-sub-parent-id="${subParentId || ''}">Edit</button>
              <button class="delete-btn" data-id="${item.id}" data-type="${dataType}">Hapus</button>
              <input type="checkbox" 
                class="status-checkbox" 
                ${item.status === 'selesai' ? 'checked' : ''}
                data-id="${item.id}" 
                data-type="${dataType}">
            </div>
          </div>`;
          
        if (dataType === 'dailyActivities') {
          addSubActivityForm(li, item);
        } else if (dataType === 'weeklyPlans') {
          addSubWeeklyPlanForm(li, item);
        }
        
        listElement.appendChild(li);
      });
    });
  };
  
  // ... rest of the renderList function remains the same ...
};