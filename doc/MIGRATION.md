# GUIDA MIGRAZIONE - Monolitico -> Modularizzato

## DIFFERENZE PRINCIPALI

### PRIMA (Monolitico)
```
securechat/
├── server.js (280 righe - tutto backend)
├── public/
│   └── index.html (1400+ righe - HTML+CSS+JS)
└── package.json
```

### DOPO (Modularizzato)
```
securechat_modular/
├── server/ (7 file - 400 righe totali)
│   ├── config/config.js
│   ├── routes/room.js
│   ├── websocket/handlers.js
│   ├── utils/crypto.js
│   ├── utils/cleanup.js
│   ├── middleware/index.js
│   └── index.js
├── public/
│   ├── index.html (85 righe - solo HTML)
│   ├── css/style.css (450 righe)
│   └── js/ (4 file - 650 righe totali)
│       ├── config.js
│       ├── crypto.js
│       ├── SecureChat.js
│       └── main.js
├── package.json
└── README.md
```

## STEP MIGRAZIONE

### 1. BACKUP PROGETTO ESISTENTE
```bash
cp -r securechat securechat_backup
```

### 2. COPIA NUOVA STRUTTURA
```bash
# Opzione A: Clona nuova struttura
git clone [repo] securechat_modular

# Opzione B: Crea da zero con i file forniti
mkdir securechat_modular
cd securechat_modular
```

### 3. INSTALLA DIPENDENZE
```bash
cd securechat_modular
npm install
```

### 4. VERIFICA FUNZIONALITÀ
```bash
# Avvia server
npm start

# Apri browser
# http://localhost:3000

# Test:
# 1. Crea stanza
# 2. Copia codice
# 3. Apri incognito
# 4. Incolla codice
# 5. Invia messaggio
# 6. Carica immagine
```

### 5. MIGRA PERSONALIZZAZIONI

Se hai modificato il codice originale:

#### Backend
**Configurazione:**
- Da: variabili globali in `server.js`
- A: `server/config/config.js`

**Routes personalizzate:**
- Da: app.get/post in `server.js`
- A: `server/routes/room.js` o nuovo file routes

**Logica WebSocket:**
- Da: io.on('connection') in `server.js`
- A: `server/websocket/handlers.js`

#### Frontend
**Stili custom:**
- Da: `<style>` tag in `index.html`
- A: `public/css/style.css`

**Configurazione:**
- Da: costanti nel JavaScript in `index.html`
- A: `public/js/config.js`

**Logica custom:**
- Da: `<script>` tag in `index.html`
- A: metodi in `public/js/SecureChat.js`

## MAPPING CODICE

### Backend

| VECCHIO (server.js) | NUOVO | LINEE |
|---------------------|-------|-------|
| PORT, MESSAGE_EXPIRY_MS | server/config/config.js | 1-7 |
| app.post('/api/room/create') | server/routes/room.js | 9-23 |
| app.get('/api/room/:id/exists') | server/routes/room.js | 25-37 |
| app.post('/api/room/:id/report') | server/routes/room.js | 39-53 |
| io.on('connection') | server/websocket/handlers.js | 5-85 |
| generateRoomId() | server/utils/crypto.js | 3-5 |
| generateMessageId() | server/utils/crypto.js | 7-9 |
| setInterval cleanup | server/utils/cleanup.js | 3-30 |
| app.use(express.json) | server/middleware/index.js | 4-7 |

### Frontend

| VECCHIO (index.html) | NUOVO | LINEE |
|----------------------|-------|-------|
| `<style>` | public/css/style.css | 1-450 |
| wordlist array | public/js/config.js | 2-26 |
| availableColors | public/js/config.js | 28-31 |
| bytesToWords() | public/js/crypto.js | 2-8 |
| wordsToBytes() | public/js/crypto.js | 10-20 |
| generateKeyFromSeed() | public/js/crypto.js | 22-43 |
| encryptMessage() | public/js/crypto.js | 75-95 |
| decryptMessage() | public/js/crypto.js | 97-115 |
| class SecureChat | public/js/SecureChat.js | 1-400 |
| DOMContentLoaded | public/js/main.js | 3-18 |

