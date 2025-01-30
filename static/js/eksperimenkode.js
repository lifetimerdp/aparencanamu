Apa yang perlu saya lakukan untuk halaman pengembangan diri karena beberapa elemen dari segi konten dan tampilan telah rusak.

mungkin ada duplikat elemen dengan fitur yang mirip, tampilan yang berantakan dan membingungkan, kode yang rusak dan tidak optimal.

berikan saya masukan atau saran tentang masalah ini (gunakan bahasa Indonesia saat menjelaskan).

berikut kode-kode terkait halaman pengembangan diri:
pengembanganDiri.html:
{{ define "main" }}
<main class=container><h1 class=page-title>Pengembangan Diri</h1><nav class=tab-nav><ul><li><a href=#form-section class=active>Input Data</a><li><a href=#target-section>Target</a><li><a href=#learning-section>Pembelajaran</a><li><a href=#achievement-section>Prestasi</a></ul></nav><div class=quick-nav><select id=quick-jump><option value="">Langsung ke...<option value=target>Target<option value=booksRead>Buku<option value=coursesTaken>Kursus<option value=hobbiesInterests>Hobi<option value=keterampilan>Keterampilan<option value=prestasi>Prestasi<option value=sertifikasi>Sertifikasi<option value=catatan>Catatan</select></div><section class="active tab-content"id=form-section><div class=form-container><div class=form-wizard><div class=wizard-steps><div class="active step">1. Kategori</div><div class=step>2. Detail</div><div class=step>3. Konfirmasi</div></div><form id=pengembangan-form class=wizard-form><div class="active wizard-panel"><div class=input-group><label for=kategori-select>Pilih Kategori</label> <select id=kategori-select required><option value="">Pilih Kategori<option value=target>Target<option value=booksRead>Buku yang Dibaca<option value=coursesTaken>Kursus yang Diikuti<option value=hobbiesInterests>Hobi dan Minat<option value=keterampilan>Keterampilan<option value=prestasi>Prestasi<option value=sertifikasi>Sertifikasi<option value=catatan>Catatan Pembelajaran</select><div class=input-help><i class=help-icon>?</i> <span class=tooltip>Pilih kategori yang sesuai untuk item baru Anda</span></div></div><button class=btn-next type=button>Lanjut</button></div><div class=wizard-panel><div class=input-group><label for=item-input>Judul/Nama</label> <input id=item-input required><div class=input-preview></div></div><div class=input-group><label for=tanggal-input>Tanggal</label> <input id=tanggal-input type=date required></div><div class=input-group><label for=deskripsi-input>Deskripsi</label> <textarea id=deskripsi-input></textarea><div class=char-count>0/500</div></div><div class=target-fields><div class=milestone-checkbox><input id=milestone-check type=checkbox> <label for=milestone-check>Tandai sebagai Milestone</label></div><select id=milestone-type disabled><option value="">Pilih Tipe Milestone<option value=short>Jangka Pendek<option value=long>Jangka Panjang</select> <select id=status-select required><option value=not-started>Belum Dimulai<option value=in-progress>Sedang Berjalan<option value=completed>Selesai</select> <textarea id=lesson-learned placeholder=Pembelajaran/Refleksi></textarea> <input id=reference-link type=url placeholder="Link Referensi"> <textarea id=progress-notes placeholder="Catatan Progress"></textarea></div><div class=button-group><button class=btn-prev type=button>Kembali</button> <button class=btn-next type=button>Pratinjau</button></div></div><div class=wizard-panel><div class=preview-container><h3>Pratinjau Data</h3><div class=preview-content></div></div><div class=button-group><button class=btn-prev type=button>Ubah</button> <button class=btn-submit type=submit>Simpan</button></div></div></form></div></div></section><div class=data-sections><section class=data-section id=target><h2>Target</h2><div class=data-display><ul class=item-list id=target-list></ul><p class=empty-message id=target-empty>Belum ada target yang ditambahkan</div></section><section class=data-section id=books-read><h2>Buku yang Dibaca</h2><div class=data-display><ul class=item-list id=books-read-list></ul><p class=empty-message id=books-read-empty>Belum ada buku yang ditambahkan</div></section><section class=data-section id=courses-taken><h2>Kursus yang Diikuti</h2><div class=data-display><ul class=item-list id=courses-taken-list></ul><p class=empty-message id=courses-taken-empty>Belum ada kursus yang ditambahkan</div></section><section class=data-section id=hobbies-interests><h2>Hobi dan Minat</h2><div class=data-display><ul class=item-list id=hobbies-interests-list></ul><p class=empty-message id=hobbies-interests-empty>Belum ada hobi yang ditambahkan</div></section><section class=data-section id=keterampilan><h2>Keterampilan</h2><div class=data-display><ul class=item-list id=keterampilan-list></ul><p class=empty-message id=keterampilan-empty>Belum ada keterampilan yang ditambahkan</div></section><section class=data-section id=prestasi><h2>Prestasi</h2><div class=data-display><ul class=item-list id=prestasi-list></ul><p class=empty-message id=prestasi-empty>Belum ada prestasi yang ditambahkan</div></section><section class=data-section id=sertifikasi><h2>Sertifikasi</h2><div class=data-display><ul class=item-list id=sertifikasi-list></ul><p class=empty-message id=sertifikasi-empty>Belum ada sertifikasi yang ditambahkan</div></section><section class=data-section id=catatan><h2>Catatan Pembelajaran</h2><div class=data-display><ul class=item-list id=catatan-list></ul><p class=empty-message id=catatan-empty>Belum ada catatan yang ditambahkan</div></section></div></main><div class=modal id=edit-modal><div class=modal-content><span class=close>×</span><h2>Edit Item</h2><form id=edit-form><input id=edit-item-input required> <input id=edit-tanggal-input type=date required> <textarea id=edit-deskripsi-input></textarea><div class=target-fields id=edit-target-fields><select id=edit-timeframe-select><option value="">Pilih Jangka Waktu<option value=short>Jangka Pendek<option value=long>Jangka Panjang</select> <select id=edit-status-select><option value=not-started>Belum Dimulai<option value=in-progress>Sedang Berjalan<option value=completed>Selesai</select><div class=milestone-checkbox><input id=edit-milestone-check type=checkbox> <label for=edit-milestone-check>Tandai sebagai Milestone</label></div><textarea id=edit-lesson-learned placeholder=Pembelajaran/Refleksi></textarea> <input id=edit-reference-link type=url placeholder="Link Referensi"> <textarea id=edit-progress-notes placeholder="Catatan Progress"></textarea></div><input id=edit-item-id type=hidden> <input id=edit-kategori type=hidden> <button class=btn-submit type=submit>Simpan Perubahan</button> <button class=btn-cancel type=button id=cancel-edit>Batal</button></form></div></div><div class=loading-indicator id=loading-indicator><div class=spinner></div><p>Menyimpan data...</div>
<link rel="stylesheet" href="{{ "css/pengembanganDiri.css" | relURL }}">
<script type="module" src="{{ "js/pengembanganDiri.js" | relURL }}"></script>
{{ end }}

