/**
 * Marianna J — esperienza digitale haute couture per la boutique di Via Torino, Chivasso.
 * Un solo componente: React per lo stato, Tailwind CSS per il layout, lucide-react per le icone.
 * Il foglio di stile interno (CSS) gestisce cursore, tilt 3D, glow, grana e animazioni.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  type RefObject,
} from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  CalendarDays,
  Check,
  Copy,
  Facebook,
  Instagram,
  Layers,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  Plus,
  RotateCcw,
  Ruler,
  Scissors,
  Shuffle,
  Sparkle,
  X,
} from "lucide-react";

/* ─────────────────────────── Contatti ─────────────────────────── */

const WA_NUMBER = "390110000000";
const PHONE = "+39 011 000 0000";
const ADDRESS = "Via Torino, 10034 Chivasso (TO)";
const MAPS = "https://www.google.com/maps/search/?api=1&query=Via+Torino+Chivasso+TO";
const COORDS = "45°11′N · 7°53′E";
const INSTAGRAM = "https://instagram.com";
const FACEBOOK = "https://facebook.com";
const wa = (msg: string) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;

/* ─────────────────────────── Immagini ─────────────────────────── */

// Foto da Unsplash. Nella build "artifact" le stesse foto vengono servite in locale da img/.
const LOCAL_IMAGES =
  typeof window !== "undefined" &&
  (window as Window & { __MJ_LOCAL_IMAGES__?: boolean }).__MJ_LOCAL_IMAGES__ === true;
