#!/usr/bin/env node
/* ==========================================================================
   verify.mjs — Static sanity checks for the landing page.
   Run from barberia/:  node scripts/verify.mjs
   Checks: i18n key parity (es/pt), data-i18n keys exist in both languages,
   every <use href="#…"> resolves to a <symbol>, local file refs exist.
   ========================================================================== */

import { readFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

const html = read("index.html").replace(/<!--[\s\S]*?-->/g, "");
const i18nSrc = read("js/i18n.js");

let failures = 0;
const fail = (msg) => {
  failures++;
  console.error(`  ✗ ${msg}`);
};
const ok = (msg) => console.log(`  ✓ ${msg}`);

/* --- 1. i18n key parity -------------------------------------------------- */
function extractLang(code) {
  const start = i18nSrc.indexOf(`${code}: {`);
  if (start === -1) throw new Error(`Language block "${code}" not found`);
  const end = i18nSrc.indexOf("\n  },", start);
  const body = i18nSrc.slice(start, end);
  const keys = new Set();
  for (const m of body.matchAll(/"([^"]+)"\s*:/g)) keys.add(m[1]);
  return keys;
}

const esKeys = extractLang("es");
const ptKeys = extractLang("pt");

console.log("\n1) i18n key parity");
for (const k of esKeys) if (!ptKeys.has(k)) fail(`es key missing in pt: ${k}`);
for (const k of ptKeys) if (!esKeys.has(k)) fail(`pt key missing in es: ${k}`);
if (failures === 0) ok(`es/pt in sync (${esKeys.size} keys)`);

/* --- 2. data-i18n / data-i18n-aria keys exist in both languages ----------- */
const used = new Set();
for (const m of html.matchAll(/data-i18n(?:-aria)?="([^"]+)"/g)) used.add(m[1]);

console.log("\n2) data-i18n keys present in both languages");
for (const k of used) {
  if (!esKeys.has(k) || !ptKeys.has(k)) fail(`node references missing key: ${k}`);
}
if (used.size && failures === 0) ok(`${used.size} keys referenced in HTML, all present in es + pt`);

/* --- 3. <use href="#…"> resolves to a <symbol id="…"> ---------------------- */
const symbolIds = new Set();
for (const m of html.matchAll(/<symbol\s+id="([^"]+)"/g)) symbolIds.add(m[1]);
const useRefs = new Set();
for (const m of html.matchAll(/<use href="#([^"]+)"/g)) useRefs.add(m[1]);

console.log("\n3) <use> refs resolve to <symbol>");
for (const id of useRefs) if (!symbolIds.has(id)) fail(`<use> refs undefined symbol: #${id}`);
for (const id of symbolIds) if (!useRefs.has(id)) ok(`defined symbol: #${id} (unused, fine)`);
if (failures === 0) ok(`${useRefs.size} <use> refs all resolve`);

/* --- 4. local file references exist ---------------------------------------- */
console.log("\n4) local file refs exist");
// Optional asset: the hero falls back to its poster when the video is absent.
const EXPECTED_MISSING = new Set(["assets/video/hero.mp4"]);
const refs = new Set();
for (const m of html.matchAll(/(?:src|href|poster)="(?!https?:|#)([^"]+)"/g)) refs.add(m[1]);
for (const rel of refs) {
  if (EXPECTED_MISSING.has(rel)) {
    ok(`${rel} (optional — poster fallback)`);
  } else if (!existsSync(join(root, rel))) {
    fail(`missing file: ${rel}`);
  }
}
if (failures === 0) ok(`${refs.size} local refs found and present`);

console.log(failures === 0 ? "\nAll checks passed ✔" : `\n${failures} failure(s) ✘`);
process.exit(failures === 0 ? 0 : 1);
