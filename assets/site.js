/* =========================================================
   Benini Design — site.js
   Nessuna dipendenza esterna. Progressive enhancement:
   il sito resta pienamente leggibile anche senza JavaScript.
   ========================================================= */
(function () {
  'use strict';

  var doc = document;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  /* ---------- 1. Header condensato allo scroll ---------- */
  var header = $('header.site');
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 24) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- 2. Menu mobile ---------- */
  var mBtn = $('.menu-btn');
  var mNav = $('.mobile-nav');
  if (mBtn && mNav) {
    mBtn.addEventListener('click', function () {
      var open = mNav.classList.toggle('open');
      mBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      doc.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', mNav).forEach(function (a) {
      a.addEventListener('click', function () {
        mNav.classList.remove('open');
        mBtn.setAttribute('aria-expanded', 'false');
        doc.body.style.overflow = '';
      });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mNav.classList.contains('open')) mBtn.click();
    });
  }

  /* ---------- 3. Reveal on scroll ---------- */
  var rv = $$('.rv');
  if (rv.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
      rv.forEach(function (el) { io.observe(el); });
    } else {
      rv.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- 4. Formattazione valuta ---------- */
  var euro = function (n) {
    return new Intl.NumberFormat(doc.documentElement.lang === 'en' ? 'en-GB' : 'it-IT', {
      style: 'currency', currency: 'EUR', maximumFractionDigits: 0
    }).format(Math.round(n / 10) * 10);
  };

  /* ---------- 5. Chipset (gruppi di scelta) ---------- */
  $$('.chipset').forEach(function (set) {
    $$('label', set).forEach(function (lab) {
      var input = $('input', lab);
      if (!input) return;
      var sync = function () {
        if (input.type === 'radio') {
          $$('label', set).forEach(function (l) {
            var i = $('input', l);
            if (i && i.name === input.name) l.classList.toggle('on', i.checked);
          });
        } else {
          lab.classList.toggle('on', input.checked);
        }
      };
      input.addEventListener('change', sync);
      sync();
    });
  });

  /* ---------- 6. Preventivatore consulenza online ---------- */
  /* Stima trasparente e dichiarata: nessun dato inviato, calcolo locale. */
  var est = $('#estimator');
  if (est) {
    var EN = (document.documentElement.lang || 'it').slice(0, 2) === 'en';

    /* Scaglioni di metratura: [m² max, consulenza in pianta, progetto di arredo].
       Stessi numeri della pagina prezzi. */
    var TIER = [[15, 190, 490], [30, 290, 690], [50, 420, 980], [80, 590, 1380], [120, 820, 1890]];
    /* Sopra i 120 m2 si parte dall'ultimo scaglione e si aggiunge la tariffa sui soli metri eccedenti */
    var OVER = { pianta: 6.5, arredo: 20 };
    var BASE120 = { pianta: 820, arredo: 1890 };

    var roomPrice = function (pk, sqm) {
      var k = (pk === 'pianta') ? 1 : 2;
      for (var i = 0; i < TIER.length; i++) { if (sqm <= TIER[i][0]) return TIER[i][k]; }
      return Math.round(BASE120[pk] + (sqm - 120) * OVER[pk]);
    };

    /* Sconto a scalare per ambienti aggiuntivi, come da listino */
    var discount = function (n) { return n === 0 ? 1 : (n === 1 ? 0.85 : (n === 2 ? 0.75 : 0.65)); };

    var EXTRA = {
      render:   { label: EN ? 'Extra photorealistic renders' : 'Render fotorealistici extra', v: 180 },
      shopping: { label: EN ? 'Shopping list with links and prices' : 'Shopping list con link e prezzi', v: 150 },
      esecutivi:{ label: EN ? 'Dimensioned drawings for joiners and fitters' : 'Tavole quotate per artigiani e posatori', v: 240 },
      acquisti: { label: EN ? 'Purchasing management' : 'Direzione acquisti e ordini', v: 420 },
      sopral:   { label: EN ? 'Site visit (Verona and province)' : 'Sopralluogo in loco (Verona e prov.)', v: 100 }
    };

    var recalc = function () {
      var pk = ($('input[name="est-pack"]:checked', est) || {}).value || 'pianta';
      var rooms = parseInt(($('#est-rooms') || {}).value || 1, 10);
      var sqm = parseInt(($('#est-sqm') || {}).value || 60, 10);
      var low = 0;
      if (pk === 'call') {
        low = 90;
      } else {
        var per = Math.max(6, Math.round(sqm / rooms));
        for (var r = 0; r < rooms; r++) { low += roomPrice(pk, per) * discount(r); }
        low = Math.round(low);
      }
      var extras = 0;
      var lines = [];
      $$('input[name="est-extra"]:checked', est).forEach(function (i) {
        var e = EXTRA[i.value];
        if (e) { extras += e.v; lines.push(e); }
      });
      var total = low + extras;
      var out = $('#est-amount', est);
      if (out) out.textContent = euro(total * 0.92) + ' – ' + euro(total * 1.18);
      var rl = $('#est-rooms-val', est); if (rl) rl.textContent = rooms;
      var sl = $('#est-sqm-val', est); if (sl) sl.textContent = sqm + ' m²';
      var det = $('#est-detail', est);
      if (det) {
        var html = '<li><span>' + (EN ? 'Consultation package' : 'Formato di consulenza') + '</span><b>' + euro(low) + '</b></li>';
        lines.forEach(function (e) { html += '<li><span>' + e.label + '</span><b>' + euro(e.v) + '</b></li>'; });
        det.innerHTML = html;
      }
    };

    $$('input,select', est).forEach(function (i) {
      i.addEventListener('input', recalc);
      i.addEventListener('change', recalc);
    });
    recalc();
  }

  /* ---------- 7. Calcolatore budget arredo ---------- */
  var bud = $('#budget-calc');
  if (bud) {
    /* €/m² indicativi, arredo completo chiavi in mano, IVA inclusa */
    var TIER = { economy: [110, 190], medio: [200, 380], alto: [400, 750], lusso: [800, 1600] };
    var SCOPE = { parziale: 0.55, completo: 1, misura: 1.35 };

    var brecalc = function () {
      var sqm = parseInt(($('#bud-sqm') || {}).value || 90, 10);
      var tier = ($('input[name="bud-tier"]:checked', bud) || {}).value || 'medio';
      var scope = ($('input[name="bud-scope"]:checked', bud) || {}).value || 'completo';
      var t = TIER[tier], s = SCOPE[scope];
      var lo = sqm * t[0] * s, hi = sqm * t[1] * s;
      var o = $('#bud-amount', bud); if (o) o.textContent = euro(lo) + ' – ' + euro(hi);
      var v = $('#bud-sqm-val', bud); if (v) v.textContent = sqm + ' m²';
      var d = $('#bud-detail', bud);
      if (d) {
        var rows = [
          ['Zona giorno e cucina', 0.46],
          ['Zona notte', 0.24],
          ['Bagni e servizi', 0.12],
          ['Illuminazione e tende', 0.11],
          ['Complementi e tessili', 0.07]
        ];
        d.innerHTML = rows.map(function (r) {
          return '<li><span>' + r[0] + '</span><b>' + euro(lo * r[1]) + ' – ' + euro(hi * r[1]) + '</b></li>';
        }).join('');
      }
    };
    $$('input', bud).forEach(function (i) {
      i.addEventListener('input', brecalc);
      i.addEventListener('change', brecalc);
    });
    brecalc();
  }

  /* ---------- 8. Quiz "che stile è casa tua" ---------- */
  var quiz = $('#style-quiz');
  if (quiz) {
    var qs = $$('.quiz-q', quiz);
    var score = {};
    var step = 0;

    var render = function () {
      qs.forEach(function (q, i) { q.classList.toggle('active', i === step); });
      $$('.quiz-prog i', quiz).forEach(function (b, i) { b.classList.toggle('on', i <= step); });
    };

    $$('.quiz-opt', quiz).forEach(function (btn) {
      btn.addEventListener('click', function () {
        (btn.dataset.style || '').split(',').forEach(function (s) {
          s = s.trim(); if (!s) return;
          score[s] = (score[s] || 0) + 1;
        });
        step++;
        if (step < qs.length) { render(); }
        else {
          var best = Object.keys(score).sort(function (a, b) { return score[b] - score[a]; })[0];
          qs.forEach(function (q) { q.classList.remove('active'); });
          $$('.quiz-result', quiz).forEach(function (r) {
            r.classList.toggle('active', r.dataset.style === best);
          });
          $$('.quiz-prog i', quiz).forEach(function (b) { b.classList.add('on'); });
        }
      });
    });

    var reset = $('.quiz-reset', quiz);
    if (reset) reset.addEventListener('click', function () {
      score = {}; step = 0;
      $$('.quiz-result', quiz).forEach(function (r) { r.classList.remove('active'); });
      render();
    });
    render();
  }

  /* ---------- 9. Evidenziazione capitolo attivo nell'indice ---------- */
  var toc = $('.toc[data-spy]');
  if (toc && 'IntersectionObserver' in window) {
    var links = {};
    $$('a[href^="#"]', toc).forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (ents) {
      ents.forEach(function (e) {
        var a = links[e.target.id];
        if (a) a.style.color = e.isIntersecting ? 'var(--clay)' : '';
      });
    }, { rootMargin: '-15% 0px -75% 0px' });
    Object.keys(links).forEach(function (id) {
      var t = doc.getElementById(id); if (t) spy.observe(t);
    });
  }

  /* ---------- 10. Form contatto (mailto fallback) ---------- */
  /* Se non è configurato un endpoint (data-endpoint), il form compone
     una email precompilata: il sito resta funzionante su hosting statico. */
  $$('form[data-mailto]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      if (form.dataset.endpoint) return; // invio normale verso l'endpoint
      e.preventDefault();
      var data = new FormData(form);
      var lines = [];
      data.forEach(function (v, k) {
        if (k.indexOf('_') === 0 || !String(v).trim()) return;
        lines.push(k.replace(/-/g, ' ') + ': ' + v);
      });
      var subject = form.dataset.subject || 'Richiesta dal sito';
      var body = lines.join('\n');
      window.location.href = 'mailto:' + form.dataset.mailto +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    });
  });

  /* ---------- 11. Anno corrente nel footer ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
