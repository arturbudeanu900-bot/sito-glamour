// Illustrazioni dell'atelier Marianna J: capi in stile "ghost mannequin" su fondale da studio
// e figurini per hero e lookbook. Ogni scena è un SVG (texture di tessuto, luce, grana)
// renderizzato in JPEG con Playwright in public/img/.
//
//   NODE_PATH=$(npm root -g) node scripts/draw-images.cjs
//
// Stampa anche le coordinate (in % della foto) degli hotspot del lookbook.

const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const OUT = path.join(__dirname, "..", "public", "img");

/* ─────────────── utilità ─────────────── */

let n = 0;
const uid = (p) => `${p}${++n}`;

// Specchia un path in coordinate assolute (solo coppie x y) rispetto a x = 0.
const mirror = (d) => {
  let i = 0;
  return d.replace(/-?\d*\.?\d+/g, (v) => (i++ % 2 === 0 ? String(-parseFloat(v)) : v));
};

const stitch = (d, color = "#fff", op = 0.28, w = 0.8) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="${w}" stroke-dasharray="3 2.4" stroke-linecap="round"/>`;
const line = (d, color = "#000", op = 0.5, w = 1) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round"/>`;
const soft = (d, color = "#000", op = 0.4, w = 12, blur = "b6") =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="${w}" stroke-linecap="round" filter="url(#${blur})"/>`;

// Un pezzo di tessuto: base + texture + motivo + pieghe + volume ai bordi + ombreggiatura.
function piece(d, o) {
  const id = uid("c");
  const g = uid("g");
  const [x1, y1, x2, y2] = o.box ?? [-140, 80, 140, 320];
  return `
<linearGradient id="${g}" gradientUnits="userSpaceOnUse" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">
  <stop offset="0" stop-color="#fff" stop-opacity="${o.hi ?? 0.16}"/>
  <stop offset=".38" stop-color="#fff" stop-opacity="0"/>
  <stop offset=".6" stop-color="#000" stop-opacity="0"/>
  <stop offset="1" stop-color="#000" stop-opacity="${o.lo ?? 0.55}"/>
</linearGradient>
<clipPath id="${id}"><path d="${d}"/></clipPath>
<path d="${d}" fill="${o.fill}"${o.tex ? ` filter="url(#${o.tex})"` : ""}/>
<g clip-path="url(#${id})">
  ${o.pattern ? `<rect x="-400" y="-100" width="1400" height="1200" fill="url(#${o.pattern})" opacity="${o.patternOp ?? 1}"/>` : ""}
  ${(o.folds ?? []).map((f) => soft(f, "#000", o.foldOp ?? 0.42, o.foldW ?? 12)).join("")}
  ${(o.lights ?? []).map((f) => soft(f, "#fff", o.lightOp ?? 0.16, o.lightW ?? 9, "b5")).join("")}
  ${o.inner ?? ""}
  <rect x="-400" y="-100" width="1400" height="1200" fill="url(#${g})"/>
  <path d="${d}" fill="none" stroke="#000" stroke-opacity="${o.edgeOp ?? 0.5}" stroke-width="${o.edge ?? 16}" filter="url(#b8)"/>
</g>
<path d="${d}" fill="none" stroke="${o.stroke ?? "#000"}" stroke-opacity="${o.strokeOp ?? 0.4}" stroke-width=".9"/>
${o.over ?? ""}`;
}

const button = (x, y, r = 6, tone = "horn") => {
  const fill = tone === "pearl" ? "url(#g-pearl)" : tone === "gold" ? "url(#g-gold)" : "url(#g-horn)";
  const holes =
    tone === "gold"
      ? ""
      : [[-1, -1], [1, -1], [-1, 1], [1, 1]]
          .map(([a, b]) => `<circle cx="${x + a * r * 0.28}" cy="${y + b * r * 0.28}" r="${r * 0.11}" fill="#000" fill-opacity=".55"/>`)
          .join("");
  return `<circle cx="${x + 0.8}" cy="${y + 1.6}" r="${r}" fill="#000" fill-opacity=".45" filter="url(#b2)"/>
<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>
<circle cx="${x}" cy="${y}" r="${r * 0.72}" fill="none" stroke="#000" stroke-opacity=".3" stroke-width=".6"/>
${holes}
<ellipse cx="${x - r * 0.35}" cy="${y - r * 0.4}" rx="${r * 0.35}" ry="${r * 0.2}" fill="#fff" fill-opacity=".35"/>`;
};

/* ─────────────── definizioni comuni ─────────────── */

const texture = (id, freq, oct, scale, elev = 58, kd = 1.16, seed = 2) => `
<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="${oct}" seed="${seed}" result="t"/>
  <feDiffuseLighting in="t" surfaceScale="${scale}" diffuseConstant="${kd}" lighting-color="#fff" result="l"><feDistantLight azimuth="225" elevation="${elev}"/></feDiffuseLighting>
  <feComposite in="l" in2="SourceAlpha" operator="in" result="lt"/>
  <feBlend in="SourceGraphic" in2="lt" mode="multiply"/>
</filter>`;

const DEFS = `
${[2, 3, 5, 6, 8, 14, 24, 40].map((s) => `<filter id="b${s}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${s}"/></filter>`).join("")}
${texture("t-wool", "2.4", 2, 0.75, 62, 1.12)}
${texture("t-flannel", "1.9", 3, 0.8, 62, 1.12)}
${texture("t-knit", "0.7 3.2", 2, 0.9, 60, 1.14)}
${texture("t-fine", "3", 1, 0.4, 66, 1.08)}
${texture("t-leather", "0.9", 3, 0.5, 66, 1.08, 7)}
${texture("t-denim", "2.6 0.7", 2, 0.9, 60, 1.14, 5)}
<filter id="silhouette" x="-20%" y="-20%" width="140%" height="140%"><feColorMatrix type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0"/><feGaussianBlur stdDeviation="14"/></filter>
<filter id="dim"><feComponentTransfer><feFuncR type="linear" slope=".62"/><feFuncG type="linear" slope=".62"/><feFuncB type="linear" slope=".62"/></feComponentTransfer></filter>
<filter id="grain" x="0" y="0" width="100%" height="100%">
  <feTurbulence type="fractalNoise" baseFrequency="0.95" numOctaves="2" seed="9" stitchTiles="stitch"/>
  <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .1 0"/>
</filter>
<pattern id="p-herring" width="12" height="6" patternUnits="userSpaceOnUse">
  <path d="M0 6 L6 0 M0 3 L3 0 M3 6 L6 3 M6 0 L12 6 M9 0 L12 3 M6 3 L9 6" stroke="#fff" stroke-opacity=".1" stroke-width=".9" fill="none"/>
  <path d="M6 0 L6 6" stroke="#000" stroke-opacity=".12" stroke-width=".6"/>
</pattern>
<pattern id="p-pin" width="9" height="20" patternUnits="userSpaceOnUse"><rect x="0" width=".75" height="20" fill="#E8E4DC" fill-opacity=".42"/></pattern>
<pattern id="p-twill" width="4" height="4" patternUnits="userSpaceOnUse"><path d="M0 4 L4 0 M-1 1 L1 -1 M3 5 L5 3" stroke="#fff" stroke-opacity=".1" stroke-width=".8"/></pattern>
<pattern id="p-rib" width="4.2" height="10" patternUnits="userSpaceOnUse"><rect width="2.1" height="10" fill="#000" fill-opacity=".28"/><rect x="2.3" width=".8" height="10" fill="#fff" fill-opacity=".08"/></pattern>
<pattern id="p-ribh" width="10" height="4.2" patternUnits="userSpaceOnUse"><rect width="10" height="2.1" fill="#000" fill-opacity=".28"/><rect y="2.3" width="10" height=".8" fill="#fff" fill-opacity=".08"/></pattern>
<pattern id="p-denim" width="3.2" height="3.2" patternUnits="userSpaceOnUse"><path d="M0 3.2 L3.2 0 M-.8 .8 L.8 -.8 M2.4 4 L4 2.4" stroke="#C9D6F0" stroke-opacity=".16" stroke-width=".7"/></pattern>
<radialGradient id="g-horn" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#7A5536"/><stop offset=".6" stop-color="#3B2617"/><stop offset="1" stop-color="#1E130B"/></radialGradient>
<radialGradient id="g-pearl" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#FBF7EE"/><stop offset=".6" stop-color="#D9D2C4"/><stop offset="1" stop-color="#A8A196"/></radialGradient>
<radialGradient id="g-gold" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#F6E3A8"/><stop offset=".45" stop-color="#C79A45"/><stop offset="1" stop-color="#6E4E1C"/></radialGradient>
<linearGradient id="g-goldbar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3DD9C"/><stop offset=".5" stop-color="#B98A3A"/><stop offset="1" stop-color="#6A4A1A"/></linearGradient>
<linearGradient id="g-skin" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#E2BC9F"/><stop offset=".55" stop-color="#C99A7B"/><stop offset="1" stop-color="#8E6650"/></linearGradient>
<linearGradient id="g-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3A2A22"/><stop offset=".5" stop-color="#1A1310"/><stop offset="1" stop-color="#0B0807"/></linearGradient>
`;

/* ─────────────── scene ─────────────── */

function studio(W, H, { lx = 0.42, ly = 0.34, floor = null, window: win = null, tint = "#3A3530" } = {}) {
  const wall = uid("w");
  const fl = uid("f");
  const r = Math.max(W, H) * 0.75;
  return `