const photo = (id: string, w = 1200) =>
  LOCAL_IMAGES ? `img/${id}.jpg` : `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

/* ─────────────────────────── Catalogo ─────────────────────────── */

type Cat = "Capospalla" | "Top" | "Pantaloni" | "Accessori";
type Texture = "spina" | "gessato" | "twill" | "seta" | "costa" | "flanella" | "pelle" | "denim";

type Item = {
  id: string;
  name: string;
  cat: Cat;
  price: number;
  color: string;
  hex: string;
  texture: Texture;
  photo: string;
  material: string;
  composition: [string, string][];
  desc: string;
  fit: string;
  care: string;
  sizes: [string, number][];
};

const CATS: Cat[] = ["Capospalla", "Top", "Pantaloni", "Accessori"];

const ITEMS: Item[] = [
  {
    id: "c1",
    name: "Cappotto Sartoriale Cashmere",
    cat: "Capospalla",
    price: 420,
    color: "Cammello",
    hex: "#A27B57",
    texture: "spina",
    photo: "photo-1539533018447-63fcce2678e3",
    material: "Lana vergine e cashmere",
    composition: [["90%", "Lana vergine"], ["10%", "Cashmere"]],
    desc: "Monopetto lungo al polpaccio, rever a lancia e spalla morbida. Fodera in cupro e tasche a filetto.",
    fit: "Linea dritta, lunghezza al polpaccio. Se sei tra due taglie, scegli la più piccola.",
    care: "Solo lavaggio a secco. Riponi su gruccia sagomata.",
    sizes: [["XS", 1], ["S", 2], ["M", 3], ["L", 1], ["XL", 0]],
  },
  {
    id: "c2",
    name: "Blazer Doppiopetto Gessato",
    cat: "Capospalla",
    price: 260,
    color: "Antracite",
    hex: "#2E2F33",
    texture: "gessato",
    photo: "photo-1594938298603-c8148c4dae35",
    material: "Lana merino Super 120's",
    composition: [["100%", "Lana merino"]],
    desc: "Doppiopetto a sei bottoni in corno, gessato sottile tono su tono, spalla costruita.",
    fit: "Taglio maschile, leggermente oversize sulle spalle.",
    care: "Solo lavaggio a secco.",
    sizes: [["XS", 0], ["S", 1], ["M", 2], ["L", 2], ["XL", 1]],
  },
  {
    id: "c3",
    name: "Trench in Gabardine",
    cat: "Capospalla",
    price: 340,
    color: "Sabbia",
    hex: "#B9A27E",
    texture: "twill",
    photo: "photo-1591369822096-ffd140ec948f",
    material: "Gabardine di cotone",
    composition: [["100%", "Cotone"]],
    desc: "Doppiopetto con cintura, carré antipioggia e polsini regolabili. Gabardine compatto e idrorepellente.",
    fit: "Ampio sulle spalle, si segna in vita con la cintura.",
    care: "Lavaggio a secco delicato.",
    sizes: [["XS", 1], ["S", 1], ["M", 2], ["L", 0], ["XL", 1]],
  },
  {
    id: "t1",
    name: "Camicia in Seta Avorio",
    cat: "Top",
    price: 180,
    color: "Avorio",
    hex: "#E6DCC8",
    texture: "seta",
    photo: "photo-1564257631407-4deb1f99d992",
    material: "Seta crêpe de chine",
    composition: [["100%", "Seta"]],
    desc: "Collo morbido con fiocco da annodare, polsini a tre bottoni, caduta fluida.",
    fit: "Morbida, da portare dentro o fuori dal pantalone.",
    care: "Lavaggio a mano in acqua fredda o a secco.",
    sizes: [["XS", 2], ["S", 2], ["M", 1], ["L", 1], ["XL", 0]],
  },
  {
    id: "t2",
    name: "Dolcevita in Merino Extrafine",
    cat: "Top",
    price: 145,
    color: "Nero",
    hex: "#1A1A1A",
    texture: "costa",
    photo: "photo-1608234807905-4466023792f5",
    material: "Lana merino extrafine",
    composition: [["100%", "Lana merino extrafine"]],
    desc: "Collo alto a costa inglese, maglia sottile che non ingombra sotto la giacca.",
    fit: "Aderente, lunghezza al fianco.",
    care: "Lavaggio a mano a 30°, asciugare in piano.",
    sizes: [["XS", 2], ["S", 3], ["M", 3], ["L", 2], ["XL", 1]],
  },
  {
    id: "t3",
    name: "Cardigan in Cashmere",
    cat: "Top",
    price: 230,
    color: "Grigio perla",
    hex: "#B4B0A8",
    texture: "costa",
    photo: "photo-1620799140408-edc6dcb6d633",
    material: "Cashmere",
    composition: [["100%", "Cashmere"]],
    desc: "Scollo a V, bottoni in madreperla, bordi a costa 2×2.",
    fit: "Leggermente ampio, si porta anche da solo.",
    care: "Lavaggio a mano a freddo, asciugare in piano.",
    sizes: [["XS", 0], ["S", 1], ["M", 1], ["L", 1], ["XL", 0]],
  },
  {
    id: "p1",
    name: "Pantalone Palazzo in Flanella",
    cat: "Pantaloni",
    price: 195,
    color: "Grigio melange",
    hex: "#6B6966",
    texture: "flanella",
    photo: "photo-1594633312681-425c7b97ccd1",
    material: "Flanella di lana",
    composition: [["98%", "Lana"], ["2%", "Elastan"]],
    desc: "Vita alta con doppia pince, gamba ampia e piega stirata. Cade dritto fino a terra.",
    fit: "Lunghezza pensata per un tacco medio.",
    care: "Lavaggio a secco.",
    sizes: [["XS", 1], ["S", 2], ["M", 2], ["L", 1], ["XL", 1]],
  },
  {
    id: "p2",
    name: "Pantalone Sartoriale Nero",
    cat: "Pantaloni",
    price: 175,
    color: "Nero",
    hex: "#161616",
    texture: "twill",
    photo: "photo-1506629082955-511b1aa562c8",
    material: "Lana fresca",
    composition: [["100%", "Lana vergine"]],
    desc: "Taglio a sigaretta, piega centrale e tasche alla francese.",
    fit: "Regolare in vita, gamba affusolata alla caviglia.",
    care: "Lavaggio a secco.",
    sizes: [["XS", 2], ["S", 2], ["M", 0], ["L", 1], ["XL", 1]],
  },
  {
    id: "p3",
    name: "Jeans Wide Leg Cimosato",
    cat: "Pantaloni",
    price: 150,
    color: "Indaco",
    hex: "#2C3A55",
    texture: "denim",
    photo: "photo-1541099649105-f69ad21f3246",
    material: "Denim cimosato 13 oz",
    composition: [["100%", "Cotone"]],
    desc: "Vita alta, gamba ampia, lavaggio scuro uniforme. Cuciture a contrasto tono su tono.",
    fit: "Vita alta e aderente, gamba ampia dal ginocchio.",
    care: "Lavare al rovescio a 30°, non asciugare in asciugatrice.",
    sizes: [["XS", 1], ["S", 2], ["M", 2], ["L", 2], ["XL", 0]],
  },
  {
    id: "a1",
    name: "Borsa Bauletto in Pelle",
    cat: "Accessori",
    price: 290,
    color: "Cuoio",
    hex: "#7A4A2B",
    texture: "pelle",
    photo: "photo-1548036328-c9fa89d128fa",
    material: "Pelle di vitello liscia",
    composition: [["Esterno", "Pelle di vitello"], ["Fodera", "Suede"]],
    desc: "Manico rigido, tracolla removibile e chiusura metallica dorata.",
    fit: "31 × 22 × 13 cm. Tracolla regolabile fino a 120 cm.",
    care: "Spolverare con panno morbido, conservare nella sua sacca.",
    sizes: [["Unica", 2]],
  },
  {
    id: "a2",
    name: "Stivale al Ginocchio in Nappa",
    cat: "Accessori",
    price: 360,
    color: "Nero",
    hex: "#111111",
    texture: "pelle",
    photo: "photo-1543163521-1bf539c55dd2",
    material: "Pelle nappa",
    composition: [["Tomaia", "Pelle nappa"], ["Suola", "Cuoio"]],
    desc: "Tacco a blocco di 6 cm, zip interna e punta squadrata.",
    fit: "Calzata regolare, gambale morbido.",
    care: "Crema neutra e tendiscarpe dopo ogni uso.",
    sizes: [["36", 1], ["37", 2], ["38", 0], ["39", 1], ["40", 1]],
  },
  {
    id: "a3",
    name: "Stola in Cashmere",
    cat: "Accessori",
    price: 210,
    color: "Cammello chiaro",
    hex: "#C3A27A",
    texture: "flanella",
    photo: "photo-1520903920243-00d872a2d1c9",
    material: "Cashmere",
    composition: [["100%", "Cashmere"]],
    desc: "Grande stola con frange, tessuta leggera: sciarpa o mantella sulle spalle.",
    fit: "200 × 70 cm.",
    care: "Lavaggio a secco.",
    sizes: [["Unica", 3]],
  },
];

const byId = (id: string) => ITEMS.find((i) => i.id === id)!;

// La collezione numerata: otto pezzi, numerazione fissa anche quando si filtra.
const COLLECTION = ["c1", "t1", "c2", "p1", "a1", "t2", "c3", "a2"].map(byId);
const edition = (item: Item) => {
  const i = COLLECTION.indexOf(item);
  return i < 0 ? null : `${String(i + 1).padStart(2, "0")}/${String(COLLECTION.length).padStart(2, "0")}`;
};

type Pin = { id: string; x: number; y: number };
type Look = {
  id: string;
  title: string;
  line: string;
  photo: string;
  w: number;
  h: number;
  pos: [number, number];
  tone: string;
  pins: Pin[];
};

// Coordinate dei pin in percentuale sulla foto originale (non sul riquadro ritagliato).
const LOOKS: Look[] = [
  {
    id: "01",
    title: "Look 01",
    line: "Cammello e flanella, per le sere d’autunno",
    photo: "photo-1509631179647-0177331693ae",
    w: 3648,
    h: 5472,
    pos: [0.5, 0.35],
    tone: "#2B2621",
    pins: [
      { id: "c1", x: 44, y: 40 },
      { id: "t2", x: 52, y: 25 },
      { id: "p1", x: 48, y: 72 },
      { id: "a1", x: 30, y: 58 },
    ],
  },
  {
    id: "02",
    title: "Look 02",
    line: "Gessato e seta avorio, dal giorno alla sera",
    photo: "photo-1539109136881-3be0616acf4b",
    w: 3456,
    h: 5184,
    pos: [0.5, 0.3],
    tone: "#24252A",
    pins: [
      { id: "c2", x: 42, y: 38 },
      { id: "t1", x: 52, y: 28 },
      { id: "p2", x: 50, y: 70 },
      { id: "a2", x: 46, y: 90 },
    ],
  },
];

const HERO = { photo: "photo-1515886657613-9f3515b0c78f", tone: "#1E1C1A", item: "c1" };

const TICKER: { t: string; k: "mono" | "serif" | "sans" }[] = [
  { t: "45°11′N 7°53′E", k: "mono" },
  { t: "Chivasso", k: "serif" },
  { t: "Autunno / Inverno 2026—27", k: "sans" },
  { t: "Drop 01 · 24.10.2026", k: "mono" },
  { t: "Edizione numerata · 08 pezzi", k: "sans" },
  { t: "Private viewing su appuntamento", k: "serif" },
  { t: "Via Torino", k: "mono" },
  { t: "Fitting privato · camerino riservato", k: "sans" },
];

const FABRICS = ["Cashmere", "Seta crêpe", "Lana merino", "Flanella", "Nappa", "Gabardine", "Denim cimosato"];

/* ─────────────────────────── Orari ─────────────────────────── */

const HOURS: { label: string; days: number[]; text: string }[] = [
  { label: "Lunedì", days: [1], text: "15:30 – 19:30" },
  { label: "Martedì – Sabato", days: [2, 3, 4, 5, 6], text: "9:30 – 12:30 · 15:30 – 19:30" },
  { label: "Domenica", days: [0], text: "Chiuso" },
];

// Fasce di apertura in minuti dalla mezzanotte, per giorno (0 = domenica).
const MORNING: [number, number] = [570, 750];
const AFTERNOON: [number, number] = [930, 1170];
const SCHEDULE: Record<number, [number, number][]> = {
  0: [],
  1: [AFTERNOON],
  2: [MORNING, AFTERNOON],
  3: [MORNING, AFTERNOON],
  4: [MORNING, AFTERNOON],
  5: [MORNING, AFTERNOON],
  6: [MORNING, AFTERNOON],
};
const DAY_IT = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];

const fmtMin = (m: number) => `${Math.floor(m / 60)}:${String(m % 60).padStart(2, "0")}`;
const eur = (n: number) =>
  new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

type RomeNow = { y: number; mo: number; d: number; dow: number; h: number; m: number; s: number };

const ROME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Europe/Rome",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  weekday: "short",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function romeNow(): RomeNow {
  const p: Record<string, string> = {};
  for (const part of ROME.formatToParts(new Date())) p[part.type] = part.value;
  return {
    y: +p.year,
    mo: +p.month,
    d: +p.day,
    dow: WEEKDAYS.indexOf(p.weekday),
    h: +p.hour % 24,
    m: +p.minute,
    s: +p.second,
  };
}

function shopStatus(t: RomeNow) {
  const mins = t.h * 60 + t.m;
  const open = SCHEDULE[t.dow].find(([a, b]) => mins >= a && mins < b);
  if (open) return { open: true, text: `Aperto ora · chiude alle ${fmtMin(open[1])}` };
  for (let i = 0; i < 8; i++) {
    const dow = (t.dow + i) % 7;
    const next = SCHEDULE[dow].find(([a]) => i > 0 || a > mins);
    if (next) {
      const when = i === 0 ? "oggi" : i === 1 ? "domani" : DAY_IT[dow];
      return { open: false, text: `Chiuso · riapre ${when} alle ${fmtMin(next[0])}` };
    }
  }
  return { open: false, text: "Chiuso" };
}

const DAY_SHORT = new Intl.DateTimeFormat("it-IT", { weekday: "short", day: "numeric", timeZone: "UTC" });
const DAY_LONG = new Intl.DateTimeFormat("it-IT", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

type FittingDay = { key: string; short: string; long: string; slots: string[] };

// Prossimi giorni con almeno un orario libero per il fitting (slot da un'ora, con un'ora di preavviso).
function fittingDays(now: RomeNow, count = 6): FittingDay[] {
  const out: FittingDay[] = [];
  const base = Date.UTC(now.y, now.mo - 1, now.d, 12);
  const nowMin = now.h * 60 + now.m;
  for (let i = 0; out.length < count && i < 14; i++) {
    const date = new Date(base + i * 864e5);
    const slots: string[] = [];
    for (const [a, b] of SCHEDULE[date.getUTCDay()]) {
      for (let m = a; m + 60 <= b; m += 60) if (i > 0 || m > nowMin + 60) slots.push(fmtMin(m));
    }
    if (slots.length) {
      out.push({ key: date.toISOString().slice(0, 10), short: DAY_SHORT.format(date), long: DAY_LONG.format(date), slots });
    }
  }
  return out;
}

/* ─────────────────────────── Stile ─────────────────────────── */

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=DM+Mono:wght@300;400;500&family=Jost:ital,wght@0,100..900;1,100..900&display=swap";

const NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const TEXTURE: Record<Texture, string> = {
  spina:
    "repeating-linear-gradient(45deg, rgba(255,255,255,.07) 0 2px, transparent 2px 9px), repeating-linear-gradient(-45deg, rgba(0,0,0,.16) 0 2px, transparent 2px 9px)",
  gessato: "repeating-linear-gradient(90deg, transparent 0 22px, rgba(255,255,255,.16) 22px 23px)",
  twill: "repeating-linear-gradient(62deg, rgba(255,255,255,.07) 0 1px, transparent 1px 5px)",
  seta: "linear-gradient(115deg, transparent 25%, rgba(255,255,255,.22) 42%, transparent 58%), radial-gradient(120% 80% at 20% 10%, rgba(255,255,255,.28), transparent 55%)",
  costa: "repeating-linear-gradient(90deg, rgba(0,0,0,.22) 0 3px, rgba(255,255,255,.05) 3px 6px)",
  flanella:
    "repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, rgba(0,0,0,.1) 0 1px, transparent 1px 3px)",
  pelle: "radial-gradient(140% 90% at 72% 8%, rgba(255,255,255,.2), transparent 50%)",
  denim: "repeating-linear-gradient(-32deg, rgba(255,255,255,.09) 0 1px, transparent 1px 4px)",
};

const CSS = `
:root{--void:#070707;--ink:#0D0D0D;--graphite:#151515;--silver:#C3C6CB;--steel:#8A8E94;--cream:#ECE3D2;--ease:cubic-bezier(.16,1,.3,1);color-scheme:dark}
html{background:var(--void);scroll-behavior:smooth}
body{background:var(--void);color:var(--cream);-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:60;background:var(--void)}
::selection{background:var(--cream);color:var(--ink)}
.f-serif{font-family:"Bodoni Moda","Bodoni 72",Didot,"Times New Roman",serif;font-optical-sizing:auto}
.f-sans{font-family:Jost,Futura,"Century Gothic","Avenir Next",system-ui,sans-serif}
.f-mono{font-family:"DM Mono",ui-monospace,SFMono-Regular,Menlo,monospace;font-variant-numeric:tabular-nums}
.mj-root h1,.mj-root h2,.mj-root h3{text-wrap:balance}
.mj-gutter{padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
@media (min-width:768px){.mj-gutter{padding-left:max(40px,env(safe-area-inset-left,0px));padding-right:max(40px,env(safe-area-inset-right,0px))}}
@media (min-width:1280px){.mj-gutter{padding-left:max(64px,env(safe-area-inset-left,0px));padding-right:max(64px,env(safe-area-inset-right,0px))}}
.mj-noise{background-image:${NOISE};background-size:180px;mix-blend-mode:overlay;pointer-events:none}
.mj-grain{position:fixed;inset:-50%;z-index:90;pointer-events:none;opacity:.075;background-image:${NOISE};background-size:200px;animation:mj-grain 1.1s steps(6) infinite}
@keyframes mj-grain{0%,100%{transform:translate(0,0)}20%{transform:translate(-3%,2%)}40%{transform:translate(2%,-4%)}60%{transform:translate(-4%,-1%)}80%{transform:translate(3%,3%)}}
.mj-vignette{position:fixed;inset:0;z-index:89;pointer-events:none;background:radial-gradient(120% 95% at 50% 40%,transparent 62%,rgba(0,0,0,.42))}
.mj-glass{background:linear-gradient(180deg,rgba(236,227,210,.075),rgba(236,227,210,.02));border:1px solid rgba(236,227,210,.11);-webkit-backdrop-filter:blur(20px) saturate(115%);backdrop-filter:blur(20px) saturate(115%);box-shadow:0 40px 90px -40px rgba(0,0,0,.85),inset 0 1px 0 rgba(255,255,255,.06)}
.mj-glass::before{content:"";position:absolute;inset:0;border-radius:inherit;background-image:${NOISE};background-size:160px;opacity:.07;pointer-events:none}
.mj-tilt{--rx:0deg;--ry:0deg;--mx:50%;--my:50%;--s:1;transform:perspective(1100px) rotateX(var(--rx)) rotateY(var(--ry)) scale(var(--s));transition:transform .8s var(--ease);will-change:transform}
.mj-tilt[data-tilt]{transition:transform .14s linear}
.mj-glow::after{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:5;opacity:0;transition:opacity .5s;background:radial-gradient(380px circle at var(--mx) var(--my),rgba(236,227,210,.17),transparent 46%);mix-blend-mode:screen}
.mj-glow[data-tilt]::after{opacity:1}
.mj-cursor-on,.mj-cursor-on *{cursor:none!important}
.mj-cur-dot,.mj-cur-ring{position:fixed;left:0;top:0;pointer-events:none;border-radius:50%;opacity:0;transition:opacity .3s}
.mj-cur-dot{z-index:121;width:6px;height:6px;margin:-3px 0 0 -3px;background:var(--cream);mix-blend-mode:difference}
.mj-cur-ring{z-index:120;width:38px;height:38px;margin:-19px 0 0 -19px;border:1px solid rgba(236,227,210,.6);display:grid;place-items:center;mix-blend-mode:difference;transition:opacity .3s,width .5s var(--ease),height .5s var(--ease),margin .5s var(--ease),background-color .4s,border-color .4s}
.mj-cur-dot[data-on],.mj-cur-ring[data-on]{opacity:1}
.mj-cur-ring span{font:500 9.5px/1 Jost,Futura,system-ui,sans-serif;letter-spacing:.22em;text-transform:uppercase;color:var(--ink);opacity:0;transition:opacity .25s;white-space:nowrap}
.mj-cur-ring[data-state=link]{width:58px;height:58px;margin:-29px 0 0 -29px}
.mj-cur-ring[data-state=label]{width:88px;height:88px;margin:-44px 0 0 -44px;background:var(--cream);border-color:transparent;mix-blend-mode:normal}
.mj-cur-ring[data-state=label] span{opacity:1}
.mj-cur-ring[data-down]{width:30px;height:30px;margin:-15px 0 0 -15px}
.mj-mask{display:inline-block;overflow:hidden;vertical-align:top;padding:.04em .03em .14em;margin:-.04em -.03em -.14em}
.mj-rise{display:inline-block;animation:mj-rise 1.3s var(--ease) both}
@keyframes mj-rise{from{transform:translateY(112%) rotate(5deg)}to{transform:none}}
.mj-k{display:inline-block;transition:font-weight .5s var(--ease),transform .5s var(--ease)}
.mj-curtain{position:absolute;inset:0;display:flex;z-index:6;pointer-events:none}
.mj-curtain i{flex:1;background:var(--ink);transform-origin:top;animation:mj-curtain 1.35s var(--ease) both}
.mj-curtain i:nth-child(even){transform-origin:bottom}
@keyframes mj-curtain{to{transform:scaleY(0)}}
.mj-frame .mj-spot{clip-path:circle(0px at var(--sx,50%) var(--sy,50%));transition:clip-path .45s var(--ease)}
.mj-frame[data-on] .mj-spot{clip-path:circle(150px at var(--sx,50%) var(--sy,50%))}
.mj-frame[data-full] .mj-spot{clip-path:circle(150% at 50% 50%)}
.mj-spin{animation:mj-spin 22s linear infinite}
.mj-badge:hover .mj-spin{animation-duration:7s}
@keyframes mj-spin{to{transform:rotate(360deg)}}
.mj-float{animation:mj-float 7s ease-in-out infinite}
@keyframes mj-float{50%{transform:translateY(-12px)}}
.mj-marquee-track{display:flex;width:max-content;animation:mj-marquee var(--dur,48s) linear infinite}
.mj-marquee:hover .mj-marquee-track{animation-play-state:paused}
.mj-marquee[data-reverse] .mj-marquee-track{animation-direction:reverse}
@keyframes mj-marquee{to{transform:translateX(-50%)}}
.mj-outline{color:transparent;-webkit-text-stroke:1px rgba(236,227,210,.42);transition:color .6s var(--ease),-webkit-text-stroke-color .6s}
.mj-outline:hover{color:var(--cream);-webkit-text-stroke-color:transparent}
.mj-pin::before,.mj-pin::after{content:"";position:absolute;inset:0;border-radius:50%;border:1px solid var(--cream);animation:mj-pulse 2.4s var(--ease) infinite}
.mj-pin::after{animation-delay:1.2s}
@keyframes mj-pulse{from{transform:scale(1);opacity:.75}to{transform:scale(2.7);opacity:0}}
.mj-ping{transform-box:fill-box;transform-origin:center;animation:mj-pulse 2.6s var(--ease) infinite}
.mj-slowzoom{transition:transform 2.8s var(--ease),filter 1.2s var(--ease),opacity 1s ease}
.group:hover .mj-slowzoom{transform:scale(1.12)}
.mj-lens .mj-lens-img{transform-origin:var(--ox,50%) var(--oy,50%);transition:transform .7s var(--ease),opacity 1s ease}
.mj-lens:hover .mj-lens-img{transform:scale(1.8)}
.mj-swap{animation:mj-swap 1s var(--ease) both}
@keyframes mj-swap{from{clip-path:inset(100% 0 0 0);transform:scale(1.06)}to{clip-path:inset(0 0 0 0);transform:none}}
.mj-pop{animation:mj-pop .55s var(--ease) both}
@keyframes mj-pop{from{opacity:0;transform:translateY(12px) scale(.98)}}
.mj-fade{animation:mj-fade 1.1s ease both}
@keyframes mj-fade{from{opacity:0}}
.mj-kb{animation:mj-kb 18s ease-out both}
@keyframes mj-kb{from{transform:scale(1.14)}to{transform:scale(1.02)}}
.mj-flash{animation:mj-flash 1.4s var(--ease)}
@keyframes mj-flash{0%,60%{box-shadow:0 0 0 1px var(--cream),0 0 50px 4px rgba(236,227,210,.35)}100%{box-shadow:0 0 0 0 transparent}}
.mj-drawer-in{animation:mj-drawer-in .75s var(--ease) both}
.mj-drawer-out{animation:mj-drawer-out .55s var(--ease) both}
@keyframes mj-drawer-in{from{transform:translateX(104%)}}
@keyframes mj-drawer-out{to{transform:translateX(104%)}}
.mj-veil-in{animation:mj-fade .6s ease both}
.mj-veil-out{animation:mj-veil-out .55s ease both}
@keyframes mj-veil-out{to{opacity:0}}
.mj-u{background:linear-gradient(currentColor,currentColor) 0 100%/0 1px no-repeat;transition:background-size .6s var(--ease)}
.mj-u:hover,.mj-u[aria-current=true]{background-size:100% 1px}
.mj-sheen{position:relative;overflow:hidden}
.mj-sheen::after{content:"";position:absolute;inset:0;transform:translateX(-120%);background:linear-gradient(100deg,transparent 30%,rgba(255,255,255,.45) 50%,transparent 70%);transition:transform .9s var(--ease)}
.mj-sheen:hover::after{transform:translateX(120%)}
.mj-scroll-x{scrollbar-width:none}
.mj-scroll-x::-webkit-scrollbar{display:none}
.mj-root :focus-visible{outline:1px solid var(--silver);outline-offset:3px}
@media (hover:none){.mj-touch-show{opacity:1!important;transform:none!important}}
@media (prefers-reduced-motion:reduce){
  html{scroll-behavior:auto}
  .mj-root *,.mj-root *::before,.mj-root *::after{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important}
  .mj-grain{display:none}
}
`;

/* ─────────────────────────── Utilità ─────────────────────────── */

const reducedMotion = () =>
  typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = () =>
  typeof matchMedia !== "undefined" && matchMedia("(hover: hover) and (pointer: fine)").matches;

const scrollToId = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
const go = (id: string) => (e: ReactMouseEvent) => {
  e.preventDefault();
  scrollToId(id);
};

const shade = (hex: string, k: number) => {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.min(255, Math.round(v * k));
  return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
};

function useRomeTime(everyMs = 1000) {
  const [t, setT] = useState(romeNow);
  useEffect(() => {
    const id = window.setInterval(() => setT(romeNow()), everyMs);
    return () => window.clearInterval(id);
  }, [everyMs]);
  return t;
}

function useTween(value: number, ms = 750) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = performance.now();
    const a = from.current;
    let raf = 0;
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const v = a + (value - a) * (1 - Math.pow(1 - p, 3));
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return shown;
}

function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [active]);
}

// Ogni lettera marcata con data-k cambia peso in base alla distanza dal puntatore.
function useKinetic(ref: RefObject<HTMLElement>, radius = 320) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !finePointer() || reducedMotion()) return;
    const chars = Array.from(root.querySelectorAll<HTMLElement>("[data-k]"));
    let mx = -1e5;
    let my = -1e5;
    let raf = 0;
    const apply = () => {
      raf = 0;
      for (const c of chars) {
        const b = c.getBoundingClientRect();
        const dist = Math.hypot(mx - (b.left + b.width / 2), my - (b.top + b.height / 2));
        const t = Math.max(0, 1 - dist / radius);
        const e = t * t * (3 - 2 * t);
        const lo = Number(c.dataset.min);
        const hi = Number(c.dataset.max);
        c.style.fontWeight = String(Math.round(lo + (hi - lo) * e));
        c.style.transform = `translateY(${(-e * 0.05).toFixed(3)}em)`;
      }
    };
    const queue = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      mx = e.clientX;
      my = e.clientY;
      queue();
    };
    const out = () => {
      mx = my = -1e5;
      queue();
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    document.documentElement.addEventListener("mouseleave", out);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", queue);
      document.documentElement.removeEventListener("mouseleave", out);
    };
  }, [ref, radius]);
}

/* ─────────────────────────── Primitivi ─────────────────────────── */

function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!finePointer() || reducedMotion()) return;
    const d = dot.current!;
    const r = ring.current!;
    const l = label.current!;
    const html = document.documentElement;
    html.classList.add("mj-cursor-on");
    let x = -100;
    let y = -100;
    let rx = -100;
    let ry = -100;
    let raf = 0;
    const tick = () => {
      rx += (x - rx) * 0.17;
      ry += (y - ry) * 0.17;
      d.style.transform = `translate3d(${x}px,${y}px,0)`;
      r.style.transform = `translate3d(${rx}px,${ry}px,0)`;
      raf = requestAnimationFrame(tick);
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      d.dataset.on = r.dataset.on = "1";
      const el = (e.target as Element | null)?.closest?.("[data-cursor], a, button, label, [role=button]");
      const text = el?.getAttribute("data-cursor") ?? "";
      r.dataset.state = el ? (text ? "label" : "link") : "";
      if (l.textContent !== text) l.textContent = text;
    };
    const out = () => {
      delete d.dataset.on;
      delete r.dataset.on;
    };
    const down = () => {
      r.dataset.down = "1";
    };
    const up = () => {
      delete r.dataset.down;
    };
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    html.addEventListener("mouseleave", out);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      html.classList.remove("mj-cursor-on");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      html.removeEventListener("mouseleave", out);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="mj-cur-ring" aria-hidden="true">
        <span ref={label} />
      </div>
      <div ref={dot} className="mj-cur-dot" aria-hidden="true" />
    </>
  );
}

type TiltProps = HTMLAttributes<HTMLDivElement> & { max?: number; scale?: number; glow?: boolean; children: ReactNode };

// Inclinazione 3D sulle coordinate del mouse + glow che segue il puntatore.
function Tilt({ max = 8, scale = 1.015, glow = true, className = "", children, onPointerMove, onPointerLeave, ...rest }: TiltProps) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    onPointerMove?.(e);
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - y) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((x - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(x * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(y * 100).toFixed(1)}%`);
    el.style.setProperty("--s", String(scale));
    el.dataset.tilt = "on";
  };
  const leave = (e: ReactPointerEvent<HTMLDivElement>) => {
    onPointerLeave?.(e);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--s", "1");
    delete el.dataset.tilt;
  };
  return (
    <div ref={ref} {...rest} onPointerMove={move} onPointerLeave={leave} className={`mj-tilt ${glow ? "mj-glow" : ""} ${className}`}>
      {children}
    </div>
  );
}

