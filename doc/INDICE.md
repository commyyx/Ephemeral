# INDICE FILE PROGETTO MODULARIZZATO

## FILE PRINCIPALI

### 1. CONSEGNA.md
Documento principale che leggi ora.
Spiega cosa ho fatto e come usare il progetto.

### 2. securechat_modular.tar.gz (18KB)
Archivio compresso dell'intero progetto.
Estrai con: `tar -xzf securechat_modular.tar.gz`

### 3. securechat_modular/
Directory completa del progetto modularizzato.

## STRUTTURA DETTAGLIATA

### ROOT (6 file)
```
securechat_modular/
├── .gitignore              # Esclusioni Git
├── package.json            # Dipendenze Node.js
├── test.js                 # Script test moduli
├── README.md               # Guida installazione/uso (300+ righe)
├── MIGRATION.md            # Guida migrazione (400+ righe)
└── SUMMARY.md              # Riepilogo modularizzazione
```

### SERVER (7 file backend)
```
server/
├── index.js                        # Entry point (57 righe)
│                                   # - Setup Express + Socket.IO
│                                   # - Orchestrazione moduli
│                                   # - Error handling
│
├── config/
│   └── config.js                   # Configurazione (7 righe)
│                                   # - PORT, timeout, intervalli
│                                   # - Tutte le costanti
│
├── routes/
│   └── room.js                     # API Routes (55 righe)
│                                   # - POST /api/room/create
│                                   # - GET /api/room/:id/exists
│                                   # - POST /api/room/:id/report
│
├── websocket/
│   └── handlers.js                 # WebSocket (87 righe)
│                                   # - join_room
│                                   # - send_message
│                                   # - disconnect
│
├── utils/
│   ├── crypto.js                   # Utility crypto (11 righe)
│   │                               # - generateRoomId()
│   │                               # - generateMessageId()
│   │
│   └── cleanup.js                  # Pulizia automatica (32 righe)
│                                   # - Cancella messaggi scaduti
│                                   # - Rimuove stanze inattive
│
└── middleware/
    └── index.js                    # Middleware (8 righe)
                                    # - JSON parsing
                                    # - CORS
                                    # - Static files
```

### PUBLIC (5 file frontend)
```
public/
├── index.html                      # HTML (85 righe)
│                                   # - Markup semantico pulito
│                                   # - Nessuno stile inline
│                                   # - Nessuno script inline
│
├── css/
│   └── style.css                   # Stili (450 righe)
│                                   # - CSS Variables
│                                   # - Layout responsive
│                                   # - Animazioni
│                                   # - Media queries
│
└── js/
    ├── config.js                   # Configurazione (35 righe)
    │                               # - WORDLIST (256 parole)
    │                               # - USER_COLORS (8 colori)
    │                               # - MAX_FILE_SIZE
    │                               # - Costanti crypto
    │
    ├── crypto.js                   # Crittografia (117 righe)
    │                               # - bytesToWords()
    │                               # - wordsToBytes()
    │                               # - encryptMessage()
    │                               # - decryptMessage()
    │                               # - generateKeyFromSeed()
    │                               # - encodeRoomCode()
    │                               # - decodeRoomCode()
    │
    ├── SecureChat.js               # Classe principale (398 righe)
    │                               # - Gestione Socket.IO
    │                               # - Creazione/join stanze
    │                               # - Invio/ricezione messaggi
    │                               # - Upload immagini
    │                               # - Differenziazione utenti
    │                               # - UI updates
    │
    └── main.js                     # Inizializzazione (20 righe)
                                    # - Crea istanza SecureChat
                                    # - Auto-join da URL
```

## MAPPA FUNZIONALITÀ -> FILE

### Configurazione
- Backend: `server/config/config.js`
- Frontend: `public/js/config.js`

### API REST
- Routes: `server/routes/room.js`
- Middleware: `server/middleware/index.js`

### WebSocket Real-time
- Handlers: `server/websocket/handlers.js`

### Crittografia E2EE
- Frontend: `public/js/crypto.js`
- Utility: `server/utils/crypto.js`

### UI Chat
- HTML: `public/index.html`
- CSS: `public/css/style.css`
- JS: `public/js/SecureChat.js`

### Task Automatici
- Cleanup: `server/utils/cleanup.js`

