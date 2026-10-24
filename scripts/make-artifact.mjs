// Converte dist-artifact/index.html (JS e CSS già inline) nel frammento HTML pubblicabile come Artifact:
// niente doctype/html/head/body (li aggiunge la piattaforma), foto servite da artifact/img/ se presenti.
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";

const SRC = "dist-artifact/index.html";
const OUT_DIR = "artifact";
const OUT = `${OUT_DIR}/marianna-j.html`;

let html = readFileSync(SRC, "utf8");

const strip = (re) => {
  const hits = html.match(new RegExp(re.source, "gi")) ?? [];
  if (hits.length !== 1) throw new Error(`Atteso un solo match per ${re}, trovati ${hits.length}`);
  html = html.replace(re, "");
};
strip(/<!doctype html>/i);
strip(/<html[^>]*>/i);
strip(/<\/html>/i);
strip(/<head>/i);
strip(/<\/head>/i);
strip(/<body>/i);
strip(/<\/body>/i);
strip(/<meta charset="UTF-8" \/>/i);
strip(/<meta name="viewport"[^>]*\/>/i);

html = html.replace(/(<title>[^<]*<\/title>)/i, '$1\n    <meta name="claude:viewport-fit-sides" content="cover" />');

const imgDir = `${OUT_DIR}/img`;
const local = existsSync(imgDir) && readdirSync(imgDir).some((f) => f.endsWith(".jpg"));
if (local) {
  html = html.replace(/<script type="module"/i, "<script>window.__MJ_LOCAL_IMAGES__ = true;</script>\n    $&");
}

// Lo script del bundle va dopo #root: React monta su un nodo che esiste già.
const script = html.match(/<script type="module"[\s\S]*?<\/script>/i);
if (!script) throw new Error("Bundle JS non trovato");
html = html.replace(script[0], "");
html = `${html.trim()}\n    ${script[0]}\n`;

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT, html);
console.log(`${OUT} · ${(html.length / 1024).toFixed(0)} KB · foto ${local ? "locali (artifact/img)" : "da Unsplash"}`);