<radialGradient id="${wall}" gradientUnits="userSpaceOnUse" cx="${W * lx}" cy="${H * ly}" r="${r}">
  <stop offset="0" stop-color="${tint}"/><stop offset=".45" stop-color="#1A1816"/><stop offset="1" stop-color="#090909"/>
</radialGradient>
<rect width="${W}" height="${H}" fill="url(#${wall})"/>
${
  win
    ? `<g opacity=".9" filter="url(#b24)" transform="${win.t}">
        <path d="M0 ${win.h} L0 ${win.w / 2} C0 0 ${win.w} 0 ${win.w} ${win.w / 2} L${win.w} ${win.h} Z" fill="#FFF3E0" fill-opacity=".09"/>
        <path d="M${win.w / 2} 0 L${win.w / 2} ${win.h} M0 ${win.h * 0.45} L${win.w} ${win.h * 0.45} M0 ${win.h * 0.72} L${win.w} ${win.h * 0.72}" stroke="#090909" stroke-opacity=".5" stroke-width="${win.w * 0.05}"/>
      </g>`
    : ""
}
${
  floor
    ? `<linearGradient id="${fl}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1F1C1A"/><stop offset="1" stop-color="#0C0B0A"/></linearGradient>
       <rect y="${floor}" width="${W}" height="${H - floor}" fill="url(#${fl})"/>
       <rect y="${floor - 30}" width="${W}" height="60" fill="#000" fill-opacity=".25" filter="url(#b24)"/>`
    : ""
}`;
}

function finish(W, H) {
  const v = uid("v");
  return `
<radialGradient id="${v}" cx=".5" cy=".45" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></radialGradient>
<rect width="${W}" height="${H}" fill="url(#${v})"/>
<rect width="${W}" height="${H}" filter="url(#grain)" opacity=".9"/>`;
}

const svg = (W, H, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${DEFS}</defs>${body}</svg>`;

// Posiziona un capo in coordinate "corpo" (x centrato su 0, y 0 = testa, 900 = pavimento) nel riquadro 600×800.
function ghost(content, [y0, y1], hw, maxS = 1.55) {
  const s = Math.min(660 / (y1 - y0), 236 / hw, maxS);
  const ty = 400 - (s * (y0 + y1)) / 2;
  return `<g transform="translate(300 ${ty.toFixed(1)}) scale(${s.toFixed(3)})">
  <g filter="url(#silhouette)" opacity=".6" transform="translate(14 22)">${content}</g>
  ${content}
</g>`;
}

/* ─────────────── capi (coordinate corpo) ─────────────── */

const SLEEVE_COAT = "M -92 148 C -104 180 -110 240 -110 300 C -110 360 -112 410 -114 452 L -84 458 C -82 400 -80 330 -78 280 C -76 250 -74 228 -70 214 C -76 190 -84 165 -92 148 Z";

function sleeve(d, fill, o = {}) {
  const right = (o.box ?? [-130])[0] > 0;
  const inner = right ? mirror("M -72 220 C -76 280 -80 360 -84 456") : "M -72 220 C -76 280 -80 360 -84 456";
  return (
    soft(inner, "#000", 0.55, 7, "b3") +
    piece(d, {
      fill,
      tex: o.tex,
      pattern: o.pattern,
      box: o.box ?? [-130, 150, -70, 260],
      folds: o.folds ?? ["M -110 300 C -102 306 -92 306 -84 302"],
      foldOp: 0.2,
      foldW: 6,
      lights: o.lights ?? ["M -104 200 C -106 260 -106 330 -108 430", "M -110 290 C -100 296 -92 296 -84 292"],
      hi: 0.14,
      lo: o.lo ?? 0.32,
      edge: 10,
      edgeOp: 0.4,
    }) + (o.over ?? "")
  );
}

function coat({ inside = true } = {}) {
  const C = "#A47C57";
  const panel =
    "M -30 130 C -52 136 -76 140 -92 148 C -96 190 -90 240 -84 300 C -82 360 -92 460 -100 560 C -106 620 -110 670 -112 702 C -86 708 -56 708 -32 704 C -28 560 -22 420 -18 300 C -16 230 -15 180 -14 150 C -18 142 -24 135 -30 130 Z";
  const lining =
    "M -14 150 C -15 180 -16 230 -18 300 C -22 420 -28 560 -32 704 L 32 704 C 28 560 22 420 18 300 C 16 230 15 180 14 150 C 8 140 -8 140 -14 150 Z";
  const lapel =
    "M -26 132 C -38 150 -50 166 -60 176 L -52 182 L -56 190 C -42 228 -28 268 -19 300 C -18 240 -17 190 -16 146 C -18 140 -22 136 -26 132 Z";
  const collar = "M -30 130 C -18 121 18 121 30 130 L 26 141 C 12 134 -12 134 -26 141 Z";
  const pocket = "M -90 486 L -52 482 L -51 497 L -89 502 Z";
  const opt = (side) => ({
    fill: C,
    tex: "t-wool",
    pattern: "p-herring",
    box: side < 0 ? [-120, 160, 10, 420] : [-10, 160, 120, 420],
    hi: side < 0 ? 0.2 : 0.06,
    lo: side < 0 ? 0.35 : 0.6,
    folds: side < 0 ? ["M -72 380 C -76 500 -86 600 -94 700", "M -40 520 C -42 600 -44 660 -46 704"] : [mirror("M -72 380 C -76 500 -86 600 -94 700"), mirror("M -40 520 C -42 600 -44 660 -46 704")],
    lights: side < 0 ? ["M -54 420 C -56 520 -60 620 -64 700"] : [mirror("M -54 420 C -56 520 -60 620 -64 700")],
    over: side < 0 ? stitch("M -110 690 C -86 696 -56 696 -34 692", "#000", 0.3) : stitch(mirror("M -110 690 C -86 696 -56 696 -34 692"), "#000", 0.3),
  });
  const lapelPiece = (d, side) =>
    piece(d, { fill: "#B08865", tex: "t-wool", pattern: "p-herring", box: side < 0 ? [-70, 140, -10, 260] : [10, 140, 70, 260], hi: 0.22, lo: 0.25, edge: 8, edgeOp: 0.35 }) +
    soft(side < 0 ? "M -58 186 C -44 228 -30 268 -20 300" : mirror("M -58 186 C -44 228 -30 268 -20 300"), "#000", 0.45, 6, "b3") +
    line(side < 0 ? "M -56 182 L -48 177" : mirror("M -56 182 L -48 177"), "#000", 0.55, 1.2);
  return {
    lining: inside
      ? piece(lining, { fill: "#4A3424", tex: "t-fine", box: [-30, 140, 30, 700], hi: 0, lo: 0.2, edge: 22, edgeOp: 0.7 }) +
        `<ellipse cx="0" cy="140" rx="15" ry="7" fill="#1A120C"/>`
      : "",
    body:
      piece(panel, opt(-1)) +
      piece(mirror(panel), opt(1)) +
      piece(collar, { fill: "#9C7552", tex: "t-wool", box: [-30, 120, 30, 140], hi: 0.1, lo: 0.4, edge: 6 }) +
      lapelPiece(lapel, -1) +
      lapelPiece(mirror(lapel), 1) +
      piece(pocket, { fill: "#A98260", tex: "t-wool", pattern: "p-herring", box: [-90, 480, -50, 500], hi: 0.15, lo: 0.3, edge: 4 }) +
      soft("M -90 504 L -51 499", "#000", 0.5, 4, "b2") +
      piece(mirror(pocket), { fill: "#A07A57", tex: "t-wool", pattern: "p-herring", box: [50, 480, 90, 500], hi: 0.05, lo: 0.4, edge: 4 }) +
      soft(mirror("M -90 504 L -51 499"), "#000", 0.5, 4, "b2") +
      button(30, 332, 6.5) +
      button(34, 432, 6.5) +
      button(38, 532, 6.5),
    sleeves:
      sleeve(SLEEVE_COAT, C, { tex: "t-wool", pattern: "p-herring", over: stitch("M -113 436 L -84 441", "#000", 0.35) }) +
      sleeve(mirror(SLEEVE_COAT), C, {
        tex: "t-wool",
        pattern: "p-herring",
        box: [70, 150, 130, 260],
        lo: 0.42,
        folds: [mirror("M -110 300 C -102 306 -92 306 -84 302")],
        lights: [mirror("M -104 200 C -106 260 -106 330 -108 430")],
        over: stitch(mirror("M -113 436 L -84 441"), "#000", 0.35),
      }),
  };
}

