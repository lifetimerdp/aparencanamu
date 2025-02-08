halaman editDokumentasi tidak bekerja dengan benar. seharusnya halaman ini menolak akses pengguna jika pengunjung tidak login dan akunnya tidak memiliki role admin. selain itu, halaman ini tidak dapat menyimpan dokumentasi ke firestore. 

Saya ingin agar kode html dibuat di js sehingga jika pengguna tidak memenuhi persyaratan (terautentikasi dan role admin), maka pengguna akan diarahkan ke halaman /masuk tanpa bisa melihat sedikitpun konten pada halaman /editDokumentasi. Contoh penolakan dan penulisan kode html di js sudah diterapkan di file admin.html dan admin.js

berikut file-file terkait halaman admin dan editDokumentasi:

firestore rules:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow create: if request.auth != null;
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
    }

		// Aturan untuk dokumentasi
    match /dokumentasi/{document} {
      allow read, write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}

firebaseConfig.js:
import{initializeApp}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";import{getAuth}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";import{getFirestore}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";import{getAnalytics}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";import{getMessaging}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js";const firebaseConfig={apiKey:"AIzaSyAeUpI8hb-mLbp4xYldcu5q89vPxGj1EY8",authDomain:"aparencanamu.firebaseapp.com",projectId:"aparencanamu",storageBucket:"aparencanamu.appspot.com",messagingSenderId:"1082769981395",appId:"1:1082769981395:web:611ad60b17e104b7d83926",measurementId:"G-3PGV4HD1BP"};const app=initializeApp(firebaseConfig);const analytics=getAnalytics(app);const auth=getAuth(app);const db=getFirestore(app);const messaging=getMessaging(app);export{app,analytics,auth,db,messaging}

admin.html:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Dashboard</title>
  <!-- Load Firebase Config -->
  <script type="module" src="/js/admin.js"></script>
</head>
<body>
  <div id="admin-container">
    <!-- Konten akan dimuat di sini oleh JavaScript -->
  </div>
</body>
</html>

