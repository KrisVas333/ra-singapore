/* Robotics Academy × BrainClub · Singapore · interactions + anonymous events
   Events go through window.bt (track.js, cookieless). Every event carries src (?src=<channel>). */
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // ---- source channel (?src=qr-onepager etc.), kept for the session ----
  var SRC = 'direct';
  try {
    var q = new URLSearchParams(location.search).get('src');
    if (q) { SRC = q.replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'direct'; sessionStorage.setItem('ra_sg_src', SRC); }
    else { SRC = sessionStorage.getItem('ra_sg_src') || 'direct'; }
  } catch (e) {}
  var track = function (n, p) { p = p || {}; p.src = SRC; if (window.bt) { try { window.bt(n, p); } catch (e) {} } };
  window.addEventListener('load', function () { track('engage', { landed: 1 }); }, { once: true });

  // ---- CTA + mailto clicks ----
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () {
      var href = a.getAttribute('href') || '';
      track('cta', { id: a.getAttribute('data-cta'), kind: href.indexOf('mailto:') === 0 ? 'mailto' : (href.charAt(0) === '#' ? 'scroll' : 'link') });
    });
  });

  // ---- WhatsApp: shown only when a number is filled in ----
  var wa = $('#wa');
  if (wa) {
    var num = (wa.getAttribute('data-whatsapp') || '').replace(/\D/g, '');
    if (num) { wa.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent('Hi! About Robotics Academy × Singapore'); wa.target = '_blank'; wa.rel = 'noopener'; wa.hidden = false; }
  }

  // ---- video slot (75 s video, swap via data-src) ----
  var slot = $('.vid-slot');
  if (slot && slot.getAttribute('data-src')) {
    var v = document.createElement('video');
    v.controls = true; v.playsInline = true; v.preload = 'none';
    v.setAttribute('data-vid', slot.getAttribute('data-vid') || 'ra-75s');
    if (slot.getAttribute('data-poster')) v.poster = slot.getAttribute('data-poster');
    v.src = slot.getAttribute('data-src');
    slot.replaceChild(v, $('.slot-ph', slot));
  }

  // ---- video events ----
  $$('video[data-vid]').forEach(function (v) {
    var id = v.getAttribute('data-vid'), started = false, half = false;
    v.addEventListener('play', function () {
      if (!started) { started = true; track('value', { step: 'video_play', video: id }); }
      $$('video').forEach(function (o) { if (o !== v) o.pause(); });
    });
    v.addEventListener('timeupdate', function () { if (!half && v.duration && v.currentTime / v.duration > 0.5) { half = true; track('engage', { video_half: id }); } });
    v.addEventListener('ended', function () { track('value', { step: 'video_end', video: id }); });
  });

  // ---- age ladder ----
  var age = $('#age'), out = $('#ageOut'), hint = $('#ageHint'), touched = false;
  function grade(a) { return a >= 7 ? '(grade ' + (a - 6) + ')' : (a >= 5 ? '(kindergarten)' : '(pre-school)'); }
  function ladder() {
    var a = +age.value;
    out.textContent = a; hint.textContent = grade(a);
    $$('.prog').forEach(function (p) {
      var on = a >= +p.getAttribute('data-min') && a <= +p.getAttribute('data-max');
      p.classList.toggle('is-on', on); p.classList.toggle('is-off', !on);
    });
  }
  if (age) {
    age.addEventListener('input', function () { ladder(); if (!touched) { touched = true; track('engage', { ladder: 1 }); } });
    age.addEventListener('change', function () { track('engage', { age: +age.value }); });
    ladder();
  }

  // ---- tabs (lessons) ----
  $$('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-tab]').forEach(function (o) { o.setAttribute('aria-selected', o === b ? 'true' : 'false'); });
      $$('.lesson').forEach(function (p) { p.hidden = p.id !== 'l-' + b.getAttribute('data-tab'); });
      animateTimeline($('#l-' + b.getAttribute('data-tab')));
      track('engage', { lesson_tab: b.getAttribute('data-tab') });
    });
  });
  // ---- tabs (voices) ----
  $$('[data-vtab]').forEach(function (b) {
    b.addEventListener('click', function () {
      $$('[data-vtab]').forEach(function (o) { o.setAttribute('aria-selected', o === b ? 'true' : 'false'); });
      $$('.vpanel').forEach(function (p) { p.hidden = p.getAttribute('data-vpanel') !== b.getAttribute('data-vtab'); });
      track('engage', { voices_tab: b.getAttribute('data-vtab') });
    });
  });

  // ---- sticky CTA after hero (mobile) ----
  var sticky = $('.sticky'), hero = $('.hero'), partner = $('#partner');
  if (sticky && 'IntersectionObserver' in window) {
    var heroOut = false, partnerIn = false;
    var set = function () { sticky.classList.toggle('is-in', heroOut && !partnerIn); };
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; set(); }).observe(hero);
    new IntersectionObserver(function (e) { partnerIn = e[0].isIntersecting; set(); }, { threshold: 0.05 }).observe(partner);
  }

  // ---- scroll depth (once each) ----
  var depths = [25, 50, 75, 100], sent = {};
  window.addEventListener('scroll', function () {
    var h = document.documentElement, p = (h.scrollTop + innerHeight) / h.scrollHeight * 100;
    depths.forEach(function (d) { if (p >= d - 1 && !sent[d]) { sent[d] = 1; track('engage', { scroll: d }); } });
  }, { passive: true });

  // ======================= MOTION (GSAP) =======================
  var timelineFn = null;
  function animateTimeline(panel) { if (timelineFn && panel) timelineFn(panel); }

  function motion() {
    if (!window.gsap || !window.ScrollTrigger) return; // page works fully without motion
    gsap.registerPlugin(ScrollTrigger);
    document.documentElement.classList.add('js');
    var mm = gsap.matchMedia();

    mm.add('(prefers-reduced-motion: no-preference)', function () {
      // hero
      gsap.from('.hero-media img', { scale: 1.12, duration: 2.2, ease: 'power2.out' });
      gsap.from('.hero-in > *', { y: 30, opacity: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out', delay: 0.15 });
      gsap.to('.hero-media img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });

      // counters
      $$('.stat [data-count]').forEach(function (el) {
        var end = +el.getAttribute('data-count'), pre = el.getAttribute('data-prefix') || '', suf = el.getAttribute('data-suffix') || '';
        var plain = el.hasAttribute('data-plain'), o = { v: plain ? end - 13 : 0 };
        gsap.to(o, { v: end, duration: 1.8, ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          onUpdate: function () { var n = Math.round(o.v); el.textContent = pre + (plain ? n : n.toLocaleString('en-US')) + suf; } });
      });
      gsap.from('.stat', { y: 20, opacity: 0, stagger: 0.07, duration: 0.6, scrollTrigger: { trigger: '.stats', start: 'top 90%', once: true } });

      // generic reveals
      ScrollTrigger.batch('.reveal', { start: 'top 88%', once: true,
        onEnter: function (b) { gsap.to(b, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'power3.out' }); } });

      // photo mosaic
      gsap.from('.m', { clipPath: 'inset(100% 0 0 0)', scale: 1.05, duration: 1, stagger: 0.1, ease: 'power3.out',
        scrollTrigger: { trigger: '.mosaic', start: 'top 80%', once: true } });

      // programme cards
      gsap.fromTo('.prog', { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.08, ease: 'power3.out',
        scrollTrigger: { trigger: '.progs', start: 'top 85%', once: true } });
      // ladder demo: sweep 3 → 7 once when it enters view (only if untouched)
      ScrollTrigger.create({ trigger: '.ladder', start: 'top 75%', once: true, onEnter: function () {
        if (touched) return; var o = { v: 3 };
        gsap.to(o, { v: 7, duration: 1.6, ease: 'power1.inOut', onUpdate: function () { var n = Math.round(o.v); if (+age.value !== n) { age.value = n; ladder(); } } });
      } });

      // lesson timeline
      timelineFn = function (panel) {
        var segs = $$('.seg', panel), ph = $('.playhead', panel), tl = $('.tl', panel);
        if (!segs.length) return;
        gsap.fromTo(segs, { '--fill': 0 }, { '--fill': 1, duration: 0.5, stagger: 0.18, ease: 'power2.out' });
        gsap.from(segs, { opacity: 0, x: -12, duration: 0.4, stagger: 0.12 });
        if (ph && getComputedStyle(ph).display !== 'none') gsap.fromTo(ph, { x: 0 }, { x: tl.clientWidth - 3, duration: 3.2, ease: 'none' });
      };
      ScrollTrigger.create({ trigger: '#lesson', start: 'top 65%', once: true, onEnter: function () { animateTimeline($('.lesson:not([hidden])')); } });

      // mentor steps
      gsap.from('.step', { x: -20, opacity: 0, stagger: 0.12, duration: 0.6, scrollTrigger: { trigger: '.steps', start: 'top 85%', once: true } });

      // map arcs: draw LT → Dublin → Chicago → Singapore
      var arcs = $$('.arc');
      arcs.forEach(function (p) { var L = p.getTotalLength(); p.style.strokeDasharray = L; p.style.strokeDashoffset = L; });
      var mt = gsap.timeline({ scrollTrigger: { trigger: '.map', start: 'top 75%', once: true } });
      mt.from('.pin', { scale: 0, transformOrigin: 'center', opacity: 0, duration: 0.4, stagger: 0.15 })
        .to(arcs, { strokeDashoffset: 0, duration: 1.1, stagger: 0.45, ease: 'power2.inOut' }, '-=0.2')
        .add(function () { arcs.forEach(function (p) { p.style.strokeDasharray = '6 8'; p.style.strokeDashoffset = 0; }); });

      // partner option cards
      gsap.from('.opt', { y: 30, opacity: 0, stagger: 0.1, duration: 0.6, scrollTrigger: { trigger: '.opts', start: 'top 85%', once: true } });

      return function () { timelineFn = null; };
    });

    // hover tilt, pointer devices only
    mm.add('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', function () {
      $$('.tilt').forEach(function (el) {
        var rx = gsap.quickTo(el, 'rotationX', { duration: 0.4 }), ry = gsap.quickTo(el, 'rotationY', { duration: 0.4 });
        gsap.set(el, { transformPerspective: 800 });
        el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); ry(((e.clientX - r.left) / r.width - 0.5) * 10); rx(-((e.clientY - r.top) / r.height - 0.5) * 10); });
        el.addEventListener('pointerleave', function () { rx(0); ry(0); });
      });
    });
  }
  if (document.readyState === 'complete' || document.readyState === 'interactive') motion(); else document.addEventListener('DOMContentLoaded', motion);
})();
