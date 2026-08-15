# Isaias Barber — landing page

Framework-free static landing page for a barbershop. No build step, no backend:
plain HTML + CSS + vanilla ES modules served over HTTP.

## Structure

```
├── index.html            Semantic markup + inline SVG sprite (<symbol> + <use>)
├── css/
│   ├── tokens.css        Design tokens (CSS custom properties) — single source of truth
│   ├── base.css          Reset, base typography, layout primitives, texture, a11y helpers
│   └── components.css    BEM components (.header .hero .card .price .barber
│                         .reserve .footer .sticky-bar .wa — with --lg/--mini/--pulse)
├── js/
│   ├── i18n.js           I18N dictionary (es + pt), LANG_CODES, DEFAULT_LANG
│   ├── config.js         PHONE and buildWaLink(lang)
│   └── app.js            Entry point (type="module") — i18n swap, lang toggle,
│                         WhatsApp hrefs, reduced-motion video, current year
├── assets/
│   ├── video/            Drop hero.mp4 here (hero uses assets/video/hero.mp4)
│   └── img/              Poster + barber photo placeholders (SVG)
└── scripts/
    └── verify.mjs        Static sanity checks (run: node scripts/verify.mjs)
```

## Run it locally

The page uses ES modules (`<script type="module">`), which browsers refuse to load
from `file://` due to CORS. Serve the repository root over HTTP:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Or with Node: `npx serve .`

## Deploy to GitHub Pages

The repo root is the Pages source, so pushing is all that's needed:

1. Push this branch: `git push origin main`.
2. On GitHub: **Settings → Pages → Source: "Deploy from a branch" → branch `main` + `/ (root)`**.
3. The site is live at `https://lqdm12.github.io/isaiasbarber/`.

There's no `barberia/` subfolder anymore — `index.html` sits at the root, which
is what Pages serves. If you ever see a Pages 404, first check that the file
case matches (`index.html`, not `Index.html`) and that the branch/folder above
is selected.

## How the pieces fit

- **i18n**: every translatable node carries `data-i18n="<key>"` (text) or
  `data-i18n-aria="<key>"` (aria-label). `app.js` swaps text, updates
  `<html lang>`, and sets `aria-pressed` on the language toggle buttons.
  Language state lives in memory only (no `localStorage`).
- **WhatsApp**: every call-to-action anchor carries `data-wa` and gets its `href`
  rebuilt by `buildWaLink(lang)` — number + URL-encoded localized message.
- **Icons**: an inline SVG sprite defines `<symbol id="i-…">` once; icons are
  reused with `<use href="#i-…">`. All `#i-…` refs resolve to symbols in the
  same file.
- **Video**: `assets/video/hero.mp4` autoplays muted; if the file is missing the
  poster (`assets/img/hero-poster.svg`) shows. Under
  `prefers-reduced-motion` the video is paused by `app.js`.

## Customize

| What            | Where                                        |
| --------------- | -------------------------------------------- |
| WhatsApp number | `js/config.js` → `PHONE` (country code + number, no `+`) |
| WhatsApp message| `js/i18n.js` → `wa.message` in each language |
| All copy        | `js/i18n.js` (keep both languages in sync)   |
| Brand / colors / type / spacing | `css/tokens.css`            |
| Fonts           | `index.html` `<head>` + `--font-display` token |
| Photos          | Replace `assets/img/*.svg` (keep names or update `src`) |
| Hero video      | Drop `assets/video/hero.mp4`                 |

## Add a language

1. Add the code to `LANG_CODES` (e.g. `"en"`).
2. Add an `en: { … }` object in `I18N` with every key present in `es`/`pt`.
3. Add a `data-lang="en"` button next to the ES/PT toggle in `index.html`.

## Notes on quality

- Mobile-first: single-column layouts up to `720px`, `data-wa` sticky bar hidden
  at `≥ 900px`, scrollable nav strip under the header on small screens.
- Accessible: semantic landmarks, `aria-label`s on regions/toggles,
  `aria-labelledby` on sections, `:focus-visible` outline, `.sr-only`,
  `prefers-reduced-motion` respected in CSS and JS.
- Validation: i18n key parity across languages, `data-i18n` keys, `<use>` refs
  and local file links are all checked by `scripts/verify.mjs`.
