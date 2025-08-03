// 📜 Wisdom Vault 2.0 – Mini-Notion familiar
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('service-worker.js');
  });
}
function saveEntry() {
  const text = document.getElementById('memory').value.trim();
  const tag  = document.getElementById('tag').value;
  if (!text) return alert('Por favor escreve algo antes de guardar.');
  const date   = new Date().toLocaleString();
  const entry  = { text, tag, date };
  const vault  = JSON.parse(localStorage.getItem('wisdomVault') || '[]');
  vault.push(entry);
  localStorage.setItem('wisdomVault', JSON.stringify(vault));
  alert('✅ Conteúdo guardado');
  document.getElementById('memory').value = '';
  document.getElementById('tag').value    = '';
  showEntries();
}
function showEntries() {
  const vault = JSON.parse(localStorage.getItem('wisdomVault') || '[]');
  const box   = document.getElementById('entries');
  box.innerHTML = '';
  vault.reverse().forEach((e, idx) => {
    const wrap   = document.createElement('div');
    wrap.className = 'entry';
    const check  = document.createElement('input');
    check.type   = 'checkbox';
    check.className = 'export-check';
    check.dataset.index = vault.length - 1 - idx;
    const label  = document.createElement('label');
    label.textContent = `[${e.date}] (${e.tag || 'Sem etiqueta'})\n${e.text}`;
    const btnBox = document.createElement('div');
    btnBox.className = 'buttons';
    const refine = document.createElement('button');
    refine.textContent = 'Refinar com AI';
    refine.onclick = () => refineEntry(e.text, wrap);
    const del = document.createElement('button');
    del.textContent = 'Eliminar';
    del.onclick = () => deleteEntry(vault.length - 1 - idx);
    btnBox.appendChild(refine);
    btnBox.appendChild(del);
    wrap.appendChild(check);
    wrap.appendChild(label);
    wrap.appendChild(btnBox);
    box.appendChild(wrap);
  });
}
function deleteEntry(i){
  const vault = JSON.parse(localStorage.getItem('wisdomVault') || '[]');
  vault.splice(i,1);
  localStorage.setItem('wisdomVault', JSON.stringify(vault));
  showEntries();
}
async function refineEntry(text, container){
  if(!navigator.onLine){
    alert('🔌 AI indisponível (offline)');
    return;
  }
  const apiKey = 'YOUR_API_KEY_HERE';
  try{
    const res = await fetch('https://api.openai.com/v1/chat/completions',{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
      body:JSON.stringify({model:'gpt-4',messages:[
        {role:'system',content:'Melhora este conteúdo para torná-lo claro, conciso, útil e inspirador para uso familiar duradouro.'},
        {role:'user',content:text}]})
    });
    const data = await res.json();
    const refined = document.createElement('div');
    refined.className = 'refined';
    refined.textContent = '🧠 Conteúdo refinado: ' + (data.choices?.[0]?.message?.content || 'Erro ao gerar resposta');
    container.appendChild(refined);
  }catch(err){alert('Erro na chamada à API.');}
}
function pdfFrom(entries, filename){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({orientation:'p'});
  let y=10;
  entries.forEach((e,i)=>{
    const text = `#${i+1}\n[${e.date}] (${e.tag||'Sem etiqueta'})\n${e.text}\n`;
    doc.text(text,10,y); y+=30;
    if(y>270){doc.addPage();y=10;}
  });
  doc.save(filename);
}
function exportAllToPDF(){
  const vault = JSON.parse(localStorage.getItem('wisdomVault') || '[]');
  if(!vault.length) return alert('Nada para exportar.');
  pdfFrom(vault,'cofre-de-conteudo.pdf');
}
function exportSelectedToPDF(){
  const picks = [...document.querySelectorAll('.export-check:checked')];
  if(!picks.length) return alert('Selecione pelo menos um conteúdo.');
  const vault = JSON.parse(localStorage.getItem('wisdomVault') || '[]');
  const sel = picks.map(cb=>vault[cb.dataset.index]);
  pdfFrom(sel,'conteudos-selecionados.pdf');
}
showEntries();