type PhotoProps = {
  src: string;
  alt: string;
  tone: string;
  texture?: Texture;
  caption?: string;
  className?: string;
  imgClassName?: string;
  imgStyle?: CSSProperties;
  eager?: boolean;
  onReady?: (w: number, h: number) => void;
};

// Foto con fondo "campione di tessuto" nel colore del capo, visibile durante il caricamento.
function Photo({ src, alt, tone, texture = "flanella", caption, className = "", imgClassName = "", imgStyle, eager, onReady }: PhotoProps) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<"wait" | "ok" | "err">("wait");
  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth) {
      setState("ok");
      onReady?.(el.naturalWidth, el.naturalHeight);
    } else setState("wait");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);
  return (
    <span
      className={`relative block overflow-hidden ${className}`}
      style={{
        backgroundColor: tone,
        backgroundImage: `${TEXTURE[texture]}, linear-gradient(155deg, ${shade(tone, 1.18)} 0%, ${tone} 46%, ${shade(tone, 0.5)} 100%)`,
      }}
    >
      <span className="mj-noise absolute inset-0 block opacity-60" aria-hidden="true" />
      {state !== "ok" && caption && (
        <span className="f-mono absolute bottom-3 left-3 right-3 block text-[10px] uppercase leading-relaxed tracking-[.22em] text-cream/75">
          {caption}
        </span>
      )}
      {state !== "err" && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          draggable={false}
          onLoad={(e) => {
            setState("ok");
            onReady?.(e.currentTarget.naturalWidth, e.currentTarget.naturalHeight);
          }}
          onError={() => setState("err")}
          className={`absolute inset-0 h-full w-full max-w-none object-cover transition-opacity duration-1000 ${state === "ok" ? "opacity-100" : "opacity-0"} ${imgClassName}`}
          style={imgStyle}
        />
      )}
    </span>
  );
}

function KineticWord({ text, min, max, delay = 0, rise = true }: { text: string; min: number; max: number; delay?: number; rise?: boolean }) {
  return (
    <span className="inline-flex whitespace-nowrap">
      {[...text].map((ch, i) => (
        <span key={i} className="mj-mask" aria-hidden="true">
          <span className={rise ? "mj-rise" : "inline-block"} style={rise ? { animationDelay: `${delay + i * 55}ms` } : undefined}>
            <span data-k="" data-min={min} data-max={max} className="mj-k" style={{ fontWeight: min }}>
              {ch === " " ? " " : ch}
            </span>
          </span>
        </span>
      ))}
    </span>
  );
}

