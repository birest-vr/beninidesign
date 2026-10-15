# Benini Design — sito web

Sito statico bilingue (IT/EN) per **Benini Design**, progettazione e arredamento
d'interni con base a Verona: servizio in loco a Verona e provincia, consulenza online in
videochiamata in tutto il Nord Italia.

Nessun framework, nessuna build, nessuna dipendenza: **HTML, CSS e JavaScript puri**.
Si pubblica copiando la cartella su qualsiasi hosting statico (Netlify, Vercel, GitHub Pages,
Aruba, un normale spazio FTP).

---
## Dati reali e voci ancora aperte

Telefono, partita IVA e dominio sono quelli definitivi. Restano da definire o
verificare le voci segnate sotto.

| Voce | Stato | Dove |
|---|---|---|
| `+39 349 659 3570` | reale | `tel:` e testo, tutte le pagine |
| `05073630237` | reale | partita IVA, footer di ogni pagina |
| `beninidesign.it` | reale | dominio attivo su GitHub Pages dal 15/10/2026 |
| `benini.design.vr@gmail.com` | reale | email di contatto, tutte le pagine e il configuratore |
| Verona (VR), 37100 | da verificare | JSON-LD `PostalAddress` |
| `45.4384 / 10.9916` | da verificare | JSON-LD `geo`, coordinate della sede |
| Prezzi di listino | da confermare | `prezzi.html`, `en/pricing.html`, pagine servizi |

Comando per ritrovare le voci ancora aperte:

```bash
grep -rn "37100\|45.4384" --include="*.html" .
```

I prezzi del listino sono quelli concordati e vanno riverificati periodicamente.

---

## Struttura

```
/
├── index.html                       Home IT
├── chi-siamo.html                   Chi siamo e come lavoriamo
├── servizi.html                     Tutti i servizi
├── consulenza-online.html           ★ pagina pilastro: consulenza a distanza
├── progettazione-verona.html        Servizio in loco (SEO locale)
├── prezzi.html                      Listino + prezzi medi di mercato
├── contatti.html                    Contatti e modulo
├── comuni/                          Zone servite — 60 comuni veronesi
│   ├── index.html                   Indice per zona geografica
│   ├── _dati.txt                    Dati sorgente, un comune per riga
│   ├── _template.html               Template della pagina comune
│   ├── _genera.sh                   Generatore
│   └── verona.html … (60 pagine)    Titolo: "Designer di interni a …"
├── guida/                           Enciclopedia dell'arredo — 14 voci
│   ├── index.html                   Indice generale
│   ├── stili.html                   22 stili d'arredo (+ test interattivo)
│   ├── materiali.html               Legni e pannelli
│   ├── superfici-e-top.html         Top cucina e superfici
│   ├── tessuti-e-imbottiti.html     Tessuti, pelli, anatomia del divano
│   ├── finiture-e-pareti.html       Pitture, calce, microcemento, pavimenti
│   ├── illuminazione.html           Lumen, Kelvin, CRI, piano luci
│   ├── colori.html                  Palette 2026, RAL, NCS, LRV
│   ├── misure-e-ergonomia.html      120+ quote di riferimento
│   ├── ambienti.html                Stanza per stanza (9 ambienti)
│   ├── qualita-mobili.html          12 controlli in showroom
│   ├── sostenibilita.html           Formaldeide, VOC, certificazioni
│   ├── tendenze-2026.html           Report tendenze
│   ├── quanto-costa-arredare.html   Budget e prezzi (+ calcolatore)
│   └── glossario.html               140+ termini A–Z
├── en/                              Versione inglese, struttura speculare
│   ├── index.html, about.html, services.html, online-consultation.html,
│   │   verona-interior-design.html, pricing.html, contact.html
│   └── guide/  (index + 14 voci)
├── assets/
│   ├── style.css                    Design system completo
│   └── site.js                      Nav, animazioni, preventivatore, quiz
├── robots.txt
├── sitemap.xml
└── README.md
```

**105 pagine HTML** in totale: 22 italiane, 22 inglesi e 61 pagine di zona (indice più
60 comuni), tutte con contenuto originale.

### Aggiungere o modificare un comune

