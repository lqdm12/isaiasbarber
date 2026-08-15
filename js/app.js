/* ==========================================================================
   app.js — Entry point (ES module, loaded via type="module").
   Responsibilities:
     - data-i18n  → replace element text content
     - data-i18n-aria → replace element aria-label
     - data-wa    → refresh WhatsApp hrefs for the current language
     - <html lang> + aria-pressed on language toggle buttons
     - pause hero video under prefers-reduced-motion
     - inject current year into [data-year]
   Language state lives in memory only (no localStorage).
   ========================================================================== */

import { I18N, LANG_CODES, DEFAULT_LANG } from "./i18n.js";
import { buildWaLink } from "./config.js";

let lang = DEFAULT_LANG;

const t = (key) => I18N[lang][key] ?? key;

function applyLanguage() {
  document.documentElement.lang = lang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });

  document.querySelectorAll("[data-wa]").forEach((el) => {
    el.href = buildWaLink(lang);
  });

  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.lang === lang));
  });
}

function bindLanguageToggle() {
  document.querySelectorAll("[data-lang-btn]").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!LANG_CODES.includes(btn.dataset.lang)) return;
      lang = btn.dataset.lang;
      applyLanguage();
    });
  });
}

function bindVideoMotion() {
  const video = document.querySelector("[data-hero-video]");
  if (!video) return;

  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const sync = () => {
    if (mq.matches) {
      video.pause();
    } else if (video.paused) {
      video.play();
    }
  };

  sync();
  mq.addEventListener("change", sync);
}

function injectYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

applyLanguage();
bindLanguageToggle();
bindVideoMotion();
injectYear();