pengembanganDiri.css:
:root{--primary-color:#3498db;--secondary-color:#2980b9;--accent-color:#2c3e50;--white:#fff;--light-gray:#f4f4f4;--neutral-gray:#ecf0f1;--soft-hover-gray:#e0e0e0;--delete-red:#e74c3c;--secondary-btn-gray:#95a5a6;--inactive-text-gray:#7f8c8d;--gradient-primary:linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);--gradient-success:linear-gradient(135deg, #11998e 0%, #38ef7d 100%);--soft-shadow:0 10px 25px rgba(0, 0, 0, 0.1);--transition-smooth:all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);--transition-quick:all 0.2s ease;--box-shadow-hover:0 8px 15px rgba(0, 0, 0, 0.1)}body{background:linear-gradient(to right,#f5f7fa,#c3cfe2);color:var(--accent-color);font-family:Inter,Segoe UI,Roboto,sans-serif;line-height:1.6}.container{max-width:1200px;margin:0 auto;padding:2rem}.page-title{text-align:center;color:var(--accent-color);margin-bottom:2rem;font-weight:800;letter-spacing:-1px}.tab-nav{margin-bottom:2rem;border-bottom:2px solid var(--neutral-gray)}.tab-nav ul{display:flex;list-style:none;padding:0;margin:0;gap:1rem}.tab-nav a{display:inline-block;padding:1rem 1.5rem;color:var(--accent-color);text-decoration:none;position:relative;transition:var(--transition-quick)}.tab-nav a.active::after{content:"";position:absolute;bottom:-2px;left:0;width:100%;height:2px;background:var(--primary-color)}.quick-nav{margin-bottom:1.5rem}#quick-jump{width:auto;min-width:200px}.progress-container{background:rgb(255 255 255 / .9);border:1px solid rgb(255 255 255 / .2);border-radius:15px;margin-bottom:2rem;padding:2rem;box-shadow:var(--soft-shadow);transition:var(--transition-smooth)}.progress-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1.5rem}.progress-card{background:#fff;border:1px solid var(--neutral-gray);border-radius:12px;padding:1.5rem;text-align:center;transition:var(--transition-smooth);cursor:pointer;box-shadow:0 5px 15px rgb(0 0 0 / .05);transform:perspective(500px)}.progress-card:hover{transform:scale(1.05) rotateX(5deg);box-shadow:0 10px 20px rgb(0 0 0 / .1)}.progress-number{background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:#fff0;display:inline-block;font-size:3rem;font-weight:900;letter-spacing:-2px;margin-bottom:.5rem}.progress-label{color:var(--accent-color);font-weight:700;text-transform:uppercase;letter-spacing:1.5px;opacity:.8}.form-container{background:var(--white);padding:2rem;border-radius:12px;box-shadow:0 15px 30px rgb(0 0 0 / .1);margin-bottom:2rem}.form-wizard{background:#fff;border-radius:12px;padding:2rem;box-shadow:var(--soft-shadow)}.wizard-steps{display:flex;justify-content:space-between;margin-bottom:2rem;position:relative}.wizard-steps::before{content:"";position:absolute;top:50%;left:0;right:0;height:2px;background:var(--neutral-gray);z-index:1}.step{background:#fff;padding:.5rem 1rem;border-radius:20px;color:var(--accent-color);position:relative;z-index:2}.step.active{background:var(--primary-color);color:#fff}.wizard-panel{display:none}.wizard-panel.active{display:block}.input-group{margin-bottom:1.5rem;position:relative}select,input,textarea{padding:.8rem;border:1px solid var(--soft-hover-gray);border-radius:8px;font-size:1rem;width:100%;box-sizing:border-box;transition:border-color 0.3s}select:focus,input:focus,textarea:focus{outline:0;border-color:var(--primary-color)}.input-help{position:absolute;right:.5rem;top:50%;transform:translateY(-50%)}.tooltip{display:none;position:absolute;right:100%;top:50%;transform:translateY(-50%);background:var(--accent-color);color:#fff;padding:.5rem;border-radius:4px;font-size:.875rem;white-space:nowrap}.input-help:hover .tooltip{display:block}.char-count{text-align:right;font-size:.875rem;color:var(--inactive-text-gray)}.preview-container{background:var(--light-gray);padding:1rem;border-radius:8px;margin-bottom:1rem}.button-group{display:flex;gap:1rem;justify-content:flex-end}.btn-prev,.btn-next,.btn-submit{padding:.8rem 1.5rem;border:none;border-radius:6px;cursor:pointer;transition:var(--transition-quick)}.btn-prev{background:var(--secondary-btn-gray);color:#fff}.btn-next{background:var(--primary-color);color:#fff}.btn-submit{background:var(--gradient-success);color:#fff}.data-sections{display:grid;gap:2rem}.data-section{background:var(--white);border-radius:12px;padding:1.5rem;box-shadow:0 15px 30px rgb(0 0 0 / .1)}.data-section h2{color:var(--accent-color);margin-bottom:1rem;padding-bottom:.5rem;border-bottom:2px solid var(--light-gray)}.item-list{list-style:none;padding:0;margin:0}.item-card{background:var(--neutral-gray);border-radius:8px;padding:1rem;margin-bottom:1rem;transition:transform 0.3s}.item-card:hover{transform:translateY(-5px)}.loading-indicator{display:none;position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:2rem;border-radius:12px;box-shadow:var(--soft-shadow);z-index:1000}.spinner{width:40px;height:40px;border:4px solid var(--neutral-gray);border-top-color:var(--primary-color);border-radius:50%;animation:spin 1s linear infinite}.empty-message{text-align:center;color:var(--inactive-text-gray);background:var(--neutral-gray);padding:2rem;border-radius:8px}.success-message{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:1100;max-width:400px;width:90%;text-align:center;padding:1rem;border-radius:8px;background:var(--gradient-success);color:#fff;box-shadow:0 10px 25px rgb(0 0 0 / .2);transition:opacity 0.5s}.error-message{text-align:center;background:#ffebee;color:#c62828;padding:1rem;border-radius:8px;margin:1rem 0}@keyframes spin{to{transform:rotate(360deg)}}@media (max-width:768px){.container{padding:1rem}.tab-nav ul{flex-wrap:wrap}.wizard-steps{flex-direction:column;gap:1rem}.wizard-steps::before{display:none}.progress-grid{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}}@media print{.form-container,.item-actions,.modal,.tab-nav,.quick-nav{display:none}.container{padding:0}.data-section{break-inside:avoid;box-shadow:none}}

pengembanganDiri.js:
import{auth,db}from "./firebaseConfig.js";import{getDoc,doc,updateDoc,setDoc,Timestamp}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";const CATEGORIES=["booksRead","coursesTaken","hobbiesInterests","keterampilan","prestasi","target","sertifikasi","catatan"];const CATEGORY_LABELS={booksRead:"Buku Dibaca",coursesTaken:"Kursus Diikuti",hobbiesInterests:"Hobi & Minat",keterampilan:"Keterampilan",prestasi:"Prestasi",target:"Target",sertifikasi:"Sertifikasi",catatan:"Catatan"};const DOM={form:document.getElementById("pengembangan-form"),kategoriSelect:document.getElementById("kategori-select"),itemInput:document.getElementById("item-input"),tanggalInput:document.getElementById("tanggal-input"),deskripsiInput:document.getElementById("deskripsi-input"),editModal:document.getElementById("edit-modal"),editForm:document.getElementById("edit-form"),editItemInput:document.getElementById("edit-item-input"),editTanggalInput:document.getElementById("edit-tanggal-input"),editDeskripsiInput:document.getElementById("edit-deskripsi-input"),editItemId:document.getElementById("edit-item-id"),editKategori:document.getElementById("edit-kategori"),closeModal:document.querySelector(".close"),cancelEdit:document.getElementById("cancel-edit"),};const generateId=()=>Date.now().toString(36)+Math.random().toString(36).substr(2);const formatDate=(timestamp)=>(timestamp?timestamp.toDate().toISOString().split("T")[0]:"");const createItemData=(title,date,description="")=>({id:generateId(),title,date:Timestamp.fromDate(new Date(date)),description,createdAt:Timestamp.now(),updatedAt:Timestamp.now()});const STATUS_OPTIONS={'not-started':'Belum Dimulai','in-progress':'Sedang Berjalan','completed':'Selesai'};const TIMEFRAME_OPTIONS={'short':'Jangka Pendek','long':'Jangka Panjang'};const createTargetData=(title,date,description="",timeframe="short",status="not-started",isMilestone=!1,lessonLearned="",referenceLink="",progressNotes="",relatedCategories=[])=>({...createItemData(title,date,description),timeframe,status,isMilestone,lessonLearned,referenceLink,progressNotes,relatedCategories});const filterAndSearchItems=(items,filters)=>{if(!items)return[];return items.filter(item=>{const matchesStatus=!filters.status||item.status===filters.status;const matchesTimeframe=!filters.timeframe||item.timeframe===filters.timeframe;const matchesSearch=!filters.search||item.title.toLowerCase().includes(filters.search.toLowerCase())||item.description.toLowerCase().includes(filters.search.toLowerCase());return matchesStatus&&matchesTimeframe&&matchesSearch})};const sortItems=(items,sortType)=>{if(!items)return[];const sortedItems=[...items];switch(sortType){case 'date-desc':return sortedItems.sort((a,b)=>b.date.seconds-a.date.seconds);case 'date-asc':return sortedItems.sort((a,b)=>a.date.seconds-b.date.seconds);case 'status':return sortedItems.sort((a,b)=>{const statusOrder={'completed':1,'in-progress':2,'not-started':3};return statusOrder[a.status]-statusOrder[b.status]});default:return sortedItems}};const getCategoryLabel=(category)=>CATEGORY_LABELS[category]||category;function enhanceSuccessMessage(message,kategori=null,action=null,name=null){const existingNotification=document.querySelector(".success-message");if(existingNotification){existingNotification.remove()}
const successElement=document.createElement("div");successElement.className="success-message";const successMessages={booksRead:["1 buku baru membuka jendela pengetahuan barumu.","Setiap buku adalah perjalanan ilmu yang menakjubkan.","Membaca adalah investasi terbaik untuk dirimu.","Satu buku, seribu pengalaman baru."],coursesTaken:["Kursus baru = Skill baru dikembangkan!","Terus belajar, terus tumbuh.","Pengetahuan adalah kekuatan, dan kamu baru saja mendapatkannya.","Selamat pada langkah pembelajaran barumu!"],hobbiesInterests:["Hobi adalah jendela kebahagiaan dan kreativitasmu.","Setiap minat baru adalah potensi tersembunyi.","Kamu baru saja menambah warna pada kehidupanmu.","Hobi membuat hidup terasa lebih berarti."],keterampilan:["Skill baru, kesempatan baru!","Setiap keterampilan adalah senjata untuk masa depan.","Kamu baru saja memperluas peta kemampuanmu.","Terus asah, terus kembangkan potensimu."],prestasi:["Setiap prestasi adalah bukti kerja kerasmu.","Kamu layak berbangga dengan pencapaianmu!","Prestasi kecil hari ini, kesuksesan besar besok.","Terus ukir prestasi, terus inspirasi."],target:["Target baru = Mimpi baru yang akan diwujudkan!","Setiap target adalah kompas perjalananmu.","Kamu baru saja membuat peta masa depanmu.","Tetap fokus, target akan tercapai."],sertifikasi:["Sertifikasi baru, kredibilitas bertambah!","Selamat pada pengakuan profesionalitasmu.","Sertifikasi adalah bukti komitmen belajarmu.","Terus kembangkan diri melalui sertifikasi."],catatan:["Catatan adalah jembatan antara pikiran dan aksi.","Setiap catatan adalah langkah refleksi dirimu.","Kamu baru saja merekam momen pertumbuhanmu.","Terus catat, terus pelajari."],};const actionMessages={diperbarui:"telah diperbarui. Terus kembangkan dirimu!",dihapus:"telah dihapus. Tetap fokus pada tujuanmu!"};let successText;if(action&&name){const categoryLabel=getCategoryLabel(kategori);successText=`${categoryLabel} "${name}" ${actionMessages[action]}`}else{const categoryMessages=successMessages[kategori]||["Keren! Kamu baru saja menambahkan langkah maju dalam perkembanganmu.","Setiap langkah kecil adalah kemajuan besar.","Terus berkembang, terus tumbuh!"];successText=categoryMessages[Math.floor(Math.random()*categoryMessages.length)]}
successElement.textContent=successText;document.body.appendChild(successElement);setTimeout(()=>{successElement.style.opacity="0";setTimeout(()=>{successElement.remove()},500)},3000)}
const createProgressSummary=(userData)=>{const progressGrid=document.createElement("div");progressGrid.className="progress-grid";CATEGORIES.forEach((category)=>{const items=userData[category]||[];const card=document.createElement("div");card.className="progress-card";card.innerHTML=`
            <div class="progress-number">${items.length}</div>
            <div class="progress-label">${getCategoryLabel(category)}</div>
        `;progressGrid.appendChild(card)});const progressContainer=document.createElement("div");progressContainer.className="progress-container";progressContainer.appendChild(progressGrid);return progressContainer};const showEditModal=(item,kategori)=>{DOM.editItemInput.value=item.title;DOM.editTanggalInput.value=formatDate(item.date);DOM.editDeskripsiInput.value=item.description||"";DOM.editItemId.value=item.id;DOM.editKategori.value=kategori;DOM.editModal.style.display="block";if(kategori==='target'){const existingTargetFields=DOM.editForm.querySelector('.target-fields');if(!existingTargetFields){const targetFields=document.createElement('div');targetFields.className='target-fields active';targetFields.innerHTML=`
                <div class="milestone-checkbox">
                    <input type="checkbox" id="edit-milestone-check" ${item.isMilestone ? 'checked' : ''}>
                    <label for="edit-milestone-check">Tandai sebagai Milestone</label>
                </div>
                <select id="edit-milestone-type" ${!item.isMilestone ? 'disabled' : ''}>
                    <option value="">Pilih Tipe Milestone</option>
                    <option value="short" ${item.milestoneType === 'short' ? 'selected' : ''}>Jangka Pendek</option>
                    <option value="long" ${item.milestoneType === 'long' ? 'selected' : ''}>Jangka Panjang</option>
                </select>
                <select id="edit-status-select" required>
                    <option value="not-started" ${item.status === 'not-started' ? 'selected' : ''}>Belum Dimulai</option>
                    <option value="in-progress" ${item.status === 'in-progress' ? 'selected' : ''}>Sedang Berjalan</option>
                    <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>Selesai</option>
                </select>
                <div class="related-categories-select">
                    <label>Kategori Terkait:</label>
                    <select id="edit-related-categories" multiple>
                        ${CATEGORIES.filter(cat => cat !== 'target').map(cat => 
                            `<option value="${cat}" ${item.relatedCategories?.includes(cat)?'selected':''}>${CATEGORY_LABELS[cat]}</option>`
                        ).join('')}
                    </select>
                </div>
            `;DOM.editForm.insertBefore(targetFields,DOM.editForm.querySelector('button'));document.getElementById('edit-milestone-check').addEventListener('change',(e)=>{document.getElementById('edit-milestone-type').disabled=!e.target.checked})}}
updatePreview()};const closeEditModal=()=>{DOM.editModal.style.display="none";DOM.editForm.reset();const targetFields=DOM.editForm.querySelector('.target-fields');if(targetFields){targetFields.remove()}};const renderList=(listElement,emptyElement,items,kategori)=>{if(kategori==='target'){renderTargetList(listElement,emptyElement,items);return}
if(!items||items.length===0){listElement.style.display="none";emptyElement.style.display="block";return}
listElement.style.display="block";emptyElement.style.display="none";listElement.innerHTML="";items.sort((a,b)=>b.date.seconds-a.date.seconds).forEach((item)=>{const li=document.createElement("li");li.className="item-card";const date=item.date.toDate().toLocaleDateString("id-ID",{year:"numeric",month:"long",day:"numeric"});li.innerHTML=`
            <div class="item-header">
                <h3>${item.title}</h3>
                <span class="date">${date}</span>
            </div>
            ${item.description ? `<p class="description">${item.description}</p>` : ""}
            <div class="item-actions">
                <button class="edit-btn" data-id="${item.id}">Edit</button>
                <button class="delete-btn" data-id="${item.id}">Hapus</button>
            </div>
        `;li.querySelector(".edit-btn").onclick=()=>showEditModal(item,kategori);li.querySelector(".delete-btn").onclick=()=>deleteItem(item,kategori);listElement.appendChild(li)})};const renderTargetList=(listElement,emptyElement,items)=>{if(!items||items.length===0){listElement.style.display="none";emptyElement.style.display="block";return}
listElement.style.display="block";emptyElement.style.display="none";const journeyContainer=document.createElement('div');journeyContainer.className='journey-container';const journeyPath=document.createElement('div');journeyPath.className='journey-path';const journeyLine=document.createElement('div');journeyLine.className='journey-line';journeyPath.appendChild(journeyLine);items.forEach(item=>{const journeyItem=document.createElement('div');journeyItem.className=`journey-item status-${item.status || 'not-started'} timeframe-${item.timeframe || 'short'}`;if(item.isMilestone)journeyItem.classList.add('milestone');const date=item.date.toDate().toLocaleDateString("id-ID",{year:"numeric",month:"long",day:"numeric"});journeyItem.innerHTML=`
      <h3>${item.title}</h3>
      <span class="date">${date}</span>
      ${item.description ? `<p class="description">${item.description}</p>` : ''}
      <div class="target-details">
        <p class="timeframe">Jangka Waktu: ${TIMEFRAME_OPTIONS[item.timeframe]}</p>
        <p class="status">Status: ${STATUS_OPTIONS[item.status]}</p>
        ${item.lessonLearned ? `<p class="lesson">Pembelajaran:${item.lessonLearned}</p>` : ''}
        ${item.referenceLink ? `<p class="reference">Referensi:<a href="${item.referenceLink}" target="_blank">Link</a></p>` : ''}
        ${item.progressNotes ? `<p class="progress">Progress:${item.progressNotes}</p>` : ''}
      </div>
      ${item.relatedCategories?.length ? 
        `<div class="related-categories">${item.relatedCategories.map(cat=>`<span class="category-tag">${CATEGORY_LABELS[cat]}</span>`).join('')}</div>` : ''
      }
      <div class="item-actions">
        <button class="edit-btn" data-id="${item.id}">Edit</button>
        <button class="delete-btn" data-id="${item.id}">Hapus</button>
      </div>
    `;journeyPath.appendChild(journeyItem)});journeyContainer.appendChild(journeyPath);listElement.innerHTML='';listElement.appendChild(journeyContainer)};const addItem=async(e)=>{e.preventDefault();const user=auth.currentUser;showLoading();if(!user){alert("Silakan login terlebih dahulu");return}
const kategori=DOM.kategoriSelect.value;if(!kategori){alert("Silakan pilih kategori");return}
try{let itemData;if(kategori==='target'){itemData=createTargetData(DOM.itemInput.value.trim(),DOM.tanggalInput.value,DOM.deskripsiInput.value.trim(),document.getElementById('status-select').value,document.getElementById('milestone-check').checked,document.getElementById('milestone-type').value,Array.from(document.getElementById('related-categories').selectedOptions).map(option=>option.value))}else{itemData=createItemData(DOM.itemInput.value.trim(),DOM.tanggalInput.value,DOM.deskripsiInput.value.trim())}
const docRef=doc(db,"users",user.uid);const userDoc=await getDoc(docRef);if(!userDoc.exists()){await setDoc(docRef,{[kategori]:[itemData]})}else{const currentData=userDoc.data()[kategori]||[];await updateDoc(docRef,{[kategori]:[...currentData,itemData]})}
DOM.form.reset();const targetFields=document.querySelector('.target-fields');if(targetFields){targetFields.classList.remove('active')}
enhanceSuccessMessage("Keren! Kamu baru saja menambahkan langkah maju dalam perkembanganmu.",kategori);await loadUserData()}catch(error){console.error("Error menambah data:",error);alert("Gagal menambah data. Error: "+error.message)}};const updateItem=async(e)=>{e.preventDefault();const user=auth.currentUser;if(!user)return;const itemId=DOM.editItemId.value;const kategori=DOM.editKategori.value;const itemName=DOM.editItemInput.value.trim();try{const docRef=doc(db,"users",user.uid);const userDoc=await getDoc(docRef);const currentData=userDoc.data()[kategori]||[];let updatedData;if(kategori==='target'){updatedData=currentData.map(item=>item.id===itemId?{...item,title:itemName,date:Timestamp.fromDate(new Date(DOM.editTanggalInput.value)),description:DOM.editDeskripsiInput.value.trim(),status:document.getElementById('edit-status-select').value,isMilestone:document.getElementById('edit-milestone-check').checked,milestoneType:document.getElementById('edit-milestone-type').value,relatedCategories:Array.from(document.getElementById('edit-related-categories').selectedOptions).map(option=>option.value),updatedAt:Timestamp.now()}:item)}else{updatedData=currentData.map(item=>item.id===itemId?{...item,title:itemName,date:Timestamp.fromDate(new Date(DOM.editTanggalInput.value)),description:DOM.editDeskripsiInput.value.trim(),updatedAt:Timestamp.now()}:item)}
await updateDoc(docRef,{[kategori]:updatedData});closeEditModal();enhanceSuccessMessage(null,kategori,"diperbarui",itemName);hideLoading();await loadUserData()}catch(error){console.error("Error memperbarui data:",error);alert("Gagal memperbarui data. Error: "+error.message)}};const deleteItem=async(item,kategori)=>{if(!confirm("Yakin ingin menghapus item ini?"))return;const user=auth.currentUser;if(!user)return;try{const docRef=doc(db,"users",user.uid);const userDoc=await getDoc(docRef);const currentData=userDoc.data()[kategori]||[];const updatedData=currentData.filter((i)=>i.id!==item.id);await updateDoc(docRef,{[kategori]:updatedData});enhanceSuccessMessage(null,kategori,"dihapus",item.title);await loadUserData()}catch(error){console.error("Error menghapus data:",error);hideLoading();alert("Gagal menghapus data. Error: "+error.message)}};const loadUserData=async()=>{const user=auth.currentUser;if(!user){console.log("User tidak ditemukan");return}
try{const docRef=doc(db,"users",user.uid);const userDoc=await getDoc(docRef);if(!userDoc.exists()){console.log("Dokumen user belum ada");return}
const userData=userDoc.data();const container=document.querySelector(".container");const existingProgressContainers=document.querySelectorAll(".progress-container");existingProgressContainers.forEach((el)=>el.remove());const progressSummary=createProgressSummary(userData);const pageTitle=document.querySelector(".page-title");if(pageTitle){pageTitle.insertAdjacentElement("afterend",progressSummary)}
CATEGORIES.forEach((kategori)=>{const listId=`${kategori.replace(/([A-Z])/g, "-$1").toLowerCase()}-list`;const emptyId=`${kategori.replace(/([A-Z])/g, "-$1").toLowerCase()}-empty`;const listElement=document.getElementById(listId);const emptyElement=document.getElementById(emptyId);if(!listElement||!emptyElement){console.error(`Element tidak ditemukan untuk kategori ${kategori}`);return}
const items=userData[kategori]||[];renderList(listElement,emptyElement,items,kategori)})}catch(error){console.error("Error memuat data:",error);alert("Gagal memuat data. Error: "+error.message)}};DOM.kategoriSelect.addEventListener('change',(e)=>{const targetFields=document.querySelector('.target-fields');if(e.target.value==='target'){if(!targetFields){const fields=document.createElement('div');fields.className='target-fields active';fields.innerHTML=`
                <div class="milestone-checkbox">
                    <input type="checkbox" id="milestone-check">
                    <label for="milestone-check">Tandai sebagai Milestone</label>
                </div>
                <select id="milestone-type" disabled>
                    <option value="">Pilih Tipe Milestone</option>
                    <option value="short">Jangka Pendek</option>
                    <option value="long">Jangka Panjang</option>
                </select>
                <select id="status-select" required>
                    <option value="not-started">Belum Dimulai</option>
                    <option value="in-progress">Sedang Berjalan</option>
                    <option value="completed">Selesai</option>
                </select>
                <div class="related-categories-select">
                    <label>Kategori Terkait:</label>
                    <select id="related-categories" multiple>
                        ${CATEGORIES.filter(cat => cat !== 'target').map(cat => 
                            `<option value="${cat}">${CATEGORY_LABELS[cat]}</option>`
                        ).join('')}
                    </select>
                </div>
            `;DOM.form.insertBefore(fields,DOM.form.querySelector('button'));document.getElementById('milestone-check').addEventListener('change',(e)=>{document.getElementById('milestone-type').disabled=!e.target.checked})}else{targetFields.classList.add('active')}}else if(targetFields){targetFields.classList.remove('active')}});const initTabs=()=>{const tabs=document.querySelectorAll('.tab-nav a');const contents=document.querySelectorAll('.tab-content');tabs.forEach(tab=>{tab.addEventListener('click',(e)=>{e.preventDefault();tabs.forEach(t=>t.classList.remove('active'));contents.forEach(c=>c.classList.remove('active'));tab.classList.add('active');const target=document.querySelector(tab.getAttribute('href'));target.classList.add('active')})})};const initQuickJump=()=>{const quickJump=document.getElementById('quick-jump');quickJump.addEventListener('change',()=>{const selected=quickJump.value;const target=document.getElementById(`${selected}-section`);if(target){target.scrollIntoView({behavior:'smooth'})}})};const initFormWizard=()=>{const wizard=document.querySelector('.form-wizard');const steps=wizard.querySelectorAll('.step');const panels=wizard.querySelectorAll('.wizard-panel');const nextBtns=wizard.querySelectorAll('.btn-next');const prevBtns=wizard.querySelectorAll('.btn-prev');let currentStep=0;const updateStep=(step)=>{steps.forEach((s,i)=>{s.classList.toggle('active',i===step)});panels.forEach((p,i)=>{p.classList.toggle('active',i===step)})};nextBtns.forEach(btn=>{btn.addEventListener('click',()=>{if(validateStep(currentStep)){currentStep++;updateStep(currentStep)}})});prevBtns.forEach(btn=>{btn.addEventListener('click',()=>{currentStep--;updateStep(currentStep)})})};const initInputPreview=()=>{const inputs=document.querySelectorAll('input, textarea, select');inputs.forEach(input=>{input.addEventListener('input',()=>{updatePreview()})})};const updatePreview=()=>{const previewContainer=document.querySelector('.preview-content');const title=DOM.itemInput.value;const date=DOM.tanggalInput.value;const description=DOM.deskripsiInput.value;const kategori=DOM.kategoriSelect.value;const formattedDate=date?new Date(date).toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'}):'';let previewHTML=`
        <div class="preview-item">
            <p><strong>Kategori:</strong> ${CATEGORY_LABELS[kategori] || ''}</p>
            <p><strong>Judul:</strong> ${title}</p>
            <p><strong>Tanggal:</strong> ${formattedDate}</p>
            ${description ? `<p><strong>Deskripsi:</strong>${description}</p>` : ''}
    `;if(kategori==='target'){const status=document.getElementById('status-select')?.value;const isMilestone=document.getElementById('milestone-check')?.checked;const milestoneType=document.getElementById('milestone-type')?.value;const lessonLearned=document.getElementById('lesson-learned')?.value;const referenceLink=document.getElementById('reference-link')?.value;const progressNotes=document.getElementById('progress-notes')?.value;previewHTML+=`
            <p><strong>Status:</strong> ${STATUS_OPTIONS[status] || ''}</p>
            <p><strong>Milestone:</strong> ${isMilestone ? 'Ya' : 'Tidak'}</p>
            ${isMilestone && milestoneType ? `<p><strong>Tipe Milestone:</strong>${TIMEFRAME_OPTIONS[milestoneType]}</p>` : ''}
            ${lessonLearned ? `<p><strong>Pembelajaran:</strong>${lessonLearned}</p>` : ''}
            ${referenceLink ? `<p><strong>Referensi:</strong><a href="${referenceLink}" target="_blank">${referenceLink}</a></p>` : ''}
            ${progressNotes ? `<p><strong>Catatan Progress:</strong>${progressNotes}</p>` : ''}
        `}
previewHTML+='</div>';previewContainer.innerHTML=previewHTML};const showLoading=()=>{document.getElementById('loading-indicator').style.display='block'};const hideLoading=()=>{document.getElementById('loading-indicator').style.display='none'};document.addEventListener("DOMContentLoaded",()=>{const searchInput=document.getElementById('search-input');const filterStatus=document.getElementById('filter-status');const filterTimeframe=document.getElementById('filter-timeframe');const sortSelect=document.getElementById('sort-select');const exportPdfBtn=document.getElementById('export-pdf');const applyFiltersAndSort=async()=>{const filters={search:searchInput.value,status:filterStatus.value,timeframe:filterTimeframe.value};const sortType=sortSelect.value;const userData=await getUserData();if(userData?.target){const filteredItems=filterAndSearchItems(userData.target,filters);const sortedItems=sortItems(filteredItems,sortType);const targetList=document.getElementById('target-list');const targetEmpty=document.getElementById('target-empty');renderTargetList(targetList,targetEmpty,sortedItems)}};[searchInput,filterStatus,filterTimeframe,sortSelect].forEach(element=>{element?.addEventListener('input',applyFiltersAndSort)});exportPdfBtn?.addEventListener('click',()=>{window.print()});const today=new Date().toISOString().split("T")[0];initTabs();initQuickJump();initFormWizard();initInputPreview();if(DOM.tanggalInput){DOM.tanggalInput.value=today}
if(DOM.form){DOM.form.addEventListener("submit",addItem)}
if(DOM.editForm){DOM.editForm.addEventListener("submit",updateItem)}
if(DOM.closeModal){DOM.closeModal.addEventListener("click",closeEditModal)}
if(DOM.cancelEdit){DOM.cancelEdit.addEventListener("click",closeEditModal)}
window.addEventListener("click",(e)=>{if(e.target===DOM.editModal){closeEditModal()}});auth.onAuthStateChanged((user)=>{if(!user){window.location.href="/masuk"}else{loadUserData()}})});const findItemById=(itemId,kategori)=>{const userData=auth.currentUser?JSON.parse(localStorage.getItem(`userData_${auth.currentUser.uid}`)):null;if(userData&&userData[kategori]){return userData[kategori].find((item)=>item.id===itemId)}
return null}