/* ==========================================================================
   Glamour Intimo & Abbigliamento — interazioni
   ========================================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- Icone Lucide ---------- */
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons({ attrs: { 'stroke-width': 1.5, 'aria-hidden': 'true' } });
  }

  /* ---------- Anno nel footer ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ======================================================================
     ORARI E STATO DI APERTURA (fuso orario Europe/Rome)
     Minuti dalla mezzanotte. 0 = domenica … 6 = sabato
     ====================================================================== */
  var SPLIT = [[600, 750], [960, 1170]];       // 10:00–12:30 · 16:00–19:30
  var HOURS = {
    0: [],                                      // domenica: chiuso
    1: [],                                      // lunedì: chiuso
    2: SPLIT,
    3: SPLIT,
    4: [[600, 1140]],                           // giovedì: 10:00–19:00 continuato
    5: SPLIT,
    6: SPLIT
  };
  var DAY_NAMES = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];

  function hhmm(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function romeNow() {
    var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    try {
      var parts = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      }).formatToParts(new Date());
      var o = {};
      parts.forEach(function (p) { o[p.type] = p.value; });
      return { day: map[o.weekday], min: (parseInt(o.hour, 10) % 24) * 60 + parseInt(o.minute, 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }

  function todayHoursText(day) {
    var s = HOURS[day];
    if (!s.length) return 'Oggi la boutique è chiusa';
    if (day === 4) return '10:00 – 19:00 · orario continuato';
    return s.map(function (r) { return hhmm(r[0]) + ' – ' + hhmm(r[1]); }).join(' · ');
  }

  function computeStatus() {
    var now = romeNow();
    var slots = HOURS[now.day];
    var i, r;

    for (i = 0; i < slots.length; i++) {
      r = slots[i];
      if (now.min >= r[0] && now.min < r[1]) {
        var left = r[1] - now.min;
        return {
          state: left <= 30 ? 'soon' : 'open',
          text: left <= 30 ? 'Chiude tra ' + left + ' min' : 'Aperto · fino alle ' + hhmm(r[1]),
          day: now.day
        };
      }
    }
    for (i = 0; i < slots.length; i++) {
      r = slots[i];
      if (now.min < r[0]) {
        return {
          state: 'closed',
          text: (i > 0 ? 'In pausa · riapre alle ' : 'Apre alle ') + hhmm(r[0]),
          day: now.day
        };
      }
    }
    for (var k = 1; k <= 7; k++) {
      var d = (now.day + k) % 7;
      if (HOURS[d].length) {
        var when = k === 1 ? 'domani' : DAY_NAMES[d];
        return { state: 'closed', text: 'Chiuso · riapre ' + when + ' alle ' + hhmm(HOURS[d][0][0]), day: now.day };
      }
    }
    return { state: 'closed', text: 'Chiuso', day: now.day };
  }

  function renderStatus() {
    var st = computeStatus();
    document.querySelectorAll('[data-status-text]').forEach(function (el) { el.textContent = st.text; });
    document.querySelectorAll('[data-status-dot]').forEach(function (el) {
      el.classList.toggle('is-open', st.state === 'open');
      el.classList.toggle('is-soon', st.state === 'soon');
    });
    document.querySelectorAll('[data-today-label]').forEach(function (el) {
      el.textContent = 'Oggi · ' + cap(DAY_NAMES[st.day]);
    });
    document.querySelectorAll('[data-today-hours]').forEach(function (el) {
      el.textContent = todayHoursText(st.day);
    });
    document.querySelectorAll('.hours tbody tr').forEach(function (tr) {
      tr.classList.toggle('is-today', Number(tr.getAttribute('data-day')) === st.day);
    });
  }
  renderStatus();
  setInterval(renderStatus, 30000);

  /* ======================================================================
     NAVIGAZIONE
     ====================================================================== */
  var nav = document.getElementById('siteNav');
  var fab = document.querySelector('.wa-fab');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  // Voce attiva in base alla sezione visibile
  if ('IntersectionObserver' in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) {
      var target = document.querySelector(a.getAttribute('href'));
      if (target) sectionObserver.observe(target);
    });
  }

  /* ---------- Menu mobile ---------- */
  var menu = document.getElementById('mobileMenu');
  var menuToggle = document.getElementById('menuToggle');
  var menuClose = document.getElementById('menuClose');

  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('is-open', open);
    if (open) { menu.removeAttribute('inert'); } else { menu.setAttribute('inert', ''); }
    menuToggle.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { setTimeout(function () { menuClose.focus(); }, 60); } else { menuToggle.focus({ preventScroll: true }); }
  }
  if (menu && menuToggle && menuClose) {
    menuToggle.addEventListener('click', function () { setMenu(true); });
    menuClose.addEventListener('click', function () { setMenu(false); });
    menu.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setMenu(false);
    });
  }

  /* ======================================================================
     SCROLL: barra di avanzamento, nav compatta, parallasse
     ====================================================================== */
  var speedEls = reduceMotion ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-speed]'));
  var scrollXEls = reduceMotion ? [] : Array.prototype.slice.call(document.querySelectorAll('[data-scroll-x]'));
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var vh = window.innerHeight;

    if (nav) {
      nav.classList.toggle('is-scrolled', y > 24);
      nav.style.setProperty('--progress', max > 0 ? (y / max).toFixed(4) : 0);
    }
    if (fab) fab.classList.toggle('is-visible', y > vh * 0.6);

    speedEls.forEach(function (el) {
      var box = el.parentElement.getBoundingClientRect();
      if (box.bottom < -200 || box.top > vh + 200) return;
      var offset = (box.top + box.height / 2 - vh / 2) * parseFloat(el.getAttribute('data-speed'));
      el.style.translate = '0 ' + offset.toFixed(1) + 'px';
    });
    scrollXEls.forEach(function (el) {
      var box = el.parentElement.getBoundingClientRect();
      if (box.bottom < 0 || box.top > vh) return;
      var shift = (box.top - vh) * parseFloat(el.getAttribute('data-scroll-x'));
      el.style.transform = 'translateX(' + shift.toFixed(1) + 'px)';
    });
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ======================================================================
     RIVELAZIONI ALLO SCROLL
     ====================================================================== */
  function splitWords(el) {
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (child) {
        if (child.nodeType === 3) {
          var frag = document.createDocumentFragment();
          child.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
            var s = document.createElement('span');
            s.className = 'w';
            s.textContent = part;
            frag.appendChild(s);
          });
          node.replaceChild(frag, child);
        } else if (child.nodeType === 1) {
          walk(child);
        }
      });
    };
    walk(el);
  }

  var splitEls = Array.prototype.slice.call(document.querySelectorAll('[data-split]'));
  if (!reduceMotion) splitEls.forEach(splitWords);

  if ('IntersectionObserver' in window && !reduceMotion) {
    root.classList.add('reveal-ready');
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute('data-split')) {
          el.querySelectorAll('.w').forEach(function (w, i) {
            setTimeout(function () { w.classList.add('is-in'); }, i * 70);
          });
        } else {
          el.classList.add('is-in');
        }
        revealObserver.unobserve(el);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    document.querySelectorAll('[data-reveal], [data-split]').forEach(function (el) { revealObserver.observe(el); });
  }

  /* ======================================================================
     PROFONDITÀ 3D: parallasse del mouse nell'hero, card inclinabili, magneti
     ====================================================================== */
  if (!reduceMotion && finePointer) {
    // Hero: strati che si muovono a profondità diverse
    var hero = document.querySelector('.hero');
    var depthEls = hero ? Array.prototype.slice.call(hero.querySelectorAll('[data-depth]')) : [];
    var target = { x: 0, y: 0 }, current = { x: 0, y: 0 }, heroRaf = null;

    function heroLoop() {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      depthEls.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth'));
        el.style.transform = 'translate3d(' + (current.x * d).toFixed(2) + 'px,' + (current.y * d).toFixed(2) + 'px,0)';
      });
      if (Math.abs(target.x - current.x) > 0.001 || Math.abs(target.y - current.y) > 0.001) {
        heroRaf = requestAnimationFrame(heroLoop);
      } else {
        heroRaf = null;
      }
    }
    if (hero) {
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        target.x = (e.clientX - r.left) / r.width - 0.5;
        target.y = (e.clientY - r.top) / r.height - 0.5;
        if (!heroRaf) heroRaf = requestAnimationFrame(heroLoop);
      });
      hero.addEventListener('pointerleave', function () {
        target.x = 0; target.y = 0;
        if (!heroRaf) heroRaf = requestAnimationFrame(heroLoop);
      });
    }

    // Card del bento: inclinazione prospettica + riflesso
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.classList.add('is-tilting');
        card.style.transform = 'perspective(1200px) rotateX(' + (-py * 7).toFixed(2) + 'deg) rotateY(' + (px * 9).toFixed(2) + 'deg)';
        card.style.setProperty('--gx', ((px + 0.5) * 100).toFixed(1) + '%');
        card.style.setProperty('--gy', ((py + 0.5) * 100).toFixed(1) + '%');
      });
      card.addEventListener('pointerleave', function () {
        card.classList.remove('is-tilting');
        card.style.transform = '';
      });
    });

    // Pulsanti magnetici
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('pointermove', function (e) {
        var r = btn.getBoundingClientRect();
        var x = e.clientX - (r.left + r.width / 2);
        var y = e.clientY - (r.top + r.height / 2);
        btn.style.transform = 'translate(' + (x * 0.22).toFixed(1) + 'px,' + (y * 0.32).toFixed(1) + 'px)';
      });
      btn.addEventListener('pointerleave', function () {
        btn.style.transition = 'transform .6s cubic-bezier(.22,1,.36,1), background-position 1s cubic-bezier(.22,1,.36,1), box-shadow .5s';
        btn.style.transform = '';
        setTimeout(function () { btn.style.transition = ''; }, 600);
      });
    });

    // Cursore personalizzato
    var cursor = document.querySelector('.cursor');
    if (cursor) {
      var label = cursor.querySelector('.cursor__label');
      var pos = { x: -100, y: -100 }, cur = { x: -100, y: -100 };
      root.classList.add('has-cursor');
      document.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        pos.x = e.clientX; pos.y = e.clientY;
        cursor.classList.add('is-visible');
      });
      document.addEventListener('pointerleave', function () { cursor.classList.remove('is-visible'); });
      (function loop() {
        cur.x += (pos.x - cur.x) * 0.2;
        cur.y += (pos.y - cur.y) * 0.2;
        cursor.style.transform = 'translate3d(' + cur.x.toFixed(1) + 'px,' + cur.y.toFixed(1) + 'px,0)';
        requestAnimationFrame(loop);
      })();
      document.addEventListener('pointerover', function (e) {
        var labelled = e.target.closest('[data-cursor]');
        var link = e.target.closest('a, button');
        cursor.classList.toggle('is-label', !!labelled);
        cursor.classList.toggle('is-link', !labelled && !!link);
        label.textContent = labelled ? labelled.getAttribute('data-cursor') : '';
      });
    }
  }

  /* ======================================================================
     MAPPA GOOGLE (caricata solo su richiesta)
     ====================================================================== */
  var MAP_SRC = 'https://www.google.com/maps?q=Via%20Roma%206%2C%2010034%20Chivasso%20TO&z=17&output=embed';
  var mapBox = document.querySelector('[data-map]');

  function loadMap() {
    if (!mapBox || mapBox.classList.contains('is-loaded')) return;
    var frame = document.createElement('iframe');
    frame.className = 'map-frame';
    frame.src = MAP_SRC;
    frame.title = 'Mappa: Glamour Intimo & Abbigliamento, Via Roma 6, Chivasso';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.allowFullscreen = true;
    mapBox.appendChild(frame);
    mapBox.classList.add('is-loaded');
    try { localStorage.setItem('glamour-map-consent', '1'); } catch (e) { /* storage non disponibile */ }
  }
  if (mapBox) {
    var loadBtn = mapBox.querySelector('[data-map-load]');
    if (loadBtn) loadBtn.addEventListener('click', loadMap);
    try { if (localStorage.getItem('glamour-map-consent') === '1') loadMap(); } catch (e) { /* storage non disponibile */ }
  }

  /* ======================================================================
     COPIA INDIRIZZO
     ====================================================================== */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var labelEl = btn.querySelector('[data-copy-label]');
    var original = labelEl ? labelEl.textContent : '';
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        btn.classList.add('is-copied');
        if (labelEl) labelEl.textContent = 'Indirizzo copiato';
        setTimeout(function () {
          btn.classList.remove('is-copied');
          if (labelEl) labelEl.textContent = original;
        }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, function () {});
      } else {
        var ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) { /* ignora */ }
        document.body.removeChild(ta);
      }
    });
  });
})();