## CONFRONTO FUNZIONALITÀ

| Funzione | Monolitico | Modularizzato | Note |
|----------|-----------|---------------|------|
| E2EE | Si | Si | Identico |
| Codice parole | Si | Si | Identico |
| Upload immagini | Si | Si | Identico |
| Differenziazione utenti | Si | Si | Identico |
| Segnalazioni | Si | Si | Identico |
| Cleanup automatico | Si | Si | Identico |
| Responsive | Si | Si | Identico |

**Nessuna funzionalità persa nella migrazione.**

## VANTAGGI IMMEDIATI

### Sviluppo
- Modifiche isolate (es. cambio colori solo in style.css)
- Debug più semplice (file specifici)
- Git diff più leggibili
- Code review più facile

### Team
- Sviluppatori possono lavorare su file diversi senza conflitti
- Onboarding nuovo dev più veloce (README + struttura chiara)
- Responsabilità chiare per ogni modulo

### Testing
- Unit test per singoli moduli
- Mock più semplici
- Test isolati senza dipendenze

### Manutenzione
- Bug fix localizzati
- Refactoring sicuro
- Feature nuove senza toccare codice esistente

## PROBLEMI COMUNI

### Import non funziona
**Sintomo:** Script non caricati

**Soluzione:**
- Verifica path in index.html
- Controlla ordine caricamento script:
  1. socket.io.js
  2. config.js
  3. crypto.js
  4. SecureChat.js
  5. main.js

### CSS non applicato
**Sintomo:** Stili mancanti

**Soluzione:**
- Verifica `<link rel="stylesheet" href="css/style.css">`
- Controlla file in `public/css/`
- Svuota cache browser (Ctrl+Shift+R)

### Backend non parte
**Sintomo:** Error: Cannot find module

**Soluzione:**
- Verifica `npm install` completato
- Controlla path relativi in require()
- Entry point corretto in package.json: `server/index.js`

### Config non letta
**Sintomo:** Variabili undefined

**Soluzione:**
- Verifica CONFIG globale esposto
- Controlla config.js caricato prima di SecureChat.js
- Usa `window.CONFIG` se necessario

## ROLLBACK

Se qualcosa non funziona:

```bash
# Stop server
Ctrl+C

# Torna al backup
cd ..
mv securechat securechat_modular_test
mv securechat_backup securechat
cd securechat

# Riavvia vecchia versione
npm start
```

## DEPLOYMENT

### Render/Railway
**Cambia solo:**
- Start command: `npm start`
- Entry point: `server/index.js` (automatico da package.json)

Tutto il resto identico.

### Docker
Se usi Docker, aggiorna Dockerfile:
```dockerfile
COPY server/ /app/server/
COPY public/ /app/public/
COPY package.json /app/

CMD ["node", "server/index.js"]
```

## CHECKLIST MIGRAZIONE

- [ ] Backup progetto originale
- [ ] Copia nuova struttura
- [ ] `npm install` completato
- [ ] Server parte senza errori
- [ ] Frontend carica correttamente
- [ ] Crea stanza funziona
- [ ] Join stanza funziona
- [ ] Invio messaggi funziona
- [ ] Upload immagini funziona
- [ ] Differenziazione utenti funziona
- [ ] Segnalazioni funzionano
- [ ] Responsive funziona
- [ ] Personalizzazioni migrate
- [ ] Test completo su device reali
- [ ] Deploy su ambiente di test
- [ ] Test finale su produzione

## TEMPISTICA

- Migrazione base: 30 minuti
- Test completo: 1 ora
- Migrazione personalizzazioni: 2-4 ore (dipende da modifiche)
- Deploy: 15 minuti

**Totale: 4-6 ore** per migrazione completa e testata.

## SUPPORTO

Problemi durante migrazione:
1. Controlla console browser (F12)
2. Controlla log server
3. Verifica file structure
4. Confronta con README
5. Usa backup se necessario

**La migrazione è reversibile e sicura.**
