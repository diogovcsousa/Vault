/* VAULT 2.2 – Notion-style with sidebar & pages */
if ('serviceWorker' in navigator){
  window.addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js'));
}

/* ---------- Sidebar toggle ---------- */
const sidebar   = document.getElementById('sidebar');
document.getElementById('openSidebar').onclick = ()=>sidebar.classList.add('open');
document.getElementById('sidebarClose').onclick = ()=>sidebar.classList.remove('open');
sidebar.addEventListener('click',e=>{if(e.target===sidebar) sidebar.classList.remove('open');});

/* ---------- Page system ---------- */
let pages = JSON.parse(localStorage.getItem('vaultPages')||'[{"id":0,"emoji":"📂","title":"Página Inicial","parent":null}]');
let currentPage = 0; // id

function renderPages(){
  const nav=document.getElementById('pageList');nav.innerHTML='';
  pages.forEach(p=>{ if(p.parent===null) nav.appendChild(makePageItem(p,0)); });
}
function makePageItem(p,depth){
  const div=document.createElement('div');div.className='pageItem'+(depth?` child`:'');
  div.dataset.id=p.id;
  div.innerHTML=`${p.emoji||'📄'}<span>${p.title}</span>`;
  div.onclick=()=>{currentPage=p.id;sidebar.classList.remove('open');showEntries();};
  // render children
  pages.filter(ch=>ch.parent===p.id).forEach(ch=>div.after(makePageItem(ch,depth+1)));
  return div;
}
document.getElementById('addPage').onclick=()=>{
  const title=prompt('Nome da nova página:'); if(!title) return;
  const emoji=prompt('Emoji desta página (ex. 📌):','📄')||'📄';
  const id=Date.now();
  pages.push({id,emoji,title,parent:null});
  localStorage.setItem('vaultPages',JSON.stringify(pages));
  renderPages();
};

/* ---------- Conteúdo ---------- */
function saveEntry(){
  const text=document.getElementById('memory').value.trim();
  const tag =document.getElementById('tag').value;
  if(!text)return alert('Escreve algo primeiro.');
  const vaultKey='vault_'+currentPage;
  const list=JSON.parse(localStorage.getItem(vaultKey)||'[]');
  list.push({text,tag,date:new Date().toLocaleString()});
  localStorage.setItem(vaultKey,JSON.stringify(list));
  document.getElementById('memory').value='';
  document.getElementById('tag').value='';
  showEntries();
}
function showEntries(){
  const vaultKey='vault_'+currentPage;
  const list=JSON.parse(localStorage.getItem(vaultKey)||'[]');
  const box=document.getElementById('entries'); box.innerHTML='';
  list.reverse().forEach((e,i)=>{
    const wrap=document.createElement('div');wrap.className='entry';
    const chk=document.createElement('input');chk.type='checkbox';chk.className='export-check';chk.dataset.index=list.length-1-i;
    const label=document.createElement('label');label.textContent=`[${e.date}] (${e.tag||'Sem etiqueta'})\n${e.text}`;
    const del=document.createElement('button');del.textContent='Excluir';del.onclick=()=>{list.splice(list.length-1-i,1);localStorage.setItem(vaultKey,JSON.stringify(list));showEntries();};
    const btnBox=document.createElement('div');btnBox.className='buttons';btnBox.appendChild(del);
    wrap.append(chk,label,btnBox);box.appendChild(wrap);
  });
}

/* ---------- Export PDF ---------- */
function pdfFrom(arr,name){
  const{jsPDF}=window.jspdf;const doc=new jsPDF();let y=10;
  arr.forEach((e,i)=>{doc.text(`#${i+1}\n[${e.date}] (${e.tag||'Sem etiqueta'})\n${e.text}\n`,10,y);y+=30;if(y>270){doc.addPage();y=10;}});
  doc.save(name);
}
function exportAllToPDF(){
  const key='vault_'+currentPage;const list=JSON.parse(localStorage.getItem(key)||'[]');
  if(!list.length)return alert('Nada para exportar.');pdfFrom(list,'vault-todos.pdf');
}
function exportSelectedToPDF(){
  const picks=[...document.querySelectorAll('.export-check:checked')];
  if(!picks.length)return alert('Seleciona algo.');
  const key='vault_'+currentPage;const all=JSON.parse(localStorage.getItem(key)||'[]');
  pdfFrom(picks.map(cb=>all[cb.dataset.index]),'vault-selecionados.pdf');
}

/* ---------- Init ---------- */
renderPages();showEntries();

/* ---------- AI Placeholder ---------- */
document.getElementById('aiBtn').onclick=()=>alert('Funcionalidades AI virão em breve! 😉');
