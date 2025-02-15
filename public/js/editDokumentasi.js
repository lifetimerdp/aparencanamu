import { auth, db } from './firebaseConfig.js';
import { 
  collection, getDocs, doc, getDoc, 
  setDoc, deleteDoc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

let isUnsubscribed = false;
let formSubmitListener = null;

// Fungsi untuk generate ID page[angka]
async function generateNewPageId() {
  const snapshot = await getDocs(collection(db, "dokumentasi"));
  let maxNumber = 0;
  
  snapshot.forEach(doc => {
    const match = doc.id.match(/page(\d+)/);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNumber) maxNumber = num;
    }
  });
  
  return `page${maxNumber + 1}`;
}

// Fungsi untuk menambahkan toolbar editor
function addEditorToolbar() {
  const editorContainer = document.createElement('div');
  editorContainer.className = 'editor-container';

  const toolbar = document.createElement('div');
  toolbar.className = 'editor-toolbar';

  const buttons = [
    { label: 'Bold', action: 'bold' },
    { label: 'Italic', action: 'italic' },
    { label: 'Quote', action: 'quote' },
    { label: 'Code', action: 'code' },
    { label: 'Link', action: 'link' },
    { label: 'Image', action: 'image' },
    { label: 'List Bullet', action: 'bullet' },
    { label: 'List Number', action: 'number' },
    { label: 'H2', action: 'h2' },
    { label: 'H3', action: 'h3' },
    { label: 'Code Block', action: 'codeBlock' }
  ];

  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn.label;
    button.type = 'button';
    button.addEventListener('click', (e) => {
      e.preventDefault();
      formatText(btn.action);
    });
    toolbar.appendChild(button);
  });

  const textarea = document.createElement('textarea');
  textarea.id = 'content';
  textarea.placeholder = 'Tulis konten dokumentasi Anda di sini...';
  textarea.required = true;

  const helpText = document.createElement('div');
  helpText.className = 'editor-help';
  helpText.innerHTML = `
    <h4>Panduan Formatting:</h4>
    <ul>
      <li><code>**bold**</code>: Menebalkan teks</li>
      <li><code>*italic*</code>: Memiringkan teks</li>
      <li><code>> quote</code>: Membuat kutipan</li>
      <li><code>\`code\`</code>: Menulis kode inline</li>
      <li><code>[link](url)</code>: Membuat tautan</li>
      <li><code>![alt](image-url)</code>: Menyisipkan gambar</li>
      <li><code>- list item</code>: Membuat list bullet</li>
      <li><code>1. list item</code>: Membuat list nomor</li>
      <li><code>## H2</code>: Membuat heading 2</li>
      <li><code>### H3</code>: Membuat heading 3</li>
      <li><code>\`\`\`code\`\`\`</code>: Membuat blok kode</li>
    </ul>
  `;

  editorContainer.appendChild(toolbar);
  editorContainer.appendChild(textarea);
  editorContainer.appendChild(helpText);

  return editorContainer;
}

// Fungsi formatting text yang diperbarui
function formatText(action) {
  const textarea = document.getElementById('content');
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);

  const formats = {
    bold: { prefix: '**', suffix: '**', cursorPos: 2 },
    italic: { prefix: '*', suffix: '*', cursorPos: 1 },
    quote: { prefix: '> ', suffix: '', cursorPos: 2 },
    code: { prefix: '`', suffix: '`', cursorPos: 1 },
    link: { prefix: '[', suffix: '](url)', cursorPos: 1 },
    image: { prefix: '![', suffix: '](image-url)', cursorPos: 2 },
    bullet: { prefix: '- ', suffix: '', cursorPos: 2 },
    number: { prefix: '1. ', suffix: '', cursorPos: 3 },
    h2: { prefix: '## ', suffix: '', cursorPos: 3 }, // Formatting untuk H2
    h3: { prefix: '### ', suffix: '', cursorPos: 4 }, // Formatting untuk H3
    codeBlock: { prefix: '```\n', suffix: '\n```', cursorPos: 4 } // Formatting untuk Code Block
  };

  const format = formats[action];
  if (!format) return;

  let newText = format.prefix + selectedText + format.suffix;
  let newCursorPos = start + format.cursorPos;

  // Jika formatting adalah H2, H3, atau Code Block, pastikan kursor berada di posisi yang benar
  if (['h2', 'h3', 'codeBlock'].includes(action)) {
    if (textarea.value.substring(start - 2, start) === '\n\n') {
      newText = '\n' + newText;
      newCursorPos += 1;
    }
  }

  textarea.setRangeText(newText, start, end, 'end');
  textarea.focus();
  textarea.setSelectionRange(newCursorPos, newCursorPos);
}

// Fungsi untuk handle enter pada list
function handleListInput(e) {
  if (e.key === 'Enter') {
    const textarea = e.target;
    const start = textarea.selectionStart;
    const value = textarea.value;
    
    // Check if current line is a list item
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const line = value.substring(lineStart, start);
    
    if (line.match(/^\s*-\s/)) {
      e.preventDefault();
      const newText = '\n- ';
      textarea.setRangeText(newText, start, start, 'end');
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    } else if (line.match(/^\s*\d+\.\s/)) {
      e.preventDefault();
      const match = line.match(/^(\s*)(\d+)\.\s/);
      const newText = `\n${match[1]}${parseInt(match[2]) + 1}. `;
      textarea.setRangeText(newText, start, start, 'end');
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }
  }
}

