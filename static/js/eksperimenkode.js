 Saya akan menjelaskan secara spesifik bagian mana yang perlu dihapus dan diganti:

1. **Kode yang Harus Dihapus**:
- Semua deklarasi konstanta form dan input individu di awal file:
```javascript 
// HAPUS semua baris ini
const dailyActivitiesForm = document.getElementById("daily-activities-form");
const dailyActivitiesInput = document.getElementById("daily-activities-input");
const dailyActivitiesDate = document.getElementById("daily-activities-date");
const budgetForm = document.getElementById("budget-form");
const budgetInput = document.getElementById("budget-input");
const budgetMonth = document.getElementById("budget-month");
// ... dan seterusnya
```

- Array months yang dideklarasikan secara terpisah:
```javascript
// HAPUS baris ini
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
```

2. **Kode yang Harus Ditambahkan**:
```javascript
// TAMBAHKAN konfigurasi ini di awal file setelah imports
const CONFIG = {
  months: ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"],
  forms: {
    dailyActivities: document.getElementById("daily-activities-form"),
    budget: document.getElementById("budget-form"),
    expense: document.getElementById("expense-form"),
    income: document.getElementById("income-form"),
    reminder: document.getElementById("reminder-form")
  },
  inputs: {
    dailyActivities: {
      name: document.getElementById("daily-activities-input"),
      date: document.getElementById("daily-activities-date")
    },
    budget: {
      name: document.getElementById("budget-input"),
      month: document.getElementById("budget-month"),
      amount: document.getElementById("budget-amount")
    },
    expense: {
      name: document.getElementById("expense-input"),
      category: document.getElementById("expense-category"),
      amount: document.getElementById("expense-amount")
    },
    income: {
      name: document.getElementById("income-input"),
      category: document.getElementById("income-category"),
      amount: document.getElementById("income-amount")
    },
    reminder: {
      name: document.getElementById("reminder-input"),
      date: document.getElementById("reminder-date"),
      time: document.getElementById("reminder-time")
    }
  }
};
```

3. **Perubahan Referensi**:
Setiap kali Anda menggunakan referensi ke form atau input, ganti dengan referensi dari CONFIG. Contoh:

Sebelum:
```javascript
dailyActivitiesForm.addEventListener('submit', ...)
dailyActivitiesInput.value
```

Setelah:
```javascript
CONFIG.forms.dailyActivities.addEventListener('submit', ...)
CONFIG.inputs.dailyActivities.name.value
```

4. **Penggunaan months**:
Dimana pun Anda menggunakan array `months`, ganti dengan `CONFIG.months`

5. **Setup Event Listener**:
Tambahkan fungsi ini untuk menangani setup form:
```javascript
const setupFormHandlers = () => {
  Object.entries(CONFIG.forms).forEach(([formType, form]) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = getFormData(formType);
      const success = await handleFormSubmission(formData);
      if (success) {
        clearFormInputs(formType);
      }
    });
  });
};
```

6. **Initialization**:
Ganti event listener DOMContentLoaded dengan:
```javascript
document.addEventListener("DOMContentLoaded", async () => {
  try {
    await initUserId();
    if (!userId) {
      throw new Error("User not authenticated");
    }
    const user = await checkAuth();
    const userDocRef = doc(db, "users", user.uid);
    
    setupFormHandlers();
    // Setup existing listeners and handlers
    // ... rest of your initialization code
    
  } catch (error) {
    console.error("Error loading user data:", error);
  }
});
```

Penting untuk diingat:
- Semua fungsi yang di-export harus tetap ada
- Fungsionalitas dasar tidak berubah
- Hanya cara mengorganisasi dan mereferensikan elemen yang berubah
- Perubahan ini membuat kode lebih mudah dimaintain dan lebih terstruktur

Apakah Anda ingin saya menjelaskan bagian tertentu dengan lebih detail?