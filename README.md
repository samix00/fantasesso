# 🔥 Fantasesso — Web App per GitHub Pages

Un'applicazione web moderna, accattivante e completamente responsive pensata per gestire le leghe del **Fantasesso** tra amici: consultazione del regolamento ufficiale con bonus e malus, classifica aggiornata in tempo reale con podio, assegnazione rapida dei punti, diario degli eventi e sistema di backup e sincronizzazione JSON.

Realizzata in **HTML5 + Tailwind CSS + Vanilla JavaScript**: nessun passaggio di compilazione o installazione (`npm`/`node`) necessario. Funziona istantaneamente su qualsiasi browser e si pubblica su **GitHub Pages in 2 minuti**.

---

## ✨ Funzionalità Incluse

- 📜 **Regolamento Interattivo**:
  - Più di 30 bonus e malus categorizzati (*Flirt & Approcci*, *Spicy & Intimità*, *Location Insolite*, *Goliardia & Social*, *Malus & Cringe*).
  - Barra di ricerca istantanea e filtri rapidi per categoria e per punteggio.
  - Possibilità di aggiungere nuove regole personalizzate direttamente dal browser.
  - Pulsante rapido `⚡ Assegna` su ogni regola.

- 🏆 **Classifica & Podio**:
  - Podio visivo per il 1°, 2° e 3° posto con coppe e badge.
  - Conteggio automatico di bonus, malus e totale punti.
  - Scheda profilo dettagliata di ciascun partecipante con storico completo di tutti i punti accumulati.
  - Creazione e rimozione di partecipanti con avatar emoji personalizzabili.

- ⚡ **Assegnazione Punti & Diario degli Avvenimenti**:
  - Modulo intuitivo per selezionare partecipante, regola sbloccata ed eventuale nota/aneddoto dell'accaduto.
  - Supporto a punti manuali estemporanei.
  - Effetto coriandoli animato al festeggiamento di un bonus.
  - Diario cronologico (Feed) con possibilità di cancellare eventi errati.

- ⚙️ **Salvataggio & Sincronizzazione (Zero Database)**:
  - Tutti i dati rimangono salvati nel browser (`LocalStorage`).
  - Funzione **Esporta JSON**: scarica il file di backup o copialo con un click per inviarlo su WhatsApp/Telegram.
  - Funzione **Importa JSON**: carica il file inviato dagli amici o incolla il testo per sincronizzare all'istante la classifica di gruppo.

---

## 🚀 Come Pubblicare il Sito su GitHub Pages

Segui questi semplici passaggi per avere il sito online e condivisibile:

### 1. Crea un repository su GitHub
1. Vai su [github.com/new](https://github.com/new).
2. Dai un nome al repository (es. `fantasesso` oppure `fantasesso-2026`).
3. Scegli se farlo **Public** (consigliato per GitHub Pages gratuito).
4. Clicca su **Create repository**.

### 2. Collega la cartella locale e invia i file (Push)
Apri il terminale in questa cartella (`/Users/samuel/orca/projects/Fantase`) ed esegui:

```bash
# Aggiungi tutti i file al commit
git add .
git commit -m "Primo rilascio Fantasesso Web App"

# Collega il tuo repository remoto (sostituisci USERNAME e REPO con i tuoi)
git remote add origin https://github.com/TUO-USERNAME/TUO-REPO.git

# Rinomina il branch in main (se non già fatto) e fai push
git branch -M main
git push -u origin main
```

### 3. Attiva GitHub Pages
1. Vai sulla pagina del tuo repository su GitHub.
2. Clicca su **Settings** (la scheda in alto a destra).
3. Nel menu laterale a sinistra, clicca su **Pages**.
4. Sotto **Build and deployment** > **Source**:
   - Seleziona **Deploy from a branch**.
   - Sotto **Branch**: seleziona `main` e cartella `/(root)`.
   - Clicca **Save**.
5. Attendi circa 30-60 secondi: GitHub ti fornirà il link pubblico del tuo sito (es. `https://TUO-USERNAME.github.io/TUO-REPO/`).

---

## 💻 Come Testarlo in Locale sul Tuo Computer

Non serve installare alcun server complicato. Puoi semplicemente:
- Fare doppio click sul file `index.html` per aprirlo direttamente nel tuo browser preferito (Chrome, Safari, Firefox).
- Oppure, se hai Python installato, avviare un server locale temporaneo:
  ```bash
  python3 -m http.server 8080
  ```
  e aprire nel browser `http://localhost:8080`.

---

## 📁 Struttura del Progetto

```text
├── index.html           # Struttura principale della Single Page App (HTML5 + Tailwind)
├── css/
│   └── styles.css       # Palette scura neon, effetti glassmorphism e animazioni
├── js/
│   ├── rules.js         # Elenco predefinito di bonus, malus e categorie
│   └── app.js           # Logica di calcolo punteggi, filtri, localStorage, export/import
├── .gitignore
└── README.md            # Guida all'installazione e all'uso
```

---

## 🎨 Personalizzazione Regole

Se desideri modificare o espandere l'elenco di regole base direttamente nel codice sorgente prima del deploy, puoi modificare il file [js/rules.js](file:///Users/samuel/orca/projects/Fantase/js/rules.js).
In alternativa, gli utenti possono aggiungere regole personalizzate in qualsiasi momento direttamente dall'interfaccia web cliccando su **"✨ Aggiungi Nuova Regola"** nella scheda Regolamento!
