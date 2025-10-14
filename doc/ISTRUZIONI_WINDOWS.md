# COME SCARICARE I FILE - WINDOWS

## OPZIONE 1: ARCHIVIO ZIP (CONSIGLIATO)

Scarica questo file:
**securechat_modular.zip** (28KB)

Poi:
1. Clicca destro sul file ZIP
2. "Estrai tutto..."
3. Scegli una cartella (es. Desktop)
4. Apri la cartella estratta

## OPZIONE 2: FILE SINGOLI

Scarica questi file uno per uno:

### Documentazione (scarica per prima)
1. **CONSEGNA.md** - Guida principale
2. **INDICE.md** - Mappa file

### Progetto completo
3. **securechat_modular.zip** - Tutto il progetto (28KB)

## DOPO AVER ESTRATTO

Apri PowerShell o CMD nella cartella `securechat_modular`:

```cmd
cd securechat_modular
npm install
node test.js
npm start
```

Apri browser: http://localhost:3000

## STRUTTURA FILE ESTRATTI

```
securechat_modular/
├── server/                 Backend (7 file)
├── public/                 Frontend (5 file)
├── README.md               Guida completa
├── MIGRATION.md            Guida migrazione
├── SUMMARY.md              Riepilogo
├── test.js                 Test moduli
└── package.json            Dipendenze
```

## PREREQUISITI WINDOWS

1. **Node.js** (scarica da nodejs.org)
   - Versione minima: 16.0.0
   - Installer Windows .msi

2. **npm** (incluso con Node.js)
   - Verifica: `npm --version`

3. **Editor codice** (opzionale)
   - Visual Studio Code
   - Notepad++
   - Sublime Text

## INSTALLAZIONE SU WINDOWS

### Passo 1: Installa Node.js
```
1. Vai su https://nodejs.org
2. Scarica versione LTS (Long Term Support)
3. Esegui installer .msi
4. Segui wizard installazione
5. Riavvia computer se richiesto
```

### Passo 2: Verifica installazione
Apri PowerShell:
```powershell
node --version
npm --version
```

Dovresti vedere qualcosa come:
```
v18.17.0
9.6.7
```

### Passo 3: Estrai progetto
1. Scarica **securechat_modular.zip**
2. Clicca destro → "Estrai tutto..."
3. Scegli: C:\Users\TUONOME\Desktop\

### Passo 4: Installa dipendenze
Apri PowerShell nella cartella:
```powershell
cd C:\Users\TUONOME\Desktop\securechat_modular
npm install
```

Vedrai qualcosa come:
```
added 57 packages in 3s
```

### Passo 5: Test
```powershell
node test.js
```

Output atteso:
```
=== TEST MODULARE SECURECHAT ===
1. Test Config... OK
2. Test Crypto Utils... OK
3. Test Storage... OK
4. Test Cleanup Logic... OK
5. Test Middleware... OK
6. Test Routes... OK
=== TUTTI I TEST PASSATI ===
```

### Passo 6: Avvia server
```powershell
npm start
```

Vedrai:
```
Server SecureChat in esecuzione sulla porta 3000
Ambiente: development
```

### Passo 7: Apri browser
```
http://localhost:3000
```

## POSSIBILI PROBLEMI WINDOWS

### Errore: "node non riconosciuto"
**Soluzione:**
- Node.js non installato
- Riavvia PowerShell dopo installazione
- Riavvia computer

### Errore: "npm install" fallisce
**Soluzione:**
- Controlla connessione internet
- Esegui come amministratore
- Svuota cache: `npm cache clean --force`

### Errore: "Porta 3000 già in uso"
**Soluzione:**
Cambia porta in `server/config/config.js`:
```javascript
PORT: 3001,  // Cambia da 3000 a 3001
```

### Errore: "Cannot find module"
**Soluzione:**
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

### Firewall blocca server
**Soluzione:**
- Windows Security → Consenti app
- Aggiungi Node.js alle eccezioni

## EDITOR CONSIGLIATI WINDOWS

### Visual Studio Code (GRATIS)
- Download: https://code.visualstudio.com
- Extensions utili:
  - JavaScript (ES6)
  - Prettier
  - ESLint

### Notepad++ (GRATIS)
- Download: https://notepad-plus-plus.org
- Leggero e veloce

## COMANDI UTILI POWERSHELL

```powershell
# Naviga directory
cd C:\path\to\folder

# Lista file
ls
dir

# Crea cartella
mkdir nome_cartella

# Elimina file
rm nome_file

# Apri file
notepad nome_file.txt

# Svuota schermo
cls

# Stop server (Ctrl+C non funziona?)
taskkill /F /IM node.exe
```

## STRUTTURA COMPLETA FILE

Dopo estrazione ZIP avrai:

```
securechat_modular/
│
├── server/                      Backend Node.js
│   ├── config/
│   │   └── config.js            Configurazione
│   ├── routes/
│   │   └── room.js              API endpoints
│   ├── websocket/
│   │   └── handlers.js          WebSocket real-time
│   ├── utils/
│   │   ├── crypto.js            Utility crypto
│   │   └── cleanup.js           Pulizia automatica
│   ├── middleware/
│   │   └── index.js             Middleware Express
│   └── index.js                 Entry point
│
├── public/                      Frontend
│   ├── css/
│   │   └── style.css            Tutti gli stili
│   ├── js/
│   │   ├── config.js            Configurazione frontend
│   │   ├── crypto.js            Crittografia E2EE
│   │   ├── SecureChat.js        Classe principale
│   │   └── main.js              Inizializzazione
│   └── index.html               HTML
│
├── .gitignore                   Esclusioni Git
├── package.json                 Dipendenze npm
├── test.js                      Script test
├── README.md                    Guida completa
├── MIGRATION.md                 Guida migrazione
└── SUMMARY.md                   Riepilogo tecnico
```

## FILE DA MODIFICARE (WINDOWS)

### Apri con Notepad o VS Code:

**Cambia colori:**
- `public\css\style.css`

**Cambia timeout:**
- `server\config\config.js`

**Cambia limite file:**
- `public\js\config.js`

**Aggiungi API:**
- `server\routes\room.js`

## DEPLOYMENT DA WINDOWS

### Su Render.com:
1. Crea account Render
2. New → Web Service
3. Connect GitHub repository
4. Build command: `npm install`
5. Start command: `npm start`
6. Deploy

### Su Railway.app:
1. Crea account Railway
2. New Project → Deploy from GitHub
3. Connect repository
4. Deploy automatico

## LINK UTILI

- Node.js: https://nodejs.org
- VS Code: https://code.visualstudio.com
- Git for Windows: https://git-scm.com/download/win
- Render: https://render.com
- Railway: https://railway.app

## SUPPORTO

Se hai problemi:
1. Leggi **CONSEGNA.md**
2. Leggi **README.md** nella cartella estratta
3. Controlla console PowerShell per errori
4. Verifica Node.js installato correttamente

## CHECKLIST INSTALLAZIONE WINDOWS

- [ ] Node.js 16+ installato
- [ ] npm funziona da PowerShell
- [ ] securechat_modular.zip scaricato
- [ ] ZIP estratto in una cartella
- [ ] Aperto PowerShell nella cartella
- [ ] `npm install` eseguito con successo
- [ ] `node test.js` tutti i test passati
- [ ] `npm start` server avviato
- [ ] Browser aperto su http://localhost:3000
- [ ] Chat funziona

---

**INIZIA SCARICANDO: securechat_modular.zip**

Estrai e segui le istruzioni sopra.