async function checkAdminRole(user) {
  try {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    return userDoc.exists() && userDoc.data().role === 'admin';
  } catch (error) {
    console.error('Role check error:', error);
    return false;
  }
}

function loadPageContent() {
  const container = document.getElementById('edit-container');
  container.innerHTML = `
    <a href="/admin">Kembali ke Dashboard</a>
    <div class="doc-list" id="doc-list"></div>
    <div id="editor">
      <h2>${window.location.search ? 'Edit' : 'Buat'} Dokumentasi</h2>
      <form id="edit-form">
        <div>
          <label for="title">Judul:</label>
          <input type="text" id="title" required>
        </div>
        <div>
          <label for="content">Konten:</label>
          <div id="editor-container"></div>
        </div>
        <div>
          <label for="image-url">Link Gambar:</label>
          <input type="url" id="image-url">
        </div>
        <div class="button-container">
          <button type="submit">Simpan</button>
          <button type="button" id="cancel-btn">Batal</button>
        </div>
      </form>
    </div>
  `;

  const editorContainer = addEditorToolbar();
  document.getElementById('editor-container').appendChild(editorContainer);

  const textarea = document.getElementById('content');
  textarea.addEventListener('keydown', handleListInput);

  document.getElementById('cancel-btn').addEventListener('click', () => {
    window.location.href = '/admin/editDokumentasi';
  });
}

function processSnapshot(snapshot) {
  const docList = document.getElementById('doc-list');
  docList.innerHTML = '';
  
  snapshot.forEach((docItem) => {
    const docElement = document.createElement('div');
    docElement.className = 'doc-item';
    docElement.innerHTML = `
      <div>${docItem.data().title} (ID: ${docItem.id})</div>
      <div class="doc-actions">
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Hapus</button>
      </div>
    `;
    
    docElement.querySelector('.edit-btn').addEventListener('click', () => {
      window.location.href = `/admin/editDokumentasi?id=${docItem.id}`;
    });
    
    docElement.querySelector('.delete-btn').addEventListener('click', () => {
      deleteDocument(docItem.id);
    });
    
    docList.appendChild(docElement);
  });
}

async function deleteDocument(docId) {
  if (!confirm(`Hapus dokumen ${docId}?`)) return;
  
  try {
    await deleteDoc(doc(db, "dokumentasi", docId));
    alert('Dokumen dihapus!');
  } catch (error) {
    console.error('Delete error:', error);
    alert(`Gagal menghapus: ${error.message}`);
  }
}

async function loadDocumentForEdit() {
  const params = new URLSearchParams(window.location.search);
  const docId = params.get('id');

  if (formSubmitListener) {
    document.getElementById('edit-form').removeEventListener('submit', formSubmitListener);
  }

  formSubmitListener = async (e) => {
    e.preventDefault();
    
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('content').value.trim();
    const imageUrl = document.getElementById('image-url').value.trim();

    if (!title || !content) {
      alert('Judul dan konten wajib diisi!');
      return;
    }

    try {
      const data = {
        title,
        content,
        imageUrl: imageUrl || null,
        updatedAt: new Date().toISOString()
      };

      if (!docId) {
        const newId = await generateNewPageId();
        const newDocRef = doc(db, "dokumentasi", newId);
        await setDoc(newDocRef, {
          ...data,
          createdAt: new Date().toISOString()
        });
        alert('Dokumen baru berhasil dibuat!');
        window.location.href = `/admin/editDokumentasi?id=${newId}`;
        return;
      }

      const docRef = doc(db, "dokumentasi", docId);
      await setDoc(docRef, data, { merge: true });
      alert('Perubahan tersimpan!');
      window.location.href = '/admin/editDokumentasi';
    } catch (error) {
      console.error('Save error:', error);
      alert(`Gagal menyimpan: ${error.code || error.message}`);
    }
  };

  document.getElementById('edit-form').addEventListener('submit', formSubmitListener);

  if (!docId) return;

  try {
    const docRef = doc(db, "dokumentasi", docId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error('Dokumen tidak ditemukan');
    }

    const data = docSnap.data();
    document.getElementById('title').value = data.title || '';
    document.getElementById('content').value = data.content || '';
    document.getElementById('image-url').value = data.imageUrl || '';
  } catch (error) {
    console.error('Load error:', error);
    alert(error.message);
    window.location.href = '/admin/editDokumentasi';
  }
}

async function setupPageFunctionality() {
  try {
    const unsubscribe = onSnapshot(
      collection(db, "dokumentasi"),
      (snapshot) => {
        if (!isUnsubscribed) processSnapshot(snapshot);
      },
      (error) => {
        console.error('Listener error:', error);
        alert('Gagal memuat data realtime');
      }
    );

    window.addEventListener('beforeunload', () => {
      isUnsubscribed = true;
      unsubscribe();
    });

    await loadDocumentForEdit();
  } catch (error) {
    console.error('Setup error:', error);
    alert('Error: ' + error.message);
  }
}

auth.onAuthStateChanged(async (user) => {
  const container = document.getElementById('edit-container');
  
  if (!user) {
    window.location.href = '/masuk';
    return;
  }

  if (!(await checkAdminRole(user))) {
    window.location.href = '/';
    return;
  }

  loadPageContent();
  setupPageFunctionality();
});