function Marquee({ children, reverse, duration = 48, className = "" }: { children: ReactNode; reverse?: boolean; duration?: number; className?: string }) {
  return (
    <div className={`mj-marquee overflow-hidden ${className}`} data-reverse={reverse ? "" : undefined}>
      <div className="mj-marquee-track" style={{ "--dur": `${duration}s` } as CSSProperties}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}

function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <p className={`f-mono flex items-center gap-3 text-[11px] uppercase tracking-[.28em] text-steel ${className}`}>
      <span className="h-px w-8 bg-silver/50" aria-hidden="true" />
      {children}
    </p>
  );
}

function RotatingBadge({ className = "", style }: { className?: string; style?: CSSProperties }) {
  return (
    <a
      href="#lookbook"
      onClick={go("lookbook")}
      data-cursor="Lookbook"
      aria-label="Vai al lookbook"
      className={`mj-badge group grid place-items-center ${className}`}
      style={style}
    >
      <span className="mj-float relative grid h-[124px] w-[124px] place-items-center rounded-full border border-cream/15 bg-void/50 backdrop-blur-md md:h-[156px] md:w-[156px]">
        <svg viewBox="0 0 200 200" className="mj-spin absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <path id="mj-badge-circle" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
          </defs>
          <text className="f-sans" fill="#ECE3D2" fontSize="13.5" fontWeight="500" letterSpacing="3.2">
            <textPath href="#mj-badge-circle" textLength="474" lengthAdjust="spacing">
              HAUTE COUTURE • CHIVASSO • EDITION 2026 •
            </textPath>
          </text>
        </svg>
        <span className="grid h-12 w-12 place-items-center rounded-full bg-cream text-ink transition-transform duration-700 group-hover:rotate-[-45deg] md:h-14 md:w-14">
          <ArrowDownRight className="h-5 w-5" strokeWidth={1.4} />
        </span>
      </span>
    </a>
  );
}

/* ─────────────────────────── Header ─────────────────────────── */

const NAV: [string, string][] = [
  ["Lookbook", "lookbook"],
  ["Collezione", "collezione"],
  ["Atelier", "atelier"],
  ["Boutique", "boutique"],
];

function StatusDot({ open }: { open: boolean }) {
  return (
    <span className="relative inline-flex h-2 w-2" aria-hidden="true">
      {open && <span className="absolute inset-0 animate-ping rounded-full bg-cream/60" />}
      <span className={`relative h-2 w-2 rounded-full ${open ? "bg-cream" : "border border-steel"}`} />
    </span>
  );
}

function HeaderClock() {
  const t = useRomeTime();
  const st = shopStatus(t);
  return (
    <span className="f-mono hidden items-center gap-2.5 text-[11px] uppercase tracking-[.2em] text-silver md:inline-flex" title={st.text}>
      <StatusDot open={st.open} />
      Chivasso {String(t.h).padStart(2, "0")}:{String(t.m).padStart(2, "0")}
    </span>
  );
}