function turtleneck({ full = true } = {}) {
  const K = "#2A2A2A";
  const collar = "M -21 94 C -12 90 12 90 21 94 L 23 141 C 10 147 -10 147 -23 141 Z";
  const body =
    "M -22 136 C -45 140 -66 142 -80 150 C -84 200 -80 260 -74 300 C -72 360 -74 400 -76 432 C -40 438 40 438 76 432 C 74 400 72 360 74 300 C 80 260 84 200 80 150 C 66 142 45 140 22 136 C 10 142 -10 142 -22 136 Z";
  const sl = "M -80 150 C -90 190 -96 250 -98 310 C -100 370 -102 420 -102 452 L -80 456 C -79 410 -78 350 -76 300 C -74 260 -72 230 -68 210 C -72 185 -76 165 -80 150 Z";
  const knit = { tex: "t-knit", pattern: "p-rib", hi: 0.22, lo: 0.6, lightOp: 0.1 };
  const bodyP = piece(body, {
    fill: K,
    ...knit,
    box: [-90, 150, 90, 300],
    folds: ["M -40 250 C -30 300 -24 360 -20 420", "M 46 260 C 40 320 36 380 34 424"],
    lights: ["M -56 180 C -60 260 -58 340 -60 420", "M 10 170 C 12 260 8 340 6 420"],
    inner: `<rect x="-90" y="410" width="180" height="30" fill="url(#p-ribh)" opacity=".9"/>`,
  });
  const collarP =
    piece(collar, { fill: "#262626", ...knit, box: [-24, 90, 24, 140], edge: 8 }) +
    soft("M -21 118 C -10 122 10 122 21 118", "#000", 0.6, 4, "b2") +
    soft("M -21 112 C -10 116 10 116 21 112", "#fff", 0.1, 3, "b2");
  const sleeves =
    piece(sl, { fill: K, ...knit, box: [-110, 150, -70, 260], folds: ["M -98 300 C -92 306 -84 306 -78 300"], lights: ["M -92 190 C -96 270 -98 360 -100 440"], edge: 10 }) +
    piece(mirror(sl), { fill: K, ...knit, box: [70, 150, 110, 260], lo: 0.7, folds: [mirror("M -98 300 C -92 306 -84 306 -78 300")], lights: [mirror("M -92 190 C -96 270 -98 360 -100 440")], edge: 10 }) +
    `<rect x="-104" y="432" width="26" height="24" fill="url(#p-ribh)" opacity=".7"/><rect x="78" y="432" width="26" height="24" fill="url(#p-ribh)" opacity=".7"/>`;
  return full ? sleeves + bodyP + collarP : bodyP + collarP;
}

function palazzo() {
  const G = "#7A7773";
  const band = "M -60 368 C -20 364 20 364 60 368 L 61 392 C 20 388 -20 388 -61 392 Z";
  const legs =
    "M -61 390 C -20 386 20 386 61 390 C 72 420 82 460 88 520 C 96 640 106 780 114 892 C 80 898 40 898 6 894 C 4 760 3 640 1 540 L -1 540 C -3 640 -4 760 -6 894 C -40 898 -80 898 -114 892 C -106 780 -96 640 -88 520 C -82 460 -72 420 -61 390 Z";
  const crease = (s) => (s < 0 ? "M -50 520 C -54 640 -58 760 -60 892" : mirror("M -50 520 C -54 640 -58 760 -60 892"));
  return (
    piece(legs, {
      fill: G,
      tex: "t-flannel",
      box: [-120, 420, 120, 700],
      hi: 0.18,
      lo: 0.55,
      folds: [
        "M 0 520 C 0 640 0 760 0 894",
        "M -30 392 C -32 440 -36 500 -40 560",
        mirror("M -30 392 C -32 440 -36 500 -40 560"),
        "M -96 760 C -86 820 -78 860 -74 892",
        mirror("M -96 760 C -86 820 -78 860 -74 892"),
        "M -24 700 C -22 780 -20 840 -18 892",
        mirror("M -24 700 C -22 780 -20 840 -18 892"),
      ],
      lights: [crease(-1), crease(1), "M -70 560 C -76 680 -84 800 -90 892"],
      lightOp: 0.2,
      inner: line("M 0 540 L 0 894", "#000", 0.55, 1.4) + line("M -46 394 C -47 420 -48 450 -50 480", "#000", 0.35) + line(mirror("M -46 394 C -47 420 -48 450 -50 480"), "#000", 0.35),
    }) +
    piece(band, { fill: "#77746F", tex: "t-flannel", box: [-60, 364, 60, 392], hi: 0.12, lo: 0.4, edge: 5 }) +
    stitch("M 3 393 C 4 430 6 460 8 492", "#000", 0.35) +
    [-42, -18, 22, 44].map((x) => `<rect x="${x - 2.5}" y="364" width="5" height="28" rx="1" fill="#6E6B67" stroke="#000" stroke-opacity=".3" stroke-width=".6"/>`).join("") +
    button(-4, 379, 3.6, "horn")
  );
}

function cigarette() {
  const B = "#1C1C1D";
  const band = "M -58 368 C -20 364 20 364 58 368 L 59 392 C 20 388 -20 388 -59 392 Z";
  const legs =
    "M -59 390 C -20 386 20 386 59 390 C 66 420 72 460 72 500 C 70 600 62 720 58 858 L 18 860 C 15 760 10 640 4 540 L -4 540 C -10 640 -15 760 -18 860 L -58 858 C -62 720 -70 600 -72 500 C -72 460 -66 420 -59 390 Z";
  return (
    piece(legs, {
      fill: B,
      tex: "t-fine",
      pattern: "p-twill",
      box: [-80, 420, 80, 640],
      hi: 0.2,
      lo: 0.6,
      folds: ["M 0 540 L 0 860", "M -28 392 C -30 430 -32 470 -34 500", mirror("M -28 392 C -30 430 -32 470 -34 500"), "M -54 800 C -48 820 -40 840 -34 858"],
      lights: ["M -38 470 C -38 600 -38 740 -38 858", mirror("M -38 470 C -38 600 -38 740 -38 858")],
      lightOp: 0.22,
      inner: line("M 0 540 L 0 860", "#000", 0.8, 1.6) + line("M -50 393 C -56 410 -62 430 -66 448", "#fff", 0.18, 1) + line(mirror("M -50 393 C -56 410 -62 430 -66 448"), "#fff", 0.18, 1),
    }) +
    piece(band, { fill: "#202021", tex: "t-fine", box: [-60, 364, 60, 392], hi: 0.18, lo: 0.4, edge: 5 }) +
    stitch("M 3 393 C 4 430 6 460 8 490", "#fff", 0.18) +
    button(-4, 379, 3.6, "horn")
  );
}

