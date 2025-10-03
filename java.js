/* Simple SPA + fake persistence in localStorage
   - users: stored in localStorage.users (array)
   - currentUser: localStorage.currentUser (object)
   - posts, companies, jobs, messages, notifications are initialized with sample data
*/

const qs = sel => document.querySelector(sel);
const qsa = sel => document.querySelectorAll(sel);

// pages
const landing = qs('#landing');
const auth = qs('#auth');
const app = qs('#app');

// auth elements
const startBtn = qs('#startBtn');
const gotoLogin = qs('#gotoLogin');
const tabLogin = qs('#tabLogin');
const tabRegister = qs('#tabRegister');
const loginForm = qs('#loginForm');
const registerForm = qs('#registerForm');
const regType = qs('#regType');
const extraLabel = qs('#extraLabel');

// app elements
const pageTitle = qs('#pageTitle');
const pageSub = qs('#pageSub');
const xpFill = qs('#xpFill');
const myAvatar = qs('#myAvatar');

const postsNode = qs('#posts');
const companyList = qs('#companyList');
const jobsList = qs('#jobsList');
const conversations = qs('#conversations');
const notificationList = qs('#notificationList');

const navBtns = qsa('.nav-btn');

// storage helpers
const storage = {
  get(k){ try{ return JSON.parse(localStorage.getItem(k)); }catch(e){return null} },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
};

// initialize sample data if not present
if(!storage.get('users')){
  const sampleUsers = [
    {id:1, username:'maria', name:'Maria Santos', type:'professional', email:'maria@ex.com', pass:'123', role:'UX Designer', xp:1250, about:'UX designer apaixonada por experiência do usuário.'},
    {id:2, username:'techx', name:'TechCorp Solutions', type:'company', email:'hr@techx.com', pass:'123', role:'Tecnologia', xp:0, about:'Empresa de soluções tecnológicas.'},
    {id:3, username:'carlos', name:'Carlos Oliveira', type:'professional', email:'carlos@ex.com', pass:'123', role:'Desenvolvedor React', xp:980, about:'Dev React apaixonado por performance.'}
  ];
  storage.set('users', sampleUsers);
}

if(!storage.get('posts')){
  const posts = [
    {id:1, userId:1, name:'Maria Santos', role:'UX Designer', time:'2h', text:'Acabei de finalizar meu projeto de redesign completo! #UXDesign', img:null, likes:24, comments:2},
    {id:2, userId:3, name:'Carlos Oliveira', role:'Desenvolvedor React', time:'4h', text:'Dica rápida: sempre validem os formulários no frontend e backend! #Segurança', img:null, likes:15, comments:3}
  ];
  storage.set('posts', posts);
}

if(!storage.get('companies')){
  const companies = [
    {id:1, name:'TechCorp Solutions', sector:'Tecnologia', city:'São Paulo, SP', size:'500-1000', about:'Empresa líder em soluções tecnológicas.'},
    {id:2, name:'Design Studio Creative', sector:'Design e Marketing', city:'Rio de Janeiro, RJ', size:'50-100', about:'Agência especializada em branding.'},
    {id:3, name:'StartupLab', sector:'Inovação', city:'Belo Horizonte, MG', size:'10-50', about:'Aceleradora de startups.'}
  ];
  storage.set('companies', companies);
}

if(!storage.get('jobs')){
  const jobs = [
    {id:1, title:'Desenvolvedor React Jr', company:'TechCorp Solutions', city:'São Paulo, SP', type:'CLT', salary:'R$ 3.500 - R$ 5.000', tags:['React','JavaScript','TypeScript'], time:'2 dias'},
    {id:2, title:'UX Designer', company:'Design Studio Creative', city:'Remoto', type:'PJ', salary:'R$ 4.000 - R$ 6.500', tags:['UX','Design'], time:'1 dia'}
  ];
  storage.set('jobs', jobs);
}

