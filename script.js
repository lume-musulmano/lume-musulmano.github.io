/* LUME MUSULMANO — interazioni */
document.addEventListener('DOMContentLoaded', () => {

  /* --- Preloader intro (solo home, una volta per sessione) --- */
  const pre = document.getElementById('preloader');
  if (pre && pre.style.display !== 'none') {
    try { sessionStorage.setItem('lm_intro', '1'); } catch (e) {}
    setTimeout(() => {
      pre.classList.add('pre-hide');
      document.documentElement.classList.remove('pre-lock');
      setTimeout(() => { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 650);
    }, 1650);
  } else {
    document.documentElement.classList.remove('pre-lock');
  }

  /* --- Tema chiaro/scuro --- */
  var themeBtn = document.getElementById('theme-toggle');
  function updThemeIcon() {
    var d = document.documentElement.classList.contains('dark');
    if (themeBtn) themeBtn.textContent = d ? '☀️' : '🌙';
  }
  updThemeIcon();
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var dark = document.documentElement.classList.toggle('dark');
      try { localStorage.setItem('lm_theme', dark ? 'dark' : 'light'); } catch (e) {}
      updThemeIcon();
    });
  }

  /* --- Video hero: pulsante audio --- */
  var heroV = document.querySelector('.hero-video');
  var heroM = document.getElementById('hero-mute');
  if (heroV && heroM) {
    heroM.addEventListener('click', function () {
      heroV.muted = !heroV.muted;
      heroM.textContent = heroV.muted ? '🔇' : '🔊';
      if (!heroV.muted) { heroV.play().catch(function(){}); }
    });
  }

  /* --- Menu mobile --- */
  const burger = document.querySelector('.hamburger');
  const nav = document.querySelector('nav.main');
  if (burger && nav) {
    burger.addEventListener('click', () => {
      nav.classList.toggle('aperto');
      burger.classList.toggle('attivo');
    });
    nav.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => nav.classList.remove('aperto'))
    );
  }

  /* --- FAQ accordion --- */
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const risposta = item.querySelector('.faq-a');
      const aperto = item.classList.contains('aperto');
      document.querySelectorAll('.faq-item').forEach(i => {
        i.classList.remove('aperto');
        i.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!aperto) {
        item.classList.add('aperto');
        risposta.style.maxHeight = risposta.scrollHeight + 'px';
      }
    });
  });

  /* --- Contatori animati --- */
  const contatori = document.querySelectorAll('[data-conta]');
  if (contatori.length) {
    const anima = el => {
      const finale = parseFloat(el.dataset.conta);
      const suffisso = el.dataset.suffisso || '';
      const durata = 1800; const inizio = performance.now();
      const step = ora => {
        const p = Math.min((ora - inizio) / durata, 1);
        const val = Math.floor(finale * (1 - Math.pow(1 - p, 3)));
        el.textContent = val.toLocaleString('it-IT') + suffisso;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = finale.toLocaleString('it-IT') + suffisso;
      };
      requestAnimationFrame(step);
    };
    const obs = new IntersectionObserver((entries, o) => {
      entries.forEach(e => { if (e.isIntersecting) { anima(e.target); o.unobserve(e.target); } });
    }, { threshold: .5 });
    contatori.forEach(c => obs.observe(c));
  }

  /* --- Filtri corsi --- */
  const filtri = document.querySelectorAll('.filtro-btn');
  const corsi = document.querySelectorAll('.corsi-grid [data-cat]');
  if (filtri.length && corsi.length) {
    filtri.forEach(btn => {
      btn.addEventListener('click', () => {
        filtri.forEach(b => b.classList.remove('attivo'));
        btn.classList.add('attivo');
        const cat = btn.dataset.filtro;
        corsi.forEach(c => {
          const mostra = cat === 'tutti' || c.dataset.cat === cat;
          c.style.display = mostra ? '' : 'none';
        });
      });
    });
  }

  /* --- Carosello corsi: frecce + trascinamento + auto-scroll --- */
  document.querySelectorAll('.js-carousel').forEach(wrap => {
    const track = wrap.querySelector('.car-track');
    if (!track) return;
    let offset = 0, half = 0, dragging = false, moved = false, startX = 0, startOffset = 0, hover = false;
    const measure = () => { half = track.scrollWidth / 2; };
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    const cardStep = () => { const c = track.querySelector('.photo-card'); return c ? c.offsetWidth + 22 : 322; };
    const apply = () => {
      if (half > 0) { if (offset <= -half) offset += half; if (offset > 0) offset -= half; }
      track.style.transform = 'translateX(' + offset + 'px)';
    };
    const loop = () => { if (!hover && !dragging) { offset -= 0.5; apply(); } requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    const next = wrap.querySelector('.car-next'), prev = wrap.querySelector('.car-prev');
    next && next.addEventListener('click', () => { offset -= cardStep(); apply(); });
    prev && prev.addEventListener('click', () => { offset += cardStep(); apply(); });
    wrap.addEventListener('mouseenter', () => hover = true);
    wrap.addEventListener('mouseleave', () => { hover = false; });
    const down = e => { dragging = true; moved = false; startX = (e.touches ? e.touches[0].clientX : e.clientX); startOffset = offset; track.classList.add('dragging'); };
    const move = e => { if (!dragging) return; const x = (e.touches ? e.touches[0].clientX : e.clientX); const d = x - startX; if (Math.abs(d) > 5) moved = true; offset = startOffset + d; apply(); };
    const up = () => { if (dragging) { dragging = false; track.classList.remove('dragging'); } };
    track.addEventListener('mousedown', down);
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    track.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('touchmove', move, { passive: true });
    window.addEventListener('touchend', up);
    track.querySelectorAll('a').forEach(a => a.addEventListener('click', e => { if (moved) e.preventDefault(); }));
  });

  /* --- Reveal on scroll --- */
  const reveal = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visibile'); reveal.unobserve(e.target); } });
  }, { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(el => reveal.observe(el));

  /* --- Numeri "maestria": disegno + comparsa card allo scroll --- */
  const drawObs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('drawn'); drawObs.unobserve(e.target); } });
  }, { threshold: .25 });
  document.querySelectorAll('.dim').forEach(el => drawObs.observe(el));

  /* --- Numeri maestria: comparsa PROGRESSIVA legata allo scroll (ri-anima ogni volta) --- */
  const bigNums = document.querySelectorAll('.big-num');
  const maGrid = document.querySelector('.maestria-grid');
  if (bigNums.length && maGrid) {
    const updNums = () => {
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const r = maGrid.getBoundingClientRect();
      const center = r.top + r.height / 2;
      let p = (vh - center) / (vh * 0.5);   // 0 quando il centro e in basso, 1 quando arriva a meta schermo
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      const op = (0.35 + p * 0.65).toFixed(3);        // da parziale a pieno
      const tx = ((1 - p) * 90).toFixed(1);           // slide da destra
      bigNums.forEach(el => { el.style.opacity = op; el.style.transform = 'translate(' + tx + 'px, -50%)'; });
    };
    window.addEventListener('scroll', updNums, { passive: true });
    window.addEventListener('resize', updNums);
    updNums();
  }

  /* --- Header shadow on scroll --- */
  const header = document.querySelector('header.site');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 20
        ? '0 8px 30px rgba(11,61,46,.14)' : '0 4px 18px rgba(11,61,46,.08)';
    });
  }

  /* --- Orologio live: Roma + fuso dell'utente --- */
  const clockEl = document.getElementById('clock-text');
  if (clockEl) {
    const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Rome';
    const cittaUtente = userTz.split('/').pop().replace(/_/g, ' ');
    const fmt = tz => new Intl.DateTimeFormat('it-IT', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    }).format(new Date());
    const offset = tz => {
      const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
        .formatToParts(new Date()).find(x => x.type === 'timeZoneName');
      return p ? p.value.replace('GMT', 'GMT') : '';
    };
    const aggiorna = () => {
      let txt = 'Roma ' + fmt('Europe/Rome');
      if (userTz !== 'Europe/Rome') {
        txt += '  ·  ' + cittaUtente + ' ' + fmt(userTz) + ' (' + offset(userTz) + ')';
      }
      clockEl.textContent = txt;
    };
    aggiorna();
    setInterval(aggiorna, 1000);
  }

  /* --- Form contatti (demo) --- */
  const form = document.querySelector('#form-contatti');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const msg = form.querySelector('.msg-ok');
      if (msg) { msg.style.display = 'block'; form.reset(); }
    });
  }
});