function Header() {
  const [solid, setSolid] = useState(false);
  const [menu, setMenu] = useState(false);
  useScrollLock(menu);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  useEffect(() => {
    if (!menu) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [menu]);

  const jump = (id: string) => (e: ReactMouseEvent) => {
    setMenu(false);
    go(id)(e);
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 z-50 border-b transition-[background-color,border-color] duration-500 ${
          solid ? "border-cream/10 bg-void/75 backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
        style={{ top: "env(safe-area-inset-top, 0px)" }}
      >
        <div className="mj-gutter mx-auto flex h-[72px] max-w-[1600px] items-center justify-between gap-6">
          <a href="#top" onClick={go("top")} className="f-serif text-[17px] tracking-[.34em] text-cream md:text-[19px]">
            MARIANNA&nbsp;J
          </a>
          <nav className="hidden items-center gap-10 lg:flex" aria-label="Sezioni">
            {NAV.map(([label, id]) => (
              <a key={id} href={`#${id}`} onClick={go(id)} className="f-sans mj-u pb-1 text-[12px] uppercase tracking-[.24em] text-cream/75 transition-colors hover:text-cream">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-5">
            <HeaderClock />
            <a
              href={wa("Ciao Marianna J, vorrei prenotare un private viewing in boutique.")}
              target="_blank"
              rel="noreferrer"
              className="f-sans mj-sheen hidden items-center gap-2 rounded-full border border-cream/25 px-5 py-2.5 text-[11px] uppercase tracking-[.22em] text-cream transition-colors hover:border-cream hover:bg-cream hover:text-ink sm:inline-flex"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} /> Private Viewing
            </a>
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 text-cream lg:hidden"
              aria-label="Apri il menu"
            >
              <Menu className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {menu && (
        <div className="mj-veil-in fixed inset-0 z-[75] flex flex-col bg-ink" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="mj-gutter flex h-[72px] items-center justify-between" style={{ marginTop: "env(safe-area-inset-top, 0px)" }}>
            <span className="f-serif text-[17px] tracking-[.34em]">MARIANNA&nbsp;J</span>
            <button type="button" onClick={() => setMenu(false)} className="grid h-10 w-10 place-items-center rounded-full border border-cream/20" aria-label="Chiudi il menu">
              <X className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
          <nav className="mj-gutter flex flex-1 flex-col justify-center gap-2" aria-label="Sezioni">
            {NAV.map(([label, id], i) => (
              <a key={id} href={`#${id}`} onClick={jump(id)} className="f-serif mj-pop text-[13vw] italic leading-[1.05] text-cream" style={{ animationDelay: `${i * 70}ms` }}>
                {label}
              </a>
            ))}
          </nav>
          <div className="mj-gutter f-mono flex flex-col gap-1 pb-[calc(28px+env(safe-area-inset-bottom,0px))] text-[11px] uppercase tracking-[.2em] text-steel">
            <span>{ADDRESS}</span>
            <span>{COORDS}</span>
          </div>
        </div>
      )}
    </>
  );
}

/* ─────────────────────────── Hero ─────────────────────────── */

function Hero({ onOpen }: { onOpen: (item: Item) => void }) {
  const hero = useRef<HTMLElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  useKinetic(title);
  const heroItem = byId(HERO.item);

  const parallax = (e: ReactPointerEvent<HTMLElement>) => {
    const el = hero.current;
    if (!el || e.pointerType !== "mouse" || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3));
    el.style.setProperty("--py", (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3));
  };

  const spot = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = frame.current;
    if (!el || e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--sx", `${e.clientX - r.left}px`);
    el.style.setProperty("--sy", `${e.clientY - r.top}px`);
    el.dataset.on = "1";
  };

  const layer = (k: number, ky = k * 0.7): CSSProperties => ({
    transform: `translate3d(calc(var(--px, 0) * ${k}px), calc(var(--py, 0) * ${ky}px), 0)`,
    transition: "transform 1.1s cubic-bezier(.16,1,.3,1)",
  });

  return (
    <section
      id="top"
      ref={hero}
      onPointerMove={parallax}
      className="relative overflow-hidden"
      style={{ paddingTop: "calc(96px + env(safe-area-inset-top, 0px))" }}
    >
      <div className="mj-gutter relative mx-auto max-w-[1600px]">
        <div className="f-mono mj-fade flex items-center justify-between gap-4 text-[10.5px] uppercase tracking-[.28em] text-steel md:text-[11px]">
          <span>Boutique · Via Torino, Chivasso</span>
          <span className="hidden sm:inline">Autunno / Inverno 2026—27</span>
        </div>

        <div className="relative mt-6 pb-10 lg:mt-4 lg:h-[min(80svh,880px)] lg:min-h-[640px] lg:pb-0">
          {/* Titolo cinetico: sans geometrico sottile + serif italico sovrapposto */}
          <h1
            ref={title}
            aria-label="Marianna J"
            className="pointer-events-none relative z-20 select-none text-cream mix-blend-difference lg:absolute lg:inset-x-0 lg:top-[4%]"
          >
            <span className="f-sans block text-[17.5vw] uppercase leading-[.82] tracking-[-.035em] lg:text-[13.6vw] 2xl:text-[218px]">
              <KineticWord text="Marianna" min={200} max={820} delay={350} />
            </span>
            <span
              className="f-serif -mt-[.28em] block pr-[2vw] text-right text-[34vw] italic leading-[.72] lg:-mt-[.2em] lg:pr-[17%] lg:text-[25vw] 2xl:text-[400px]"
              style={layer(22)}
            >
              <KineticWord text="J." min={400} max={900} delay={820} />
            </span>
          </h1>

          {/* Immagine editoriale: tenda d'apertura, bianco e nero, il colore si rivela sotto il cursore */}
          <div
            className="relative z-10 mx-auto mt-[-14vw] w-[86%] sm:w-[62%] lg:absolute lg:right-[5%] lg:top-0 lg:mt-0 lg:h-full lg:w-[33%]"
            style={layer(-14)}
          >
            <Tilt max={4} scale={1} className="relative h-full w-full lg:h-[calc(100%-34px)]">
              <div
                ref={frame}
                onPointerMove={spot}
                onPointerLeave={() => frame.current && delete frame.current.dataset.on}
                onClick={() => {
                  const el = frame.current;
                  if (!el || finePointer()) return;
                  if (el.dataset.full) delete el.dataset.full;
                  else el.dataset.full = "1";
                }}
                data-cursor="Colore"
                className="mj-frame relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto lg:h-full"
              >
                <Photo
                  src={photo(HERO.photo, 1400)}
                  alt="Modella in cappotto cammello, editoriale Autunno/Inverno di Marianna J"
                  tone={HERO.tone}
                  texture="spina"
                  eager
                  className="absolute inset-0"
                  imgClassName="mj-kb grayscale contrast-[1.12] brightness-[.82]"
                />
                <span className="mj-spot absolute inset-0 block">
                  <Photo
                    src={photo(HERO.photo, 1400)}
                    alt=""
                    tone={heroItem.hex}
                    texture="spina"
                    eager
                    className="absolute inset-0"
                    imgClassName="mj-kb"
                  />
                </span>
                <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent" />
                <span className="mj-curtain" aria-hidden="true">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <i key={i} style={{ animationDelay: `${250 + i * 110}ms` }} />
                  ))}
                </span>
              </div>
            </Tilt>
            <button
              type="button"
              onClick={() => onOpen(heroItem)}
              data-cursor="Scheda"
              className="f-mono group mt-3 flex w-full items-center justify-between gap-3 text-left text-[10.5px] uppercase tracking-[.2em] text-steel transition-colors hover:text-cream"
            >
              <span>
                In foto · {heroItem.name} · {eur(heroItem.price)}
              </span>
              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={1.4} />
            </button>
            <RotatingBadge className="absolute -left-6 bottom-16 z-30 md:-left-20 md:bottom-24" style={layer(30)} />
          </div>

          {/* Testo e azioni */}
          <div className="relative z-20 mt-12 max-w-[25rem] lg:absolute lg:bottom-[5%] lg:left-0 lg:mt-0">
            <p className="f-serif text-[22px] italic leading-snug text-cream md:text-[26px]">Haute couture, a Chivasso.</p>
            <p className="f-sans mt-4 text-[15px] leading-relaxed text-cream/65">
              Capi scelti uno a uno e provati con calma. Ogni pezzo della collezione è numerato e si prova su appuntamento, in un camerino riservato a te.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="#lookbook"
                onClick={go("lookbook")}
                data-cursor="Scorri"
                className="f-sans mj-sheen inline-flex items-center gap-3 rounded-full bg-cream px-7 py-4 text-[11px] uppercase tracking-[.24em] text-ink"
              >
                Entra nel lookbook <ArrowDownRight className="h-4 w-4" strokeWidth={1.5} />
              </a>
              <a
                href={wa("Ciao Marianna J, vorrei prenotare un private viewing in boutique.")}
                target="_blank"
                rel="noreferrer"
                className="f-sans inline-flex items-center gap-3 rounded-full border border-cream/25 px-7 py-4 text-[11px] uppercase tracking-[.24em] text-cream transition-colors hover:border-cream"
              >
                Private viewing
              </a>
            </div>
            <p className="f-mono mt-6 hidden text-[10px] uppercase tracking-[.22em] text-steel lg:block">Passa sulla foto: il colore si rivela</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Ticker() {
  const kind = { mono: "f-mono text-[12px] uppercase tracking-[.26em] text-silver", serif: "f-serif text-[22px] italic text-cream", sans: "f-sans text-[13px] uppercase tracking-[.3em] text-cream/80" };
  return (
    <Marquee duration={52} className="border-y border-cream/10 bg-ink py-5">
      {TICKER.map((it, i) => (
        <span key={i} className="flex items-center">
          <span className={`whitespace-nowrap ${kind[it.k]}`}>{it.t}</span>
          <Sparkle className="mx-9 h-3 w-3 text-silver/60" strokeWidth={1.2} aria-hidden="true" />
        </span>
      ))}
    </Marquee>
  );
}

/* ─────────────────────────── Lookbook ─────────────────────────── */

function Lookbook({ onOpen, onTry }: { onOpen: (item: Item) => void; onTry: (item: Item) => void }) {
  const [li, setLi] = useState(0);
  const [active, setActive] = useState<number | null>(0);
  const look = LOOKS[li];
  const frame = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [nat, setNat] = useState({ w: look.w, h: look.h });

  useEffect(() => {
    setNat({ w: look.w, h: look.h });
    setActive(0);
  }, [look]);

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setBox({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const key = (e: KeyboardEvent) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);

  // Proietta i pin dalla foto originale al riquadro "object-cover".
  const s = Math.max(box.w / nat.w, box.h / nat.h) || 0;
  const rw = nat.w * s;
  const rh = nat.h * s;
  const ox = (box.w - rw) * look.pos[0];
  const oy = (box.h - rh) * look.pos[1];
  const pins = look.pins.map((p, i) => {
    const x = ox + (p.x / 100) * rw;
    const y = oy + (p.y / 100) * rh;
    return { i, x, y, item: byId(p.id), show: box.w > 0 && x > 24 && x < box.w - 24 && y > 96 && y < box.h - 24 };
  });
  const cur = active !== null ? pins[active] : null;
  const mobile = box.w > 0 && box.w < 720;
  const CARD_W = 330;
  const cardStyle: CSSProperties = !cur
    ? {}
    : mobile
      ? { left: 12, right: 12, bottom: 12 }
      : {
          width: CARD_W,
          left: cur.x < box.w * 0.55 ? cur.x + 36 : cur.x - 36 - CARD_W,
          top: Math.min(Math.max(cur.y - 80, 100), box.h - 330),
        };

  const step = (d: number) => setLi((i) => (i + d + LOOKS.length) % LOOKS.length);

  return (
    <section id="lookbook" className="relative scroll-mt-0 bg-void">
      <div ref={frame} className="relative h-[100svh] max-h-[1100px] min-h-[640px] overflow-hidden" onClick={() => setActive(null)}>
        <div key={look.id} className="mj-fade absolute inset-0">
          <Photo
            src={photo(look.photo, 2000)}
            alt={`${look.title}: ${look.line}`}
            tone={look.tone}
            texture="flanella"
            className="absolute inset-0"
            imgClassName="mj-kb"
            imgStyle={{ objectPosition: `${look.pos[0] * 100}% ${look.pos[1] * 100}%` }}
            onReady={(w, h) => setNat({ w, h })}
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-void/80 via-void/10 to-void/70" />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-gradient-to-r from-void/60 to-transparent" />

        <div className="mj-gutter pointer-events-none absolute inset-x-0 top-0 mx-auto max-w-[1600px] pt-[calc(104px+env(safe-area-inset-top,0px))]">
          <Eyebrow>Lookbook interattivo · A/I 2026—27</Eyebrow>
          <h2 key={look.id} className="f-serif mj-pop mt-5 text-[13vw] leading-[.9] text-cream md:text-[7.5vw] 2xl:text-[120px]">
            {look.title}
          </h2>
          <p className="f-serif mt-3 max-w-md text-[18px] italic text-cream/75 md:text-[22px]">{look.line}</p>
          <p className="f-mono mt-6 hidden text-[10.5px] uppercase tracking-[.22em] text-steel md:block">Tocca i punti sui capi per aprirne il dettaglio</p>
        </div>

        {pins.map((p) =>
          p.show ? (
            <button
              key={`${look.id}-${p.i}`}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActive(active === p.i ? null : p.i);
              }}
              aria-label={`${p.item.name}, ${eur(p.item.price)}`}
              aria-expanded={active === p.i}
              data-cursor="Dettaglio"
              className="group absolute z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: p.x, top: p.y }}
            >
              <span
                className={`mj-pin relative grid h-9 w-9 place-items-center rounded-full border text-[10px] transition-all duration-500 ${
                  active === p.i ? "border-cream bg-cream text-ink" : "border-cream/70 bg-void/40 text-cream backdrop-blur-md group-hover:bg-cream group-hover:text-ink"
                }`}
              >
                <span className="f-mono">{String(p.i + 1).padStart(2, "0")}</span>
              </span>
              <span className="f-sans pointer-events-none absolute left-11 top-1/2 hidden -translate-y-1/2 translate-x-2 whitespace-nowrap rounded-full bg-void/70 px-3 py-1.5 text-[10px] uppercase tracking-[.2em] text-cream opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100 md:block">
                {p.item.cat}
              </span>
            </button>
          ) : null,
        )}

        {cur && cur.show && (
          <div
            key={`${look.id}-${cur.i}`}
            className="mj-pop absolute z-30"
            style={cardStyle}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={cur.item.name}
          >
            <Tilt max={6} className="mj-glass relative rounded-[3px] p-4">
              <div className="relative z-10 flex gap-4">
                <Photo
                  src={photo(cur.item.photo, 400)}
                  alt={cur.item.name}
                  tone={cur.item.hex}
                  texture={cur.item.texture}
                  className="aspect-[3/4] w-[88px] shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <div className="f-mono flex items-center justify-between text-[10px] uppercase tracking-[.2em] text-steel">
                    <span>
                      {String(cur.i + 1).padStart(2, "0")} · {cur.item.cat}
                    </span>
                    <button type="button" onClick={() => setActive(null)} className="-mr-1 -mt-1 grid h-7 w-7 place-items-center rounded-full text-cream/70 hover:text-cream" aria-label="Chiudi">
                      <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                  <p className="f-serif mt-1 text-[19px] leading-tight text-cream">{cur.item.name}</p>
                  <p className="f-sans mt-1.5 text-[12.5px] text-cream/60">
                    {cur.item.material} · {cur.item.color}
                  </p>
                  <p className="f-mono mt-2 text-[15px] text-cream">{eur(cur.item.price)}</p>
                </div>
              </div>
              <div className="relative z-10 mt-4 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onTry(cur.item)}
                  data-cursor="Prova"
                  className="f-sans mj-sheen inline-flex items-center justify-center gap-2 rounded-full bg-cream px-3 py-3 text-[10.5px] uppercase tracking-[.2em] text-ink"
                >
                  <Layers className="h-3.5 w-3.5" strokeWidth={1.5} /> Provalo
                </button>
                <button
                  type="button"
                  onClick={() => onOpen(cur.item)}
                  data-cursor="Scheda"
                  className="f-sans inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-3 py-3 text-[10.5px] uppercase tracking-[.2em] text-cream hover:border-cream"
                >
                  Scheda <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              </div>
            </Tilt>
          </div>
        )}

        <div
          className={`absolute z-20 flex items-center gap-3 ${mobile ? "right-3 top-[calc(84px+env(safe-area-inset-top,0px))]" : "bottom-8 right-[max(40px,env(safe-area-inset-right,0px))]"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" onClick={() => step(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-cream/25 bg-void/40 text-cream backdrop-blur-md transition-colors hover:bg-cream hover:text-ink" aria-label="Look precedente">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.4} />
          </button>
          <span className="f-mono min-w-[64px] text-center text-[12px] tracking-[.2em] text-cream">
            {look.id} / {String(LOOKS.length).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => step(1)} className="grid h-11 w-11 place-items-center rounded-full border border-cream/25 bg-void/40 text-cream backdrop-blur-md transition-colors hover:bg-cream hover:text-ink" aria-label="Look successivo">
            <ArrowRight className="h-4 w-4" strokeWidth={1.4} />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Collezione ─────────────────────────── */

function ProductCard({ item, index, onOpen }: { item: Item; index: number; onOpen: (item: Item) => void }) {
  return (
    <article className={index % 2 === 1 ? "lg:mt-24" : ""}>
      <Tilt max={7} className="relative overflow-hidden rounded-[2px]">
        <button type="button" onClick={() => onOpen(item)} data-cursor="Scopri" className="group block w-full text-left" aria-label={`${item.name}, ${eur(item.price)}`}>
          <Photo
            src={photo(item.photo, 900)}
            alt={item.name}
            tone={item.hex}
            texture={item.texture}
            className="aspect-[3/4] w-full"
            imgClassName="mj-slowzoom"
            caption={`${item.material} — ${item.color}`}
          />
          <span className="pointer-events-none absolute inset-0 block bg-gradient-to-t from-void/85 via-void/0 to-void/20 opacity-70 transition-opacity duration-700 group-hover:opacity-100" />
          <span className="f-mono absolute left-3 top-3 block rounded-full border border-cream/20 bg-void/45 px-3 py-1.5 text-[10.5px] tracking-[.18em] text-cream backdrop-blur-md">
            {edition(item)}
          </span>
          <span className="f-sans absolute right-3 top-3 block text-[10px] uppercase tracking-[.24em] text-cream/75">{item.cat}</span>
          <span className="mj-touch-show absolute inset-x-3 bottom-3 block translate-y-3 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="f-sans block text-[12px] leading-snug text-cream/80">{item.desc}</span>
            <span className="f-mono mt-3 flex items-center justify-between border-t border-cream/20 pt-3 text-[10px] uppercase tracking-[.2em] text-cream">
              Apri la scheda <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.4} />
            </span>
          </span>
        </button>
      </Tilt>
      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="f-serif text-[19px] leading-tight text-cream">{item.name}</h3>
        <span className="f-mono shrink-0 text-[13px] text-cream/80">{eur(item.price)}</span>
      </div>
      <p className="f-sans mt-1.5 flex items-center gap-2 text-[12.5px] text-steel">
        <span className="h-2.5 w-2.5 rounded-full border border-cream/20" style={{ background: item.hex }} aria-hidden="true" />
        {item.color} · {item.material}
      </p>
    </article>
  );
}

function Collection({ onOpen }: { onOpen: (item: Item) => void }) {
  const [filter, setFilter] = useState<"Tutti" | Cat>("Tutti");
  const list = filter === "Tutti" ? COLLECTION : COLLECTION.filter((i) => i.cat === filter);
  const filters: ("Tutti" | Cat)[] = ["Tutti", ...CATS];
  return (
    <section id="collezione" className="relative scroll-mt-20 bg-void py-24 md:py-36">
      <div className="mj-gutter mx-auto max-w-[1600px]">
        <div className="grid gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>La Collezione · Edizione numerata</Eyebrow>
            <h2 className="f-serif mt-6 text-[12vw] leading-[.92] text-cream md:text-[6.4vw] 2xl:text-[104px]">
              Otto pezzi, <em className="text-silver">ognuno</em> col suo numero.
            </h2>
          </div>
          <p className="f-sans text-[15px] leading-relaxed text-cream/60 lg:col-span-4 lg:col-start-9">
            Ogni capo arriva in boutique in poche taglie. Apri la scheda per tessuto, vestibilità e disponibilità, poi chiedi un private viewing: lo prepariamo nella tua taglia prima che arrivi.
          </p>
        </div>

        <div className="mj-scroll-x mt-14 flex gap-8 overflow-x-auto border-b border-cream/10" aria-label="Filtra per categoria">
          {filters.map((f) => {
            const n = f === "Tutti" ? COLLECTION.length : COLLECTION.filter((i) => i.cat === f).length;
            const on = filter === f;
            return (
              <button
                key={f}
                type="button"
                aria-pressed={on}
                onClick={() => setFilter(f)}
                className={`f-sans -mb-px flex items-baseline gap-2 whitespace-nowrap border-b pb-4 text-[12px] uppercase tracking-[.22em] transition-colors ${
                  on ? "border-cream text-cream" : "border-transparent text-steel hover:text-cream"
                }`}
              >
                {f} <span className="f-mono text-[10px] text-steel">{String(n).padStart(2, "0")}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((item, i) => (
            <ProductCard key={item.id} item={item} index={i} onOpen={onOpen} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FabricRibbon() {
  return (
    <Marquee reverse duration={70} className="border-y border-cream/10 bg-void py-8 md:py-12">
      {FABRICS.map((f) => (
        <span key={f} className="flex items-center">
          <span className="f-serif mj-outline whitespace-nowrap px-6 text-[15vw] italic leading-none md:text-[9vw] 2xl:text-[150px]">{f}</span>
          <span className="f-mono px-6 text-[11px] uppercase tracking-[.3em] text-steel">◆</span>
        </span>
      ))}
    </Marquee>
  );
}

/* ─────────────────────────── Mix & Match ─────────────────────────── */

type Outfit = Record<Cat, string | null>;
const DEFAULT_OUTFIT: Outfit = { Capospalla: "c1", Top: "t2", Pantaloni: "p1", Accessori: "a1" };

const FRAME: Record<Cat, string> = {
  Capospalla: "left-0 top-0 z-10 h-[60%] w-[56%]",
  Top: "right-0 top-[5%] z-20 h-[40%] w-[40%]",
  Pantaloni: "bottom-0 left-[9%] z-30 h-[44%] w-[37%]",
  Accessori: "bottom-[6%] right-[3%] z-40 h-[33%] w-[43%]",
};

function MixMatch({ outfit, setOutfit, flash, onOpen }: { outfit: Outfit; setOutfit: (o: Outfit | ((o: Outfit) => Outfit)) => void; flash: string | null; onOpen: (item: Item) => void }) {
  const chosen = CATS.map((c) => [c, outfit[c] ? byId(outfit[c]!) : null] as const);
  const items = chosen.flatMap(([, it]) => (it ? [it] : []));
  const total = items.reduce((s, it) => s + it.price, 0);
  const shown = useTween(total);
  const days = useMemo(() => fittingDays(romeNow()), []);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState(days[0]?.slots[0] ?? "");

  const pickDay = (i: number) => {
    setDay(i);
    setSlot(days[i]?.slots[0] ?? "");
  };

  const toggle = (it: Item) => setOutfit((o) => ({ ...o, [it.cat]: o[it.cat] === it.id ? null : it.id }));
  const shuffle = () =>
    setOutfit((o) => {
      const next = { ...o };
      for (const c of CATS) {
        const pool = ITEMS.filter((i) => i.cat === c && i.id !== o[c]);
        next[c] = pool[Math.floor(Math.random() * pool.length)].id;
      }
      return next;
    });

  const when = days[day] ? `${days[day].long}, ore ${slot}` : "";
  const message = [
    "Ciao Marianna J, vorrei prenotare un fitting privato in Via Torino con questo outfit:",
    ...chosen.flatMap(([c, it]) => (it ? [`— ${c}: ${it.name} (${it.color}, ${eur(it.price)})`] : [])),
    `Totale look: ${eur(total)}`,
    when ? `Preferenza: ${when}.` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return (
    <section id="atelier" className="relative scroll-mt-16 bg-ink py-24 md:py-36">
      <div className="mj-gutter mx-auto max-w-[1600px]">
        <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <Eyebrow>Atelier · Virtual stylist</Eyebrow>
            <h2 className="mt-6 leading-[.85] text-cream">
              <span className="f-serif block text-[16vw] italic md:text-[9vw] 2xl:text-[150px]">Mix</span>
              <span className="f-sans -mt-[.12em] block pl-[12vw] text-[13vw] font-[200] uppercase tracking-[-.02em] md:pl-[7vw] md:text-[7.2vw] 2xl:text-[120px]">
                &amp; Match
              </span>
            </h2>
          </div>
          <p className="f-sans text-[15px] leading-relaxed text-cream/60 lg:col-span-4 lg:col-start-9">
            Scegli un capospalla, un top, un pantalone e un accessorio. Il total look si aggiorna mentre lo componi e lo trovi pronto in camerino al tuo fitting.
          </p>
        </div>

        <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="flex flex-col gap-12 lg:col-span-7">
            {CATS.map((c) => {
              const sel = outfit[c] ? byId(outfit[c]!) : null;
              return (
                <div key={c} id={`row-${c}`} className="scroll-mt-28">
                  <div className="flex items-baseline justify-between gap-4 border-b border-cream/10 pb-3">
                    <p className="f-sans text-[12px] uppercase tracking-[.26em] text-cream">{c}</p>
                    <p className="f-mono truncate text-[11px] text-steel">{sel ? `${sel.name} · ${eur(sel.price)}` : "Nessuno"}</p>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-3 md:gap-5">
                    {ITEMS.filter((i) => i.cat === c).map((it) => {
                      const on = outfit[c] === it.id;
                      return (
                        <Tilt key={it.id} max={10} className={`relative rounded-[2px] ${flash === it.id ? "mj-flash" : ""}`}>
                          <button type="button" onClick={() => toggle(it)} aria-pressed={on} data-cursor={on ? "Togli" : "Scegli"} className="group block w-full text-left">
                            <Photo
                              src={photo(it.photo, 600)}
                              alt={it.name}
                              tone={it.hex}
                              texture={it.texture}
                              caption={it.color}
                              className={`aspect-[3/4] w-full border transition-colors duration-500 ${on ? "border-cream" : "border-cream/10"}`}
                              imgClassName={`mj-slowzoom ${on ? "" : "brightness-[.72] saturate-[.7]"}`}
                            />
                            <span
                              className={`absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full transition-all duration-500 ${
                                on ? "scale-100 bg-cream text-ink opacity-100" : "scale-75 border border-cream/40 opacity-0 group-hover:opacity-100"
                              }`}
                              aria-hidden="true"
                            >
                              {on ? <Check className="h-3.5 w-3.5" strokeWidth={2} /> : <Plus className="h-3 w-3 text-cream" strokeWidth={1.5} />}
                            </span>
                            <span className={`f-sans mt-3 block text-[12.5px] leading-tight md:text-[13.5px] ${on ? "text-cream" : "text-cream/70"}`}>{it.name}</span>
                            <span className="f-mono mt-1 block text-[11px] text-steel">{eur(it.price)}</span>
                          </button>
                        </Tilt>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-[calc(96px+env(safe-area-inset-top,0px))]">
              <Tilt max={3} scale={1} className="mj-glass relative rounded-[3px] p-5 md:p-7">
                <div className="relative z-10">
                  <div className="flex items-center justify-between gap-4">
                    <p className="f-serif text-[24px] italic text-cream">Il tuo total look</p>
                    <div className="flex gap-2">
                      <button type="button" onClick={shuffle} data-cursor="Mescola" className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:bg-cream hover:text-ink" aria-label="Componi un look a caso">
                        <Shuffle className="h-4 w-4" strokeWidth={1.4} />
                      </button>
                      <button type="button" onClick={() => setOutfit(DEFAULT_OUTFIT)} className="grid h-10 w-10 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:bg-cream hover:text-ink" aria-label="Torna al look iniziale">
                        <RotateCcw className="h-4 w-4" strokeWidth={1.4} />
                      </button>
                    </div>
                  </div>

                  <div className="relative mt-6 aspect-[4/5] w-full">
                    {chosen.map(([c, it]) => (
                      <span key={c} className={`absolute block ${FRAME[c]}`}>
                        {it ? (
                          <button type="button" key={it.id} onClick={() => onOpen(it)} data-cursor="Scheda" className="mj-swap relative block h-full w-full shadow-[0_30px_60px_-24px_rgba(0,0,0,.9)]">
                            <Photo src={photo(it.photo, 700)} alt={it.name} tone={it.hex} texture={it.texture} caption={it.name} className="h-full w-full border border-cream/15" />
                            <span className="f-mono absolute left-2 top-2 block rounded-full bg-void/65 px-2 py-1 text-[9px] uppercase tracking-[.2em] text-cream/85 backdrop-blur">{c}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => document.getElementById(`row-${c}`)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" })}
                            className="f-mono flex h-full w-full flex-col items-center justify-center gap-2 border border-dashed border-cream/20 bg-void/30 text-[10px] uppercase tracking-[.2em] text-cream/45 transition-colors hover:text-cream"
                          >
                            <Plus className="h-4 w-4" strokeWidth={1.2} />
                            {c}
                          </button>
                        )}
                      </span>
                    ))}
                  </div>

                  <ul className="mt-6 divide-y divide-cream/10 border-y border-cream/10">
                    {chosen.map(([c, it]) => (
                      <li key={c} className="flex items-baseline justify-between gap-4 py-2.5">
                        <span className="f-sans min-w-0 truncate text-[13px] text-cream/80">
                          <span className="f-mono mr-3 text-[10px] uppercase tracking-[.18em] text-steel">{c}</span>
                          {it ? it.name : "—"}
                        </span>
                        <span className="f-mono shrink-0 text-[12px] text-cream/80">{it ? eur(it.price) : ""}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-end justify-between">
                    <span className="f-mono text-[11px] uppercase tracking-[.24em] text-steel">Totale look</span>
                    <span className="f-serif text-[40px] leading-none text-cream" aria-live="polite">
                      {eur(Math.round(shown))}
                    </span>
                  </div>

                  {days.length > 0 && (
                    <div className="mt-7">
                      <p className="f-mono flex items-center gap-2 text-[10.5px] uppercase tracking-[.22em] text-steel">
                        <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.4} /> Quando vuoi passare
                      </p>
                      <div className="mj-scroll-x mt-3 flex gap-2 overflow-x-auto pb-1">
                        {days.map((d, i) => (
                          <button
                            key={d.key}
                            type="button"
                            onClick={() => pickDay(i)}
                            aria-pressed={day === i}
                            className={`f-sans shrink-0 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[.16em] transition-colors ${
                              day === i ? "border-cream bg-cream text-ink" : "border-cream/20 text-cream/75 hover:border-cream/60"
                            }`}
                          >
                            {d.short}
                          </button>
                        ))}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {days[day]?.slots.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => setSlot(s)}
                            aria-pressed={slot === s}
                            className={`f-mono rounded-full border px-3 py-1.5 text-[11px] transition-colors ${
                              slot === s ? "border-silver text-cream" : "border-cream/10 text-steel hover:text-cream"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {items.length > 0 ? (
                    <a
                      href={wa(message)}
                      target="_blank"
                      rel="noreferrer"
                      data-cursor="Prenota"
                      className="f-sans mj-sheen mt-7 flex items-center justify-center gap-3 rounded-full bg-cream px-6 py-4 text-center text-[11px] uppercase leading-snug tracking-[.2em] text-ink"
                    >
                      <MessageCircle className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                      Prenota fitting privato in Via Torino con questo outfit
                    </a>
                  ) : (
                    <p className="f-sans mt-7 rounded-full border border-dashed border-cream/20 px-6 py-4 text-center text-[11px] uppercase tracking-[.2em] text-steel">
                      Scegli almeno un capo per prenotare
                    </p>
                  )}
                  <p className="f-mono mt-3 text-center text-[10px] uppercase tracking-[.18em] text-steel">Il messaggio si apre su WhatsApp già compilato</p>
                </div>
              </Tilt>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Drawer prodotto ─────────────────────────── */

type DrawerState = { item: Item; open: boolean } | null;

function Drawer({ state, onClose, onTry }: { state: DrawerState; onClose: () => void; onTry: (item: Item) => void }) {
  const item = state?.item ?? null;
  const open = !!state?.open;
  const [size, setSize] = useState("");
  const closeBtn = useRef<HTMLButtonElement>(null);
  const lens = useRef<HTMLSpanElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (item) setSize(item.sizes.find(([, n]) => n > 0)?.[0] ?? "");
  }, [item]);

  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", key);
    closeBtn.current?.focus({ preventScroll: true });
    return () => window.removeEventListener("keydown", key);
  }, [open, onClose]);

  if (!item) return null;
  const num = edition(item);
  const stock = item.sizes.find(([s]) => s === size)?.[1] ?? 0;

  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={item.name}>
      <div className={`absolute inset-0 bg-void/70 backdrop-blur-[6px] ${open ? "mj-veil-in" : "mj-veil-out"}`} onClick={onClose} />
      <aside
        className={`absolute inset-y-0 right-0 flex w-full flex-col border-l border-cream/10 bg-ink sm:w-[min(540px,100%)] ${open ? "mj-drawer-in" : "mj-drawer-out"}`}
        style={{ paddingTop: "env(safe-area-inset-top, 0px)", paddingRight: "env(safe-area-inset-right, 0px)" }}
      >
        <div className="flex items-center justify-between border-b border-cream/10 px-6 py-4">
          <span className="f-mono text-[11px] uppercase tracking-[.22em] text-steel">
            {num ?? "Atelier"} · {item.cat}
          </span>
          <button ref={closeBtn} type="button" onClick={onClose} className="grid h-10 w-10 place-items-center rounded-full border border-cream/15 text-cream transition-colors hover:bg-cream hover:text-ink" aria-label="Chiudi la scheda">
            <X className="h-4 w-4" strokeWidth={1.4} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overscroll-contain">
          <span
            ref={lens}
            className="mj-lens relative block"
            data-cursor="Zoom"
            onPointerMove={(e) => {
              const el = lens.current;
              if (!el) return;
              const r = el.getBoundingClientRect();
              el.style.setProperty("--ox", `${((e.clientX - r.left) / r.width) * 100}%`);
              el.style.setProperty("--oy", `${((e.clientY - r.top) / r.height) * 100}%`);
            }}
          >
            <Photo
              src={photo(item.photo, 1200)}
              alt={item.name}
              tone={item.hex}
              texture={item.texture}
              caption={`${item.material} — ${item.color}`}
              className="aspect-[4/5] w-full"
              imgClassName="mj-lens-img"
            />
          </span>

          <div className="px-6 pb-10 pt-7">
            <h3 className="f-serif text-[32px] leading-[1.05] text-cream">{item.name}</h3>
            <div className="mt-3 flex items-center justify-between">
              <span className="f-sans flex items-center gap-2 text-[13px] text-cream/70">
                <span className="h-3 w-3 rounded-full border border-cream/25" style={{ background: item.hex }} aria-hidden="true" />
                {item.color}
              </span>
              <span className="f-mono text-[20px] text-cream">{eur(item.price)}</span>
            </div>
            <p className="f-sans mt-6 text-[14.5px] leading-relaxed text-cream/70">{item.desc}</p>

            <div className="mt-8">
              <p className="f-mono text-[10.5px] uppercase tracking-[.24em] text-steel">Tessuto e composizione</p>
              <dl className="mt-3 divide-y divide-cream/10 border-y border-cream/10">
                {item.composition.map(([k, v]) => (
                  <div key={k + v} className="flex justify-between gap-4 py-2.5 text-[13.5px]">
                    <dt className="f-mono text-cream">{k}</dt>
                    <dd className="f-sans text-cream/75">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <ul className="mt-6 flex flex-col gap-3">
              <li className="f-sans flex gap-3 text-[13px] leading-relaxed text-cream/70">
                <Ruler className="mt-0.5 h-4 w-4 shrink-0 text-silver" strokeWidth={1.3} /> {item.fit}
              </li>
              <li className="f-sans flex gap-3 text-[13px] leading-relaxed text-cream/70">
                <Scissors className="mt-0.5 h-4 w-4 shrink-0 text-silver" strokeWidth={1.3} /> {item.care}
              </li>
            </ul>

            <div className="mt-8">
              <div className="flex items-baseline justify-between">
                <p className="f-mono text-[10.5px] uppercase tracking-[.24em] text-steel">Taglia</p>
                <p className="f-mono text-[10.5px] uppercase tracking-[.18em] text-silver">
                  {stock === 1 ? "Ultimo pezzo" : stock > 1 ? `${stock} disponibili` : "Esaurita"}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {item.sizes.map(([s, n]) => (
                  <button
                    key={s}
                    type="button"
                    disabled={n === 0}
                    onClick={() => setSize(s)}
                    aria-pressed={size === s}
                    className={`f-mono relative h-11 min-w-[48px] rounded-full border px-4 text-[12px] transition-colors ${
                      n === 0
                        ? "cursor-not-allowed border-cream/10 text-cream/25 line-through"
                        : size === s
                          ? "border-cream bg-cream text-ink"
                          : "border-cream/20 text-cream hover:border-cream/70"
                    }`}
                  >
                    {s}
                    {n === 1 && <span className={`absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full ${size === s ? "bg-ink" : "bg-silver"}`} aria-hidden="true" />}
                  </button>
                ))}
              </div>
              <p className="f-sans mt-3 text-[12px] text-steel">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-silver align-middle" aria-hidden="true" /> ultimo pezzo · le taglie barrate sono esaurite. Disponibilità confermata su WhatsApp.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-cream/10 bg-ink px-6 pt-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}>
          <a
            href={wa(`Ciao Marianna J, vorrei richiedere un private viewing in boutique per il capo ${num ? `n. ${num} ` : ""}"${item.name}" (${item.color}, taglia ${size || "da definire"}). Quando posso passare in Via Torino?`)}
            target="_blank"
            rel="noreferrer"
            data-cursor="WhatsApp"
            className="f-sans mj-sheen flex items-center justify-center gap-3 rounded-full bg-cream px-6 py-4 text-[11px] uppercase tracking-[.22em] text-ink"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} /> Richiedi Private Viewing via WhatsApp
          </a>
          <button
            type="button"
            onClick={() => onTry(item)}
            className="f-sans mt-2 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-[10.5px] uppercase tracking-[.22em] text-cream/75 transition-colors hover:text-cream"
          >
            <Layers className="h-3.5 w-3.5" strokeWidth={1.5} /> Aggiungi al Mix &amp; Match
          </button>
        </div>
      </aside>
    </div>
  );
}

/* ─────────────────────────── Atelier & località ─────────────────────────── */

function AnalogClock({ t }: { t: RomeNow }) {
  const sec = t.h * 3600 + t.m * 60 + t.s;
  const hand = (deg: number): CSSProperties => ({
    transform: `rotate(${deg}deg)`,
    transformOrigin: "100px 100px",
    transition: "transform .55s cubic-bezier(.4,1.8,.5,1)",
  });
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`Ora di Chivasso ${t.h}:${String(t.m).padStart(2, "0")}`}>
      <circle cx="100" cy="100" r="97" fill="#0D0D0D" stroke="rgba(195,198,203,.35)" strokeWidth="1" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="rgba(195,198,203,.1)" strokeWidth="1" />
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          x1="100"
          y1={i % 5 ? 9 : 7}
          x2="100"
          y2={i % 5 ? 14 : 20}
          stroke={i % 5 ? "rgba(195,198,203,.4)" : "#ECE3D2"}
          strokeWidth={i % 5 ? 0.8 : 1.6}
          transform={`rotate(${i * 6} 100 100)`}
        />
      ))}
      {[
        ["XII", 100, 39],
        ["III", 164, 104],
        ["VI", 100, 169],
        ["IX", 36, 104],
      ].map(([r, x, y]) => (
        <text key={r} x={x} y={y} textAnchor="middle" className="f-serif" fontSize="13" fontStyle="italic" fill="#ECE3D2">
          {r}
        </text>
      ))}
      <text x="100" y="136" textAnchor="middle" className="f-mono" fontSize="6.5" letterSpacing="2.2" fill="#8A8E94">
        CHIVASSO
      </text>
      <line x1="100" y1="108" x2="100" y2="54" stroke="#ECE3D2" strokeWidth="3.2" strokeLinecap="round" style={hand(sec / 120)} />
      <line x1="100" y1="110" x2="100" y2="30" stroke="#ECE3D2" strokeWidth="1.8" strokeLinecap="round" style={hand(sec / 10)} />
      <g style={hand(sec * 6)}>
        <line x1="100" y1="122" x2="100" y2="20" stroke="#C3C6CB" strokeWidth=".8" />
        <circle cx="100" cy="122" r="2.4" fill="#C3C6CB" />
      </g>
      <circle cx="100" cy="100" r="3.6" fill="#ECE3D2" />
      <circle cx="100" cy="100" r="1.3" fill="#0D0D0D" />
    </svg>
  );
}

