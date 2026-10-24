# Marianna J — sito-glamour

Esperienza digitale haute couture per la boutique **Marianna J**, Via Torino, Chivasso (TO).
Un unico componente React (`src/MariannaJ.tsx`) con Tailwind CSS e lucide-react.

## Cosa contiene

- **Cursore dinamico** con etichette contestuali e **tilt 3D** sulle card, con glow che segue il puntatore su vetro scuro e grana.
- **Hero cinematografica**: tipografia cinetica (Jost + Bodoni Moda) che cambia peso al passaggio del mouse, apertura a tende, foto in bianco e nero che si colora sotto il cursore, badge rotante "Haute Couture • Chivasso • Edition 2026" e ticker infinito.
- **Lookbook interattivo** a tutto schermo con hotspot pulsanti sui capi e scheda galleggiante ("Provalo" / "Scheda").
- **Collezione numerata** (01/08 … 08/08) con zoom lento, filtri per categoria e **drawer** laterale: composizione del tessuto, vestibilità, taglie disponibili, "Richiedi Private Viewing via WhatsApp".
- **Mix & Match**: capospalla, top, pantaloni e accessori combinabili, totale animato, scelta di giorno e orario e prenotazione del fitting privato via WhatsApp.
- **Atelier & località**: orologio analogico e digitale sull'ora di Chivasso, stato aperto/chiuso calcolato dagli orari, mappa stilizzata.

## Avvio

```bash
npm install
npm run dev        # sviluppo
npm run build      # build di produzione in dist/
```

## Da personalizzare prima della pubblicazione

In cima a `src/MariannaJ.tsx`:

- `WA_NUMBER` e `PHONE`: sono gli stessi valori del sito precedente (`390110000000`, `+39 011 000 0000`) e vanno sostituiti con i numeri reali.
- `INSTAGRAM` e `FACEBOOK`: link ai profili della boutique.
- `ITEMS`: capi, prezzi, composizioni e disponibilità per taglia sono contenuti di esempio.
- `LOOKS[].pins`: posizione degli hotspot in percentuale sulla foto originale.

## Anteprima come Artifact (HTML singolo)

```bash
npm run images     # scarica le foto Unsplash in artifact/img (serve accesso a images.unsplash.com)
npm run artifact   # genera artifact/marianna-j.html con JS e CSS inline
```

Gli Artifact non caricano immagini da host esterni: per questo le foto vengono scaricate e servite in locale.
Senza le foto, ogni immagine mostra un campione del tessuto nel colore del capo.

## Usarlo in un progetto TanStack Start / Lovable

```tsx
import { createFileRoute } from "@tanstack/react-router";
import MariannaJ from "@/components/MariannaJ";

export const Route = createFileRoute("/")({ component: MariannaJ });
```

Aggiungi al `tailwind.config` i colori `void`, `ink`, `graphite`, `silver`, `steel`, `cream` (vedi `tailwind.config.js`).
