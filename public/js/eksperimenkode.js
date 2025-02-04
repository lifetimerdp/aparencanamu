Beberapa elemen pada halaman pengembangan diri perlu dirubah:
- Tambahkan fitur scrolling saat konten atau data didalam elemen kategori terlalu banyak. jadi, kotak tidak terlihat terlalu memanjang.
- Tambahkan warna background untuk data didalam elemen kategori. pikirkan warna apa yang cocok, tidak mengganggu pengguna dan meningkatkan keterbacaan data didalam kategori.

sedikit pertanyaan:
hal apa lagi yang bisa ditambahkan atau mungkin dirubah pada halaman pengembangan diri jika pengguna atau pengunjung website saya adalah orang minim pengetahuan dan literasi, bodoh, dan emosian?

berikut kode html, css dan js yang membangun halaman pengembangan diri:
pengembanganDiri.html:
{{ define "main" }}
<main class=container><div class=chart-container id=progress-chart><div class=chart-header><h2>📊 Progress Pengembangan Diri</h2><div class=chart-controls><button class=btn-export id=export-csv>📥 Export CSV</button></div></div><div class=chart-bars></div></div><nav class=main-nav><div class=desktop-tabs><a aria-selected=true href=#form-section role=tab class=active>➕ Input Baru</a> <a aria-selected=false href=#progress-section role=tab>📊 Progress</a> <a aria-selected=false href=#target-section role=tab>🎯 Target</a> <a aria-selected=false href=#learning-section role=tab>📚 Pembelajaran</a> <a aria-selected=false href=#target-management role=tab>🎯 Target Management</a></div><select class=mobile-dropdown><option value=#form-section>➕ Input Baru<option value=#progress-section>📊 Progress<option value=#target-section>🎯 Target<option value=#learning-section>📚 Pembelajaran<option value=#target-management>🎯 Target Management</select></nav><section class="active form-section"id=form-section><div class=form-wizard><div class=wizard-header><div class=wizard-progress><div class=progress-bar style=width:33%></div></div><div class=wizard-steps><div class="active step">1. Kategori</div><div class=step>2. Detail</div><div class=step>3. Konfirmasi</div></div></div><form class=wizard-form id=pengembangan-form><div class="active wizard-panel"data-step=1><div class=input-group><label for=kategori-select>Pilih Kategori</label> <select id=kategori-select required><option value="">Pilih Kategori...<option value=target>🎯 Target<option value=booksRead>📚 Buku<option value=coursesTaken>🎓 Kursus<option value=hobbiesInterests>🎨 Hobi</select></div><div class=button-group><button class=btn-next type=button>Lanjut →</button></div></div><div class=wizard-panel data-step=2><div class=input-grid><div class=input-group><label for=item-input>Judul</label> <input id=item-input required></div><div class=input-group><label for=tanggal-input>Tanggal</label> <input id=tanggal-input required type=date></div><div class="input-group full-width"><label for=deskripsi-input>Deskripsi</label> <textarea id=deskripsi-input maxlength=500></textarea><div class=input-footer><span class=char-count>0/500</span> <span class=input-hint>ⓘ Wajib diisi</span></div></div></div><div class=button-group><button class=btn-prev type=button>← Kembali</button> <button class=btn-next type=button>Lanjut →</button></div></div><div class=wizard-panel data-step=3><div class=preview-card><h3>🔄 Preview Data</h3><div class=preview-content></div></div><div class=button-group><button class=btn-prev type=button>← Ubah</button> <button class=btn-submit type=submit>💾 Simpan</button></div></div></form></div></section><div class=global-search><input id=global-search placeholder="🔍 Cari semua kategori..."> <button class=hidden id=reset-filter>⟳ Reset Filter</button></div><section class=target-section id=target-management><div class=target-grid><div class=target-card><h3>🎯 Set Target Kategori</h3><div class=target-form><div class=input-group><label for=target-category>Kategori</label> <select id=target-category><option value="">Pilih Kategori...<option value=target>🎯 Target<option value=booksRead>📚 Buku<option value=coursesTaken>🎓 Kursus<option value=hobbiesInterests>🎨 Hobi</select></div><div class=input-group><label for=target-value>Target Jumlah</label> <input id=target-value type=number min=1></div><button class=btn-set-target>🎯 Set Target</button></div></div><div class=target-progress><h3>📈 Progress Target</h3><div class=target-list></div></div></div></section><div class=data-grid id=data-sections><template id=section-template><section class=data-card><div class=card-header><h2 class=section-title></h2><input placeholder=Cari... class=search-bar> <button class=btn-add>＋ Tambah</button></div><div class=card-content><ul class=item-list></ul><p class=empty-state>📭 Belum ada data</div></section></template></div><div class=modal-overlay id=modal><div class=modal-card><div class=modal-header><h2>✏️ Edit Item</h2><button class=btn-close aria-label=Close>×</button></div><form class=modal-body id=edit-form></form></div></div><div id=toast-container aria-live=polite></div></main>
<link rel="stylesheet" href="{{ "css/pengembanganDiri.css" | relURL }}">
<script type="module" src="{{ "js/pengembanganDiri.js" | relURL }}"></script>
{{ end }}