Le pagine dei comuni **non si modificano a mano**: sono generate. Si interviene su
`comuni/_dati.txt` (una riga per comune, campi separati da barra verticale nell'ordine
slug, nome, zona, km da Verona, descrizione del paese, descrizione delle case) oppure su
`comuni/_template.html` per la struttura comune a tutte. Poi si rilancia:

```bash
bash comuni/_genera.sh
```

Il generatore ricostruisce tutte le pagine, calcola da solo i collegamenti agli altri comuni
della stessa zona e la nota sul rimborso chilometrico in base ai chilometri indicati. Dopo
aver aggiunto un comune vanno inseriti a mano l'URL in `sitemap.xml` e la voce nell'elenco
di `comuni/index.html`.

L'ordine dei sessanta comuni segue la popolazione secondo i dati pubblici noti nel 2026 ed è
**indicativo**: le posizioni in coda possono variare di qualche riga. Se l'ordine esatto è
rilevante, va verificato sui dati ISTAT aggiornati. Sulle pagine non compaiono comunque cifre
di popolazione, proprio per non pubblicare numeri non verificati.

---

## Funzionalità interattive

Tutte in JavaScript vanilla, senza dipendenze, con degradazione elegante
(il sito resta completamente leggibile a JS disattivato).

- **Preventivatore consulenza online** (`#estimator`, home IT/EN) — calcolo locale, nessun
  dato inviato. Le tariffe sono nell'oggetto `PACK` / `EXTRA` in `assets/site.js`.
- **Calcolatore budget arredo** (`#budget-calc`, pagine prezzi e voce budget) — €/m² per
  fascia nell'oggetto `TIER`.
- **Test "che stile è casa tua"** (`#style-quiz`, pagina stili) — 6 domande, 8 esiti.
- **Menu mobile**, header condensato allo scroll, animazioni di rivelazione, accordion FAQ
  (elementi `<details>` nativi, indicizzabili).
- **Modulo contatti**: senza endpoint configurato apre il client di posta con il messaggio
  precompilato (`data-mailto`). Per usare un servizio di form, aggiungere
  `data-endpoint` e `action` al `<form>` in `contatti.html` / `en/contact.html`.

---

## SEO

- `<title>`, meta description, canonical e Open Graph su ogni pagina
- **hreflang** reciproci IT ⇄ EN su tutte le pagine accoppiate, più `x-default`
- **JSON-LD**: `ProfessionalService`, `Service` con `Offer`, `Article`, `BreadcrumbList`,
  `FAQPage`, `ItemList`, `DefinedTermSet`
- Breadcrumb visibili e strutturati
- `sitemap.xml` con annotazioni `xhtml:link` per le alternative linguistiche
- Immagini: nessuna immagine raster: le illustrazioni sono **SVG inline** generati
  proceduralmente (nessuna richiesta di rete, nessun problema di licenza)

---

## Accessibilità e prestazioni

- HTML semantico, `skip link`, `aria-label` sulle navigazioni, `aria-current` sulla pagina attiva
- Contrasto verificato sulla palette; focus visibile su tutti gli elementi interattivi
- `prefers-reduced-motion` rispettato
- Nessun font raster, nessuna libreria esterna: solo Google Fonts (Bodoni Moda + Inter)
- Foglio di stile e script unici, con `defer`
- Stile di stampa dedicato (`@media print`) per le tabelle dell'enciclopedia

---

## Anteprima locale

Basta aprire `index.html` nel browser: tutti i percorsi sono relativi e funzionano
anche da filesystem.

Per un server locale (se in futuro sarà disponibile Node o Python):

```bash
npx serve .
```

```bash
python -m http.server 8000
```

---

## Note editoriali

Il tono di voce del sito è deliberatamente **concreto e non promozionale**: prezzi dichiarati,
limiti del servizio esplicitati, nessuna provvigione dichiarata, sezioni "cosa non facciamo"
e "quando non siamo la scelta giusta". L'enciclopedia è pensata come contenuto di riferimento
consultabile liberamente, non come funnel: non richiede email e non ha popup.

Dove il contenuto tocca aspetti normativi (sicurezza elettrica nei bagni, accessibilità,
garanzie, detrazioni fiscali, certificazioni ambientali) il testo rimanda esplicitamente
alla normativa vigente e a un tecnico abilitato, senza fornire indicazioni vincolanti.
