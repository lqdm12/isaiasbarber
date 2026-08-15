/* ==========================================================================
   config.js — Site configuration. Replace PHONE with the real WhatsApp
   number (country code + number, no "+", spaces or dashes).
   ========================================================================== */

import { I18N, DEFAULT_LANG } from "./i18n.js";

export const PHONE = "5511999999999";

/**
 * Builds a WhatsApp deep link prefilled with a localized message.
 * @param {string} [lang=DEFAULT_LANG] language code from i18n.js
 * @returns {string} e.g. https://wa.me/5511999999999?text=Ol%C3%A1%21...
 */
export function buildWaLink(lang = DEFAULT_LANG) {
  const copy = I18N[lang] ?? I18N[DEFAULT_LANG];
  const text = copy["wa.message"] ?? I18N[DEFAULT_LANG]["wa.message"];
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`;
}