/* ===== Banner cookie (accetta / rifiuta) ===== */
(function(){
  var KEY='lm_cookie';
  try{ if(localStorage.getItem(KEY)) return; }catch(e){}
  function init(){
    if(document.getElementById('cookie-banner')) return;
    var b=document.createElement('div');
    b.id='cookie-banner'; b.className='cookie-banner'; b.setAttribute('role','dialog'); b.setAttribute('aria-label','Avviso cookie');
    b.innerHTML='<div class="ck-inner"><p>Usiamo cookie tecnici necessari e, con il tuo consenso, cookie statistici per migliorare il sito. Dettagli nella <a href="cookie.html">Cookie Policy</a>.</p><div class="ck-actions"><button type="button" class="ck-btn ck-no">Rifiuta</button><button type="button" class="ck-btn ck-yes">Accetta</button></div></div>';
    document.body.appendChild(b);
    requestAnimationFrame(function(){ b.classList.add('show'); });
    function choose(v){ try{localStorage.setItem(KEY,v);}catch(e){} b.classList.remove('show'); setTimeout(function(){ if(b.parentNode) b.parentNode.removeChild(b); },320); }
    b.querySelector('.ck-yes').addEventListener('click',function(){ choose('accept'); });
    b.querySelector('.ck-no').addEventListener('click',function(){ choose('reject'); });
  }
  if(document.readyState==='loading'){ document.addEventListener('DOMContentLoaded',init); } else { init(); }
})();

