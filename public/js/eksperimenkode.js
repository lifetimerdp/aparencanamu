Berikan saya saran tentang apa saja yang perlu ditambahkan atau dirubah dari halaman pengembangan diri.

berikut kode terkait pengembangan diri:

firebaseConfig.js:
import{initializeApp}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";import{getAuth}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";import{getFirestore}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";import{getAnalytics}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";import{getMessaging}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";const firebaseConfig={apiKey:"AIzaSyAeUpI8hb-mLbp4xYldcu5q89vPxGj1EY8",authDomain:"aparencanamu.firebaseapp.com",projectId:"aparencanamu",storageBucket:"aparencanamu.appspot.com",messagingSenderId:"1082769981395",appId:"1:1082769981395:web:611ad60b17e104b7d83926",measurementId:"G-3PGV4HD1BP"};const app=initializeApp(firebaseConfig);const analytics=getAnalytics(app);const auth=getAuth(app);const db=getFirestore(app);const messaging=getMessaging(app);export{app,analytics,auth,db,messaging}

pengembangan-diri.html:
{{ define "main" }}
<main>
  <h1>Pengembangan Diri</h1>
  <section id="books-read">
    <h2>Buku yang Dibaca</h2>
    <div class="data-display">
      <ul id="books-read-list"></ul>
      <p id="books-read-empty" class="empty-message">Belum ada buku yang ditambahkan</p>
    </div>
    <form id="books-read-form">
      <input type="text" id="books-read-input" placeholder="Tambah Buku yang Dibaca">
      <button type="submit">Tambah</button>
    </form>
  </section>

  <section id="courses-taken">
    <h2>Kursus yang Diikuti</h2>
    <div class="data-display">
      <ul id="courses-taken-list"></ul>
      <p id="courses-taken-empty" class="empty-message">Belum ada kursus yang ditambahkan</p>
    </div>
    <form id="courses-taken-form">
      <input type="text" id="courses-taken-input" placeholder="Tambah Kursus yang Diikuti">
      <button type="submit">Tambah</button>
    </form>
  </section>

  <section id="hobbies-interests">
    <h2>Hobi dan Minat</h2>
    <div class="data-display">
      <ul id="hobbies-interests-list"></ul>
      <p id="hobbies-interests-empty" class="empty-message">Belum ada hobi yang ditambahkan</p>
    </div>
    <form id="hobbies-interests-form">
      <input type="text" id="hobbies-interests-input" placeholder="Tambah Hobi atau Minat">
      <button type="submit">Tambah</button>
    </form>
  </section>

  <section id="keterampilan">
    <h2>Keterampilan</h2>
    <div class="data-display">
      <ul id="keterampilan-list"></ul>
      <p id="keterampilan-empty" class="empty-message">Belum ada keterampilan yang ditambahkan</p>
    </div>
    <form id="keterampilan-form">
      <input type="text" id="keterampilan-input" placeholder="Tambah Keterampilan">
      <button type="submit">Tambah</button>
    </form>
  </section>

  <section id="prestasi">
    <h2>Prestasi</h2>
    <div class="data-display">
      <ul id="prestasi-list"></ul>
      <p id="prestasi-empty" class="empty-message">Belum ada prestasi yang ditambahkan</p>
    </div>
    <form id="prestasi-form">
      <input type="text" id="prestasi-input" placeholder="Tambah Prestasi">
      <button type="submit">Tambah</button>
    </form>
  </section>

  <section id="target">
    <h2>Target</h2>
    <div class="data-display">
      <ul id="target-list"></ul>
      <p id="target-empty" class="empty-message">Belum ada target yang ditambahkan</p>
    </div>
    <form id="target-form">
      <input type="text" id="target-input" placeholder="Tambah Target">
      <button type="submit">Tambah</button>
    </form>
  </section>

  <section id="sertifikasi">
    <h2>Sertifikasi</h2>
    <div class="data-display">
      <ul id="sertifikasi-list"></ul>
      <p id="sertifikasi-empty" class="empty-message">Belum ada sertifikasi yang ditambahkan</p>
    </div>
    <form id="sertifikasi-form">
      <input type="text" id="sertifikasi-input" placeholder="Tambah Sertifikasi">
      <button type="submit">Tambah</button>
    </form>
  </section>

  <section id="catatan">
    <h2>Catatan Pembelajaran</h2>
    <div class="data-display">
      <ul id="catatan-list"></ul>
      <p id="catatan-empty" class="empty-message">Belum ada catatan yang ditambahkan</p>
    </div>
    <form id="catatan-form">
      <input type="text" id="catatan-input" placeholder="Tambah Catatan Pembelajaran">
      <button type="submit">Tambah</button>
    </form>
  </section>
