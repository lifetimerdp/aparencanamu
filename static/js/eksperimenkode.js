saya ingin memodifikasi dan memperbaiki aplikasi pengembangan diri, diantaranya:
- Hanya pengguna terautentikasi  yang bisa mengakses halaman pengembangan diri
- Tampilkan data yang telah ditambahkan. contoh, buku, hobi, dan lain-lain yang ditambahkan pengguna.
- Jangan menambahkan hal yang tidak saya suruh seperti css atau fitur lainnya.

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
</main>
<script type="module" src="{{ "js/pengembangan-diri.js" | relURL }}"></script>
{{ end }}

penpengembangan-diri.js:
import{auth,db}from './firebaseConfig.js';import{getDoc,doc,updateDoc,arrayUnion}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";const booksReadForm=document.getElementById('books-read-form');const booksReadInput=document.getElementById('books-read-input');const coursesTakenForm=document.getElementById('courses-taken-form');const coursesTakenInput=document.getElementById('courses-taken-input');const hobbiesInterestsForm=document.getElementById('hobbies-interests-form');const hobbiesInterestsInput=document.getElementById('hobbies-interests-input');const renderList=(listElement,emptyElement,items)=>{if(!items||items.length===0){listElement.style.display='none';emptyElement.style.display='block';return}
listElement.style.display='block';emptyElement.style.display='none';listElement.innerHTML='';items.forEach(item=>{const li=document.createElement('li');li.textContent=item;const deleteButton=document.createElement('button');deleteButton.textContent='×';deleteButton.className='delete-btn';deleteButton.onclick=()=>deleteItem(item,listElement.id);li.appendChild(deleteButton);listElement.appendChild(li)})};const deleteItem=async(item,listId)=>{const user=auth.currentUser;if(!user)return;const docRef=doc(db,"users",user.uid);const fieldMap={'books-read-list':'booksRead','courses-taken-list':'coursesTaken','hobbies-interests-list':'hobbiesInterests'};const field=fieldMap[listId];const userDoc=await getDoc(docRef);const currentItems=userDoc.data()[field]||[];const updatedItems=currentItems.filter(i=>i!==item);await updateDoc(docRef,{[field]:updatedItems});loadUserData()};const loadUserData=async()=>{const user=auth.currentUser;if(!user){console.log("Tidak ada pengguna yang login.");return}
const userDoc=await getDoc(doc(db,"users",user.uid));if(!userDoc.exists()){console.log("Dokumen tidak ditemukan!");return}
const userData=userDoc.data();renderList(document.getElementById('books-read-list'),document.getElementById('books-read-empty'),userData.booksRead||[]);renderList(document.getElementById('courses-taken-list'),document.getElementById('courses-taken-empty'),userData.coursesTaken||[]);renderList(document.getElementById('hobbies-interests-list'),document.getElementById('hobbies-interests-empty'),userData.hobbiesInterests||[])};document.addEventListener("DOMContentLoaded",loadUserData);const addPersonalDevelopmentData=async(devType,inputElement)=>{const user=auth.currentUser;if(!user)return;const docRef=doc(db,"users",user.uid);const devData=inputElement.value.trim();if(devData){await updateDoc(docRef,{[devType]:arrayUnion(devData)});inputElement.value='';loadUserData()}};booksReadForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('booksRead',booksReadInput)});coursesTakenForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('coursesTaken',coursesTakenInput)});hobbiesInterestsForm.addEventListener('submit',async(e)=>{e.preventDefault();await addPersonalDevelopmentData('hobbiesInterests',hobbiesInterestsInput)})