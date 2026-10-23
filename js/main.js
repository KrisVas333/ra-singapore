/* Robotics Academy · Singapore · interactions + anonymous events (rule 16)
   Events go through window.bt (track.js, cookieless). Every event carries src (?src=<channel>, e.g. sg-print, sg-oct26). */
(function () {
  'use strict';
  // TODO (Kris): WhatsApp number, digits only with country code (e.g. '65XXXXXXXX'). All WhatsApp buttons stay hidden while empty.
  var WHATSAPP = '';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // source channel, kept for the session
  var SRC = 'direct';
  try {
    var q = new URLSearchParams(location.search).get('src');
    if (q) { SRC = q.replace(/[^a-z0-9_-]/gi, '').slice(0, 40) || 'direct'; sessionStorage.setItem('ra_sg_src', SRC); }
    else { SRC = sessionStorage.getItem('ra_sg_src') || 'direct'; }
  } catch (e) {}
  var track = function (n, p) { p = p || {}; p.src = SRC; if (window.bt) { try { window.bt(n, p); } catch (e) {} } };
  window.addEventListener('load', function () { track('engage', { landed: 1 }); }, { once: true });

  // WhatsApp buttons
  var num = WHATSAPP.replace(/\D/g, '');
  if (num) {
    $$('.js-wa').forEach(function (a) {
      a.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent('Hi Kris and Lukas, about Robotics Academy in Singapore');
      a.target = '_blank'; a.rel = 'noopener'; a.hidden = false;
    });
  }

  // CTA clicks
  $$('[data-cta]').forEach(function (a) {
    a.addEventListener('click', function () {
      var href = a.getAttribute('href') || '';
      var kind = href.indexOf('mailto:') === 0 ? 'mailto' : href.indexOf('wa.me') > -1 ? 'whatsapp' : href.charAt(0) === '#' ? 'scroll' : 'link';
      track(kind === 'mailto' || kind === 'whatsapp' ? 'value' : 'cta', { id: a.getAttribute('data-cta'), kind: kind });
    });
  });

  // video events
  $$('video[data-vid]').forEach(function (v) {
    var id = v.getAttribute('data-vid'), started = false, half = false;
    v.addEventListener('play', function () { if (!started) { started = true; track('value', { step: 'video_play', video: id }); } });
    v.addEventListener('timeupdate', function () { if (!half && v.duration && v.currentTime / v.duration > 0.5) { half = true; track('engage', { video_half: id }); } });
    v.addEventListener('ended', function () { track('value', { step: 'video_end', video: id }); });
  });
  // "Watch 33 s" scrolls to the video and starts it
  var watch = $('[data-cta="hero-watch"]'), vid = $('video[data-vid]');
  if (watch && vid) watch.addEventListener('click', function () { setTimeout(function () { try { vid.play(); } catch (e) {} }, 600); });

  // sticky CTA: visible after the hero, hidden at the final CTA
  var sticky = $('.sticky'), hero = $('.hero'), talk = $('#talk');
  if (sticky && 'IntersectionObserver' in window) {
    var heroOut = false, talkIn = false;
    var set = function () { sticky.classList.toggle('is-in', heroOut && !talkIn); };
    new IntersectionObserver(function (e) { heroOut = !e[0].isIntersecting; set(); }).observe(hero);
    new IntersectionObserver(function (e) { talkIn = e[0].isIntersecting; set(); }, { threshold: 0.05 }).observe(talk);
  }

  // scroll depth (once each)
  var depths = [25, 50, 75, 100], sent = {};
  window.addEventListener('scroll', function () {
    var h = document.documentElement, p = (h.scrollTop + innerHeight) / h.scrollHeight * 100;
    depths.forEach(function (d) { if (p >= d - 1 && !sent[d]) { sent[d] = 1; track('engage', { scroll: d }); } });
  }, { passive: true });

  // section reveals (content stays visible without JS)
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var els = $$('.sec .h2, .pains li, .story, .ladder li, .kit li, .stats div, .quote, .person, .timeline li, .box');
    document.documentElement.classList.add('js');
    els.forEach(function (el) { el.classList.add('rv'); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }
})();
