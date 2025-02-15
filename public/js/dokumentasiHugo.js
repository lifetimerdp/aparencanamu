import { db } from './firebaseConfig.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
    const dokumentasiList = document.getElementById('dokumentasiList');
    const searchInput = document.getElementById('searchInput');
    let originalItems = [];
    let activeDocId = null;

    // Fungsi untuk menambahkan tombol salin
    const addCopyButtons = () => {
        document.querySelectorAll('pre').forEach((preElement) => {
            if (!preElement.querySelector('.copy-button')) {
                const button = document.createElement('button');
                button.className = 'copy-button';
                button.textContent = 'Salin';
                preElement.appendChild(button);
                
                button.addEventListener('click', () => {
                    const code = preElement.querySelector('code').innerText;
                    navigator.clipboard.writeText(code).then(() => {
                        button.textContent = 'Tersalin!';
                        button.classList.add('copied');
                        setTimeout(() => {
                            button.textContent = 'Salin';
                            button.classList.remove('copied');
                        }, 2000);
                    });
                });
            }
        });
    };

    const truncateText = (text, maxLength = 200) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const formatFirestoreDate = (isoDate) => {
        if (!isoDate) return '';
        const date = new Date(isoDate);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const convertMarkdownToHTML = (markdown) => {
        return marked.parse(markdown);
    };

    const renderItem = (data, isFull = false) => {
        const content = isFull ? data.content : truncateText(data.content);
        return `
            <div class="dokumentasiItem" data-id="${data.id}">
                <h2 class="docTitle">${data.title}</h2>
                ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${data.title}" class="dokumentasiImage">` : ''}
                <div class="content">${convertMarkdownToHTML(content)}</div>
                ${!isFull && data.content.length > 200 ? '<span class="lihatSelengkapnya">Lihat Selengkapnya...</span>' : ''}
                <div class="metaData">
                    ${data.createdAt ? `<small>Dibuat: ${formatFirestoreDate(data.createdAt)}</small>` : ''}
                    ${data.updatedAt ? `<small>Diperbarui: ${formatFirestoreDate(data.updatedAt)}</small>` : ''}
                </div>
            </div>
        `;
    };

    const showAllDocuments = () => {
		    dokumentasiList.classList.remove('single-doc-view');
		    dokumentasiList.innerHTML = originalItems.map(item => renderItem(item)).join('');
		    activeDocId = null;
		    addCopyButtons();
		};

    const showSingleDocument = (docId) => {
		    dokumentasiList.classList.add('single-doc-view');
		    const doc = originalItems.find(item => item.id === docId);
		    dokumentasiList.innerHTML = `
		        ${renderItem(doc, true)}
		        <button id="kembaliButton" class="kembaliButton">Kembali ke Daftar</button>
		    `;
		    document.getElementById('kembaliButton').addEventListener('click', showAllDocuments);
		    addCopyButtons();
		    
		    // Tambahkan event listener untuk gambar
		    document.querySelectorAll('.content img').forEach(img => {
		        img.addEventListener('click', () => {
		            img.style.objectFit = img.style.objectFit === 'cover' ? 'contain' : 'cover';
		        });
		    });
		};

    try {
        const querySnapshot = await getDocs(collection(db, "dokumentasi"));
        originalItems = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        showAllDocuments();

        // Event listener untuk klik dokumen
        dokumentasiList.addEventListener('click', (e) => {
            const docItem = e.target.closest('.dokumentasiItem');
            const lihatSelengkapnya = e.target.closest('.lihatSelengkapnya');
            const docTitle = e.target.closest('.docTitle');
            
            if ((docTitle || lihatSelengkapnya) && docItem) {
                const docId = docItem.dataset.id;
                showSingleDocument(docId);
            }
        });

        // Event listener untuk pencarian
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = originalItems.filter(item => 
                item.title.toLowerCase().includes(searchTerm) || 
                item.content.toLowerCase().includes(searchTerm)
            );
            dokumentasiList.innerHTML = filtered.map(item => renderItem(item)).join('');
            addCopyButtons(); // Tambahkan tombol salin setelah filter
        });

    } catch (error) {
        console.error("Error mengambil data:", error);
    }
});