### Inizializzazione
- Backend: `server/index.js`
- Frontend: `public/js/main.js`

### Documentazione
- Setup: `README.md`
- Migrazione: `MIGRATION.md`
- Riepilogo: `SUMMARY.md`

### Test
- Script: `test.js`

## DIPENDENZE (node_modules/)

File `package.json` specifica:

```json
{
  "dependencies": {
    "express": "^4.18.2",       # Web server
    "socket.io": "^4.7.2",      # WebSocket real-time
    "cors": "^2.8.5"            # CORS handling
  },
  "devDependencies": {
    "nodemon": "^3.0.1"         # Auto-restart dev
  }
}
```

Installa con: `npm install`

## FILE DA MODIFICARE PIÙ SPESSO

1. **server/config/config.js** - Timeout, porte
2. **public/js/config.js** - Limiti file, colori
3. **public/css/style.css** - Tema, layout
4. **server/routes/room.js** - Nuove API
5. **public/js/SecureChat.js** - Nuove funzioni chat

## FILE DA NON MODIFICARE

1. **package.json** - Solo per aggiungere dipendenze
2. **.gitignore** - Già configurato ottimale
3. **test.js** - Script test, funziona già

## ORDINE LETTURA CONSIGLIATO

### Per capire il progetto:
1. CONSEGNA.md (questo file)
2. README.md (guida completa)
3. SUMMARY.md (riepilogo tecnico)

### Per iniziare a sviluppare:
1. server/index.js (entry point backend)
2. server/config/config.js (configurazione)
3. public/index.html (struttura frontend)
4. public/js/SecureChat.js (logica principale)

### Per modificare funzionalità:
1. MIGRATION.md (mapping codice vecchio->nuovo)
2. File specifico della funzionalità
3. test.js (verifica modifiche)

## DIMENSIONI FILE

```
File più grandi:
- public/css/style.css          450 righe
- public/js/SecureChat.js       398 righe
- public/js/crypto.js           117 righe
- server/websocket/handlers.js   87 righe
- public/index.html              85 righe

File più piccoli:
- server/config/config.js         7 righe
- server/middleware/index.js      8 righe
- server/utils/crypto.js         11 righe
- package.json                   18 righe
- public/js/main.js              20 righe

TOTALE: ~2.200 righe di codice
```

## COME NAVIGARE

### Vuoi modificare il comportamento?
→ Cerca in `server/config/config.js` o `public/js/config.js`

### Vuoi aggiungere una API?
→ Modifica `server/routes/room.js`

### Vuoi cambiare l'aspetto?
→ Modifica `public/css/style.css`

### Vuoi aggiungere funzione crypto?
→ Modifica `public/js/crypto.js`

### Vuoi aggiungere funzione chat?
→ Modifica `public/js/SecureChat.js`

### Vuoi cambiare WebSocket?
→ Modifica `server/websocket/handlers.js`

## CHEAT SHEET COMANDI

```bash
# Estrai archivio
tar -xzf securechat_modular.tar.gz

# Entra in directory
cd securechat_modular

# Installa dipendenze
npm install

# Test moduli
node test.js

# Avvia development
npm run dev

# Avvia production
npm start

# Apri nel browser
http://localhost:3000
```

## FILE CONSEGNATI - CHECKLIST

- [ ] CONSEGNA.md - Documento principale
- [ ] securechat_modular.tar.gz - Archivio compresso
- [ ] securechat_modular/ - Directory completa
  - [ ] .gitignore
  - [ ] package.json
  - [ ] test.js
  - [ ] README.md
  - [ ] MIGRATION.md
  - [ ] SUMMARY.md
  - [ ] server/ (7 file)
  - [ ] public/ (5 file)

**TOTALE: 19 file consegnati**

## PROSSIMI STEP

1. Leggi CONSEGNA.md (questo file)
2. Estrai securechat_modular.tar.gz
3. Leggi README.md per setup
4. Esegui npm install
5. Esegui node test.js
6. Esegui npm start
7. Apri http://localhost:3000
8. Testa tutte le funzionalità
9. Leggi MIGRATION.md se hai dubbi
10. Inizia a sviluppare

---

**Tutto pronto. Codice pulito. Struttura professionale.**

**Inizia con:** `tar -xzf securechat_modular.tar.gz && cd securechat_modular`