if(!storage.get('conversations')){
  storage.set('conversations', [
    {id:1, with:'Maria Santos', last:'Obrigada pelas dicas de React!', time:'14:30', unread:2, messages:[{from:'Maria',text:'Boa! helpers',time:'14:28'}]},
    {id:2, with:'Carlos Oliveira', last:'Vamos marcar aquele café?', time:'12:15', unread:0, messages:[]}
  ]);
}

if(!storage.get('notifications')){
  storage.set('notifications', [
    {id:1, title:'Maria Santos curtiu seu projeto', subtitle:'E-commerce React recebeu uma nova curtida', time:'2 min atrás', read:false},
    {id:2, title:'Carlos Oliveira quer se conectar', subtitle:'Desenvolvedor React na TechCorp', time:'1 hora atrás', read:false},
    {id:3, title:'Nova vaga compatível com seu perfil', subtitle:'Frontend Jr na StartupLab', time:'3 horas atrás', read:false}
  ]);
}

// current session
let currentUser = storage.get('currentUser') || null;
if(currentUser){
  // if logged in, show app
  showApp();
} else {
  showLanding();
}

/* ---------- UI helpers ---------- */
function showLanding(){ landing.classList.add('active'); auth.classList.remove('active'); app.classList.remove('active'); }
function showAuth(){ landing.classList.remove('active'); auth.classList.add('active'); app.classList.remove('active'); }
function showApp(){ landing.classList.remove('active'); auth.classList.remove('active'); app.classList.add('active'); initApp(); }
function switchView(viewId, title, subtitle){
  qsa('.view').forEach(v=>v.classList.add('hidden'));
  qs('#'+viewId).classList.remove('hidden');
  pageTitle.textContent = title || 'Nexus';
  pageSub.textContent = subtitle || '';
  // nav active
  qsa('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.view === viewId));
}

/* ---------- Landing / Auth ---------- */
startBtn.onclick = () => showAuth();
gotoLogin.onclick = () => showAuth();
qs('#backToLanding').onclick = () => showLanding();

tabLogin.onclick = () => { tabLogin.classList.add('active'); tabRegister.classList.remove('active'); loginForm.classList.remove('hidden'); registerForm.classList.add('hidden'); }
tabRegister.onclick = () => { tabRegister.classList.add('active'); tabLogin.classList.remove('active'); registerForm.classList.remove('hidden'); loginForm.classList.add('hidden'); }

regType.onchange = () => {
  const t = regType.value;
  if(t === 'company'){ extraLabel.textContent = 'CNPJ / Setor'; qs('#regExtra').placeholder = 'Ex: Tecnologia, CNPJ...'; }
  else { extraLabel.textContent = 'Área de atuação'; qs('#regExtra').placeholder = 'Ex: Frontend, UX...'; }
};

registerForm.onsubmit = (e) => {
  e.preventDefault();
  const users = storage.get('users') || [];
  const username = qs('#regName').value.trim().toLowerCase().split(' ').join('') + Math.floor(Math.random()*90+10);
  const newUser = {
    id: Date.now(),
    username,
    name: qs('#regName').value.trim(),
    type: regType.value,
    email: qs('#regEmail').value.trim(),
    pass: qs('#regPass').value,
    role: qs('#regExtra').value || (regType.value === 'company' ? 'Empresa' : 'Profissional'),
    xp: 0,
    about: ''
  };
  users.push(newUser);
  storage.set('users', users);
  storage.set('currentUser', newUser);
  currentUser = newUser;
  alert('Conta criada! Você foi logado automaticamente.');
  showApp();
};

loginForm.onsubmit = (e) => {
  e.preventDefault();
  const users = storage.get('users') || [];
  const ident = qs('#loginUser').value.trim();
  const pass = qs('#loginPass').value;
  const found = users.find(u => (u.email === ident || u.username === ident || u.name === ident) && u.pass === pass);
  if(found){
    storage.set('currentUser', found);
    currentUser = found;
    showApp();
  } else {
    alert('Usuário ou senha inválidos (use: maria/123 / carlos/123 / techx/123 para testar).');
  }
};

qs('#cancelRegister').onclick = () => { tabLogin.click(); };

/* ---------- App init ---------- */
function initApp(){
  // update small UI pieces
  const u = currentUser;
  if(!u) return;
  qs('#profileName').textContent = u.name || u.username;
  qs('#profileRole').textContent = u.role || (u.type === 'company' ? 'Empresa' : 'Profissional');
  qs('#profileAbout').textContent = u.about || 'Sem descrição.';
  qs('#myAvatar').textContent = (u.name ? u.name[0].toUpperCase() : (u.username||'U')[0].toUpperCase());
  qs('#profileAvatar').textContent = (u.name ? u.name[0].toUpperCase() : (u.username||'U')[0].toUpperCase());
  qs('#profileXP').textContent = (u.xp || 0) + ' pts';
  const pct = Math.min(100, Math.floor((u.xp||0) / 30)); // fake
  qs('#profileProgress').style.width = pct + '%';
  xpFill.style.width = pct + '%';

  // render lists
  renderPosts();
  renderCompanies();
  renderJobs();
  renderConversations();
  renderNotifications();
  renderStats();

  // nav handlers
  qsa('.nav-btn').forEach(btn => {
    btn.onclick = () => {
      const view = btn.dataset.view;
      let title = 'Nexus', subtitle = '';
      if(view === 'viewFeed'){ title='Feed'; subtitle='Descubra projetos incríveis' }
      if(view === 'viewCompanies'){ title='Empresas'; subtitle='Encontre empresas para se conectar' }
      if(view === 'viewJobs'){ title='Oportunidades'; subtitle='Vagas e estágios' }
      if(view === 'viewMessages'){ title='Mensagens'; subtitle='Converse com sua rede' }
      if(view === 'viewNotifications'){ title='Notificações'; subtitle='Atividades recentes' }
      if(view === 'viewProfile'){ title='Perfil'; subtitle='' }
      switchView(view, title, subtitle);
      window.scrollTo(0,0);
    };
  });

  // post creation
  qs('#postBtn').onclick = () => {
    const text = qs('#postInput').value.trim();
    if(!text) return alert('Escreva algo para publicar.');
    const posts = storage.get('posts') || [];
    const newPost = { id:Date.now(), userId: currentUser.id, name: currentUser.name, role: currentUser.role, time: 'agora', text, img:null, likes:0, comments:0 };
    posts.unshift(newPost);
    storage.set('posts', posts);
    qs('#postInput').value = '';
    renderPosts();
    alert('Post publicado!');
  };

  // create button
  qs('#createBtn').onclick = () => {
    const txt = prompt('Criar novo post (simulação):');
    if(txt) {
      const posts = storage.get('posts') || [];
      posts.unshift({id:Date.now(), userId: currentUser.id, name: currentUser.name, role: currentUser.role, time:'agora', text:txt, img:null, likes:0, comments:0});
      storage.set('posts', posts);
      renderPosts();
    }
  };
}

/* ---------- Render functions ---------- */
function renderPosts(){
  const posts = storage.get('posts') || [];
  postsNode.innerHTML = '';
  posts.forEach(post => {
    const el = document.createElement('article');
    el.className = 'post card';
    el.innerHTML = `
      <div class="post-head">
        <div class="avatar">${(post.name||'U')[0].toUpperCase()}</div>
        <div style="flex:1">
          <h4>${post.name}</h4>
          <small style="color:var(--muted)">${post.role} • ${post.time}</small>
        </div>
        <div style="opacity:0.6">...</div>
      </div>
      <p>${escapeHtml(post.text)}</p>
      ${post.img ? `<img src="${post.img}" alt="post image">` : ''}
      <div class="actions">
        <button class="action-btn" onclick="likePost(${post.id}, this)"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M12 21s-7-4.35-9.5-7.7C-0.5 9.2 3.5 3 8 5c1.8.8 3.5 3 4 3 0.5 0 2.2-2.2 4-3 4.5-2 8.5 4.2 5.5 8.3C19 16.65 12 21 12 21z"/></svg> <span>${post.likes}</span></button>
        <button class="action-btn" onclick="commentPost(${post.id})"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> <span>${post.comments}</span></button>
        <div style="flex:1"></div>
        <button class="action-btn" onclick="sharePost(${post.id})"><svg width="18" height="18" viewBox="0 0 24 24"><path d="M4 12v7h7l-3-3 11-11-3-3L8 13 4 9z"/></svg></button>
      </div>
    `;
    postsNode.appendChild(el);
  });
}

function renderCompanies(){
  const companies = storage.get('companies') || [];
  companyList.innerHTML = '';
  companies.forEach(c => {
    const el = document.createElement('div');
    el.className = 'company-card';
    el.innerHTML = `
      <div style="display:flex;gap:12px;align-items:center">
        <div class="avatar">${(c.name||'E')[0]}</div>
        <div>
          <h4>${c.name}</h4>
          <div class="company-meta">${c.sector}</div>
          <div class="company-meta">${c.city} • ${c.size}</div>
        </div>
      </div>
      <p style="color:var(--muted);margin-top:8px">${c.about}</p>
      <div style="display:flex;justify-content:flex-end"><button class="primary" onclick='contactCompany(${c.id})'>Entrar em Contato</button></div>
    `;
    companyList.appendChild(el);
  });
}

function renderJobs(){
  const jobs = storage.get('jobs') || [];
  jobsList.innerHTML = '';
  jobs.forEach(j => {
    const el = document.createElement('div');
    el.className = 'job-card';
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div>
          <h4>${j.title}</h4>
          <div class="job-meta">${j.company} • ${j.city} • ${j.type}</div>
        </div>
        <small style="color:var(--muted)">${j.time}</small>
      </div>
      <p style="margin-top:8px;color:var(--muted)"> ${j.salary} </p>
      <p style="color:var(--muted);margin-top:6px"> ${j.company} busca ${j.title} para integrar a equipe.</p>
      <div class="job-tags">
        ${j.tags.map(t=>`<span class="tag">${t}</span>`).join('')}
      </div>
      <div style="display:flex;justify-content:center;margin-top:12px"><button class="primary" onclick='applyJob(${j.id})'>Candidatar-se</button></div>
    `;
    jobsList.appendChild(el);
  });
}

function renderConversations(){
  const conv = storage.get('conversations') || [];
  conversations.innerHTML = '';
  conv.forEach(c => {
    const el = document.createElement('div');
    el.className = 'conv-item';
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;gap:12px;align-items:center">
        <div class="avatar">${c.with[0]}</div>
        <div>
          <strong>${c.with}</strong>
          <div style="color:var(--muted);font-size:13px">${c.last}</div>
        </div>
      </div>
      <div style="text-align:right">
        <small style="color:var(--muted)">${c.time}</small>
        ${c.unread?`<div style="background:var(--accent);width:22px;height:22px;border-radius:50%;color:#fff;display:inline-flex;align-items:center;justify-content:center;margin-top:6px">${c.unread}</div>`:''}
      </div>
    </div>`;
    el.onclick = () => openConversation(c.id);
    conversations.appendChild(el);
  });
}

function renderNotifications(){
  const nots = storage.get('notifications') || [];
  notificationList.innerHTML = '';
  nots.forEach(n=>{
    const el = document.createElement('div');
    el.className = 'notif-item';
    el.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <strong style="color:${n.read? 'var(--muted)': 'var(--accent)'}">${n.title}</strong>
        <div style="color:var(--muted)">${n.subtitle}</div>
        <small style="color:var(--muted)">${n.time}</small>
      </div>
      <div>
        <button class="ghost" onclick="markRead(${n.id}, event)">Marcar</button>
      </div>
    </div>`;
    notificationList.appendChild(el);
  });
}

function renderStats(){
  const posts = storage.get('posts') || [];
  const likes = posts.reduce((s,p)=>s+(p.likes||0),0);
  qs('#statConnections').textContent = 127;
  qs('#statLikes').textContent = likes;
  qs('#statProjects').textContent = 12;
}

/* ---------- Actions ---------- */
function likePost(id, btn){
  const posts = storage.get('posts') || [];
  const p = posts.find(x=>x.id===id);
  if(!p) return;
  p.likes = (p.likes||0)+1;
  storage.set('posts', posts);
  // update UI count quickly
  const span = btn.querySelector('span');
  if(span) span.textContent = p.likes;
  renderStats();
}

function commentPost(id){
  const txt = prompt('Adicionar comentário (simulação)');
  if(txt){
    const posts = storage.get('posts') || [];
    const p = posts.find(x=>x.id===id);
    if(p){ p.comments = (p.comments||0)+1; storage.set('posts', posts); renderPosts(); alert('Comentário publicado (simulado).'); }
  }
}

function sharePost(id){ alert('Compartilhar (simulação)'); }

function contactCompany(id){
  const companies = storage.get('companies') || [];
  const c = companies.find(x=>x.id===id);
  if(!c) return;
  const conv = storage.get('conversations') || [];
  conv.unshift({id:Date.now(), with: c.name, last:'Olá! Iniciei contato', time:'agora', unread:0, messages:[{from:currentUser.name, text:'Olá, tenho interesse', time:'agora'}]});
  storage.set('conversations', conv);
  alert('Mensagem enviada (simulação). Verifique Mensagens.');
  renderConversations();
}

function applyJob(id){
  const jobs = storage.get('jobs') || [];
  const j = jobs.find(x=>x.id===id);
  if(!j) return;
  // create notification for user and simulate
  const nots = storage.get('notifications') || [];
  nots.unshift({id:Date.now(), title:`Você se candidatou: ${j.title}`, subtitle:j.company, time:'agora', read:false});
  storage.set('notifications', nots);
  alert('Candidatura enviada (simulação).');
  renderNotifications();
}

/* messages/notifications helpers */
function openConversation(id){
  const conv = storage.get('conversations') || [];
  const c = conv.find(x=>x.id===id);
  if(!c) return;
  const message = prompt(`Conversa com ${c.with}\n(última: ${c.last})\nEscreva mensagem:`);
  if(message){
    c.messages.push({from: currentUser.name, text:message, time: 'agora'});
    c.last = message;
    c.unread = 0;
    storage.set('conversations', conv);
    renderConversations();
    alert('Mensagem enviada (simulação).');
  }
}

function markRead(id, ev){
  ev.stopPropagation && ev.stopPropagation();
  const nots = storage.get('notifications') || [];
  const n = nots.find(x=>x.id===id);
  if(n) n.read = true;
  storage.set('notifications', nots);
  renderNotifications();
}

/* ---------- small utilities ---------- */
function escapeHtml(unsafe){
  return unsafe.replace(/[&<"'>]/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])});
}

/* expose certain functions for inline onclick usage */
window.likePost = likePost;
window.commentPost = commentPost;
window.sharePost = sharePost;
window.contactCompany = contactCompany;
window.applyJob = applyJob;
window.openConversation = openConversation;
window.markRead = markRead;

/* allow logout by long-press of profile avatar (dev helper) */
qs('#profileAvatar').addEventListener('contextmenu', e=>{
  e.preventDefault();
  if(confirm('Sair da conta?')){ localStorage.removeItem('currentUser'); location.reload(); }
});
