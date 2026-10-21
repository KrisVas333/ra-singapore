# Robotics Academy × BrainClub · Singapore partner page

Static, mobile-first landing for Singapore partners (QR on the printed one-pager). Built 2026-10-21. NOT deployed.

- `index.html` · `css/style.css` · `js/main.js` (GSAP 3.12.5 + ScrollTrigger from cdnjs) · `js/consent.js`
- Tracking (rule 16): `track.js` (cookieless events, `?src=` on every event) + Clarity only after "Allow". **TODO: set `CLARITY_ID` in js/consent.js.**
- QR link should be `…/?src=qr-onepager`.
- 75 s video slot: set `data-src` (+ `data-poster`) on `.vid-slot` in index.html.
- WhatsApp: set `data-whatsapp="<digits>"` on `#wa` (hidden while empty).
- og.jpg is relative: switch `og:image` to the absolute URL after deploy. Source: `tools/og-src.html`.
- QA screenshots: `qa/`.
