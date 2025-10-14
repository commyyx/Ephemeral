# SECURECHAT - VERSIONE MODULARIZZATA

## STRUTTURA PROGETTO

```
securechat_modular/
├── server/
│   ├── config/
│   │   └── config.js              # Configurazione centralizzata
│   ├── routes/
│   │   └── room.js                # API routes per stanze
│   ├── websocket/
│   │   └── handlers.js            # Handler WebSocket
│   ├── utils/
│   │   ├── crypto.js              # Utility crypto (generatori ID)
│   │   └── cleanup.js             # Task pulizia automatica
│   ├── middleware/
│   │   └── index.js               # Middleware Express
│   └── index.js                   # Entry point server
├── public/
│   ├── index.html                 # HTML pulito (solo markup)
│   ├── css/
│   │   └── style.css              # Tutti gli stili
│   └── js/
│       ├── config.js              # Configurazione frontend
│       ├── crypto.js              # Modulo crittografia
│       ├── SecureChat.js          # Classe principale
│       └── main.js                # Inizializzazione app
├── package.json
└── README.md
```

## VANTAGGI MODULARIZZAZIONE

### Backend
- **Separazione responsabilità**: ogni modulo ha un compito specifico
- **Manutenibilità**: modifiche isolate senza toccare tutto il codice
- **Testabilità**: ogni modulo testabile individualmente
- **Scalabilità**: facile aggiungere nuove feature

### Frontend
- **HTML pulito**: solo markup semantico
- **CSS separato**: stili manutenibili e riutilizzabili
- **JavaScript modulare**: logica divisa in file specifici
- **Configurazione centralizzata**: costanti in un unico posto

## FILE BACKEND

### server/config/config.js
Configurazione centralizzata:
- Porta server
- Timeout messaggi
- Intervalli cleanup
- Ambiente esecuzione

### server/routes/room.js
Gestione API stanze:
- POST /api/room/create - Crea nuova stanza
- GET /api/room/:id/exists - Verifica esistenza
- POST /api/room/:id/report - Segnala stanza

### server/websocket/handlers.js
Gestione eventi real-time:
- join_room - Unisciti a stanza
- send_message - Invia messaggio cifrato
- disconnect - Gestione disconnessione

### server/utils/crypto.js
Utility crittografiche:
- generateRoomId() - Genera ID stanza univoco
- generateMessageId() - Genera ID messaggio univoco

### server/utils/cleanup.js
Task automatici:
- Cancellazione messaggi scaduti
- Rimozione stanze inattive
- Log operazioni pulizia

### server/middleware/index.js
Middleware Express:
- JSON parsing
- CORS
- Static files

### server/index.js
Entry point:
- Setup server HTTP + WebSocket
- Orchestrazione moduli
- Error handling globale

## FILE FRONTEND

### public/index.html
Markup semantico pulito:
- Header
- Sidebar controlli
- Area chat
- Welcome screen
- Input messaggi

### public/css/style.css
Stili completi:
- CSS Variables per temi
- Layout responsive
- Animazioni
- Media queries

### public/js/config.js
Configurazione:
- WORDLIST (256 parole italiane)
- USER_COLORS (palette utenti)
- USER_ICONS (icone utenti)
- Costanti crypto (dimensioni, iterazioni)

### public/js/crypto.js
Modulo crittografia:
- bytesToWords() - Encoding parole
- wordsToBytes() - Decoding parole
- generateKeyFromSeed() - Derivazione chiave
- encodeRoomCode() - Codifica stanza
- decodeRoomCode() - Decodifica stanza
- encryptMessage() - Cifratura AES-GCM
- decryptMessage() - Decifratura AES-GCM

### public/js/SecureChat.js
Classe principale:
- Gestione Socket.IO
- Creazione/accesso stanze
- Invio/ricezione messaggi
- Upload immagini
- Differenziazione utenti
- UI updates

### public/js/main.js
Inizializzazione:
- Creazione istanza SecureChat
- Auto-join da URL
- Event listeners globali

## INSTALLAZIONE

```bash
cd securechat_modular
npm install
```

## AVVIO

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

Apri: http://localhost:3000

## CONFIGURAZIONE

### Backend
Modifica `server/config/config.js`:
```javascript
PORT: 3000,
MESSAGE_EXPIRY_MS: 3600000,  // 1 ora
ROOM_CLEANUP_INTERVAL: 1800000,  // 30 minuti
ROOM_INACTIVE_HOURS: 24
```

### Frontend
Modifica `public/js/config.js`:
```javascript
MAX_FILE_SIZE: 2 * 1024 * 1024,  // 2MB
PBKDF2_ITERATIONS: 100000,
AES_KEY_LENGTH: 256
```

## TEST

### Test Backend Isolato
```bash
node server/index.js
```

### Test Modulo Crypto Frontend
Apri console browser:
```javascript
// Test encoding
const words = CryptoHelper.bytesToWords(new Uint8Array([0, 1, 2]));
console.log(words);  // mare-sole-luna

// Test decoding
const bytes = CryptoHelper.wordsToBytes('mare-sole-luna');
console.log(bytes);  // Uint8Array [0, 1, 2]
```

### Test Routes
```bash
# Crea stanza
curl -X POST http://localhost:3000/api/room/create

# Verifica stanza
curl http://localhost:3000/api/room/abc123/exists
```

## DEPLOYMENT

### Render/Railway
1. Push codice su GitHub
2. Collega repository
3. Imposta comando build: `npm install`
4. Imposta comando start: `npm start`
5. Deploy automatico

### Variabili Ambiente
```
PORT=3000
NODE_ENV=production
```

## MANUTENZIONE

### Aggiungere nuova route API
1. Aggiungi in `server/routes/room.js`
2. Testa isolatamente
3. Integra in `server/index.js`

### Aggiungere nuova funzione crypto
1. Aggiungi in `public/js/crypto.js`
2. Esporta in oggetto CryptoHelper
3. Usa in SecureChat.js

### Modificare stili
1. Modifica `public/css/style.css`
2. Usa CSS variables per consistenza
3. Test responsive

### Aggiungere configurazione
1. Backend: `server/config/config.js`
2. Frontend: `public/js/config.js`
3. Usa costanti, no magic numbers

## TROUBLESHOOTING

### Server non parte
- Verifica `npm install` completato
- Controlla porta 3000 libera
- Verifica path `server/index.js`

### Frontend non carica
- Controlla console browser (F12)
- Verifica path file JS/CSS
- Controlla Socket.IO caricato

### Errori crypto
- Verifica wordlist completa (256 parole)
- Controlla PBKDF2 config
- Test in console browser

## COMPATIBILITÀ

- Node.js >= 16.0.0
- Browser moderni (Chrome, Firefox, Safari, Edge)
- WebCrypto API supportata
- Socket.IO 4.x

## SICUREZZA

- Cifratura E2EE AES-256-GCM
- PBKDF2 100.000 iterazioni
- Seed 96 bit (12 bytes)
- Server blind (non vede contenuti)
- Messaggi auto-distruggenti

## PERFORMANCE

- Chunk processing per immagini grandi
- Cleanup automatico risorse
- Memory-based storage (veloce)
- WebSocket real-time efficiente

## LICENZA

MIT

## CONTATTI

Per supporto: issues GitHub
