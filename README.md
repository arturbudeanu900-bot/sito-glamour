# Glamour Intimo & Abbigliamento — sito vetrina

Sito one-page per la boutique **Glamour Intimo & Abbigliamento di Botto Barbara**, Via Roma 6, 10034 Chivasso (TO).

## Struttura

```
index.html            Pagina unica: hero, La Maison, Collezione (bento), Orari, Mappa, Contatti
privacy.html          Informativa privacy e cookie (GDPR art. 13), con revoca del consenso alla mappa
404.html              Pagina "non trovata" autonoma, usata in automatico da GitHub Pages e Netlify
assets/css/style.css  Stili del sito (layer "components" di Tailwind)
assets/js/main.js     Interazioni: stato di apertura live, parallasse 3D, card inclinabili,
                      cursore, menu mobile, mappa su consenso, copia indirizzo
assets/img/           Foto della boutique, favicon e icona Apple
```

Nessuna build: basta aprire `index.html` o pubblicare la cartella su un qualsiasi hosting statico.
Tailwind CSS v4, Lucide Icons e i Google Fonts arrivano da CDN.

## Pubblicazione

**GitHub Pages** (gratuito): dopo il merge su `main`, in *Settings → Pages* scegli
*Deploy from a branch*, branch `main`, cartella `/ (root)`. Il sito sarà online in un paio di minuti
all'indirizzo `https://<utente>.github.io/sito-glamour/`; da lì puoi collegare anche un dominio tuo.

**Netlify**: trascina la cartella del progetto su app.netlify.com/drop.

## Da personalizzare

- **Foto dell'hero**: salva una foto verticale 4:5 (almeno 1200 × 1500 px) in `assets/img/hero.jpg`,
  poi in `index.html` togli il commento alla riga `<img src="assets/img/hero.jpg" …>` dentro
  `<figure class="hero-photo …">`: la foto coprirà il segnaposto.
- **Foto della collezione**: le due immagini in `assets/img/` provengono dalla demo e sono a bassa
  risoluzione; sostituiscile con versioni più grandi mantenendo lo stesso nome file.
- **Orari**: sono definiti in `assets/js/main.js` (oggetto `HOURS`, calcolo dello stato "Aperto ora"),
  nella tabella della sezione `#orari` e nel footer di `index.html`, e nei dati strutturati JSON-LD in `<head>`.
- **Privacy**: in `privacy.html` indica il fornitore di hosting e la conservazione dei suoi registri
  tecnici (voci tra parentesi quadre), fai verificare il testo al consulente e poi elimina il riquadro
  «Prima della pubblicazione».

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
