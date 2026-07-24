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
