# Glamour Intimo & Abbigliamento — sito vetrina

Sito one-page per la boutique **Glamour Intimo & Abbigliamento di Botto Barbara**, Via Roma 6, 10034 Chivasso (TO).

## Struttura

```
index.html            Pagina unica: hero, La Maison, Collezione (bento), Orari, Mappa, Contatti
privacy.html          Privacy e cookie (l'informativa GDPR completa è da completare)
assets/css/style.css  Stili del sito (layer "components" di Tailwind)
assets/js/main.js     Interazioni: stato di apertura live, parallasse 3D, card inclinabili,
                      cursore, menu mobile, mappa su consenso, copia indirizzo
assets/img/           Foto della boutique, favicon e icona Apple
```

Nessuna build: basta aprire `index.html` o pubblicare la cartella su un qualsiasi hosting statico
(GitHub Pages, Netlify, ecc.). Tailwind CSS v4, Lucide Icons e i Google Fonts arrivano da CDN.

## Da personalizzare

- **Foto dell'hero**: salva una foto verticale 4:5 (almeno 1200 × 1500 px) in `assets/img/hero.jpg`:
  comparirà automaticamente al posto del segnaposto.
- **Foto della collezione**: le due immagini in `assets/img/` provengono dalla demo e sono a bassa
  risoluzione; sostituiscile con versioni più grandi mantenendo lo stesso nome file.
- **Orari**: sono definiti in `assets/js/main.js` (oggetto `HOURS`, calcolo dello stato "Aperto ora"),
  nella tabella della sezione `#orari` e nel footer di `index.html`, e nei dati strutturati JSON-LD in `<head>`.
- **Privacy**: completare l'informativa in `privacy.html` con il proprio consulente.

## Dati aziendali usati

| | |
|---|---|
| Ragione sociale | GLAMOUR DI BARBARA BOTTO |
| Indirizzo | Via Roma 6, 10034 Chivasso (TO) |
| Partita IVA | 09828530015 |
| Telefono / WhatsApp | +39 393 284 1156 |
| Email | glamour.71@live.it |
| Facebook | https://www.facebook.com/GlamourChivasso/ |
| Instagram | https://www.instagram.com/glamour_intimo__/ |

Orari: lunedì e domenica chiuso · martedì, mercoledì, venerdì, sabato 10:00–12:30 e 16:00–19:30 ·
giovedì 10:00–19:00 orario continuato.