pengembanganDiri.css:
:root{--primary:#2a9d8f;--secondary:#264653;--accent:#e9c46a;--error:#e76f51;--background:#f8f9fa;--text:#212529;--border:#dee2e6;--radius-sm:4px;--radius-md:8px;--radius-lg:12px;--shadow-sm:0 1px 3px #0000001f;--shadow-md:0 4px 6px #0000001a;--shadow-lg:0 10px 15px #0000001a;--transition:all 0.2s cubic-bezier(0.4, 0, 0.2, 1)}body{background:var(--background);color:var(--text);font-family:Inter,system-ui,sans-serif;line-height:1.5;margin:0;padding:0}.container{max-width:1280px;margin:auto;padding:1rem}.global-search{margin:2rem auto;width:100%}#global-search{width:100%;padding:.8rem 2.5rem .8rem 1rem;border:2px solid var(--border);border-radius:var(--radius-md);background:var(--background);color:var(--text);font-size:1rem;transition:var(--transition)}#global-search:focus{border-color:var(--primary);box-shadow:0 0 0 3px #2a9d8f33;outline:0}.main-nav{margin:2rem 0}.desktop-tabs{display:flex;gap:1rem;border-bottom:2px solid var(--border)}.desktop-tabs a{padding:.75rem 1.5rem;border-radius:var(--radius-md) var(--radius-md) 0 0;color:var(--text);text-decoration:none;transition:var(--transition)}.desktop-tabs a.active{background:var(--primary);color:#fff}.mobile-dropdown{display:none;width:100%;padding:.75rem;border:2px solid var(--border);border-radius:var(--radius-md);background:var(--background);color:var(--text)}.form-wizard{background:var(--background);border-radius:var(--radius-lg);box-shadow:var(--shadow-md);margin:2rem 0;overflow:hidden;border:1px solid var(--border)}.wizard-header{padding:1.5rem;background:var(--secondary);color:#fff}.wizard-progress{height:4px;background:#fff3;border-radius:var(--radius-sm);margin-bottom:1rem}.progress-bar{height:100%;background:var(--accent);transition:var(--transition)}.wizard-steps{display:flex;justify-content:space-between;gap:1rem}.step{opacity:.5;font-weight:500}.step.active{opacity:1;color:var(--accent)}.wizard-panel{padding:2rem;display:none}.wizard-panel.active{display:block}.input-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.5rem}.input-group{margin-bottom:1rem}.input-group label{display:block;margin-bottom:.5rem;font-weight:500}.input-group :is(input,select,textarea){box-sizing:border-box;width:100%;padding:.75rem;border:2px solid var(--border);border-radius:var(--radius-md);transition:var(--transition);background:var(--background);color:var(--text)}.input-group :is(input:focus,textarea:focus){border-color:var(--primary);outline:0;box-shadow:0 0 0 3px #2a9d8f33}.full-width{grid-column:1/-1}.input-footer{display:flex;justify-content:space-between;margin-top:.5rem;font-size:.875rem;color:#6c757d}.data-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:1.5rem;margin:2rem 0}.data-card{background:var(--background);border-radius:var(--radius-lg);box-shadow:var(--shadow-sm);padding:1.5rem;animation:fadeIn 0.3s ease-out;border:1px solid var(--border)}.card-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;flex-wrap:wrap;gap:.5rem}.section-title{margin:0;font-size:1.25rem}.search-bar{padding:.5rem;border:2px solid var(--border);border-radius:var(--radius-md);width:150px;background:var(--background);color:var(--text)}.btn-add{padding:.5rem 1rem;background:var(--primary);color:#fff;border:0;border-radius:var(--radius-md);cursor:pointer;transition:var(--transition)}.btn-add:hover{transform:translateY(-2px);box-shadow:var(--shadow-lg)}.item-list{list-style:none;padding:0;margin:0}.item-list li{padding:1rem;margin:.5rem 0;background:var(--background);border-radius:var(--radius-md);display:flex;justify-content:space-between;align-items:center;animation:fadeIn 0.3s ease-out;transition:var(--transition)}.item-list li:hover{background:#00000008}.empty-state{text-align:center;color:#6c757d;padding:2rem 0}.chart-container{position:relative;padding:2rem;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--background);box-shadow:var(--shadow-sm);margin:5rem 0 2rem 0}.chart-header{display:flex;flex-wrap:wrap;gap:1rem;align-items:center;margin-bottom:2rem}.chart-controls{display:flex;gap:1rem;align-items:center;flex-wrap:nowrap}#reset-filter,.btn-export{padding:.5rem 1rem;border:0;border-radius:var(--radius-md);cursor:pointer;transition:var(--transition)}#reset-filter{background:var(--accent);color:var(--text)}.btn-export{background:var(--secondary);color:#fff}.chart-bars{display:flex;flex-direction:column;gap:1.2rem}.chart-bar{position:relative;display:grid;grid-template-columns:minmax(100px,200px) 1fr minmax(70px,100px);align-items:center;gap:1rem;transition:var(--transition)}.chart-bar:hover{transform:translateX(5px);cursor:pointer}.bar-label{display:flex;align-items:center;gap:.8rem;font-weight:500;z-index:1;color:var(--text)}.bar-container{height:40px;background:var(--border);border-radius:20px;overflow:hidden;box-shadow:inset 0 2px 4px #0000001a}.bar-fill{height:100%;background:linear-gradient(90deg,var(--primary),var(--accent));border-radius:20px 0 0 20px;transition:width 1s ease-in-out;position:relative;display:flex;align-items:center;padding-left:10px;color:#fff;font-weight:500;font-size:.9em}.bar-fill::after{content:attr(data-progress);position:absolute;right:10px}.bar-value{text-align:right;font-weight:600;color:var(--primary)}.target-section{display:none;padding:2rem;background:var(--background);border-radius:var(--radius-lg);border:1px solid var(--border)}.target-section.active{display:block}.target-grid{display:grid;grid-template-columns:1fr 2fr;gap:2rem}.target-card,.target-progress{background:var(--background);padding:1.5rem;border-radius:var(--radius-md);box-shadow:var(--shadow-sm)}.target-form{display:flex;flex-direction:column;gap:1rem}.btn-set-target{background:var(--primary);color:#fff;padding:.8rem;border:0;border-radius:var(--radius-md);cursor:pointer;transition:var(--transition)}.target-list{display:grid;gap:1rem;margin-top:1rem}.modal-overlay{display:none;position:fixed;inset:0;background:#00000080;z-index:1000;align-items:center;justify-content:center}.modal-card{background:var(--background);padding:2rem;border-radius:var(--radius-lg);max-width:500px;width:90%;box-shadow:var(--shadow-lg);animation:scaleIn 0.3s ease-out}.modal-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}.btn-close{background:0;border:0;font-size:1.5rem;color:var(--text);cursor:pointer;padding:.5rem}.modal-body{display:flex;flex-direction:column;gap:1rem}#toast-container{position:fixed;bottom:20px;right:20px;z-index:1001;display:flex;flex-direction:column;gap:.5rem}.notification{background:var(--secondary);color:#fff;padding:1rem 1.5rem;border-radius:var(--radius-md);animation:slideIn 0.3s ease-out;box-shadow:var(--shadow-md)}.notification.error{background:var(--error)}@media (min-width:769px){#reset-filter{padding:.75rem 2rem;min-width:180px;font-size:1rem;order:2}.global-search{display:flex;gap:1rem;align-items:center;max-width:800px}#global-search{flex:1;padding-right:1.5rem}#reset-filter:hover{transform:scale(1.05)}}@media (max-width:768px){.desktop-tabs{display:none}.mobile-dropdown{display:block}.input-grid,.data-grid{grid-template-columns:1fr}.modal-card{width:100%;margin:10px}.chart-bar{grid-template-columns:1fr;gap:.5rem}.bar-value{text-align:left;order:3}.bar-container{order:2}.bar-label{order:1}.bar-fill::after{right:5px}.target-grid{grid-template-columns:1fr}.chart-header,.target-form{flex-direction:column}.chart-controls{width:100%;justify-content:space-between}.btn-export,#reset-filter{width:100%;max-width:300px;margin-top:1rem}.global-search{flex-direction:column;gap:0.5rem5}#global-search{width:80%!important}#reset-filter{max-width:100%!important}.btn-set-target,.target-form .input-group{width:100%}.target-grid{gap:1rem}.target-progress{margin-top:1rem}}@media (max-width:480px){.container{padding:.5rem}.input-group :is(input,select,textarea){font-size:16px;padding:1rem}.item-list li{flex-direction:column;gap:1rem;padding:1.5rem;align-items:flex-start}.item-actions{width:100%;display:flex;justify-content:flex-end;gap:.5rem}.wizard-panel{padding:1rem}.chart-container,.target-card,.target-progress{padding:1rem}}@keyframes fadeIn{0%{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@keyframes scaleIn{0%{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}@keyframes slideIn{0%{transform:translateX(100%)}to{transform:translateX(0)}}@keyframes spin{to{transform:rotate(360deg)}}@keyframes shimmer{0%{background-position:200% 0}to{background-position:-200% 0}}.loading-spinner{width:20px;height:20px;border:3px solid var(--border);border-top-color:var(--primary);border-radius:50%;animation:spin 1s linear infinite}.skeleton{background:var(--border);border-radius:var(--radius-md);animation:shimmer 1.5s infinite linear;background-image:linear-gradient(90deg,transparent 0%,#ffffff1a 50%,transparent 100%);background-size:200% 100%}.skeleton-item,.skeleton-chart-bar{height:58px;margin:.5rem 0}.skeleton-chart-bar{margin:1rem 0}

pengembanganDiri.js:
import{auth,db}from "./firebaseConfig.js";import{doc,getDoc,setDoc,updateDoc,Timestamp,onSnapshot}from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";const CATEGORIES={target:{icon:"🎯",label:"Target"},booksRead:{icon:"📚",label:"Buku"},coursesTaken:{icon:"🎓",label:"Kursus"},hobbiesInterests:{icon:"🎨",label:"Hobi"},keterampilan:{icon:"🛠️",label:"Keterampilan"},prestasi:{icon:"🏆",label:"Prestasi"},sertifikasi:{icon:"📜",label:"Sertifikasi"},catatan:{icon:"📝",label:"Catatan"}};class DevelopmentManager{constructor(){this.currentStep=0;this.formData={};this.userData={};this.editFormSubmitHandler=null;this.debounceTimer=null;this.currentFilter=null;this.init()}
async init(){this.initDOM();this.setupEventListeners();this.authStateHandler();this.setDefaultDate();this.populateKategoriOptions();this.setupLiveValidation()}
initDOM(){this.dom={formWizard:document.querySelector(".form-wizard"),wizardPanels:document.querySelectorAll(".wizard-panel"),btnPrev:document.querySelectorAll(".btn-prev"),btnNext:document.querySelectorAll(".btn-next"),kategoriSelect:document.getElementById("kategori-select"),itemInput:document.getElementById("item-input"),tanggalInput:document.getElementById("tanggal-input"),deskripsiInput:document.getElementById("deskripsi-input"),dataGrid:document.getElementById("data-sections"),sectionTemplate:document.getElementById("section-template"),modal:document.getElementById("modal"),editForm:document.getElementById("edit-form"),globalSearch:document.getElementById("global-search"),resetFilter:document.getElementById("reset-filter"),exportCSV:document.getElementById("export-csv"),targetCategory:document.getElementById("target-category"),targetValue:document.getElementById("target-value"),btnSetTarget:document.querySelector(".btn-set-target")}}
setupEventListeners(){document.querySelectorAll(".desktop-tabs a").forEach(tab=>tab.addEventListener("click",e=>{e.preventDefault();this.showSection(tab.getAttribute("href"))}));document.querySelector(".mobile-dropdown").addEventListener("change",e=>this.showSection(e.target.value));this.dom.btnPrev.forEach(btn=>btn.addEventListener("click",()=>this.handlePrevStep()));this.dom.btnNext.forEach(btn=>btn.addEventListener("click",()=>this.handleNextStep()));document.getElementById("pengembangan-form").addEventListener("submit",e=>this.handleFormSubmit(e));this.dom.dataGrid.addEventListener("click",e=>this.handleDynamicElements(e));this.dom.dataGrid.addEventListener("input",e=>this.handleSearchInput(e));this.dom.deskripsiInput.addEventListener("input",()=>this.updateCharacterCount());this.dom.modal.querySelector(".btn-close").addEventListener("click",()=>this.toggleModal());this.dom.globalSearch.addEventListener("input",e=>this.handleGlobalSearch(e));this.dom.resetFilter.addEventListener("click",()=>this.resetFilter());this.dom.exportCSV.addEventListener("click",()=>this.exportToCSV());this.dom.btnSetTarget.addEventListener("click",e=>{e.preventDefault();this.handleSetTarget()})}
async authStateHandler(){auth.onAuthStateChanged(async user=>{if(!user)return(window.location.href="/masuk");this.userRef=doc(db,"users",user.uid);this.setupRealtimeListener()})}
handleNextStep(){if(!this.validateStep())return;this.currentStep++;this.updateWizard()}
handlePrevStep(){this.currentStep--;this.updateWizard()}
validateStep(){const currentPanel=this.dom.wizardPanels[this.currentStep];const requiredFields=currentPanel.querySelectorAll("[required]");let isValid=!0;if(this.currentStep===1){const selectedDate=new Date(this.dom.tanggalInput.value);const today=new Date();selectedDate.setHours(0,0,0,0);today.setHours(0,0,0,0);if(selectedDate>today){this.showNotification("Tanggal tidak boleh di masa depan","error");this.dom.tanggalInput.style.borderColor="var(--error)";isValid=!1}}
requiredFields.forEach(field=>{if(!field.checkValidity()){field.reportValidity();isValid=!1}});return isValid}
async handleFormSubmit(e){e.preventDefault();this.showLoading();try{const user=auth.currentUser;if(!user)return;const selectedDate=new Date(this.dom.tanggalInput.value);if(selectedDate>new Date())throw new Error("Tanggal tidak boleh di masa depan");const itemData={id:this.generateId(),title:this.dom.itemInput.value.trim(),date:Timestamp.fromDate(new Date(this.dom.tanggalInput.value)),description:this.dom.deskripsiInput.value.trim(),category:this.dom.kategoriSelect.value,createdAt:Timestamp.now()};await this.saveToFirebase(user.uid,itemData);this.resetForm();this.showNotification("Data berhasil disimpan!","success");this.renderDataSections();this.renderChart()}catch(error){this.showNotification(`Gagal menyimpan: ${error.message}`,"error")}finally{this.hideLoading()}}
renderDataSections(){this.dom.dataGrid.innerHTML="";Object.entries(CATEGORIES).forEach(([key,category])=>{const section=this.dom.sectionTemplate.content.cloneNode(!0);section.querySelector(".section-title").textContent=`${category.icon} ${category.label}`;section.querySelector(".data-card").id=`${key}-section`;section.querySelector(".btn-add").dataset.category=key;this.dom.dataGrid.appendChild(section)});this.renderAllItems()}
renderAllItems(){Object.keys(CATEGORIES).forEach(category=>{const listElement=document.querySelector(`#${category}-section .item-list`);const emptyState=document.querySelector(`#${category}-section .empty-state`);const items=this.userData[category]||[];this.renderItems(listElement,emptyState,items,category)})}
renderItems(listElement,emptyState,items,category){listElement.innerHTML="";if(items.length===0){emptyState.style.display="block";return}
emptyState.style.display="none";items.forEach(item=>{const li=document.createElement("li");li.innerHTML=`
        <div>
          <h3>${item.title.length > 50 ? item.title.substring(0, 47) + "..." : item.title}</h3>
          <small>${item.date.toDate().toLocaleDateString("id-ID")}</small>
          ${item.description ? `<p class="item-desc">${item.description.length>150?item.description.substring(0,147)+"...":item.description}</p>` : ""}
        </div>
        <div class="item-actions">
          <button class="btn-edit" data-id="${item.id}" data-category="${category}">✏️</button>
          <button class="btn-delete" data-id="${item.id}" data-category="${category}">🗑️</button>
        </div>
      `;listElement.appendChild(li)})}
renderChart(){const chartContainer=document.querySelector("#progress-chart .chart-bars");chartContainer.innerHTML="";const totalItems=Object.keys(CATEGORIES).reduce((acc,key)=>acc+(this.userData[key]?.length||0),0);Object.entries(CATEGORIES).forEach(([key,category])=>{const count=this.userData[key]?.length||0;const target=this.userData.targets?.[key]||0;const percentage=target>0?Math.min((count/target)*100,100):totalItems>0?(count/totalItems)*100:0;const bar=document.createElement("div");bar.className="chart-bar";bar.innerHTML=`
        <div class="bar-label">${category.icon} ${category.label}</div>
        <div class="bar-container">
          <div class="bar-fill" style="width: 0%" data-target-width="${percentage}%" data-progress="${target > 0 ? `${count}/${target}` : `${percentage.toFixed(0)}%`}"></div>
        </div>
        <div class="bar-value">${count} item</div>
      `;bar.addEventListener("click",()=>this.filterByCategory(key));chartContainer.appendChild(bar)});this.animateChart()}
animateChart(){const bars=document.querySelectorAll(".bar-fill");bars.forEach((bar,index)=>{const targetWidth=bar.dataset.targetWidth;setTimeout(()=>bar.style.width=targetWidth,100*index)})}
filterByCategory(category){if(this.currentFilter===category){this.resetFilter();return}
this.currentFilter=category;this.dom.resetFilter.classList.remove("hidden");this.dom.globalSearch.value="";document.querySelectorAll(".data-card").forEach(card=>card.style.display=card.id===`${category}-section`?"block":"none");this.showNotification(`Menampilkan kategori: ${CATEGORIES[category].label}`)}
resetFilter(){this.currentFilter=null;this.dom.resetFilter.classList.add("hidden");document.querySelectorAll(".data-card").forEach(card=>card.style.display="block");this.showNotification("Menampilkan semua kategori")}
handleGlobalSearch(e){const term=e.target.value.toLowerCase();Object.keys(CATEGORIES).forEach(category=>{const items=this.userData[category]||[];const filtered=items.filter(item=>item.title.toLowerCase().includes(term)||(item.description?.toLowerCase().includes(term)));const listElement=document.querySelector(`#${category}-section .item-list`);const emptyState=document.querySelector(`#${category}-section .empty-state`);const section=document.querySelector(`#${category}-section`);this.renderItems(listElement,emptyState,filtered,category);section.style.display=filtered.length>0?'block':'none'})}
async handleSetTarget(){const category=this.dom.targetCategory.value;const value=this.dom.targetValue.value;if(!category||!value){this.showNotification("Harap isi kategori dan nilai target","error");return}
try{await updateDoc(this.userRef,{[`targets.${category}`]:Number(value)});this.showNotification("Target berhasil diperbarui");this.dom.targetValue.value=""}catch(error){this.showNotification(`Gagal update target: ${error.message}`,"error")}}
renderTargetProgress(){const targetList=document.querySelector(".target-list");if(!targetList)return;targetList.innerHTML="";Object.entries(this.userData.targets||{}).forEach(([key,target])=>{const current=this.userData[key]?.length||0;const progress=Math.min((current/target)*100,100);const progressBar=document.createElement("div");progressBar.className="target-progress-item";progressBar.innerHTML=`
        <div class="target-header">
          <span>${CATEGORIES[key].icon} ${CATEGORIES[key].label}</span>
          <span>${current}/${target}</span>
        </div>
        <div class="progress-bar-container">
          <div class="progress-bar-fill" style="width: ${progress}%"></div>
        </div>
      `;targetList.appendChild(progressBar)})}
exportToCSV(){const csvContent=[];csvContent.push("Kategori,Judul,Tanggal,Deskripsi\n");Object.keys(CATEGORIES).forEach(category=>{const items=this.userData[category]||[];items.forEach(item=>{csvContent.push(`"${CATEGORIES[category].label}","${item.title}","${item.date.toDate().toLocaleDateString("id-ID")}","${item.description || ""}"\n`)})});const blob=new Blob(csvContent,{type:"text/csv;charset=utf-8;"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download=`backup-pengembangan-${new Date().toISOString().split("T")[0]}.csv`;link.click()}
setupLiveValidation(){document.querySelectorAll("[required]").forEach(input=>input.addEventListener("input",()=>input.style.borderColor=input.checkValidity()?"var(--border)":"var(--error)"))}
showNotification(message,type="success"){const toastContainer=document.getElementById("toast-container");const existing=toastContainer.querySelector(".notification");if(existing)existing.remove();const notification=document.createElement("div");notification.className=`notification ${type === "error" ? "error" : ""}`;notification.textContent=message;toastContainer.appendChild(notification);setTimeout(()=>notification.remove(),3000)}
handleDynamicElements(e){const target=e.target;if(target.classList.contains("btn-add"))this.handleAddItem(target.dataset.category);if(target.classList.contains("btn-edit"))this.handleEditItem(target.dataset.id,target.dataset.category);if(target.classList.contains("btn-delete"))this.handleDeleteItem(target.dataset.id,target.dataset.category);}
handleSearchInput(e){if(e.target.classList.contains("search-bar")){if(this.debounceTimer)clearTimeout(this.debounceTimer);this.debounceTimer=setTimeout(()=>{const searchTerm=e.target.value.toLowerCase();const items=e.target.closest(".data-card").querySelectorAll(".item-list li");items.forEach(item=>item.style.display=item.querySelector("h3").textContent.toLowerCase().includes(searchTerm)?"flex":"none")},300)}}
updateCharacterCount(){const charCount=this.dom.deskripsiInput.value.length;this.dom.deskripsiInput.closest(".input-group").querySelector(".char-count").textContent=`${charCount}/500`}
handleAddItem(category){this.dom.kategoriSelect.value=category;document.querySelector("#form-section").scrollIntoView({behavior:"smooth"});this.handleNextStep()}
async handleEditItem(itemId,category){const item=this.userData[category]?.find(i=>i.id===itemId);if(!item)return;const editFormHTML=`
      <div class="input-group">
        <label for="edit-title">Judul</label>
        <input id="edit-title" value="${item.title}" required>
      </div>
      <div class="input-group">
        <label for="edit-date">Tanggal</label>
        <input type="date" id="edit-date" value="${item.date.toDate().toISOString().split("T")[0]}" required>
      </div>
      <div class="input-group">
        <label for="edit-desc">Deskripsi</label>
        <textarea id="edit-desc">${item.description || ""}</textarea>
      </div>
      <input type="hidden" id="edit-item-id" value="${itemId}">
      <input type="hidden" id="edit-category" value="${category}">
      <div class="button-group">
        <button type="button" class="btn-cancel">Batal</button>
        <button type="submit" class="btn-submit">Simpan Perubahan</button>
      </div>
    `;this.toggleModal(editFormHTML);if(this.editFormSubmitHandler)this.dom.editForm.removeEventListener("submit",this.editFormSubmitHandler);this.dom.editForm.querySelector(".btn-cancel").addEventListener("click",()=>this.toggleModal());this.editFormSubmitHandler=e=>this.handleUpdateItem(e);this.dom.editForm.addEventListener("submit",this.editFormSubmitHandler)}
async handleDeleteItem(itemId,category){if(!confirm("Apakah Anda yakin ingin menghapus item ini?"))return;try{const userRef=doc(db,"users",auth.currentUser.uid);const filteredItems=this.userData[category].filter(item=>item.id!==itemId);await updateDoc(userRef,{[category]:filteredItems});this.showNotification("Item berhasil dihapus","success");const listElement=document.querySelector(`#${category}-section .item-list`);const emptyState=document.querySelector(`#${category}-section .empty-state`);this.renderItems(listElement,emptyState,filteredItems,category)}catch(error){this.showNotification(`Gagal menghapus: ${error.message}`,"error")}}
async saveToFirebase(uid,data){const userRef=doc(db,"users",uid);const userSnap=await getDoc(userRef);const category=data.category;const updateData={[category]:userSnap.exists()?[...(userSnap.data()[category]||[]),data]:[data]};await setDoc(userRef,updateData,{merge:!0})}
async loadUserData(uid){try{this.showSkeletonLoading();const userRef=doc(db,"users",uid);const userSnap=await getDoc(userRef);await new Promise(resolve=>setTimeout(resolve,500));this.userData=userSnap.exists()?userSnap.data():{};this.renderDataSections();this.renderChart();this.renderTargetProgress()}catch(error){this.showNotification(`Gagal memuat data: ${error.message}`,"error")}finally{setTimeout(()=>this.hideSkeletonLoading(),500)}}
resetForm(){this.currentStep=0;this.updateWizard();this.dom.formWizard.querySelector("form").reset();this.setDefaultDate();this.updateCharacterCount()}
setDefaultDate(){const now=new Date();const year=now.getFullYear();const month=String(now.getMonth()+1).padStart(2,'0');const day=String(now.getDate()).padStart(2,'0');this.dom.tanggalInput.value=`${year}-${month}-${day}`}
populateKategoriOptions(){const select=this.dom.kategoriSelect;select.innerHTML='<option value="">Pilih Kategori...</option>';Object.entries(CATEGORIES).forEach(([value,category])=>{const option=document.createElement("option");option.value=value;option.textContent=`${category.icon} ${category.label}`;select.appendChild(option)})}
showSection(sectionId){document.querySelectorAll("section").forEach(section=>section.classList.remove("active"));document.querySelector(sectionId).classList.add("active");document.querySelectorAll(".desktop-tabs a").forEach(tab=>tab.classList.toggle("active",tab.getAttribute("href")===sectionId))}
updateWizard(){const progress=((this.currentStep+1)/this.dom.wizardPanels.length)*100;this.dom.formWizard.querySelector(".progress-bar").style.width=`${progress}%`;this.dom.wizardPanels.forEach((panel,index)=>panel.classList.toggle("active",index===this.currentStep));if(this.currentStep===2)this.updatePreview();const currentPanel=this.dom.wizardPanels[this.currentStep];const firstInput=currentPanel.querySelector("input, select, textarea");if(firstInput)firstInput.focus();}
showLoading(){const button=this.dom.formWizard.querySelector(".btn-submit");button.innerHTML=`<div class="loading-spinner"></div>`;button.disabled=!0}
hideLoading(){const button=this.dom.formWizard.querySelector(".btn-submit");button.innerHTML="💾 Simpan";button.disabled=!1}
updatePreview(){const previewContent=this.dom.formWizard.querySelector(".preview-content");previewContent.innerHTML=`
      <p><strong>Kategori:</strong> ${CATEGORIES[this.dom.kategoriSelect.value].label}</p>
      <p><strong>Judul:</strong> ${this.dom.itemInput.value}</p>
      <p><strong>Tanggal:</strong> ${new Date(this.dom.tanggalInput.value).toLocaleDateString("id-ID")}</p>
      ${this.dom.deskripsiInput.value ? `<p><strong>Deskripsi:</strong>${this.dom.deskripsiInput.value}</p>` : ""}
    `}
async handleUpdateItem(e){e.preventDefault();const user=auth.currentUser;if(!user)return;try{const editDate=new Date(document.getElementById("edit-date").value);if(editDate>new Date()){this.showNotification("Tanggal tidak boleh di masa depan","error");return}
const updates={title:document.getElementById("edit-title").value,date:Timestamp.fromDate(editDate),description:document.getElementById("edit-desc").value,updatedAt:Timestamp.now()};const category=document.getElementById("edit-category").value;const itemId=document.getElementById("edit-item-id").value;const updatedItems=this.userData[category].map(item=>item.id===itemId?{...item,...updates}:item);await updateDoc(this.userRef,{[category]:updatedItems});const listElement=document.querySelector(`#${category}-section .item-list`);const emptyState=document.querySelector(`#${category}-section .empty-state`);this.renderItems(listElement,emptyState,updatedItems,category);this.toggleModal();this.showNotification("Perubahan berhasil disimpan!","success")}catch(error){const category=document.getElementById("edit-category").value;const listElement=document.querySelector(`#${category}-section .item-list`);const emptyState=document.querySelector(`#${category}-section .empty-state`);this.renderItems(listElement,emptyState,this.userData[category],category);this.showNotification(`Gagal menyimpan perubahan: ${error.message}`,"error")}}
async setupRealtimeListener(){this.showSkeletonLoading();onSnapshot(this.userRef,doc=>{if(doc.exists()){const newData=doc.data();let hasChanges=!1;Object.entries(newData).forEach(([key,value])=>{if(CATEGORIES[key]||key==="targets"){const currentValue=JSON.stringify(this.userData[key]);const newValue=JSON.stringify(value);if(currentValue!==newValue){this.userData[key]=value;hasChanges=!0}}});if(hasChanges){this.renderDataSections();this.renderChart();this.renderTargetProgress();this.hideSkeletonLoading()}
if(this.dom.globalSearch.value)this.handleGlobalSearch({target:this.dom.globalSearch})}})}
generateId(){return Date.now().toString(36)+Math.random().toString(36).substr(2,5)}
toggleModal(content){this.dom.modal.style.display=this.dom.modal.style.display==="flex"?"none":"flex";if(content)this.dom.editForm.innerHTML=content;else this.dom.editForm.innerHTML=""}
showSkeletonLoading(){document.querySelectorAll(".item-list, .chart-bars, .target-list").forEach(container=>{container.innerHTML=Array(3).fill().map(()=>`
        <div class="skeleton ${container.classList.contains("item-list") ? "skeleton-item" : "skeleton-chart-bar"}"></div>
      `).join("")})}
hideSkeletonLoading(){this.renderDataSections();this.renderChart();this.renderTargetProgress()}}
const developmentManager=new DevelopmentManager()