function jeans() {
  const D = "#2E3D5C";
  const band = "M -60 368 C -20 364 20 364 60 368 L 61 390 C 20 386 -20 386 -61 390 Z";
  const legs =
    "M -61 388 C -20 384 20 384 61 388 C 72 420 80 460 86 520 C 94 640 102 780 108 892 C 78 898 40 898 6 894 C 4 760 3 640 1 540 L -1 540 C -3 640 -4 760 -6 894 C -40 898 -78 898 -108 892 C -102 780 -94 640 -86 520 C -80 460 -72 420 -61 388 Z";
  const ts = "#B8925A";
  return (
    piece(legs, {
      fill: D,
      tex: "t-denim",
      pattern: "p-denim",
      box: [-110, 420, 110, 700],
      hi: 0.22,
      lo: 0.55,
      folds: ["M 0 520 C 0 640 0 760 0 894", "M -92 780 C -84 830 -76 866 -72 892", mirror("M -92 780 C -84 830 -76 866 -72 892")],
      lights: [
        "M -60 470 C -62 520 -64 560 -66 600",
        mirror("M -60 470 C -62 520 -64 560 -66 600"),
        "M -24 500 C -34 506 -44 508 -54 506",
        "M -20 520 C -30 528 -42 532 -52 530",
        mirror("M -24 500 C -34 506 -44 508 -54 506"),
        mirror("M -20 520 C -30 528 -42 532 -52 530"),
        "M -50 640 C -54 740 -58 820 -60 892",
        mirror("M -50 640 C -54 740 -58 820 -60 892"),
      ],
      lightOp: 0.22,
      lightW: 7,
      inner:
        line("M 0 540 L 0 894", "#000", 0.6, 1.4) +
        stitch("M -58 392 C -54 420 -40 432 -22 434", ts, 0.65) +
        stitch(mirror("M -58 392 C -54 420 -40 432 -22 434"), ts, 0.65) +
        stitch("M 4 391 C 6 430 8 464 10 494", ts, 0.65) +
        stitch("M 12 392 C 14 430 16 458 18 486", ts, 0.65) +
        stitch("M 30 404 L 44 402 L 45 420 L 31 422 Z", ts, 0.55) +
        stitch("M -100 880 C -70 886 -36 886 -8 884", ts, 0.55) +
        stitch(mirror("M -100 880 C -70 886 -36 886 -8 884"), ts, 0.55),
    }) +
    piece(band, { fill: "#33425F", tex: "t-denim", pattern: "p-denim", box: [-60, 364, 60, 390], hi: 0.15, lo: 0.4, edge: 5 }) +
    stitch("M -60 372 C -20 368 20 368 60 372", ts, 0.6) +
    stitch("M -60 386 C -20 382 20 382 60 386", ts, 0.6) +
    [-46, -20, 24, 48].map((x) => `<rect x="${x - 2.5}" y="363" width="5" height="27" rx="1" fill="#34445F" stroke="${ts}" stroke-opacity=".5" stroke-width=".6"/>`).join("") +
    button(-3, 377, 4.4, "gold") +
    [[-56, 394], [56, 394], [-22, 432], [22, 432]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.8" fill="url(#g-gold)"/>`).join("")
  );
}

function blazer() {
  const A = "#34363B";
  const body =
    "M -30 130 C -55 136 -80 140 -98 146 C -100 200 -92 250 -86 290 C -80 330 -76 350 -78 380 C -80 410 -84 430 -86 448 C -40 458 40 458 86 448 C 84 430 80 410 78 380 C 76 350 80 330 86 290 C 92 250 100 200 98 146 C 80 140 55 136 30 130 C 20 126 -20 126 -30 130 Z";
  const lapel = "M -16 138 C -26 140 -38 140 -46 142 L -76 158 L -62 178 C -42 220 -16 268 4 298 C -6 250 -12 190 -16 138 Z";
  const lapelR = "M 18 138 C 28 140 40 140 48 142 L 78 158 L 64 178 C 44 222 22 268 4 298 C 10 250 14 190 18 138 Z";
  const collar = "M -30 130 C -10 123 10 123 30 130 L 18 140 C 6 136 -6 136 -16 140 Z";
  const sl = "M -98 146 C -108 180 -112 240 -112 300 C -112 360 -112 410 -112 452 L -84 456 C -82 400 -80 330 -78 280 C -76 250 -74 228 -70 214 C -78 190 -88 165 -98 146 Z";
  const flap = "M -82 402 L -40 398 L -40 414 L -82 419 Z";
  const lap = (d, side) =>
    piece(d, { fill: "#3A3C42", tex: "t-fine", pattern: "p-pin", patternOp: 0.85, box: side < 0 ? [-80, 140, -10, 260] : [10, 140, 80, 260], hi: 0.2, lo: 0.3, edge: 7, edgeOp: 0.4 }) +
    soft(side < 0 ? "M -62 180 C -42 222 -16 268 4 298" : "M 64 180 C 44 222 22 268 4 298", "#000", 0.55, 6, "b3") +
    line(side < 0 ? "M -46 142 L -60 160" : "M 48 142 L 62 160", "#000", 0.5, 1);
  return {
    body:
      piece(body, {
        fill: A,
        tex: "t-fine",
        pattern: "p-pin",
        box: [-110, 150, 110, 380],
        hi: 0.18,
        lo: 0.6,
        folds: ["M -60 300 C -58 340 -60 380 -66 440", "M 56 300 C 54 340 56 380 62 440", "M 4 298 C 8 350 12 400 14 452"],
        lights: ["M -78 170 C -74 220 -70 260 -66 300", "M -30 320 C -30 370 -32 410 -34 446"],
        inner: line("M 4 298 C 8 350 12 400 14 452", "#000", 0.8, 1.3),
      }) +
      piece(flap, { fill: "#383A40", tex: "t-fine", pattern: "p-pin", box: [-82, 398, -40, 418], hi: 0.12, lo: 0.3, edge: 4 }) +
      soft("M -82 421 L -40 416", "#000", 0.55, 4, "b2") +
      piece(mirror(flap), { fill: "#33353A", tex: "t-fine", pattern: "p-pin", box: [40, 398, 82, 418], hi: 0.05, lo: 0.45, edge: 4 }) +
      soft(mirror("M -82 421 L -40 416"), "#000", 0.55, 4, "b2") +
      line("M 40 224 L 68 220", "#000", 0.6, 1.2) +
      line("M 40 226 L 68 222", "#fff", 0.12, 1),
    vee: "M -16 138 C -12 190 -4 250 4 298 C 10 250 16 190 18 138 C 8 134 -8 134 -16 138 Z",
    lapels: piece(collar, { fill: "#2F3135", tex: "t-fine", box: [-30, 122, 30, 140], hi: 0.08, lo: 0.4, edge: 5 }) + lap(lapel, -1) + lap(lapelR, 1),
    buttons: [320, 368, 416].map((y) => button(-20, y, 6) + button(30, y, 6)).join(""),
    sleeves:
      sleeve(sl, A, { tex: "t-fine", pattern: "p-pin", lights: ["M -106 200 C -108 260 -108 330 -110 430"] }) +
      sleeve(mirror(sl), A, { tex: "t-fine", pattern: "p-pin", box: [70, 150, 130, 260], lo: 0.45, folds: [mirror("M -110 300 C -102 306 -92 306 -84 302")], lights: [mirror("M -106 200 C -108 260 -108 330 -110 430")] }) +
      [432, 440].map((y) => button(-104, y, 2.6) + button(104, y, 2.6)).join(""),
  };
}

function blouseVee(vee) {
  return piece(vee, {
    fill: "#E8DECB",
    tex: "t-fine",
    box: [-20, 140, 20, 300],
    hi: 0.2,
    lo: 0.35,
    edge: 10,
    edgeOp: 0.45,
    lights: ["M -6 160 C -4 210 0 250 4 290"],
    lightOp: 0.4,
  });
}

function bow(cx = 2, cy = 148, k = 1) {
  const S = (d) => d.replace(/-?\d*\.?\d+/g, (v) => v);
  const loopL = `M ${cx} ${cy} C ${cx - 10 * k} ${cy - 14 * k} ${cx - 30 * k} ${cy - 12 * k} ${cx - 30 * k} ${cy + 2 * k} C ${cx - 28 * k} ${cy + 12 * k} ${cx - 10 * k} ${cy + 8 * k} ${cx} ${cy} Z`;
  const loopR = `M ${cx} ${cy} C ${cx + 10 * k} ${cy - 14 * k} ${cx + 30 * k} ${cy - 10 * k} ${cx + 32 * k} ${cy + 3 * k} C ${cx + 30 * k} ${cy + 13 * k} ${cx + 10 * k} ${cy + 8 * k} ${cx} ${cy} Z`;
  const tailL = `M ${cx - 3 * k} ${cy + 2 * k} C ${cx - 10 * k} ${cy + 34 * k} ${cx - 18 * k} ${cy + 64 * k} ${cx - 22 * k} ${cy + 92 * k} L ${cx - 10 * k} ${cy + 96 * k} C ${cx - 6 * k} ${cy + 66 * k} ${cx - 2 * k} ${cy + 36 * k} ${cx + 1 * k} ${cy + 4 * k} Z`;
  const tailR = `M ${cx + 2 * k} ${cy + 2 * k} C ${cx + 6 * k} ${cy + 40 * k} ${cx + 12 * k} ${cy + 76 * k} ${cx + 18 * k} ${cy + 108 * k} L ${cx + 28 * k} ${cy + 104 * k} C ${cx + 20 * k} ${cy + 74 * k} ${cx + 12 * k} ${cy + 38 * k} ${cx + 5 * k} ${cy + 2 * k} Z`;
  const silk = (d, box) => piece(S(d), { fill: "#ECE2CF", tex: "t-fine", box, hi: 0.3, lo: 0.4, edge: 5, edgeOp: 0.35 });
  return (
    silk(tailL, [cx - 24 * k, cy, cx, cy + 90 * k]) +
    silk(tailR, [cx, cy, cx + 30 * k, cy + 100 * k]) +
    silk(loopL, [cx - 32 * k, cy - 12 * k, cx, cy + 10 * k]) +
    silk(loopR, [cx, cy - 12 * k, cx + 32 * k, cy + 10 * k]) +
    `<ellipse cx="${cx}" cy="${cy + 1 * k}" rx="${6 * k}" ry="${7 * k}" fill="#E4D9C5" stroke="#000" stroke-opacity=".3" stroke-width=".8"/>` +
    soft(`M ${cx - 4 * k} ${cy - 4 * k} L ${cx - 2 * k} ${cy + 6 * k}`, "#000", 0.35, 2, "b2")
  );
}

function blouse() {
  const I = "#E9DFCC";
  const body =
    "M -24 132 C -46 138 -70 142 -86 152 C -90 220 -86 300 -84 360 C -84 400 -86 430 -88 452 C -60 470 -20 462 0 456 C 20 462 60 470 88 452 C 86 430 84 400 84 360 C 86 300 90 220 86 152 C 70 142 46 138 24 132 C 12 138 -12 138 -24 132 Z";
  const sl = "M -86 152 C -104 200 -118 280 -120 360 C -120 400 -116 420 -110 432 L -88 436 C -86 410 -84 380 -82 340 C -80 280 -78 240 -72 214 C -76 190 -80 170 -86 152 Z";
  const cuff = "M -112 430 L -88 434 L -89 460 L -112 457 Z";
  const silkO = { fill: I, tex: "t-fine", hi: 0.28, lo: 0.42, lightOp: 0.45, lightW: 10, foldOp: 0.25 };
  return (
    piece(sl, { ...silkO, box: [-120, 150, -80, 300], folds: ["M -116 330 C -108 360 -100 380 -92 420", "M -110 250 C -104 300 -98 340 -90 400"], lights: ["M -104 200 C -112 260 -114 330 -112 400"] }) +
    piece(mirror(sl), { ...silkO, box: [80, 150, 120, 300], lo: 0.55, folds: [mirror("M -116 330 C -108 360 -100 380 -92 420"), mirror("M -110 250 C -104 300 -98 340 -90 400")], lights: [mirror("M -104 200 C -112 260 -114 330 -112 400")] }) +
    piece(cuff, { ...silkO, box: [-112, 430, -88, 460], edge: 4 }) +
    piece(mirror(cuff), { ...silkO, box: [88, 430, 112, 460], lo: 0.5, edge: 4 }) +
    [438, 446, 454].map((y) => button(-100, y, 1.8, "pearl") + button(100, y, 1.8, "pearl")).join("") +
    piece(body, {
      ...silkO,
      box: [-100, 150, 100, 400],
      folds: ["M -54 230 C -48 300 -50 380 -56 450", "M 40 240 C 46 320 44 390 40 452", "M -20 300 C -16 360 -14 410 -12 456", "M 20 330 C 22 380 22 420 22 458"],
      lights: ["M -70 190 C -64 260 -66 340 -70 440", "M -36 240 C -32 320 -32 400 -34 456", "M 6 220 C 8 300 8 380 6 450"],
      inner: line("M 0 160 L 0 456", "#000", 0.25, 1) + line("M 6 160 L 6 456", "#000", 0.12, 0.8),
    }) +
    [190, 240, 290, 340, 390, 432].map((y) => button(3, y, 2.4, "pearl")).join("") +
    piece("M -24 132 C -12 138 12 138 24 132 L 22 144 C 10 150 -10 150 -22 144 Z", { ...silkO, box: [-24, 130, 24, 148], edge: 4 }) +
    bow(2, 146, 1)
  );
}

function cardigan() {
  const P = "#B3AFA8";
  const body =
    "M -26 134 C -48 140 -68 144 -84 152 C -88 210 -84 270 -80 320 C -78 370 -80 410 -82 440 C -40 446 40 446 82 440 C 80 410 78 370 80 320 C 84 270 88 210 84 152 C 68 144 48 140 26 134 C 18 132 -18 132 -26 134 Z";
  const vee = "M -24 136 C -16 190 -8 250 0 300 C 8 250 16 190 24 136 C 10 144 -10 144 -24 136 Z";
  const sl = "M -84 152 C -96 196 -104 260 -106 320 C -108 380 -108 420 -106 454 L -82 456 C -80 410 -80 350 -78 300 C -76 260 -74 230 -70 212 C -74 188 -78 168 -84 152 Z";
  const knit = { fill: P, tex: "t-knit", pattern: "p-rib", patternOp: 0.7, hi: 0.2, lo: 0.55 };
  return (
    piece(sl, { ...knit, box: [-110, 150, -70, 260], folds: ["M -104 310 C -96 318 -88 318 -80 312"], lights: ["M -96 200 C -100 280 -102 360 -104 440"], edge: 10 }) +
    piece(mirror(sl), { ...knit, box: [70, 150, 110, 260], lo: 0.65, folds: [mirror("M -104 310 C -96 318 -88 318 -80 312")], lights: [mirror("M -96 200 C -100 280 -102 360 -104 440")], edge: 10 }) +
    `<rect x="-108" y="432" width="27" height="24" fill="url(#p-ribh)" opacity=".8"/><rect x="81" y="432" width="27" height="24" fill="url(#p-ribh)" opacity=".8"/>` +
    piece(body, {
      ...knit,
      box: [-90, 150, 90, 300],
      folds: ["M -40 260 C -34 320 -30 380 -28 438", "M 44 270 C 40 330 38 390 36 438"],
      lights: ["M -60 180 C -62 260 -60 340 -62 432", "M 22 200 C 24 280 22 360 20 432"],
      lightOp: 0.14,
      inner: `<rect x="-90" y="416" width="180" height="26" fill="url(#p-ribh)" opacity=".85"/>`,
    }) +
    piece(vee, { fill: "#2A2724", tex: "t-fine", box: [-24, 136, 24, 300], hi: 0, lo: 0.3, edge: 14, edgeOp: 0.7 }) +
    `<path d="M -24 136 C -16 190 -8 250 0 300 L 0 442" fill="none" stroke="${P}" stroke-width="9"/>` +
    `<path d="M 24 136 C 16 190 8 250 0 300 L 0 442" fill="none" stroke="#BDB9B2" stroke-width="9"/>` +
    `<path d="M -24 136 C -16 190 -8 250 0 300 L 0 442 M 24 136 C 16 190 8 250 0 300" fill="none" stroke="url(#p-rib)" stroke-width="9" opacity=".6"/>` +
    soft("M 4 300 L 4 442", "#000", 0.35, 3, "b2") +
    [314, 346, 378, 410, 436].map((y) => button(0, y, 3.4, "pearl")).join("")
  );
}

function trench() {
  const T = "#BCA580";
  const body =
    "M -30 128 C -55 134 -80 140 -96 148 C -98 200 -90 260 -84 310 C -82 330 -80 345 -80 360 C -86 450 -100 580 -112 690 C -40 698 40 698 112 690 C 100 580 86 450 80 360 C 80 345 82 330 84 310 C 90 260 98 200 96 148 C 80 140 55 134 30 128 C 20 124 -20 124 -30 128 Z";
  const vee = "M -16 136 C -12 170 -6 210 4 250 C 12 210 16 170 18 136 C 8 132 -8 132 -16 136 Z";
  const lapel = "M -16 136 C -28 140 -40 142 -50 146 L -64 172 L -54 178 C -36 206 -14 232 4 250 C -6 210 -12 170 -16 136 Z";
  const flap = "M 20 146 C 40 148 62 150 80 156 C 82 186 82 212 80 238 L 26 234 C 24 206 22 176 20 146 Z";
  const ep = "M -42 136 L -90 148 L -90 158 L -44 147 Z";
  const sl = "M -96 148 C -106 184 -112 244 -112 304 C -112 364 -114 414 -116 456 L -84 460 C -82 402 -80 332 -78 282 C -76 252 -74 230 -70 216 C -78 192 -88 166 -96 148 Z";
  const tw = { fill: T, tex: "t-fine", pattern: "p-twill", hi: 0.2, lo: 0.55 };
  const ts = "#5B4A30";
  return (
    piece(body, {
      ...tw,
      box: [-110, 160, 110, 420],
      folds: ["M -70 380 C -76 480 -86 590 -96 688", "M 70 380 C 76 480 86 590 96 688", "M 4 250 C 10 400 16 560 20 694", "M -34 420 C -36 520 -40 610 -44 694"],
      lights: ["M -54 400 C -58 500 -62 600 -66 690", "M 40 420 C 42 520 46 610 50 692", "M -76 170 C -72 220 -68 270 -66 310"],
      inner: line("M 4 250 C 10 400 16 560 20 694", "#000", 0.6, 1.2) + stitch("M -108 676 C -40 684 40 684 108 676", ts, 0.5),
    }) +
    piece(vee, { fill: "#2E281F", tex: "t-fine", box: [-16, 136, 18, 250], hi: 0, lo: 0.2, edge: 10, edgeOp: 0.6 }) +
    piece(flap, { ...tw, box: [20, 146, 82, 238], hi: 0.12, lo: 0.4, edge: 6 }) +
    stitch("M 26 230 L 76 234", ts, 0.5) +
    piece(lapel, { ...tw, box: [-64, 136, -10, 250], hi: 0.25, lo: 0.3, edge: 6 }) +
    piece(mirror(lapel), { ...tw, box: [10, 136, 64, 250], hi: 0.1, lo: 0.45, edge: 6 }) +
    piece("M -30 128 C -10 120 10 120 30 128 L 20 138 C 8 133 -8 133 -18 138 Z", { ...tw, box: [-30, 120, 30, 138], edge: 4 }) +
    piece(ep, { ...tw, box: [-90, 136, -42, 158], edge: 3 }) +
    piece(mirror(ep), { ...tw, box: [42, 136, 90, 158], edge: 3, lo: 0.5 }) +
    button(-80, 151, 3.2) +
    button(80, 151, 3.2) +
    [262, 300].map((y) => button(-24, y, 5.5) + button(34, y, 5.5)).join("") +
    [410, 460].map((y) => button(-22, y, 5.5) + button(38, y, 5.5)).join("") +
    piece("M -82 326 C -30 322 30 322 82 326 L 82 346 C 30 342 -30 342 -82 346 Z", { ...tw, box: [-82, 322, 82, 346], hi: 0.18, lo: 0.5, edge: 5 }) +
    stitch("M -82 329 C -30 325 30 325 82 329", ts, 0.5) +
    stitch("M -82 343 C -30 339 30 339 82 343", ts, 0.5) +
    `<rect x="-24" y="322" width="22" height="24" rx="2" fill="none" stroke="#3A2E1E" stroke-width="2.4"/>` +
    `<path d="M -12 334 L -2 334" stroke="#3A2E1E" stroke-width="2"/>` +
    piece("M -6 340 C -10 370 -14 396 -16 420 L -4 422 C -2 396 0 370 4 342 Z", { ...tw, box: [-16, 340, 4, 420], edge: 3 }) +
    line("M -78 430 L -60 470", "#000", 0.55, 1.4) +
    line(mirror("M -78 430 L -60 470"), "#000", 0.55, 1.4) +
    sleeve(sl, T, { tex: "t-fine", pattern: "p-twill", over: piece("M -115 420 L -84 424 L -84 434 L -115 431 Z", { ...tw, box: [-115, 420, -84, 434], edge: 2 }) }) +
    sleeve(mirror(sl), T, {
      tex: "t-fine",
      pattern: "p-twill",
      box: [70, 150, 130, 260],
      lo: 0.42,
      folds: [mirror("M -110 300 C -102 306 -92 306 -84 302")],
      lights: [mirror("M -104 200 C -106 260 -106 330 -108 430")],
      over: piece(mirror("M -115 420 L -84 424 L -84 434 L -115 431 Z"), { ...tw, box: [84, 420, 115, 434], edge: 2 }),
    })
  );
}

/* ─────────────── accessori (coordinate 600×800) ─────────────── */

function bag() {
  const L = "#7A4A2B";
  const body = "M 152 420 C 152 352 204 332 300 332 C 396 332 448 352 448 420 L 468 598 C 470 614 458 626 442 626 L 158 626 C 142 626 130 614 132 598 Z";
  const gusset = "M 152 420 C 140 470 134 540 132 598 C 134 614 142 624 156 626 C 158 560 160 480 168 412 Z";
  const handle = "M 222 352 C 222 238 378 238 378 352";
  return (
    `<path d="${handle}" fill="none" stroke="#000" stroke-opacity=".5" stroke-width="22" filter="url(#b6)" transform="translate(6 10)"/>` +
    `<path d="${handle}" fill="none" stroke="#6A3E22" stroke-width="18" stroke-linecap="round"/>` +
    `<path d="${handle}" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3" stroke-linecap="round" transform="translate(-3 -4)" filter="url(#b2)"/>` +
    `<path d="${handle}" fill="none" stroke="#2A160A" stroke-opacity=".6" stroke-width="1" stroke-dasharray="3 2.4" transform="translate(0 6)"/>` +
    [222, 378].map((x) => `<rect x="${x - 13}" y="340" width="26" height="22" rx="3" fill="url(#g-goldbar)"/><rect x="${x - 8}" y="344" width="16" height="12" rx="2" fill="#000" fill-opacity=".35"/>`).join("") +
    piece(body, {
      fill: L,
      tex: "t-leather",
      box: [140, 360, 470, 620],
      hi: 0.28,
      lo: 0.55,
      edge: 22,
      folds: ["M 180 600 C 260 610 340 610 420 600"],
      lights: ["M 196 380 C 260 362 340 362 404 380", "M 214 420 C 230 480 236 540 236 600"],
      lightOp: 0.22,
      lightW: 14,
      inner: stitch("M 170 420 C 172 360 214 346 300 346 C 386 346 428 360 430 420 L 448 596 C 450 606 444 612 434 612 L 166 612 C 156 612 150 606 152 596 Z", "#E8C9A8", 0.45, 1),
    }) +
    piece(gusset, { fill: "#5C351E", tex: "t-leather", box: [130, 420, 170, 626], hi: 0, lo: 0.4, edge: 8 }) +
    piece("M 448 420 C 460 470 466 540 468 598 C 466 614 458 624 444 626 C 442 560 440 480 432 412 Z", { fill: "#5E361E", tex: "t-leather", box: [430, 420, 470, 626], hi: 0, lo: 0.45, edge: 8 }) +
    `<path d="M 160 396 C 200 352 400 352 440 396" fill="none" stroke="url(#g-goldbar)" stroke-width="5"/>` +
    `<rect x="272" y="368" width="56" height="42" rx="6" fill="url(#g-gold)"/>` +
    `<rect x="280" y="376" width="40" height="26" rx="4" fill="none" stroke="#5C4116" stroke-width="1.5"/>` +
    `<circle cx="300" cy="389" r="7" fill="url(#g-gold)" stroke="#5C4116" stroke-width="1.2"/>` +
    `<ellipse cx="292" cy="372" rx="10" ry="2.5" fill="#fff" fill-opacity=".5"/>` +
    [180, 420].map((x) => `<ellipse cx="${x}" cy="628" rx="7" ry="3.5" fill="url(#g-gold)"/>`).join("")
  );
}

function boot(dx = 0, dark = 0) {
  const shaft =
    "M 228 112 C 214 200 206 300 222 400 C 232 470 246 520 246 560 C 246 610 232 650 236 690 L 296 690 C 330 700 370 740 400 752 L 488 752 L 488 716 C 488 706 482 700 472 696 C 430 680 390 650 362 612 C 346 590 338 570 336 540 C 340 400 352 250 360 104 C 320 98 260 104 228 112 Z";
  return `<g transform="translate(${dx} 0)"${dark ? ' filter="url(#dim)"' : ""}>
  ${piece(shaft, {
    fill: "#151515",
    tex: "t-leather",
    box: [210, 100, 380, 300],
    hi: 0.3,
    lo: 0.5,
    edge: 20,
    folds: ["M 248 540 C 270 560 300 566 330 560", "M 246 580 C 270 600 300 606 334 600"],
    lights: ["M 342 150 C 336 260 328 380 324 520", "M 400 690 C 430 702 460 712 480 716", "M 236 160 C 228 240 226 320 236 400"],
    lightOp: 0.3,
    lightW: 10,
    inner: stitch("M 238 132 C 228 250 226 380 240 480", "#fff", 0.18) + stitch("M 300 690 C 340 698 380 728 410 742", "#fff", 0.14),
  })}
  <path d="M 228 112 C 260 124 330 118 360 104 C 320 98 260 104 228 112 Z" fill="#050505" stroke="#2a2a2a" stroke-width="1"/>
  <path d="M 296 690 C 330 700 370 740 400 752 L 488 752 L 488 760 L 400 760 C 368 748 330 712 296 698 Z" fill="#8B5A34"/>
  <path d="M 296 694 C 330 704 370 744 400 756 L 488 756" fill="none" stroke="#C99466" stroke-opacity=".6" stroke-width="1"/>
  ${piece("M 238 690 L 296 690 L 292 760 L 242 760 Z", { fill: "#1A1A1A", tex: "t-leather", box: [238, 690, 296, 760], hi: 0.2, lo: 0.4, edge: 6 })}
  <path d="M 242 756 L 292 756 L 292 760 L 242 760 Z" fill="#5A3A20"/>
</g>`;
}

function stole() {
  const S = "#C6A47B";
  const back = "M 252 150 L 350 150 C 372 300 410 470 440 660 C 400 666 362 666 330 664 C 320 480 292 300 252 150 Z";
  const front = "M 236 150 C 232 138 252 126 300 126 C 348 126 368 138 364 150 C 380 300 404 460 420 596 C 360 606 300 614 240 618 C 210 620 190 624 176 628 C 190 470 214 300 236 150 Z";
  const fringe = (xa, ya, xb, yb, len, seed, color) => {
    let s = "";
    const steps = Math.round(Math.hypot(xb - xa, yb - ya) / 5.5);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = xa + (xb - xa) * t;
      const y = ya + (yb - ya) * t - 2;
      const j = Math.sin(i * 12.9898 + seed) * 43758.5453;
      const r = j - Math.floor(j);
      s += `<path d="M ${x.toFixed(1)} ${y.toFixed(1)} C ${(x + 1).toFixed(1)} ${(y + len * 0.4).toFixed(1)} ${(x - 1 + r * 3).toFixed(1)} ${(y + len * 0.7).toFixed(1)} ${(x + r * 4 - 2).toFixed(1)} ${(y + len * (0.8 + r * 0.3)).toFixed(1)}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    return `<g>${s}</g><g opacity=".3">${s.replace(/stroke="[^"]+"/g, 'stroke="#000"').replace(/stroke-width="2.4"/g, 'stroke-width=".7"')}</g>`;
  };
  const folds = ["M 252 160 C 236 300 214 460 196 616", "M 300 150 C 296 300 292 460 290 612", "M 344 158 C 360 300 380 450 398 598"];
  const lights = ["M 276 150 C 266 300 252 460 244 614", "M 322 150 C 330 300 338 450 346 604", "M 252 134 C 280 128 320 128 348 134"];
  return (
    `<rect x="148" y="147" width="304" height="7" rx="3.5" fill="#000" fill-opacity=".45" filter="url(#b3)" transform="translate(0 6)"/>` +
    `<rect x="148" y="146" width="304" height="7" rx="3.5" fill="url(#g-goldbar)"/>` +
    `<circle cx="146" cy="149.5" r="8" fill="url(#g-gold)"/><circle cx="454" cy="149.5" r="8" fill="url(#g-gold)"/>` +
    fringe(330, 664, 440, 660, 46, 3, "#A88A64") +
    piece(back, { fill: "#A88A64", tex: "t-flannel", box: [250, 150, 440, 660], hi: 0, lo: 0.45, edge: 14, folds: ["M 300 170 C 330 300 360 470 386 662"] }) +
    fringe(176, 628, 420, 596, 50, 7, S) +
    piece(front, { fill: S, tex: "t-flannel", box: [176, 150, 420, 400], hi: 0.24, lo: 0.45, edge: 16, folds, lights, foldW: 16, foldOp: 0.32, lightOp: 0.2, lightW: 14 })
  );
}

/* ─────────────── figura (coordinate corpo) ─────────────── */

function head({ earrings = true } = {}) {
  const hair =
    "M -34 54 C -37 18 -18 0 0 0 C 18 0 37 18 34 54 C 33 70 30 82 26 92 C 27 72 25 52 18 36 C 10 26 -10 26 -18 36 C -25 52 -27 72 -26 92 C -30 82 -33 70 -34 54 Z";
  return `
<path d="M -13 84 L 13 84 L 15 132 L -15 132 Z" fill="url(#g-skin)"/>
<path d="M -13 84 C -6 96 6 96 13 84 L 13 100 C 6 106 -6 106 -13 100 Z" fill="#000" fill-opacity=".28" filter="url(#b2)"/>
<ellipse cx="0" cy="50" rx="30" ry="42" fill="url(#g-skin)"/>
<ellipse cx="12" cy="56" rx="18" ry="34" fill="#000" fill-opacity=".14" filter="url(#b5)"/>
<path d="M -2 40 C 2 52 4 60 2 64" stroke="#6E4636" stroke-opacity=".18" stroke-width="2" fill="none" filter="url(#b2)"/>
${piece(hair, { fill: "#1B1411", box: [-34, 0, 34, 80], hi: 0.3, lo: 0.6, edge: 6, lights: ["M -24 22 C -16 10 -6 6 -2 6", "M -30 50 C -30 66 -28 78 -26 88"], lightOp: 0.25, lightW: 4 })}
${line("M 0 2 L -2 24", "#000", 0.6, 1.4)}
${earrings ? `<circle cx="-31" cy="72" r="2.6" fill="url(#g-gold)"/><path d="M -31 74 L -31 88" stroke="url(#g-goldbar)" stroke-width="1.6"/><circle cx="-31" cy="90" r="3.4" fill="url(#g-gold)"/>` : ""}`;
}

function hand(x, y, flip = 1) {
  const d = `M ${x} ${y} C ${x - 4 * flip} ${y + 18} ${x - 4 * flip} ${y + 40} ${x + 2 * flip} ${y + 56} C ${x + 8 * flip} ${y + 62} ${x + 16 * flip} ${y + 58} ${x + 18 * flip} ${y + 48} C ${x + 20 * flip} ${y + 34} ${x + 22 * flip} ${y + 16} ${x + 26 * flip} ${y + 2} Z`;
  return `<path d="${d}" fill="url(#g-skin)"/><path d="${d}" fill="none" stroke="#000" stroke-opacity=".25" stroke-width="1"/>
  ${line(`M ${x + 8 * flip} ${y + 30} C ${x + 9 * flip} ${y + 40} ${x + 10 * flip} ${y + 48} ${x + 10 * flip} ${y + 54}`, "#6E4636", 0.35, 0.8)}`;
}

function floorShadow(rx = 150) {
  return `<ellipse cx="0" cy="900" rx="${rx}" ry="16" fill="#000" fill-opacity=".7" filter="url(#b14)"/>`;
}

function look01() {
  const c = coat({ inside: false });
  const shoes = `<path d="M -52 884 L -18 884 L -10 902 L -56 902 Z" fill="#111"/><path d="M 52 884 L 18 884 L 10 902 L 56 902 Z" fill="#111"/>`;
  const bagS = 0.32;
  const bagT = `translate(${-122 - 300 * bagS} ${470 - 250 * bagS}) scale(${bagS})`;
  return (
    floorShadow(170) +
    head() +
    turtleneck({ full: false }) +
    shoes +
    palazzo() +
    c.body +
    c.sleeves +
    hand(-112, 452, 1) +
    hand(112, 452, -1) +
    `<g transform="${bagT}">${bag()}</g>`
  );
}

function look02() {
  const b = blazer();
  const boots = [-1, 1]
    .map((s) => {
      const d = s < 0 ? "M -54 852 L -20 852 L -16 896 C -14 902 -24 904 -40 904 C -56 904 -64 900 -60 894 Z" : mirror("M -54 852 L -20 852 L -16 896 C -14 902 -24 904 -40 904 C -56 904 -64 900 -60 894 Z");
      return piece(d, { fill: "#141414", tex: "t-leather", box: s < 0 ? [-60, 850, -16, 904] : [16, 850, 60, 904], hi: 0.35, lo: 0.4, edge: 6, lights: [s < 0 ? "M -46 860 L -40 896" : "M 46 860 L 40 896"], lightOp: 0.3, lightW: 4 });
    })
    .join("");
  return floorShadow(130) + head() + boots + cigarette() + b.body + blouseVee(b.vee) + bow(2, 146, 0.85) + b.lapels + b.buttons + b.sleeves + hand(-112, 452, 1) + hand(112, 452, -1);
}

/* ─────────────── scene finali ─────────────── */

const PRODUCTS = {
  c1: () => {
    const c = coat();
    return ghost(c.lining + c.body + c.sleeves, [120, 712], 118, 1.1);
  },
  c2: () => {
    const b = blazer();
    return ghost(b.body + piece(b.vee, { fill: "#1C1C1E", tex: "t-fine", box: [-16, 138, 18, 298], hi: 0, lo: 0.2, edge: 12, edgeOp: 0.7 }) + b.lapels + b.buttons + b.sleeves, [122, 462], 116);
  },
  c3: () => ghost(trench(), [120, 700], 120, 1.12),
  t1: () => ghost(blouse(), [126, 470], 124),
  t2: () => ghost(turtleneck(), [88, 460], 106),
  t3: () => ghost(cardigan(), [130, 460], 110),
  p1: () => ghost(palazzo(), [362, 900], 118),
  p2: () => ghost(cigarette(), [362, 862], 76),
  p3: () => ghost(jeans(), [362, 900], 112),
  a1: () => `<ellipse cx="300" cy="632" rx="200" ry="20" fill="#000" fill-opacity=".75" filter="url(#b14)"/>${bag()}`,
  a2: () => `<ellipse cx="330" cy="764" rx="230" ry="16" fill="#000" fill-opacity=".75" filter="url(#b14)"/>${boot(-86, 0.35)}${boot(0)}`,
  a3: () => stole(),
};

const LIGHT = {
  c1: { lx: 0.38, ly: 0.3, tint: "#3D362F" },
  c2: { lx: 0.45, ly: 0.36, tint: "#4A4A50" },
  c3: { lx: 0.4, ly: 0.3, tint: "#3B3530" },
  t1: { lx: 0.42, ly: 0.3, tint: "#3C3832" },
  t2: { lx: 0.5, ly: 0.4, tint: "#57514A" },
  t3: { lx: 0.42, ly: 0.32, tint: "#393631" },
  p1: { lx: 0.4, ly: 0.4, tint: "#383430" },
  p2: { lx: 0.5, ly: 0.45, tint: "#56504A" },
  p3: { lx: 0.4, ly: 0.4, tint: "#33343A" },
  a1: { lx: 0.4, ly: 0.36, tint: "#3D362E", floor: 560 },
  a2: { lx: 0.5, ly: 0.4, tint: "#544E47", floor: 690 },
  a3: { lx: 0.4, ly: 0.3, tint: "#3D372F" },
};

function productScene(id) {
  const W = 600;
  const H = 800;
  return svg(W, H, studio(W, H, LIGHT[id]) + PRODUCTS[id]() + finish(W, H));
}

// Scena con figura: restituisce SVG e posizione degli hotspot in % della foto.
function figureScene({ W, H, cx, top, s, figure, light, pins }) {
  const tf = (x, y) => [cx + x * s, top + y * s];
  const body = `<g transform="translate(${cx} ${top}) scale(${s})">${figure}</g>`;
  const out = svg(W, H, studio(W, H, light) + body + finish(W, H));
  const pct = Object.fromEntries(Object.entries(pins).map(([k, [x, y]]) => {
    const [px, py] = tf(x, y);
    return [k, [+((px / W) * 100).toFixed(1), +((py / H) * 100).toFixed(1)]];
  }));
  return { svg: out, pins: pct };
}

const SCENES = {
  "look-01": () =>
    figureScene({
      W: 1500,
      H: 1000,
      cx: 870,
      top: 52,
      s: 0.98,
      figure: look01(),
      light: { lx: 0.5, ly: 0.32, tint: "#3E3730", floor: 905, window: { t: "translate(250 120) skewX(-8)", w: 300, h: 560 } },
      pins: { c1: [-70, 600], t2: [0, 230], p1: [70, 800], a1: [-122, 535] },
    }),
  "look-02": () =>
    figureScene({
      W: 1500,
      H: 1000,
      cx: 640,
      top: 52,
      s: 0.98,
      figure: look02(),
      light: { lx: 0.46, ly: 0.3, tint: "#36363A", floor: 905, window: { t: "translate(1000 110) skewX(8)", w: 300, h: 560 } },
      pins: { c2: [-62, 330], t1: [-14, 196], p2: [-38, 650], a2: [40, 884] },
    }),
  hero: () =>
    figureScene({
      W: 900,
      H: 1200,
      cx: 470,
      top: 70,
      s: 1.2,
      figure: look01(),
      light: { lx: 0.3, ly: 0.22, tint: "#463E35" },
      pins: {},
    }),
};

/* ─────────────── render ─────────────── */

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const jobs = [
    ...Object.keys(PRODUCTS).map((id) => ({ id, w: 600, h: 800, scale: 1.5, make: () => ({ svg: productScene(id) }) })),
    ...Object.entries(SCENES).map(([id, make]) => ({ id, w: id === "hero" ? 900 : 1500, h: id === "hero" ? 1200 : 1000, scale: id === "hero" ? 1.4 : 1.3, make })),
  ].filter((j) => !only.length || only.includes(j.id));

  const browser = await chromium.launch();
  for (const job of jobs) {
    const { svg: markup, pins } = job.make();
    const page = await browser.newPage({ viewport: { width: job.w, height: job.h }, deviceScaleFactor: job.scale });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#000">${markup}</body></html>`);
    await page.waitForTimeout(150);
    const file = path.join(OUT, `${job.id}.jpg`);
    await page.screenshot({ path: file, type: "jpeg", quality: 84, clip: { x: 0, y: 0, width: job.w, height: job.h } });
    await page.close();
    console.log(`${job.id}.jpg  ${(fs.statSync(file).size / 1024).toFixed(0)} KB${pins && Object.keys(pins).length ? `  pin ${JSON.stringify(pins)}` : ""}`);
  }
  await browser.close();
})();