</main>
<script type="module" src="{{ "js/pengembangan-diri.js" | relURL }}"></script>
{{ end }}

penpengembangan-diri.js:
import{auth,db}from './firebaseConfig.js';import{getDoc,doc,updateDoc,arrayUnion}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";auth.onAuthStateChanged((user)=>{if(!user){window.location.href='/masuk'}else{loadUserData()}});const booksReadForm=document.getElementById('books-read-form');const booksReadInput=document.getElementById('books-read-input');const coursesTakenForm=document.getElementById('courses-taken-form');const coursesTakenInput=document.getElementById('courses-taken-input');const hobbiesInterestsForm=document.getElementById('hobbies-interests-form');const hobbiesInterestsInput=document.getElementById('hobbies-interests-input');const keterampilanForm=document.getElementById('keterampilan-form');const keterampilanInput=document.getElementById('keterampilan-input');const prestasiForm=document.getElementById('prestasi-form');const prestasiInput=document.getElementById('prestasi-input');const targetForm=document.getElementById('target-form');const targetInput=document.getElementById('target-input');const sertifikasiForm=document.getElementById('sertifikasi-form');const sertifikasiInput=document.getElementById('sertifikasi-input');const catatanForm=document.getElementById('catatan-form');const catatanInput=document.getElementById('catatan-input');const renderList=(listElement,emptyElement,items)=>{if(!items||items.length===0){listElement.style.display='none';emptyElement.style.display='block';return}
listElement.style.display='block';emptyElement.style.display='none';listElement.innerHTML='';items.forEach(item=>{const li=document.createElement('li');li.textContent=item;const deleteButton=document.createElement('button');deleteButton.textContent='×';deleteButton.className='delete-btn';deleteButton.onclick=()=>deleteItem(item,listElement.id);li.appendChild(deleteButton);listElement.appendChild(li)})};const deleteItem=async(item,listId)=>{const user=auth.currentUser;if(!user)return;const docRef=doc(db,"users",user.uid);const fieldMap={'books-read-list':'booksRead','courses-taken-list':'coursesTaken','hobbies-interests-list':'hobbiesInterests','keterampilan-list':'keterampilan','prestasi-list':'prestasi','target-list':'target','sertifikasi-list':'sertifikasi','catatan-list':'catatan'};const field=fieldMap[listId];const userDoc=await getDoc(docRef);const currentItems=userDoc.data()[field]||[];const updatedItems=currentItems.filter(i=>i!==item);await updateDoc(docRef,{[field]:updatedItems});loadUserData()};const loadUserData=async()=>{const user=auth.currentUser;if(!user){console.log("Tidak ada pengguna yang login.");return}
try{const userDoc=await getDoc(doc(db,"users",user.uid));if(!userDoc.exists()){console.log("Dokumen tidak ditemukan!");return}
const userData=userDoc.data();renderList(document.getElementById('books-read-list'),document.getElementById('books-read-empty'),userData.booksRead||[]);renderList(document.getElementById('courses-taken-list'),document.getElementById('courses-taken-empty'),userData.coursesTaken||[]);renderList(document.getElementById('hobbies-interests-list'),document.getElementById('hobbies-interests-empty'),userData.hobbiesInterests||[]);renderList(document.getElementById('keterampilan-list'),document.getElementById('keterampilan-empty'),userData.keterampilan||[]);renderList(document.getElementById('prestasi-list'),document.getElementById('prestasi-empty'),userData.prestasi||[]);renderList(document.getElementById('target-list'),document.getElementById('target-empty'),userData.target||[]);renderList(document.getElementById('sertifikasi-list'),document.getElementById('sertifikasi-empty'),userData.sertifikasi||[]);renderList(document.getElementById('catatan-list'),document.getElementById('catatan-empty'),userData.catatan||[])}catch(error){console.error("Error saat memuat data pengguna:",error)}};const addPersonalDevelopmentData=async(devType,inputElement)=>{const user=auth.currentUser;if(!user)return;const docRef=doc(db,"users",user.uid);const devData=inputElement.value.trim();if(devData){try{await updateDoc(docRef,{[devType]:arrayUnion(devData)});inputElement.value='';loadUserData()}catch(error){console.error("Error saat menambah data:",error)}}};booksReadForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('booksRead',booksReadInput)});coursesTakenForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('coursesTaken',coursesTakenInput)});hobbiesInterestsForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('hobbiesInterests',hobbiesInterestsInput)});keterampilanForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('keterampilan',keterampilanInput)});prestasiForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('prestasi',prestasiInput)});targetForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('target',targetInput)});sertifikasiForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('sertifikasi',sertifikasiInput)});catatanForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('catatan',catatanInput)})