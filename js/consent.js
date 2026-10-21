/* RA × BrainClub Singapore · consent gate + Microsoft Clarity (rule 16)
 * - track.js (Umami, cookieless) always loads: anonymous events only.
 * - Microsoft Clarity (heatmaps, recordings) loads ONLY after "Allow".
 * - Choice stored in localStorage 'ra_sg_consent' = 'all' | 'necessary'.
 * TODO (Kris/orchestrator): create a Clarity project for this page (Strict masking) and paste its ID below.
 *   While CLARITY_ID is empty, Clarity never loads (banner still records the choice).
 */
(function () {
  'use strict';
  var CLARITY_ID = ''; // e.g. 'abcd1234xy' -> https://www.clarity.ms/tag/<id>
  var KEY = 'ra_sg_consent';

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadClarity() {
    if (!CLARITY_ID || window.clarity) return;
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  function banner() {
    if (document.querySelector('.consent:not(.is-gone)')) return;
    var el = document.createElement('div');
    el.className = 'consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie consent');
    el.innerHTML =
      '<p><b>Can we learn from your visit?</b> “Allow” turns on Microsoft Clarity (anonymous heatmaps) so we can make this page clearer. Without it we only count anonymous clicks, no cookies.</p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn" data-c="all">Allow</button>' +
      '<button type="button" class="btn btn-line" data-c="necessary">Necessary only</button>' +
      '</div>';
    el.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-c]');
      if (!b) return;
      var c = b.getAttribute('data-c');
      save(c);
      if (c === 'all') loadClarity();
      if (window.bt) { try { window.bt('engage', { consent: c }); } catch (x) {} }
      el.classList.add('is-gone');
      setTimeout(function () { el.remove(); }, 300);
    });
    document.body.appendChild(el);
  }

  function init() {
    var reopen = document.getElementById('consentOpen');
    if (reopen) reopen.addEventListener('click', banner);
    var c = read();
    if (c === 'all') { loadClarity(); return; }
    if (c === 'necessary') return;
    banner();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
