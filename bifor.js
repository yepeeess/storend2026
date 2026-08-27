/*
*/
(() => {
  const STORAGE_KEY = 'bifor_data_v2';
  let state = { currentUser: null, users: [], quizzes: [], timer: null, timeLeft: 15, currentQuiz: null, currentQIndex: 0, liveScore: 0, editingQuizId: null, quizPlays: {}, live: { onlineHistory: [], respondingHistory: [], feed: [], lastResponsesPerMin: 0 } };
  const defaultQuizzes = [
    { id: 'q1', title: 'Innovacion BIFOR', desc: 'Cuanto sabes de innovacion que transforma?', preguntas: [
      { pregunta: 'En que ciudad se celebra BIFOR 2026?', opciones:['Medellin','Manizales','Bogota','Cali'], correcta:1 },
      { pregunta: 'Que significa Innovacion que Transforma?', opciones:['Solo tecnologia','Cambios sostenibles con impacto real','Marketing digital','Ninguna'], correcta:1 },
      { pregunta: 'Cuantos dias dura BIFOR 2026?', opciones:['1 dia','2 dias','3 dias','5 dias'], correcta:2 },
      { pregunta: 'BIFOR apuesta por:', opciones:['Innovacion + Sostenibilidad','Solo finanzas','Entretenimiento','Deportes'], correcta:0 }
    ]},
    { id: 'q2', title: 'Sostenibilidad y Futuro', desc: 'Reto verde - responde rapido', preguntas: [
      { pregunta: 'Cual es un pilar de la sostenibilidad?', opciones:['Economia','Ambiente','Sociedad','Todas'], correcta:3 },
      { pregunta: 'Economia circular busca:', opciones:['Usar y desechar','Reutilizar y reciclar','Solo producir mas','Exportar residuos'], correcta:1 },
      { pregunta: 'Manizales es conocida como:', opciones:['Ciudad de las puertas abiertas','Eje cafetero','Ciudad de la eterna primavera','Todas son validas'], correcta:1 }
    ]},
    { id: 'q3', title: 'Cultura General BIFOR', desc: 'Preguntas rapidas estilo Kahoot', preguntas: [
      { pregunta: 'BIFOR 2026 se realiza en:', opciones:['Abril 2026','Diciembre 2026','Enero 2025','Julio 2026'], correcta:0 },
      { pregunta: 'Que color identifica a BIFOR 2026?', opciones:['Rojo','Verde lima / Negro','Azul','Rosa'], correcta:1 },
      { pregunta: 'Un minijuego Kahoot premia:', opciones:['Rapidez + acierto','Solo acierto','Solo rapidez','Azar'], correcta:0 }
    ]}
  ];
  const defaultUsers = [
    { nick:'Storend', email:'admin@storend.com', password:'admin123', cargo:'Administrador', empresa:'Storend', puntaje:0, partidas:0 },
    
  ];
  function load(){ const raw=localStorage.getItem(STORAGE_KEY); if(raw){ try{ const p=JSON.parse(raw); state.users=p.users||defaultUsers; state.quizzes=p.quizzes||defaultQuizzes; state.currentUser=p.currentUser||null; }catch{ initDefaults(); } } else initDefaults(); if(!state.quizzes.length) state.quizzes=defaultQuizzes; if(!state.users.length) state.users=defaultUsers; }
  function initDefaults(){ state.users=JSON.parse(JSON.stringify(defaultUsers)); state.quizzes=JSON.parse(JSON.stringify(defaultQuizzes)); }
  function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify({users:state.users, quizzes:state.quizzes, currentUser:state.currentUser})); }

  // ====== CREAR DOM 100% DESDE JS ======
  function buildDOM(){
    document.body.innerHTML = `
<div id="fixed-logo"><div class="logo-bifor"><span class="logo-b">BIF</span><span class="logo-o">O</span><span class="logo-r">R</span><span class="logo-year">2026</span></div><div class="logo-sub">INNOVACION QUE TRANSFORMA</div></div>
<header class="topbar">
  <div class="topbar-left"><div class="event-info"><span>15 - 17 ABRIL 2026</span><span>MANIZALES, COLOMBIA</span></div></div>
  <nav class="nav-tabs" id="navTabs">
    <button class="nav-btn active" data-view="inicio">Inicio</button>
    <button class="nav-btn" data-view="juegos">Minijuegos</button>
    <button class="nav-btn" data-view="carnet">Mi Carnet</button>
    <button class="nav-btn" data-view="ranking">Ranking</button>
    <button class="nav-btn" data-view="estadisticas">Estadisticas LIVE</button><button class="nav-btn admin-only" data-view="admin">Admin</button>
  </nav>
  <div class="topbar-right"><span id="userChip" class="user-chip hidden"></span><button id="logoutBtn" class="btn-small hidden">Salir</button></div>
</header>
<main class="main">
  <section id="view-inicio" class="view active">
    <div class="hero"><div class="hero-bg-logo"></div><div class="hero-content"><div class="hero-logo-large"><h1><span class="bif">BIF</span><span class="o">O</span><span class="r">R</span> <span class="year">2026</span></h1><p class="subtitle">INNOVACION QUE TRANSFORMA</p><p class="event-detail">15 - 17 ABRIL 2026 | MANIZALES, COLOMBIA</p></div><h2>Bienvenido a la Experiencia BIFOR</h2><p class="hero-desc">Registrate para acceder a minijuegos interactivos, tu carnet digital y compite por el primer lugar.</p></div></div>
    <div class="cards-grid">
      <div class="card form-card" id="registroCard"><div class="card-watermark">BIFOR</div><h3>Registro de Participante</h3><p class="card-sub">Crea tu cuenta para ingresar</p><form id="registroForm"><div class="input-group"><label>Nombre de Jugador *</label><input type="text" id="nick" placeholder="Ej: Innovador2026" required maxlength="16"><small>Este sera tu nombre visible en juegos y ranking</small></div><div class="input-group"><label>Correo Electronico *</label><input type="email" id="email" placeholder="tu@empresa.com" required></div><div class="input-group"><label>Contrasena *</label><input type="password" id="password" placeholder="Minimo 6 caracteres" required minlength="6"></div><div class="input-group"><label>Cargo en la Empresa *</label><select id="cargo" required><option value="">Selecciona tu cargo</option><option value="Visitante">Visitante</option><option value="Expositor">Expositor</option><option value="Organizador">Organizador</option><option value="Patrocinador">Patrocinador</option><option value="Prensa">Prensa</option><option value="Estudiante">Estudiante</option><option value="Directivo">Directivo</option><option value="Administrador">Administrador</option></select></div><div class="input-group"><label>Empresa</label><input type="text" id="empresa" placeholder="Nombre de tu empresa"></div><button type="submit" class="btn-primary btn-block">Registrarme y Entrar</button><p class="form-hint">Ya tienes cuenta? <a href="#" id="showLogin">Inicia sesion aqui</a></p></form></div>
      <div class="card form-card hidden" id="loginCard"><div class="card-watermark">BIFOR</div><h3>Iniciar Sesion</h3><form id="loginForm"><div class="input-group"><label>Correo Electronico</label><input type="email" id="loginEmail" placeholder="tu@empresa.com" required></div><div class="input-group"><label>Contrasena</label><input type="password" id="loginPassword" placeholder="••••••••" required></div><button type="submit" class="btn-primary btn-block">Ingresar</button><p class="form-hint">No tienes cuenta? <a href="#" id="showRegistro">Registrate aqui</a></p><div class="demo-box"><strong>Demo rapido:</strong><br>Admin: admin@bifor.com / admin123<br>Usuario: demo@bifor.com / demo123</div></form></div>
      <div class="info-stack"><div class="mini-card highlight"><div class="mini-watermark">BIFOR</div><h4>Minijuegos Kahoot</h4><p>Responde preguntas sobre innovacion y BIFOR. Gana puntos por rapidez!</p></div><div class="mini-card"><div class="mini-watermark">2026</div><h4>Carnet Digital</h4><p>Tu acceso QR para el evento del 15-17 Abril en Manizales.</p></div><div class="mini-card"><div class="mini-watermark">BIFOR</div><h4>Ranking en Vivo</h4><p>Compite y mira tu posicion frente a todos los participantes.</p></div></div>
    </div>
  </section>
  <section id="view-juegos" class="view"><div class="section-header"><div class="section-title"><h2>Minijuegos BIFOR</h2><p>Elige un quiz. Responde rapido para mas puntos!</p></div><div class="logo-inline">BIFOR 2026</div></div><div id="juegosLista" class="juegos-grid"></div><div id="quizArea" class="hidden"><div class="quiz-header"><button id="salirQuiz" class="btn-small">Volver</button><div class="quiz-progress"><span id="quizProgressText"></span><div class="progress-bar"><div id="progressFill"></div></div></div><div class="quiz-timer" id="quizTimer">15s</div></div><div class="quiz-card"><div class="quiz-watermark">BIFOR 2026</div><h3 id="quizQuestion"></h3><div id="quizOptions" class="options-grid"></div><div id="quizFeedback" class="feedback hidden"></div></div><div class="score-live">Puntaje actual: <strong id="liveScore">0</strong></div></div><div id="quizResult" class="hidden result-card"><div class="result-watermark">BIFOR</div><h3>Quiz Completado!</h3><div class="result-score" id="resultScore"></div><p id="resultMessage"></p><button id="volverJuegos" class="btn-primary">Volver a juegos</button></div></section>
  <section id="view-carnet" class="view"><div class="section-header"><h2>Carnet Digital de Acceso</h2><div class="logo-inline">BIFOR 2026</div></div><div class="carnet-container"><div class="carnet-card" id="carnetCard"><div class="carnet-header"><div class="carnet-logo"><span class="bif">BIF</span><span class="o">O</span><span class="r">R</span> <span class="year">2026</span><div class="sub">INNOVACION QUE TRANSFORMA</div></div><div class="carnet-badge">ACCESO OFICIAL</div></div><div class="carnet-body"><div class="carnet-avatar" id="carnetAvatar">?</div><div class="carnet-info"><h3 id="carnetNombre">-</h3><p id="carnetCargo" class="carnet-cargo">-</p><p id="carnetEmpresa" class="carnet-empresa">-</p><p id="carnetEmail" class="carnet-email">-</p><div class="carnet-meta"><span>15-17 ABRIL 2026</span><span>MANIZALES, COLOMBIA</span></div></div><div class="carnet-qr"><canvas id="qrCanvas" width="140" height="140"></canvas><small id="qrCode">ID: -</small></div></div><div class="carnet-footer"><span>VALIDO PARA LOS 3 DIAS DEL EVENTO</span><span class="carnet-watermark-inline">BIFOR 2026</span></div></div><div class="carnet-actions"><button class="btn-primary" onclick="window.print()">Imprimir / Guardar PDF</button><button class="btn-outline" id="descargarCarnet">Descargar imagen</button><p class="carnet-hint">Presenta este carnet en el ingreso. El codigo QR sera escaneado en puerta.</p></div></div></section>
  <section id="view-ranking" class="view"><div class="section-header"><h2>Ranking BIFOR 2026</h2><div class="logo-inline">BIFOR 2026</div></div><div class="ranking-container"><div class="podium" id="podium"></div><div class="ranking-table-wrapper"><table class="ranking-table"><thead><tr><th>#</th><th>Jugador</th><th>Cargo</th><th>Puntaje</th><th>Partidas</th></tr></thead><tbody id="rankingBody"></tbody></table></div><div class="my-position-card" id="myPositionCard"></div></div></section>
    <section id="view-estadisticas" class="view">
    <div class="section-header"><div class="section-title"><h2>Estadisticas LIVE - BIFOR 2026</h2><p>Monitor en tiempo real de la actividad del evento</p></div><div class="logo-inline">BIFOR 2026</div></div>
    <div class="live-ticker" id="liveTicker"><span class="live-dot"></span> EN VIVO <span id="tickerText">Sincronizando datos...</span></div>
    <div class="stats-grid">
      <div class="stat-card pulse"><div class="stat-icon">●</div><div class="stat-value" id="statOnline">0</div><div class="stat-label">Correos Conectados Ahora</div><div class="stat-sub"><span id="statOnlineDelta">+0</span> en los ultimos 60s</div><div class="card-watermark">LIVE</div></div>
      <div class="stat-card"><div class="stat-value" id="statTotal">0</div><div class="stat-label">Total Registrados</div><div class="stat-sub" id="statTotalSub">0 con carnet generado</div><div class="card-watermark">BIFOR</div></div>
      <div class="stat-card highlight"><div class="stat-value" id="statRespondiendo">0</div><div class="stat-label">Respondiendo Minijuegos</div><div class="stat-sub"><span class="live-dot small"></span> <span id="statRespondiendoSub">0 respuestas/min</span></div><div class="card-watermark">KAHOOT</div></div>
      <div class="stat-card"><div class="stat-value" id="statPartidas">0</div><div class="stat-label">Partidas Jugadas</div><div class="stat-sub" id="statPartidasSub">Promedio 0 pts</div><div class="card-watermark">2026</div></div>
    </div>
    <div class="stats-charts">
      <div class="card chart-card"><h3>Actividad por Minuto (ultimos 10 min)</h3><canvas id="chartActividad" width="600" height="180"></canvas><div class="chart-legend"><span class="leg online"></span> Conectados <span class="leg responding"></span> Respondiendo</div></div>
      <div class="card chart-card"><h3>Participacion por Quiz</h3><div id="chartQuizzes" class="bar-chart"></div></div>
    </div>
    <div class="stats-charts">
      <div class="card chart-card"><h3>Actividad Reciente</h3><div id="liveFeed" class="live-feed"></div></div>
      <div class="card chart-card"><h3>Distribucion por Cargo</h3><div id="chartCargos" class="bar-chart"></div></div>
    </div>
    <div class="card" style="margin-top:16px"><h3>Detalle por Correo</h3><div id="tablaActivos" style="overflow-x:auto"></div></div>
  </section>  <section id="view-admin" class="view"><div class="section-header"><h2>Panel Administrador - Preguntas</h2><div class="logo-inline">BIFOR 2026</div></div><div class="admin-grid"><div class="card"><h3 id="formTitle">Crear Nuevo Quiz</h3><form id="quizForm"><input type="hidden" id="editQuizId"><div class="input-group"><label>Titulo del Quiz</label><input type="text" id="quizTitle" placeholder="Ej: Innovacion Sostenible" required></div><div class="input-group"><label>Descripcion</label><input type="text" id="quizDesc" placeholder="Breve descripcion"></div><div id="preguntasEditor"></div><button type="button" class="btn-outline btn-small" id="addPregunta">+ Anadir Pregunta</button><div class="form-actions"><button type="submit" class="btn-primary">Guardar Quiz</button><button type="button" class="btn-outline hidden" id="cancelEdit">Cancelar</button></div></form></div><div class="card"><h3>Quizzes Existentes</h3><div id="adminQuizList"></div></div></div><div class="card" style="margin-top:20px"><h3>Usuarios Registrados</h3><div id="adminUsers"></div></div></section>
</main><div id="liveWidget" class="live-widget"><div class="lw-header"><span class="live-dot"></span> LIVE <span class="lw-logo">BIFOR</span></div><div class="lw-body"><div class="lw-row"><span class="lw-label">Conectados</span><strong id="lwOnline" class="lw-value">0</strong></div><div class="lw-row"><span class="lw-label">Jugando</span><strong id="lwPlaying" class="lw-value lime">0</strong></div><div class="lw-bar"><div id="lwBarFill" class="lw-bar-fill"></div></div><div class="lw-sub" id="lwSub">0 respuestas/min</div></div></div>
<footer class="footer"><span>BIFOR 2026 | Innovacion que Transforma | 15-17 Abril | Manizales, Colombia</span><span class="footer-logo">BIFOR 2026</span></footer>
    `;
  }

  // ====== LOGICA (igual que app.js pero encapsulada) ======
  let originalRegistroHTML=null;
  function showView(name){
    document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
    document.getElementById('view-'+name).classList.add('active');
    document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.view===name));
    if(name==='juegos') renderJuegos();
    if(name==='ranking') renderRanking();
    if(name==='carnet') renderCarnet();
    if(name==='admin') renderAdmin();
    window.scrollTo({top:0, behavior:'smooth'});
  }
  function toggleAuth(which){
    document.getElementById('registroCard').classList.toggle('hidden', which!=='registro');
    document.getElementById('loginCard').classList.toggle('hidden', which!=='login');
  }
  function updateAuthUI(){
    const chip=document.getElementById('userChip'), logout=document.getElementById('logoutBtn'), adminBtn=document.querySelector('.nav-btn[data-view="admin"]');
    const regCard=document.getElementById('registroCard');
    if(originalRegistroHTML===null) originalRegistroHTML=regCard.innerHTML;
    if(state.currentUser){
      chip.textContent=state.currentUser.nick+' - '+state.currentUser.cargo; chip.classList.remove('hidden'); logout.classList.remove('hidden');
      if(state.currentUser.cargo==='Administrador') adminBtn.style.display=''; else adminBtn.style.display='none';
      regCard.innerHTML=`<div class="card-watermark">BIFOR</div><h3>Hola, ${state.currentUser.nick}!</h3><p class="card-sub">Ya puedes acceder a los minijuegos y tu carnet.</p><div style="display:grid;gap:10px;margin-top:16px"><button class="btn-primary" onclick="BIFOR.showView('juegos')">Ir a Minijuegos</button><button class="btn-outline" onclick="BIFOR.showView('carnet')">Ver mi Carnet</button><button class="btn-outline" onclick="BIFOR.showView('ranking')">Ver Ranking</button></div>`;
      regCard.classList.remove('hidden'); document.getElementById('loginCard').classList.add('hidden');
    } else {
      chip.classList.add('hidden'); logout.classList.add('hidden'); adminBtn.style.display='none';
      regCard.innerHTML=originalRegistroHTML; bindRegistroForm();
      document.getElementById('loginCard').classList.add('hidden'); regCard.classList.remove('hidden');
    }
  }
  function bindRegistroForm(){
    const form=document.getElementById('registroForm'); if(!form) return;
    form.onsubmit=(e)=>{ e.preventDefault(); const nick=document.getElementById('nick').value.trim(); const email=document.getElementById('email').value.trim().toLowerCase(); const password=document.getElementById('password').value; const cargo=document.getElementById('cargo').value; const empresa=document.getElementById('empresa').value.trim()||'-'; if(!nick||!email||!password||!cargo) return; if(state.users.find(u=>u.email===email)){alert('Correo ya registrado');return;} if(state.users.find(u=>u.nick.toLowerCase()===nick.toLowerCase())){alert('Nombre de jugador ya existe');return;} const user={nick,email,password,cargo,empresa,puntaje:0,partidas:0,id:Date.now().toString(36)}; state.users.push(user); state.currentUser=user; save(); pushFeed(`${nick} (${email}) se registro como ${cargo}`, 'registro'); updateAuthUI(); alert('Bienvenido '+nick+'!'); showView('juegos'); };
    const sl=document.getElementById('showLogin'); if(sl) sl.onclick=(e)=>{e.preventDefault();toggleAuth('login');};
  }
  function renderJuegos(){
    const lista=document.getElementById('juegosLista'), quizArea=document.getElementById('quizArea'), result=document.getElementById('quizResult');
    quizArea.classList.add('hidden'); result.classList.add('hidden'); lista.classList.remove('hidden');
    if(!state.currentUser){ lista.innerHTML=`<div class="card" style="grid-column:1/-1;text-align:center;padding:30px"><h3>Debes registrarte primero</h3><p style="color:#888;margin:8px 0">Crea tu nombre de jugador</p><button class="btn-primary" onclick="BIFOR.showView('inicio')">Ir a Registro</button></div>`; return; }
    lista.innerHTML=state.quizzes.map(q=>`<div class="juego-card"><div class="juego-watermark">BIFOR 2026</div><h4>${q.title}</h4><p>${q.desc}</p><div class="juego-meta"><span>${q.preguntas.length} preguntas</span><span>${q.preguntas.length*15}s</span></div><button class="btn-primary" onclick="BIFOR.startQuiz('${q.id}')">Jugar Ahora</button></div>`).join('');
  }
  function startQuiz(id){ if(!state.currentUser){alert('Registrate');showView('inicio');return;} state.currentQuiz=state.quizzes.find(q=>q.id===id); state.currentQIndex=0; state.liveScore=0; document.getElementById('juegosLista').classList.add('hidden'); document.getElementById('quizResult').classList.add('hidden'); document.getElementById('quizArea').classList.remove('hidden'); document.getElementById('liveScore').textContent=0; showQuestion(); }
  function showQuestion(){
    const q=state.currentQuiz.preguntas[state.currentQIndex], total=state.currentQuiz.preguntas.length;
    document.getElementById('quizProgressText').textContent=`Pregunta ${state.currentQIndex+1} de ${total} - ${state.currentQuiz.title}`;
    document.getElementById('progressFill').style.width=`${(state.currentQIndex/total)*100}%`;
    document.getElementById('quizQuestion').textContent=q.pregunta;
    const opts=document.getElementById('quizOptions');
    opts.innerHTML=q.opciones.map((op,i)=>`<button class="option-btn" data-i="${i}"><span style="opacity:.6;margin-right:8px">${String.fromCharCode(65+i)}</span> ${op}</button>`).join('');
    document.getElementById('quizFeedback').classList.add('hidden');
    clearInterval(state.timer); state.timeLeft=15; document.getElementById('quizTimer').textContent=state.timeLeft+'s'; document.getElementById('quizTimer').style.background='';
    state.timer=setInterval(()=>{ state.timeLeft--; document.getElementById('quizTimer').textContent=state.timeLeft+'s'; if(state.timeLeft<=5) document.getElementById('quizTimer').style.background='#ff3232'; if(state.timeLeft<=0){clearInterval(state.timer); handleAnswer(-1);} },1000);
    opts.querySelectorAll('.option-btn').forEach(b=> b.addEventListener('click', ()=> handleAnswer(parseInt(b.dataset.i))));
  }
  function handleAnswer(idx){
    clearInterval(state.timer); const q=state.currentQuiz.preguntas[state.currentQIndex]; const buttons=document.querySelectorAll('.option-btn'); const fb=document.getElementById('quizFeedback'); const isTimeout=idx===-1, isCorrect=idx===q.correcta;
    buttons.forEach((b,i)=>{ b.disabled=true; if(i===q.correcta) b.classList.add('correct'); else if(i===idx && !isCorrect) b.classList.add('wrong'); });
    if(isTimeout){ fb.textContent=`Tiempo agotado! Correcta: ${q.opciones[q.correcta]}`; fb.className='feedback bad'; }
    else if(isCorrect){ const pts=100+state.timeLeft*7; state.liveScore+=pts; document.getElementById('liveScore').textContent=state.liveScore; fb.textContent=`Correcto! +${pts} pts`; fb.className='feedback ok'; }
    else { fb.textContent=`Incorrecto. Correcta: ${q.opciones[q.correcta]}`; fb.className='feedback bad'; }
    fb.classList.remove('hidden');
    setTimeout(()=>{ state.currentQIndex++; document.getElementById('progressFill').style.width=`${(state.currentQIndex/state.currentQuiz.preguntas.length)*100}%`; if(state.currentQIndex < state.currentQuiz.preguntas.length) showQuestion(); else finishQuiz(); },1400);
  }
  function finishQuiz(){
    clearInterval(state.timer); document.getElementById('quizArea').classList.add('hidden'); const res=document.getElementById('quizResult'); res.classList.remove('hidden');
    const idx=state.users.findIndex(u=>u.email===state.currentUser.email); if(idx>=0){ state.users[idx].puntaje=(state.users[idx].puntaje||0)+state.liveScore; state.users[idx].partidas=(state.users[idx].partidas||0)+1; state.currentUser=state.users[idx]; save(); }
    document.getElementById('resultScore').textContent=state.liveScore+' pts';
    const max=state.currentQuiz.preguntas.length*(100+15*7), pct=state.liveScore/max; let msg=pct>0.8?'Increible! Entre los mejores.':pct>0.5?'Muy bien! Sigue jugando.':'Sigue intentando!'; document.getElementById('resultMessage').textContent=msg+` Has jugado ${state.currentUser.partidas} partidas.`;
  }
  function renderCarnet(){
    if(!state.currentUser){ document.getElementById('carnetCard').innerHTML=`<div style="padding:30px;text-align:center"><h3>Inicia sesion para ver tu carnet</h3><button class="btn-primary" onclick="BIFOR.showView('inicio')">Ir a Registro</button></div>`; return; }
    if(!document.getElementById('carnetNombre')){
      document.getElementById('carnetCard').innerHTML=`<div class="carnet-header"><div class="carnet-logo"><span class="bif">BIF</span><span class="o">O</span><span class="r">R</span> <span class="year">2026</span><div class="sub">INNOVACION QUE TRANSFORMA</div></div><div class="carnet-badge">ACCESO OFICIAL</div></div><div class="carnet-body"><div class="carnet-avatar" id="carnetAvatar">?</div><div class="carnet-info"><h3 id="carnetNombre">-</h3><p id="carnetCargo" class="carnet-cargo">-</p><p id="carnetEmpresa" class="carnet-empresa">-</p><p id="carnetEmail" class="carnet-email">-</p><div class="carnet-meta"><span>15-17 ABRIL 2026</span><span>MANIZALES, COLOMBIA</span></div></div><div class="carnet-qr"><canvas id="qrCanvas" width="140" height="140"></canvas><small id="qrCode">ID: -</small></div></div><div class="carnet-footer"><span>VALIDO PARA LOS 3 DIAS</span><span class="carnet-watermark-inline">BIFOR 2026</span></div>`;
    }
    document.getElementById('carnetNombre').textContent=state.currentUser.nick;
    document.getElementById('carnetCargo').textContent=state.currentUser.cargo;
    document.getElementById('carnetEmpresa').textContent=state.currentUser.empresa||'-';
    document.getElementById('carnetEmail').textContent=state.currentUser.email;
    document.getElementById('carnetAvatar').textContent=state.currentUser.nick.charAt(0).toUpperCase();
    document.getElementById('qrCode').textContent='BIFOR-'+state.currentUser.nick.toUpperCase().replace(/\s/g,'')+'-'+state.currentUser.email.slice(0,3).toUpperCase()+'-2026';
    const c=document.getElementById('qrCanvas'), ctx=c.getContext('2d'); ctx.fillStyle='#fff'; ctx.fillRect(0,0,140,140); ctx.fillStyle='#000'; ctx.fillRect(6,6,32,32); ctx.fillRect(102,6,32,32); ctx.fillRect(6,102,32,32); ctx.fillStyle='#fff'; ctx.fillRect(12,12,20,20); ctx.fillRect(108,12,20,20); ctx.fillRect(12,108,20,20); ctx.fillStyle='#000'; ctx.fillRect(18,18,8,8); ctx.fillRect(114,18,8,8); ctx.fillRect(18,114,8,8); let seed=0; for(let ch of state.currentUser.nick) seed+=ch.charCodeAt(0); for(let i=0;i<180;i++){ if((seed+i*31)%3===0) ctx.fillRect(44+(i%13)*6,44+Math.floor(i/13)*6,4,4); } ctx.fillStyle='#000'; ctx.font='700 7px Montserrat'; ctx.textAlign='center'; ctx.fillText('BIFOR',70,74);
  }
  function renderRanking(){
    const sorted=[...state.users].sort((a,b)=>(b.puntaje||0)-(a.puntaje||0)), podium=document.getElementById('podium'), body=document.getElementById('rankingBody'), medals=['🥇','🥈','🥉'];
    podium.innerHTML=sorted.slice(0,3).map((u,i)=>`<div class="podium-item ${i===0?'first':i===1?'second':'third'}"><div class="podium-medal">${medals[i]}</div><div class="podium-name">${u.nick}</div><div class="podium-cargo">${u.cargo}</div><div class="podium-score">${u.puntaje||0} pts</div></div>`).join('');
    body.innerHTML=sorted.map((u,idx)=>{ const isMe=state.currentUser&&u.email===state.currentUser.email; return `<tr class="${isMe?'highlight':''}"><td><strong>${idx+1}</strong> ${idx<3?medals[idx]:''}</td><td><strong>${u.nick}</strong> ${isMe?' <- tu':''}</td><td>${u.cargo}</td><td style="color:var(--lime);font-weight:800">${u.puntaje||0}</td><td>${u.partidas||0}</td></tr>`; }).join('');
    const my=document.getElementById('myPositionCard'); if(!state.currentUser) my.innerHTML=`<a href="#" onclick="BIFOR.showView('inicio');return false" style="color:var(--lime)">Registrate</a> para ver tu posicion`; else { const pos=sorted.findIndex(u=>u.email===state.currentUser.email)+1; my.innerHTML=`Tu posicion: <strong>#${pos} de ${sorted.length}</strong> - ${state.currentUser.puntaje||0} pts - ${state.currentUser.partidas||0} partidas`; }
  }
