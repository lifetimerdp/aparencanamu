import{auth,db,doc,collection,getDoc,getDocs,query,where}from"/js/firebaseConfig.js";const buildPathReference=e=>{const n=e.split("/").filter(e=>e);let t=db;for(let e=0;e<n.length;e++)t=e%2===0?collection(t,n[e]):doc(t,n[e]);return t},getNestedValue=(e,t)=>t.split(".").reduce((e,t)=>e?.[t],e)||"-",handleMagicTable=async e=>{let t;try{if(t={namaTabel:e.dataset.namaTabel,path:e.dataset.path?.replace("{userId}",auth.currentUser?.uid||""),kolom:JSON.parse(e.dataset.kolom||"{}"),filter:e.dataset.filter?.split(",")||[]},!auth.currentUser)throw new Error("Pengguna belum login");if(!t.path)throw new Error("Parameter path wajib diisi");const s=buildPathReference(t.path),r=s.path.split("/").length%2!==0;let n=[];if(r){let e=collection(s);t.filter.length===2&&(e=query(e,where(t.filter[0],"==",t.filter[1])));const o=await getDocs(e);n=o.docs.map(e=>({_id:e.id,...e.data()}))}else{const e=await getDoc(s);if(!e.exists())throw new Error("Dokumen tidak ditemukan");n=[e.data()]}if(!n.length)throw new Error("Tidak ada data yang ditemukan");const c=Object.keys(t.kolom),l=Object.values(t.kolom),o=e.querySelector(".header-tabel");o&&(o.innerHTML=c.map(e=>`<th>${e}</th>`).join(""));const i=e.querySelector(".body-tabel");i&&(i.innerHTML=n.map(e=>`
          <tr>
            ${l.map(t=>`
              <td>${getNestedValue(e,t)}</td>
            `).join("")}
          </tr>
        `).join(""));const a=e.querySelector(".loading");a&&a.remove()}catch(n){console.error("MagicTable Error:",n);const s=e.querySelector(".pesan-error");s&&(s.innerHTML=`
        <div class="error-message">
          <strong>Error pada ${t?.namaTabel||"Tabel"}:</strong><br>
          ${n.message}<br>
          <small>Path: ${t?.path||"tidak valid"}</small>
        </div>
      `);const o=e.querySelector(".loading");o&&o.remove()}};document.addEventListener("DOMContentLoaded",()=>{auth.onAuthStateChanged(e=>{document.querySelectorAll(".magic-table-container").forEach(t=>{e?handleMagicTable(t):t.innerHTML='<div class="error">Silakan login untuk melihat tabel</div>'})})})