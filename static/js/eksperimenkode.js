export const renderList = (listElement, items, dataType, parentId = null, subParentId = null) => {
  // ... kode lainnya tetap sama ...
  
  li.style.borderLeft = `4px solid ${item.priority ? PRIORITY_COLORS[item.priority] : '#ccc'}`;
  li.innerHTML = `
    <div class="item-content">
      <div class="item-left">
        <span class="item-name">${content}</span>
      </div>
      <div class="item-actions">
        <div class="priority-selector">
          <select class="priority-select" data-id="${item.id}" data-type="${dataType}">
            <option value="">Pilih Prioritas</option>
            <option value="high" ${item.priority === "high" ? "selected" : ""}>
              ${PRIORITY_LABELS.high}
            </option>
            <option value="medium" ${item.priority === "medium" ? "selected" : ""}>
              ${PRIORITY_LABELS.medium}
            </option>
            <option value="low" ${item.priority === "low" ? "selected" : ""}>
              ${PRIORITY_LABELS.low}
            </option>
          </select>
        </div>
        <!-- ... kode lainnya tetap sama ... -->
      </div>
    </div>
  `;
  
  // ... kode lainnya tetap sama ...
};