// ====== ESTADISTICAS LIVE ======
function getLiveCounts(){
  const total = state.users.length;
  // online simulado: base = total + 3 bots, con variacion
  const lastOnline = state.live.onlineHistory[state.live.onlineHistory.length-1] || 10;
  let online = lastOnline + (Math.random()>0.5?1:-1) * Math.floor(Math.random()*2);
  // asegurar rango 1.. total+15
  const maxOnline = total + 12;
  online = Math.max(1, Math.min(maxOnline, online));
  if(state.currentUser) online = Math.max(online, 1);
  // respondiendo = subset de online que esta jugando
  const lastResp = state.live.respondingHistory[state.live.respondingHistory.length-1] || 3;
  let responding = lastResp + (Math.random()>0.6?1:-1) * (Math.random()>0.7?1:0);
  // si alguien esta en quiz activo, forzar +1
  if(state.currentQuiz && document.getElementById('quizArea') && !document.getElementById('quizArea').classList.contains('hidden')) responding = Math.max(responding, 1);
  responding = Math.max(0, Math.min(online, responding));
  responding = Math.round(responding);
  online = Math.round(online);
  return {total, online, responding};
}
function tickStats(){
  const {online, responding} = getLiveCounts();
  state.live.onlineHistory.push(online);
  state.live.respondingHistory.push(responding);
  if(state.live.onlineHistory.length>10) state.live.onlineHistory.shift();
  if(state.live.respondingHistory.length>10) state.live.respondingHistory.shift();
  // respuestas por minuto simulado
  state.live.lastResponsesPerMin = Math.round(responding * (2 + Math.random()*3));
  // ocasionalmente push feed aleatorio para dinamismo
  if(Math.random()>0.75){
    const nicks = state.users.map(u=>u.nick);
    const n = nicks[Math.floor(Math.random()*nicks.length)];
    const actions = [`${n} respondio en Innovacion BIFOR`, `${n} completo un quiz +${(Math.floor(Math.random()*200)+50)} pts`, `${n} genero su carnet digital`, `Nuevo pico: ${online} correos conectados`];
    pushFeed(actions[Math.floor(Math.random()*actions.length)], 'live');
    if(document.getElementById('view-estadisticas')?.classList.contains('active')) renderEstadisticas();
  }
  save();
  updateLiveWidget();
  // si estamos en estadisticas, refrescar numeros sin redibujar todo
  if(document.getElementById('view-estadisticas')?.classList.contains('active')){
    refreshEstadisticasNumbers();
    drawActividadChart();
  }
}
function updateLiveWidget(){
  const {online, responding} = getLiveCounts();
  const lwOnline = document.getElementById('lwOnline');
  const lwPlaying = document.getElementById('lwPlaying');
  const lwBar = document.getElementById('lwBarFill');
  const lwSub = document.getElementById('lwSub');
  if(lwOnline) lwOnline.textContent = online;
  if(lwPlaying) lwPlaying.textContent = responding;
  if(lwBar) lwBar.style.width = (online? Math.round(responding/online*100):0) + '%';
  if(lwSub) lwSub.textContent = (state.live.lastResponsesPerMin||0) + ' respuestas/min';
  // ticker text
  const ticker = document.getElementById('tickerText');
  if(ticker){
    const total = state.users.length;
    const partidas = state.users.reduce((a,u)=>a+(u.partidas||0),0);
    ticker.textContent = `${online} conectados \u2022 ${responding} jugando ahora \u2022 ${total} registrados \u2022 ${partidas} partidas totales`;
  }
}
function refreshEstadisticasNumbers(){
  const {total, online, responding} = getLiveCounts();
  const partidas = state.users.reduce((a,u)=>a+(u.partidas||0),0);
  const avg = partidas ? Math.round(state.users.reduce((a,u)=>a+(u.puntaje||0),0)/partidas) : 0;
  const delta = (online - (state.live.onlineHistory[state.live.onlineHistory.length-2]||online));
  const elOnline=document.getElementById('statOnline'); if(elOnline){ elOnline.textContent=online; elOnline.classList.remove('bump'); void elOnline.offsetWidth; elOnline.classList.add('bump');}
  const elDelta=document.getElementById('statOnlineDelta'); if(elDelta) elDelta.textContent=(delta>=0?'+'+delta:delta);
  const elTotal=document.getElementById('statTotal'); if(elTotal) elTotal.textContent=total;
  const elTotalSub=document.getElementById('statTotalSub'); if(elTotalSub) elTotalSub.textContent= total + ' con carnet generado';
  const elResp=document.getElementById('statRespondiendo'); if(elResp){ elResp.textContent=responding; elResp.classList.remove('bump'); void elResp.offsetWidth; elResp.classList.add('bump');}
  const elRespSub=document.getElementById('statRespondiendoSub'); if(elRespSub) elRespSub.textContent=(state.live.lastResponsesPerMin||0)+' respuestas/min';
  const elPart=document.getElementById('statPartidas'); if(elPart) elPart.textContent=partidas;
  const elPartSub=document.getElementById('statPartidasSub'); if(elPartSub) elPartSub.textContent='Promedio '+avg+' pts';
}
function renderEstadisticas(){
  refreshEstadisticasNumbers();
  // tabla activos
  const tabla=document.getElementById('tablaActivos');
  if(tabla){
    const sorted=[...state.users].sort((a,b)=>(b.puntaje||0)-(a.puntaje||0));
    tabla.innerHTML=`<table class="ranking-table"><thead><tr><th>Correo</th><th>Jugador</th><th>Cargo</th><th>Estado</th><th>Puntaje</th></tr></thead><tbody>
    ${sorted.map((u,i)=>{
      const isOnline = i< getLiveCounts().online; // simular primeros como online
      const isPlaying = isOnline && i < getLiveCounts().responding;
      const estado = isPlaying?'<span class="badge playing"><span class="live-dot small"></span> Jugando</span>' : isOnline?'<span class="badge online">● Conectado</span>':'<span class="badge off">Offline</span>';
      return `<tr class="${isPlaying?'highlight':''}"><td>${u.email}</td><td><strong>${u.nick}</strong></td><td>${u.cargo}</td><td>${estado}</td><td>${u.puntaje||0}</td></tr>`;
    }).join('')}
    </tbody></table>`;
  }
  // feed
  const feed=document.getElementById('liveFeed');
  if(feed){
    feed.innerHTML=state.live.feed.map(f=>`<div class="feed-item ${f.type}"><span class="feed-time">${f.time}</span><span class="feed-text">${f.text}</span></div>`).join('') || '<div class="feed-item">Sin actividad aun</div>';
  }
  // bar charts
  renderBarQuizzes();
  renderBarCargos();
  drawActividadChart();
}
function renderBarQuizzes(){
  const c=document.getElementById('chartQuizzes'); if(!c) return;
  const max = Math.max(1, ...Object.values(state.quizPlays), 1);
  c.innerHTML = state.quizzes.map(q=>{
    const count = state.quizPlays[q.id]||0;
    const pct = Math.round(count/max*100);
    const isActive = state.currentQuiz?.id===q.id && !document.getElementById('quizArea')?.classList.contains('hidden');
    return `<div class="bar-row"><span class="bar-label">${q.title}</span><div class="bar-track"><div class="bar-fill ${isActive?'active':''}" style="width:${pct}%"></div></div><span class="bar-value">${count} jug.</span></div>`;
  }).join('') + (state.quizzes.length===0?'<p style="color:#777">Sin quizzes</p>':'');
}
function renderBarCargos(){
  const c=document.getElementById('chartCargos'); if(!c) return;
  const counts={}; state.users.forEach(u=>{ counts[u.cargo]=(counts[u.cargo]||0)+1; });
  const max=Math.max(...Object.values(counts),1);
  c.innerHTML=Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([cargo, cnt])=>{
    const pct=Math.round(cnt/max*100);
    return `<div class="bar-row"><span class="bar-label">${cargo}</span><div class="bar-track"><div class="bar-fill cargo" style="width:${pct}%"></div></div><span class="bar-value">${cnt}</span></div>`;
  }).join('');
}
function drawActividadChart(){
  const canvas=document.getElementById('chartActividad'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const W=canvas.width, H=canvas.height, pad=20;
  ctx.clearRect(0,0,W,H);
  // grid
  ctx.strokeStyle='#222'; ctx.lineWidth=1;
  for(let i=0;i<=4;i++){ const y=pad + i*(H-pad*2)/4; ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke(); }
  const online=state.live.onlineHistory, resp=state.live.respondingHistory;
  const maxVal=Math.max(10, ...online, ...resp);
  function drawLine(data, color, width){
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.beginPath();
    data.forEach((v,i)=>{
      const x=pad + i*(W-pad*2)/(Math.max(1,data.length-1));
      const y=H-pad - (v/maxVal)*(H-pad*2);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();
    // puntos
    ctx.fillStyle=color;
    data.forEach((v,i)=>{
      const x=pad + i*(W-pad*2)/(Math.max(1,data.length-1));
      const y=H-pad - (v/maxVal)*(H-pad*2);
      ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
    });
  }
  drawLine(online, '#8ed152', 2.5);
  drawLine(resp, '#0fb9a0', 2.5);
  // labels
  ctx.fillStyle='#777'; ctx.font='10px Inter'; ctx.fillText('max '+maxVal, W-60, 14);
}
let statsInterval=null;
function startStatsLoop(){
  if(statsInterval) clearInterval(statsInterval);
  updateLiveWidget();
  statsInterval=setInterval(tickStats, 2000);
}


  function renderAdmin(){
    document.getElementById('adminQuizList').innerHTML=state.quizzes.map(q=>`<div class="admin-quiz-item"><div><h4>${q.title}</h4><p>${q.desc} - ${q.preguntas.length} preguntas</p></div><div class="admin-actions"><button class="btn-icon" onclick="BIFOR.editQuiz('${q.id}')">Edit</button><button class="btn-icon danger" onclick="BIFOR.deleteQuiz('${q.id}')">Del</button></div></div>`).join('');
    document.getElementById('adminUsers').innerHTML=`<div style="overflow-x:auto"><table class="ranking-table"><thead><tr><th>Nick</th><th>Email</th><th>Cargo</th><th>Pts</th><th>Accion</th></tr></thead><tbody>${state.users.map(u=>`<tr><td>${u.nick}</td><td>${u.email}</td><td>${u.cargo}</td><td>${u.puntaje||0}</td><td><button class="btn-icon danger" onclick="BIFOR.deleteUser('${u.email}')">Eliminar</button></td></tr>`).join('')}</tbody></table></div>`;
    if(!state.editingQuizId) resetQuizForm();
  }
  function resetQuizForm(){ document.getElementById('editQuizId').value=''; document.getElementById('quizTitle').value=''; document.getElementById('quizDesc').value=''; document.getElementById('preguntasEditor').innerHTML=''; document.getElementById('formTitle').textContent='Crear Nuevo Quiz'; document.getElementById('cancelEdit').classList.add('hidden'); state.editingQuizId=null; addPreguntaBlock(); }
  function addPreguntaBlock(data){
    const container=document.getElementById('preguntasEditor'), idx=container.children.length, div=document.createElement('div'); div.className='pregunta-block';
    div.innerHTML=`<h5>Pregunta ${idx+1} <button type="button" onclick="this.closest('.pregunta-block').remove()" style="float:right;background:none;border:none;color:#ff6b6b;cursor:pointer">x quitar</button></h5><input type="text" placeholder="Escribe la pregunta" class="pregunta-text" value="${data?data.pregunta:''}" required>${[0,1,2,3].map(i=>`<div class="option-row"><input type="radio" name="correcta_${idx}" value="${i}" ${data&&data.correcta===i?'checked':i===0&&!data?'checked':''} required><input type="text" placeholder="Opcion ${String.fromCharCode(65+i)}" class="opcion" value="${data?data.opciones[i]:''}" required></div>`).join('')}`;
    container.appendChild(div);
  }

  // INIT - construir y bindear
  function init(){
    buildDOM();
    load();
    // nav
    document.querySelectorAll('.nav-btn').forEach(b=> b.addEventListener('click', ()=>{ if(b.dataset.view==='admin' && (!state.currentUser || state.currentUser.cargo!=='Administrador')){ alert('Solo administradores. Usa admin@bifor.com / admin123'); return; } showView(b.dataset.view); }));
    // auth
    bindRegistroForm();
    document.getElementById('loginForm').addEventListener('submit', (e)=>{ e.preventDefault(); const email=document.getElementById('loginEmail').value.trim().toLowerCase(), pw=document.getElementById('loginPassword').value; const u=state.users.find(x=>x.email===email && x.password===pw); if(!u){alert('Correo o contrasena incorrectos');return;} state.currentUser=u; save(); updateAuthUI(); showView('juegos'); });
    document.getElementById('showRegistro').addEventListener('click', (e)=>{e.preventDefault(); toggleAuth('registro');});
    document.getElementById('logoutBtn').addEventListener('click', ()=>{ state.currentUser=null; save(); updateAuthUI(); showView('inicio'); });
    document.getElementById('salirQuiz').addEventListener('click', ()=>{ clearInterval(state.timer); renderJuegos(); });
    document.getElementById('volverJuegos').addEventListener('click', renderJuegos);
    document.getElementById('addPregunta').addEventListener('click', ()=> addPreguntaBlock());
    document.getElementById('cancelEdit').addEventListener('click', resetQuizForm);
    document.getElementById('quizForm').addEventListener('submit', (e)=>{
      e.preventDefault(); const title=document.getElementById('quizTitle').value.trim(), desc=document.getElementById('quizDesc').value.trim(), blocks=document.querySelectorAll('.pregunta-block'); if(!title){alert('Titulo requerido');return;} const preguntas=[]; for(let b of blocks){ const pregunta=b.querySelector('.pregunta-text').value.trim(); const opciones=[...b.querySelectorAll('.opcion')].map(o=>o.value.trim()); const correcta=parseInt(b.querySelector('input[type="radio"]:checked')?.value??0); if(!pregunta||opciones.some(o=>!o)){alert('Completa preguntas');return;} preguntas.push({pregunta,opciones,correcta}); } const id=document.getElementById('editQuizId').value||'q'+Date.now(); const quiz={id,title,desc,preguntas}; const ex=state.quizzes.findIndex(q=>q.id===id); if(ex>=0) state.quizzes[ex]=quiz; else state.quizzes.push(quiz); save(); renderAdmin(); alert('Quiz guardado'); resetQuizForm();
    });
    document.getElementById('descargarCarnet')?.addEventListener('click', ()=> alert('Usa Imprimir / Guardar como PDF'));
    // expose global
    window.BIFOR={ showView, startQuiz, editQuiz:(id)=>{ const q=state.quizzes.find(x=>x.id===id); if(!q) return; state.editingQuizId=id; document.getElementById('editQuizId').value=id; document.getElementById('quizTitle').value=q.title; document.getElementById('quizDesc').value=q.desc; document.getElementById('preguntasEditor').innerHTML=''; q.preguntas.forEach(p=>addPreguntaBlock(p)); document.getElementById('formTitle').textContent='Editando: '+q.title; document.getElementById('cancelEdit').classList.remove('hidden'); showView('admin'); }, deleteQuiz:(id)=>{ if(!confirm('Eliminar quiz?')) return; state.quizzes=state.quizzes.filter(q=>q.id!==id); save(); renderAdmin(); }, deleteUser:(email)=>{ if(email==='admin@bifor.com'){alert('No puedes eliminar admin');return;} if(!confirm('Eliminar '+email+'?')) return; state.users=state.users.filter(u=>u.email!==email); if(state.currentUser?.email===email) state.currentUser=null; save(); renderAdmin(); renderRanking(); } };
    window.showView=showView; window.startQuiz=startQuiz; window.editQuiz=window.BIFOR.editQuiz; window.deleteQuiz=window.BIFOR.deleteQuiz; window.deleteUser=window.BIFOR.deleteUser;
    updateAuthUI(); renderJuegos(); renderRanking(); renderCarnet();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
