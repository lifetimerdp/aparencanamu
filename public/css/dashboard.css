/* Gaya umum */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f4f4f4;
}

h1, h2, h3 {
  color: #2c3e50;
}

/* Gaya untuk selector aplikasi */
.app-selector {
  display: flex;
  justify-content: center;
  background-color: #ecf0f1;
  border-radius: 30px;
  padding: 10px;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.app-btn {
  background-color: transparent;
  border: none;
  padding: 12px 24px;
  margin: 0 8px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  font-size: 16px;
  font-weight: 600;
  color: #7f8c8d;
}

.app-btn::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #3498db;
  transform: scaleX(0);
  transition: transform 0.3s ease;
}

.app-btn.active {
  background-color: #3498db;
  color: white;
}

.app-btn.active::after {
  transform: scaleX(1);
}

.app-btn:hover:not(.active) {
  background-color: #e0e0e0;
}

/* Gaya untuk section aplikasi */
.app-section {
  background-color: white;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.app-section.visible {
  opacity: 1;
  transform: translateY(0);
}

/* Gaya untuk daftar aktivitas */
ul {
  list-style-type: none;
  padding: 0;
}

/* Gaya untuk layout item */
.item-content {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background-color: #ffffff;
  border-radius: 8px;
  margin-bottom: 15px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.item-content:hover {
  background-color: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.item-name {
  flex: 1 1 100%;
  margin-right: 20px;
  font-size: 1.1em;
  font-weight: 500;
  color: #34495e;
  margin-bottom: 10px;
}

.item-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  width: 100%;
}

/* Gaya untuk form */
form {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
  gap: 10px;
}

input[type="text"], input[type="number"], input[type="date"], input[type="time"], select {
  flex: 1 1 200px;
  max-width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

button {
  flex: 0 0 auto;
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #2980b9;
}

/* Gaya untuk sub-aktivitas, tugas, dan sub-weeklyPlan */
.sub-activity-list, .task-list, .sub-weeklyPlan-list {
  margin-left: 20px;
  border-left: 2px solid #3498db;
  padding-left: 20px;
}

.sub-activity-list > li, 
.task-list > li,
.sub-weeklyPlan-list > li {
  margin-bottom: 10px;
}

.sub-activity-list > li .item-content, 
.task-list > li .item-content,
.sub-weeklyPlan-list > li .item-content {
  background-color: #f8f9fa;
}

.sub-activity-list > li .item-content:hover, 
.task-list > li .item-content:hover,
.sub-weeklyPlan-list > li .item-content:hover {
  background-color: #e9ecef;
}

/* Ikon untuk aktivitas, sub-aktivitas, tugas, dan sub-weeklyPlan */
.activity-item::before,
.sub-activity-item::before,
.task-item::before,
.sub-weeklyPlan-item::before {
  font-weight: 900;
  margin-right: 10px;
  font-size: 1.2em;
}

/* Gaya untuk tombol edit dan hapus */
.edit-btn, .delete-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  transition: all 0.3s ease;
  background-color: transparent;
  display: inline-block;
  margin: 2px;
  white-space: nowrap;
}

.edit-btn {
  color: #3498db;
}

.delete-btn {
  color: #e74c3c;
}

.edit-btn:hover, .delete-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* Animasi untuk menampilkan elemen */
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.slide-in-right {
  animation: slideInRight 0.3s ease-out;
}

/* Gaya untuk pengelolaan keuangan */
.selector {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
}

.selector-btn {
  background-color: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.selector-btn:hover {
  background-color: #2980b9;
}

.financial-section {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.financial-section.hidden {
  display: none;
}

/* Responsive design */
@media screen and (max-width: 768px) {
  body {
    font-size: 14px;
  }

  .app-selector {
    flex-direction: column;
    align-items: center;
    padding: 5px;
    margin-bottom: 15px;
  }

  .app-btn {
    width: 100%;
    margin: 5px 0;
  }

  .app-section {
    padding: 15px;
  }

  form {
    flex-direction: column;
  }

  input[type="text"], input[type="number"], input[type="date"], input[type="time"], select, button {
    width: 100%;
    margin-bottom: 10px;
    flex-basis: auto;
  }
  
  h1 {
    font-size: 1.8em;
  }

  h2 {
    font-size: 1.5em;
  }

  h3 {
    font-size: 1.2em;
  }
  
  .sub-activity-list, .task-list, .sub-weeklyPlan-list {
    margin-left: 10px;
    padding-left: 10px;
  }

  .item-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .item-name {
    margin-bottom: 10px;
    font-size: 1em;
  }

  .item-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .edit-btn, .delete-btn {
    padding: 6px 10px;
    font-size: 0.9em;
  }

  .selector {
    flex-wrap: wrap;
  }

  .selector-btn {
    margin-bottom: 10px;
  }
}

@media screen and (max-width: 576px) {
  .item-actions {
    flex-wrap: nowrap;
  }

  .edit-btn, .delete-btn {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    font-size: 0.8em;
  }
}

@media screen and (max-width: 320px) {
  .item-content {
    padding: 10px;
  }
  
  .item-name {
    font-size: 0.9em;
  }
  
  .edit-btn, .delete-btn {
    padding: 6px 0;
    font-size: 0.75em;
  }
}

.priority-selector {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.priority-label {
  margin-right: 5px;
  font-size: 14px;
  color: #666;
}

.priority-select {
  padding: 2px 5px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.list-item-transition {
  transition: opacity 0.3s ease;
}

.list-item-completing {
  opacity: 0.5;
}

.sub-activities-container {
  transition: opacity 0.3s ease;
}