admin.js:
import{auth,db}from './firebaseConfig.js';import{doc,getDoc}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";const loadAdminContent=()=>{const container=document.getElementById('admin-container');container.innerHTML=`
    <h1>Admin Dashboard</h1>
    <nav>
      <a href="/admin/editDokumentasi">Edit Dokumentasi</a>
      <button id="logout-btn">Logout</button>
    </nav>
  `;document.getElementById('logout-btn').addEventListener('click',()=>{auth.signOut().then(()=>window.location.href='/')})};auth.onAuthStateChanged(async(user)=>{if(user){const userDoc=await getDoc(doc(db,"users",user.uid));if(userDoc.exists()&&userDoc.data().role==='admin'){loadAdminContent()}else{window.location.href='/'}}else{window.location.href='/masuk'}})

editDokumentasi.html:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Edit Dokumentasi</title>
  <script type="module" src="/js/editDokumentasi.js"></script>
  <style>
    /* Tambahan styling dasar */
    .doc-list { margin-bottom: 2rem; }
    .doc-item { 
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      border: 1px solid #ddd;
      margin-bottom: 0.5rem;
    }
    .doc-actions button { margin-left: 1rem; }
    .loading {
		  padding: 1rem;
		  text-align: center;
		}
		
		.error-message {
		  color: red;
		  padding: 1rem;
		}
  </style>
</head>
<body>
  <div id="edit-container">
    <a href="/admin">Kembali ke Dashboard</a>
    <div class="doc-list" id="doc-list"></div>
		<div id="editor">
	  <h2>Edit Dokumentasi</h2>
	  <form id="edit-form">
	    <div>
	      <label for="title">Judul:</label>
	      <input type="text" id="title" required>
	    </div>
	    
	    <div>
	      <label for="content">Konten:</label>
	      <textarea id="content" rows="10" required></textarea>
	    </div>
	    
	    <div>
	      <label for="image-url">Link Gambar:</label>
	      <input type="url" id="image-url" placeholder="https://example.com/image.jpg">
	    </div>
	    
	    <button type="submit">Simpan</button>
	    <button type="button" onclick="window.location.href='/admin/editDokumentasi'">Batal</button>
	  </form>
	</div>
  </div>
</body>
</html>

editDokumentasi. js:
import{db}from './firebaseConfig.js';import{collection,getDocs,doc,getDoc,setDoc,deleteDoc,onSnapshot}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";async function loadAllDocuments(){try{const querySnapshot=await getDocs(collection(db,"dokumentasi"));const docList=document.getElementById('doc-list');docList.innerHTML='';querySnapshot.forEach((docItem)=>{const docElement=document.createElement('div');docElement.className='doc-item';docElement.innerHTML=`
        <div>${docItem.data().title} (ID: ${docItem.id})</div>
        <div class="doc-actions">
          <button onclick="location.href='/admin/editDokumentasi?id=${docItem.id}'">Edit</button>
          <button onclick="deleteDocument('${docItem.id}')">Hapus</button>
        </div>
      `;docList.appendChild(docElement)})}catch(error){alert('Error memuat dokumen: '+error.message)}}
async function deleteDocument(docId){try{if(confirm(`Yakin ingin menghapus dokumen ${docId}?`)){await deleteDoc(doc(db,"dokumentasi",docId));alert('Dokumen berhasil dihapus');loadAllDocuments()}}catch(error){alert('Error menghapus dokumen: '+error.message)}}
async function loadDocumentForEdit(){const params=new URLSearchParams(window.location.search);const docId=params.get('id');if(docId){try{const docRef=doc(db,"dokumentasi",docId);const docSnap=await getDoc(docRef);if(docSnap.exists()){const data=docSnap.data();document.getElementById('title').value=data.title||'';document.getElementById('content').value=data.content||'';document.getElementById('image-url').value=data.imageUrl||''}else{alert('Dokumen tidak ditemukan!');window.location.href='/admin/editDokumentasi'}}catch(error){alert('Error memuat dokumen: '+error.message)}
document.getElementById('edit-form').addEventListener('submit',async(e)=>{e.preventDefault();const data={title:document.getElementById('title').value,content:document.getElementById('content').value,imageUrl:document.getElementById('image-url').value,updatedAt:new Date().toISOString()};try{await setDoc(doc(db,"dokumentasi",docId),data);alert('Data tersimpan!');window.location.href='/admin/editDokumentasi'}catch(error){alert('Error: '+error.message)}})}}
function setupRealTimeListener(){const unsubscribe=onSnapshot(collection(db,"dokumentasi"),(snapshot)=>{loadAllDocuments()});return unsubscribe}
window.onload=async()=>{try{const unsubscribe=setupRealTimeListener();await loadAllDocuments();loadDocumentForEdit();window.addEventListener('beforeunload',()=>{unsubscribe()})}catch(error){alert('Error memuat halaman: '+error.message)}}

editor.html:
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Editor Dokumentasi</title>
  <style>
    /* Styling dasar untuk editor */
    #editor {
      max-width: 800px;
      margin: 2rem auto;
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #f9f9f9;
    }

    #editor h2 {
      margin-bottom: 1.5rem;
      text-align: center;
    }

    #edit-form div {
      margin-bottom: 1rem;
    }

    #edit-form label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: bold;
    }

    #edit-form input[type="text"],
    #edit-form input[type="url"],
    #edit-form textarea {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ccc;
      border-radius: 4px;
      font-size: 1rem;
    }

    #edit-form textarea {
      resize: vertical;
      min-height: 150px;
    }

    #edit-form button {
      display: block;
      width: 100%;
      padding: 0.75rem;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
    }

    #edit-form button:hover {
      background-color: #0056b3;
    }
    
    #editor .loading {
		  text-align: center;
		  padding: 2rem;
		  font-size: 1.2rem;
		}
  </style>
</head>
<body>
  <div id="editor">
    <h2>Edit Dokumentasi</h2>
    <form id="edit-form">
      <div>
        <label for="title">Judul:</label>
        <input type="text" id="title" required>
      </div>
      
      <div>
        <label for="content">Konten:</label>
        <textarea id="content" rows="10" required></textarea>
      </div>
      
      <div>
        <label for="image-url">Link Gambar:</label>
        <input type="url" id="image-url" placeholder="https://example.com/image.jpg">
      </div>
      
      <button type="submit">Simpan</button>
    </form>
  </div>

  <!-- Load JavaScript -->
  <script type="module" src="/js/editor.js"></script>
</body>
</html>

editor.js:
import{db}from './firebaseConfig.js';import{doc,getDoc,setDoc}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";let isSubmitting=!1;const params=new URLSearchParams(window.location.search);const docId=params.get('id');function showError(message){const errorDiv=document.createElement('div');errorDiv.className='error-message';errorDiv.textContent=message;document.getElementById('editor').prepend(errorDiv)}
function showLoading(){const form=document.getElementById('edit-form');form.innerHTML='<div class="loading">Memuat data...</div>'}
function hideLoading(){const form=document.getElementById('edit-form');form.innerHTML=`
    <div>
      <label for="title">Judul:</label>
      <input type="text" id="title" required>
    </div>
    
    <div>
      <label for="content">Konten:</label>
      <textarea id="content" rows="10" required></textarea>
    </div>
    
    <div>
      <label for="image-url">Link Gambar:</label>
      <input type="url" id="image-url" placeholder="https://example.com/image.jpg">
    </div>
    
    <button type="submit">Simpan</button>
    <button type="button" onclick="window.location.href='editDokumentasi'">Batal</button>
  `}
async function loadDocument(){try{if(!docId){throw new Error('ID dokumen tidak ditemukan!')}
const docRef=doc(db,"dokumentasi",docId);const docSnap=await getDoc(docRef);if(docSnap.exists()){const data=docSnap.data();document.getElementById('title').value=data.title||'';document.getElementById('content').value=data.content||'';document.getElementById('image-url').value=data.imageUrl||''}else{throw new Error('Dokumen tidak ditemukan!')}}catch(error){showError(error.message);setTimeout(()=>{window.location.href='editDokumentasi'},3000)}}
async function saveDocument(data){try{await setDoc(doc(db,"dokumentasi",docId),data);alert('Data tersimpan!');window.location.href='editDokumentasi'}catch(error){throw new Error('Gagal menyimpan data: '+error.message)}}
document.getElementById('edit-form').addEventListener('submit',async(e)=>{e.preventDefault();if(isSubmitting)return;isSubmitting=!0;const submitButton=document.querySelector('button[type="submit"]');submitButton.disabled=!0;submitButton.textContent='Menyimpan...';try{const data={title:document.getElementById('title').value,content:document.getElementById('content').value,imageUrl:document.getElementById('image-url').value,updatedAt:new Date().toISOString()};await saveDocument(data)}catch(error){showError(error.message)}finally{isSubmitting=!1;submitButton.disabled=!1;submitButton.textContent='Simpan'}});document.addEventListener('DOMContentLoaded',async()=>{showLoading();await loadDocument();hideLoading()})