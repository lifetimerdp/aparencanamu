import { userId } from "./dashboard.js"
import { getDocs, addDoc, collection, doc, updateDoc, deleteDoc, onSnapshot, getDoc, arrayUnion, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { auth, db, messaging } from "../firebaseConfig.js";

// 1. Format Functions
const formatRupiah = (amount) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(amount);
};
const formatDate = (date) => {
  if (date === "Hari Ini") {
    const today = new Date();
    return `${today.getDate()} ${months[today.getMonth()]} ${today.getFullYear()}`;
  } else if (date === "Besok") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return `${tomorrow.getDate()} ${months[tomorrow.getMonth()]} ${tomorrow.getFullYear()}`;
  } else {
    return date;
  }
};
const formatDateToIndonesian = (date) => {
  const [year, monthIndex, day] = date.split("-");
  const month = months[parseInt(monthIndex, 10) - 1];
  return `${parseInt(day, 10)} ${month} ${year}`;
};
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};
const unformatNumber = (str) => {
  return parseFloat(str.replace(/[^\d]/g, ''));
};

// 2. Helpers
const getTypeName = (type) => {
  switch (type) {
      case "dailyActivities":
          return "Aktivitas Harian";
      case "weeklyPlans":
          return "Rencana Mingguan";
      case "budget":
          return "Anggaran";
      case "expenses":
          return "Pengeluaran";
      case "incomes":
          return "Pendapatan";
      case "reminders":
          return "Pengingat";
      case "subActivities":
          return "Sub-aktivitas";
      case "subWeeklyPlans":
          return "Sub-rencana";
      case "tasks":
          return "Tugas";
      default:
          return "Item";
  }
};
function getOrderForType(type) {
  switch (type) {
    case 'dailyActivities':
      return ['name', 'date'];
    case 'weeklyPlans':
      return ['name', 'createdAt', 'endDate', 'duration'];
    case 'incomes':
      return ['name', 'category', 'amount'];
    case 'expenses':
      return ['name', 'category', 'amount'];
    case 'reminders':
      return ['name', 'date', 'time'];
    case 'budget':
      return ['name', 'month', 'amount'];
    default:
      return ['name'];
  }
};
function getLabelForKey(key, type) {
  switch (key) {
    case 'name':
      return `Nama ${getTypeName(type)}`;
    case 'date':
      return 'Tanggal';
    case 'time':
      return 'Waktu';
    case 'createdAt':
      return 'Dibuat tanggal';
    case 'endDate':
      return 'Berakhir tanggal';
    case 'duration':
      return 'Durasi';
    case 'category':
      return 'Kategori';
    case 'amount':
      return 'Jumlah';
    case 'month':
      return 'Bulan';
    default:
      return key.charAt(0).toUpperCase() + key.slice(1);
  }
};

// 3. Document Reference Helper
const getDocRef = (dataType, dataId, parentId, subParentId) => {
    if (!userId) {
        throw new Error("User ID is not set. User might not be authenticated.");
    }

    const userDocRef = doc(db, "users", userId);
    switch (dataType) {
        case "dailyActivities":
        case "weeklyPlans":
        case "budget":
        case "expenses":
        case "incomes":
        case "reminders":
            return doc(userDocRef, dataType, dataId);
        case "subActivities":
            return doc(userDocRef, "dailyActivities", parentId, "subActivities", dataId);
        case "subWeeklyPlans":
            return doc(userDocRef, "weeklyPlans", parentId, "subWeeklyPlans", dataId);
        case "tasks":
            return doc(userDocRef, "dailyActivities", parentId, "subActivities", subParentId, "tasks", dataId);
        default:
            throw new Error(`Tipe data tidak dikenal: ${dataType}`);
    }
};

// 4. Variabel and Constants
const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const PRIORITY_COLORS = {
  high: '#FF4B4B',
  medium: '#FFB23F',
  low: '#4CAF50'
};
const PRIORITY_LABELS = {
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah'
};
const categories = {
  incomes: ['Gaji', 'Bonus', 'Investasi', 'Penjualan', 'Hadiah', 'Lainnya'],
  expenses: ['Makanan', 'Transportasi', 'Belanja', 'Tagihan', 'Hiburan', 'Kesehatan', 'Lainnya']
};

export {
  formatRupiah,
  formatDate,
  formatDateToIndonesian,
  formatNumber,
  unformatNumber,
  getTypeName,
  getOrderForType,
  getLabelForKey,
  getDocRef,
  months,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  categories
}