function StylizedMap() {
  const via = "M-10 262 C 60 252 120 232 176 200 S 262 150 300 136 S 344 128 370 126";
  const po = "M-10 352 C 70 326 140 384 220 360 S 330 322 370 338";
  return (
    <svg viewBox="0 0 360 400" className="h-auto w-full" role="img" aria-label="Mappa stilizzata di Chivasso con Via Torino evidenziata">
      <defs>
        <pattern id="mj-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgba(195,198,203,.07)" strokeWidth="1" />
        </pattern>
        <path id="mj-via" d={via} />
      </defs>
      <rect width="360" height="400" fill="url(#mj-grid)" />
      <path d={po} fill="none" stroke="rgba(236,227,210,.07)" strokeWidth="26" strokeLinecap="round" />
      <path d={po} fill="none" stroke="rgba(236,227,210,.25)" strokeWidth="1" strokeDasharray="2 6" />
      <text x="302" y="374" className="f-serif" fontStyle="italic" fontSize="15" fill="rgba(236,227,210,.55)">
        Po
      </text>
      <g stroke="rgba(195,198,203,.2)" strokeWidth="1" fill="none">
        <path d="M30 40 L110 330" />
        <path d="M150 20 L196 340" />
        <path d="M260 10 L238 330" />
        <path d="M0 160 L360 120" />
        <path d="M40 110 L330 70" />
        <path d="M60 300 L350 250" />
        <path d="M300 30 C320 140 330 220 350 300" />
      </g>
      <circle cx="214" cy="172" r="56" fill="rgba(236,227,210,.03)" stroke="rgba(195,198,203,.35)" strokeDasharray="3 5" />
      <text x="214" y="104" textAnchor="middle" className="f-mono" fontSize="8" letterSpacing="2.4" fill="rgba(195,198,203,.7)">
        CENTRO STORICO
      </text>
      <path d={via} fill="none" stroke="#C3C6CB" strokeWidth="2.4" />
      <text className="f-mono" fontSize="8.5" letterSpacing="3" fill="#ECE3D2" dy="-7">
        <textPath href="#mj-via" startOffset="9%">
          VIA TORINO
        </textPath>
      </text>
      <text x="10" y="290" className="f-mono" fontSize="8" letterSpacing="2" fill="rgba(195,198,203,.7)">
        ← TORINO
      </text>
      <g transform="translate(133 222)">
        <circle r="18" fill="none" stroke="#ECE3D2" strokeWidth="1" className="mj-ping" />
        <circle r="9" fill="rgba(236,227,210,.15)" />
        <circle r="4.5" fill="#ECE3D2" />
      </g>
      <g transform="translate(146 236)">
        <rect width="104" height="28" fill="#0D0D0D" stroke="rgba(236,227,210,.35)" />
        <text x="10" y="19" className="f-serif" fontStyle="italic" fontSize="14" fill="#ECE3D2">
          Marianna J
        </text>
      </g>
      <g transform="translate(332 30)">
        <path d="M0 -14 L5 6 L0 2 L-5 6 Z" fill="#C3C6CB" />
        <text y="22" textAnchor="middle" className="f-mono" fontSize="9" fill="#C3C6CB">
          N
        </text>
      </g>
    </svg>
  );
}

