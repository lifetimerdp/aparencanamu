firestore rules:
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {

    // Aturan untuk koleksi pengguna
    match /users/{userId} {
      // Izinkan create hanya jika pengguna terautentikasi
      allow create: if request.auth != null;

      // Izinkan read dan write hanya jika pengguna terautentikasi dan UID sesuai dengan userId
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Aturan untuk subkoleksi aktivitas
      match /aktivitas/{activityId} {
        allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;
      }

      // Aturan untuk subkoleksi aktivitas harian
      match /dailyActivities/{activityId} {
        allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;

        // Aturan untuk subkoleksi sub-aktivitas harian
        match /subActivities/{subActivityId} {
          allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;

          // Aturan untuk subkoleksi tugas
          match /tasks/{taskId} {
            allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;
          }
        }
      }

      // Aturan untuk subkoleksi rencana mingguan
      match /weeklyPlans/{planId} {
        allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;

        // Aturan untuk subkoleksi sub-rencana mingguan
        match /subWeeklyPlans/{subPlanId} {
          allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;
        }
      }

      // Aturan untuk subkoleksi anggaran bulanan
      match /budget/{budgetId} {
        allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;
      }

      // Aturan untuk subkoleksi pengeluaran
      match /expenses/{expenseId} {
        allow create: if request.auth != null && 
                        request.auth.uid == userId && 
                        request.resource.data.keys().hasAll(['name', 'category', 'amount', 'date']) &&
                        request.resource.data.name is string &&
                        request.resource.data.category is string &&
                        request.resource.data.amount is number &&
                        request.resource.data.date is timestamp;
        allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      }

      // Aturan untuk subkoleksi pendapatan
      match /incomes/{incomeId} {
        allow create: if request.auth != null && 
                        request.auth.uid == userId && 
                        request.resource.data.keys().hasAll(['name', 'category', 'amount', 'date']) &&
                        request.resource.data.name is string &&
                        request.resource.data.category is string &&
                        request.resource.data.amount is number &&
                        request.resource.data.date is timestamp;
        allow read, update, delete: if request.auth != null && request.auth.uid == userId;
      }

      // Aturan untuk subkoleksi pengingat
      match /reminders/{reminderId} {
        allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;
      }

      // Aturan untuk subkoleksi subscription
      match /subscriptions/{subscriptionId} {
        // Izinkan CRUD hanya jika pengguna terautentikasi dan UID sesuai dengan userId
        allow create, read, update, delete: if request.auth != null && request.auth.uid == userId;

        // Validasi data subscription
        allow create: if request.resource.data.keys().hasAll(['endpoint', 'keys']) &&
                        request.resource.data.keys.endpoint is string &&
                        request.resource.data.keys.keys == ['p256dh', 'auth'] &&
                        request.resource.data.keys.p256dh is string &&
                        request.resource.data.keys.auth is string;
      }
    }
  }
}