/* ===== Ricerca + tab login ===== */
(function(){
  var idx=[
   {t:'Nuovo Musulmano',u:'nuovo-musulmano.html',s:'Base · €14,99/mese'},
   {t:'Comprensione del Corano',u:'comprensione-corano.html',s:'Corso · €9/mese'},
   {t:'Pensiero critico',u:'pensiero-critico.html',s:'Corso · €19/mese'},
   {t:'Intelligenza emotiva',u:'intelligenza-emotiva.html',s:'Corso · €19/mese'},
   {t:"L'arte della Dawah",u:'arte-dawah.html',s:'Corso · €499'},
   {t:'Escatologia islamica e religioni comparate',u:'escatologia.html',s:'Corso · €199'},
   {t:'Surah Kahf SPECIAL',u:'surah-kahf.html',s:'Corso · €199'},
   {t:"Sistema politico dell'Islam",u:'sistema-politico.html',s:'Corso · €19/mese'},
   {t:'Musulmano Intellettuale',u:'musulmano-intellettuale.html',s:'Apologetica · €199'},
   {t:'Tutti i corsi',u:'corsi.html',s:'Catalogo'},
   {t:'Coaching',u:'coaching.html',s:'Coaching 1-a-1'},
   {t:'Chi siamo',u:'chi-siamo.html',s:'Storia e missione'},
   {t:'Contatti',u:'contatti.html',s:'Scrivici'},
   {t:'Domande frequenti',u:'faq.html',s:'FAQ'},
   {t:'Area personale',u:'accedi.html',s:'Accedi / Registrati'},
   {t:'Privacy Policy',u:'privacy.html',s:'Note legali'},
   {t:'Cookie Policy',u:'cookie.html',s:'Note legali'},
   {t:'Termini di servizio',u:'termini.html',s:'Note legali'},
   {t:'Condizioni di vendita',u:'condizioni-vendita.html',s:'Note legali'}
  ];
  var btn=document.getElementById('search-btn');
  if(btn){
    var ov=document.createElement('div'); ov.id='search-overlay';
    ov.innerHTML='<div class="search-box"><input type="search" id="search-input" placeholder="Cerca corsi e pagine…" autocomplete="off"><div class="search-results" id="search-results"></div></div>';
    document.body.appendChild(ov);
    var input=ov.querySelector('#search-input'), res=ov.querySelector('#search-results');
    function render(q){ q=(q||'').trim().toLowerCase();
      var list=q? idx.filter(function(i){return (i.t+' '+i.s).toLowerCase().indexOf(q)>-1;}):idx;
      res.innerHTML = list.length? list.map(function(i){return '<a href="'+i.u+'">'+i.t+'<small>'+i.s+'</small></a>';}).join('') : '<div class="search-empty">Nessun risultato.</div>';
    }
    function open(){ ov.classList.add('open'); input.value=''; render(''); setTimeout(function(){input.focus();},30); }
    function close(){ ov.classList.remove('open'); }
    btn.addEventListener('click',open);
    input.addEventListener('input',function(){render(input.value);});
    ov.addEventListener('click',function(e){ if(e.target===ov) close(); });
    document.addEventListener('keydown',function(e){ if(e.key==='Escape') close(); });
  }
  var tabs=document.querySelectorAll('.auth-tab, .to-signup, .to-login');
  if(tabs.length){
    function show(which){
      document.querySelectorAll('.auth-tab').forEach(function(t){ t.classList.toggle('attivo', t.getAttribute('data-auth')===which); });
      var l=document.getElementById('form-login'), s=document.getElementById('form-signup');
      if(l&&s){ l.style.display=which==='login'?'block':'none'; s.style.display=which==='signup'?'block':'none'; }
    }
    tabs.forEach(function(t){ t.addEventListener('click',function(e){ e.preventDefault(); show(t.getAttribute('data-auth')); }); });
  }
})();

/* ===== Filtro corsi per livello ===== */
(function(){
  var btns=document.querySelectorAll('.filtro-liv');
  if(!btns.length) return;
  var blocchi=document.querySelectorAll('.livello-blocco');
  btns.forEach(function(b){
    b.addEventListener('click',function(){
      btns.forEach(function(x){x.classList.remove('attivo');});
      b.classList.add('attivo');
      var liv=b.getAttribute('data-liv');
      blocchi.forEach(function(bl){
        bl.style.display=(liv==='tutti'||bl.getAttribute('data-liv')===liv)?'':'none';
      });
    });
  });
})();

/* ===== Menu 'Altro' a fisarmonica su mobile ===== */
(function(){
  document.querySelectorAll('nav.main .has-drop > .drop-toggle').forEach(function(t){
    t.addEventListener('click', function(e){
      if(window.innerWidth<=900){ e.preventDefault(); e.stopPropagation(); t.parentNode.classList.toggle('open'); }
    });
  });
})();