function Boutique() {
  const t = useRomeTime();
  const st = shopStatus(t);
  const [copied, setCopied] = useState(false);
  const addr = useRef<HTMLSpanElement>(null);

  const copy = () => {
    const done = () => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    };
    const select = () => {
      const sel = window.getSelection();
      if (!addr.current || !sel) return;
      const range = document.createRange();
      range.selectNodeContents(addr.current);
      sel.removeAllRanges();
      sel.addRange(range);
    };
    try {
      navigator.clipboard.writeText(ADDRESS).then(done, select);
    } catch {
      select();
    }
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section id="boutique" className="relative scroll-mt-16 overflow-hidden bg-void py-24 md:py-36">
      <div className="f-serif mj-outline pointer-events-none absolute -right-[4vw] top-10 select-none text-[24vw] italic leading-none opacity-50" aria-hidden="true">
        Chivasso
      </div>
      <div className="mj-gutter relative mx-auto max-w-[1600px]">
        <Eyebrow>L’Atelier · Dove siamo</Eyebrow>
        <div className="mt-10 grid gap-6 lg:grid-cols-12">
          <Tilt max={3} scale={1} className="relative rounded-[3px] border border-silver/15 bg-ink p-6 shadow-[0_60px_120px_-60px_rgba(0,0,0,.9)] md:p-10 lg:col-span-7">
            <div className="relative z-10">
              <h2 className="f-serif text-[13vw] leading-[.9] text-cream md:text-[6vw] 2xl:text-[96px]">
                Via Torino,
                <br />
                <em className="text-silver">Chivasso</em>
              </h2>
              <p className="f-sans mt-6 max-w-md text-[15px] leading-relaxed text-cream/65">
                Ti aspettiamo per una prova senza fretta. Per un private viewing scrivici su WhatsApp: prepariamo i capi nella tua taglia prima che arrivi.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <span ref={addr} className="f-sans flex items-center gap-2 text-[14px] text-cream">
                  <MapPin className="h-4 w-4 text-silver" strokeWidth={1.4} /> {ADDRESS}
                </span>
                <button type="button" onClick={copy} className="f-mono inline-flex items-center gap-2 text-[10.5px] uppercase tracking-[.2em] text-steel transition-colors hover:text-cream">
                  {copied ? <Check className="h-3.5 w-3.5" strokeWidth={1.6} /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.4} />}
                  {copied ? "Copiato" : "Copia indirizzo"}
                </button>
              </div>
              <p className="f-sans mt-3 flex select-all items-center gap-2 text-[14px] text-cream">
                <Phone className="h-4 w-4 text-silver" strokeWidth={1.4} /> {PHONE}
              </p>

              <div className="mt-10 grid gap-8 border-t border-cream/10 pt-8 md:grid-cols-[180px_1fr] md:items-center">
                <div className="mx-auto h-[180px] w-[180px] md:mx-0">
                  <AnalogClock t={t} />
                </div>
                <div className="min-w-0">
                  <p className="f-mono text-[44px] leading-none tracking-[.04em] text-cream md:text-[52px]">
                    {pad(t.h)}:{pad(t.m)}
                    <span className="text-silver/60">:{pad(t.s)}</span>
                  </p>
                  <p className="f-mono mt-2 text-[10.5px] uppercase tracking-[.24em] text-steel">Ora di Chivasso · {COORDS}</p>
                  <p className={`f-sans mt-4 inline-flex items-center gap-2.5 rounded-full border px-4 py-2 text-[11px] uppercase tracking-[.2em] ${st.open ? "border-cream/40 text-cream" : "border-cream/15 text-cream/70"}`}>
                    <StatusDot open={st.open} /> {st.text}
                  </p>
                </div>
              </div>

              <dl className="mt-8 divide-y divide-cream/10 border-y border-cream/10">
                {HOURS.map((row) => {
                  const today = row.days.includes(t.dow);
                  return (
                    <div key={row.label} className={`flex flex-wrap justify-between gap-x-6 gap-y-1 py-3 ${today ? "text-cream" : "text-cream/55"}`}>
                      <dt className="f-sans flex items-center gap-3 text-[13px] uppercase tracking-[.16em]">
                        {row.label}
                        {today && <span className="f-mono rounded-full bg-cream px-2 py-0.5 text-[9px] tracking-[.18em] text-ink">Oggi</span>}
                      </dt>
                      <dd className="f-mono text-[13px]">{row.text}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          </Tilt>

          <Tilt max={4} scale={1} className="relative self-start rounded-[3px] border border-silver/15 bg-ink p-6 shadow-[0_60px_120px_-60px_rgba(0,0,0,.9)] md:p-8 lg:col-span-5 lg:mt-28">
            <div className="relative z-10">
              <div className="flex items-baseline justify-between gap-4">
                <p className="f-mono text-[10.5px] uppercase tracking-[.24em] text-steel">Mappa</p>
                <p className="f-mono text-[10.5px] uppercase tracking-[.18em] text-steel">Stilizzata · non in scala</p>
              </div>
              <div className="mt-4 overflow-hidden border border-cream/10 bg-void">
                <StylizedMap />
              </div>
              <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <a
                  href={MAPS}
                  target="_blank"
                  rel="noreferrer"
                  data-cursor="Mappa"
                  className="f-sans mj-sheen inline-flex items-center justify-center gap-2 rounded-full bg-cream px-5 py-3.5 text-[10.5px] uppercase tracking-[.2em] text-ink"
                >
                  <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} /> Apri in Google Maps
                </a>
                <a
                  href={wa("Ciao Marianna J, vorrei passare in boutique. Mi indicate il momento migliore?")}
                  target="_blank"
                  rel="noreferrer"
                  className="f-sans inline-flex items-center justify-center gap-2 rounded-full border border-cream/25 px-5 py-3.5 text-[10.5px] uppercase tracking-[.2em] text-cream transition-colors hover:border-cream"
                >
                  <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} /> Scrivici
                </a>
              </div>
            </div>
          </Tilt>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────── Footer ─────────────────────────── */

function Footer() {
  const word = useRef<HTMLDivElement>(null);
  useKinetic(word, 260);
  return (
    <footer className="relative overflow-hidden border-t border-cream/10 bg-ink pt-20" style={{ paddingBottom: "calc(40px + env(safe-area-inset-bottom, 0px))" }}>
      <div className="mj-gutter mx-auto max-w-[1600px]">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="f-mono text-[10.5px] uppercase tracking-[.24em] text-steel">Boutique</p>
            <p className="f-sans mt-4 text-[14px] leading-relaxed text-cream/80">
              {ADDRESS}
              <br />
              <span className="select-all">{PHONE}</span>
            </p>
          </div>
          <div>
            <p className="f-mono text-[10.5px] uppercase tracking-[.24em] text-steel">Orari</p>
            <ul className="f-sans mt-4 text-[14px] leading-relaxed text-cream/80">
              {HOURS.map((h) => (
                <li key={h.label}>
                  {h.label}: <span className="f-mono text-[13px]">{h.text}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="f-mono text-[10.5px] uppercase tracking-[.24em] text-steel">Seguici</p>
            <div className="mt-4 flex gap-3">
              <a href={INSTAGRAM} target="_blank" rel="noreferrer" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:bg-cream hover:text-ink">
                <Instagram className="h-4 w-4" strokeWidth={1.4} />
              </a>
              <a href={FACEBOOK} target="_blank" rel="noreferrer" aria-label="Facebook" className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:bg-cream hover:text-ink">
                <Facebook className="h-4 w-4" strokeWidth={1.4} />
              </a>
              <a
                href={wa("Ciao Marianna J, vorrei qualche informazione.")}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="grid h-11 w-11 place-items-center rounded-full border border-cream/20 text-cream transition-colors hover:bg-cream hover:text-ink"
              >
                <MessageCircle className="h-4 w-4" strokeWidth={1.4} />
              </a>
            </div>
          </div>
        </div>

        <div ref={word} className="f-sans mt-16 select-none text-center text-[15.5vw] uppercase leading-[.8] tracking-[-.04em] text-cream 2xl:text-[250px]" aria-hidden="true">
          <KineticWord text="Marianna J" min={100} max={900} rise={false} />
        </div>

        <div className="f-mono mt-10 flex flex-col gap-3 border-t border-cream/10 pt-6 text-[10.5px] uppercase tracking-[.2em] text-steel sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 Marianna J Boutique · {COORDS}</span>
          <a href="#top" onClick={go("top")} className="inline-flex items-center gap-2 transition-colors hover:text-cream">
            Torna su <ArrowUp className="h-3.5 w-3.5" strokeWidth={1.4} />
          </a>
        </div>
      </div>
    </footer>
  );
}

function WhatsAppFab({ hidden }: { hidden: boolean }) {
  return (
    <a
      href={wa("Ciao Marianna J, vorrei qualche informazione.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Scrivici su WhatsApp"
      data-cursor="WhatsApp"
      className={`group fixed z-[55] flex h-14 items-center gap-0 overflow-hidden rounded-full border border-cream/20 bg-cream text-ink shadow-[0_20px_50px_-15px_rgba(0,0,0,.8)] transition-all duration-500 ${
        hidden ? "pointer-events-none translate-y-4 opacity-0" : "opacity-100"
      }`}
      style={{ right: "calc(20px + env(safe-area-inset-right, 0px))", bottom: "calc(20px + env(safe-area-inset-bottom, 0px))" }}
    >
      <span className="grid h-14 w-14 place-items-center">
        <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
      </span>
      <span className="f-sans max-w-0 whitespace-nowrap text-[10.5px] uppercase tracking-[.2em] opacity-0 transition-all duration-500 group-hover:max-w-[160px] group-hover:pr-6 group-hover:opacity-100">
        Scrivici
      </span>
    </a>
  );
}

/* ─────────────────────────── Pagina ─────────────────────────── */

export default function MariannaJ() {
  const [drawer, setDrawer] = useState<DrawerState>(null);
  const [outfit, setOutfit] = useState<Outfit>(DEFAULT_OUTFIT);
  const [flash, setFlash] = useState<string | null>(null);
  const closeTimer = useRef(0);
  const flashTimer = useRef(0);

  useEffect(() => {
    if (document.querySelector(`link[href="${FONTS_HREF}"]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = FONTS_HREF;
    document.head.appendChild(link);
  }, []);

  const open = useCallback((item: Item) => {
    window.clearTimeout(closeTimer.current);
    setDrawer({ item, open: true });
  }, []);

  const close = useCallback(() => {
    setDrawer((d) => (d ? { ...d, open: false } : d));
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setDrawer((d) => (d && !d.open ? null : d)), 600);
  }, []);

  const tryOn = useCallback(
    (item: Item) => {
      setOutfit((o) => ({ ...o, [item.cat]: item.id }));
      close();
      setFlash(item.id);
      window.clearTimeout(flashTimer.current);
      flashTimer.current = window.setTimeout(() => setFlash(null), 1600);
      window.setTimeout(() => document.getElementById(`row-${item.cat}`)?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" }), 80);
    },
    [close],
  );

  return (
    <div className="mj-root f-sans min-h-screen overflow-x-clip bg-void text-cream">
      <style>{CSS}</style>
      <Cursor />
      <div className="mj-grain" aria-hidden="true" />
      <div className="mj-vignette" aria-hidden="true" />
      <Header />
      <main>
        <Hero onOpen={open} />
        <Ticker />
        <Lookbook onOpen={open} onTry={tryOn} />
        <Collection onOpen={open} />
        <FabricRibbon />
        <MixMatch outfit={outfit} setOutfit={setOutfit} flash={flash} onOpen={open} />
        <Boutique />
      </main>
      <Footer />
      <WhatsAppFab hidden={!!drawer?.open} />
      <Drawer state={drawer} onClose={close} onTry={tryOn} />
    </div>
  );
}
