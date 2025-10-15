# GUIDA: IMPLEMENTAZIONE VERSIONING

## OVERVIEW

Sistema di versioning completo per SecureChat:
- **Versione nel titolo**: "Ephemeral v1.2.0"
- **Header nei file**: Commenti con versione e changelog
- **Log console**: Versione stampata all'avvio
- **CHANGELOG.md**: Documentazione modifiche

---

## VERSIONING STRATEGY

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

### Storia Versioni
```
v1.0.0 - Base (ERASE + QW-001)
v1.1.0 - Fix recupero codice stanza
v1.2.0 - Rate limiting (INF-003) <- ATTUALE
```

### Prossime Versioni
```
v1.3.0 - QW-002 + QW-003 (Download + QR Code)
v1.4.0 - FEAT-005 (Upload documenti)
v2.0.0 - FEAT-001 (Forward Secrecy - BREAKING)
```

---

## INSTALLAZIONE RAPIDA (3 minuti)

### STEP 1: Backup (30 secondi)
```cmd
mkdir backup_versioning

copy package.json backup_versioning\
copy server\config\config.js backup_versioning\
copy server\index.js backup_versioning\
copy public\index.html backup_versioning\
copy public\css\style.css backup_versioning\
copy public\js\config.js backup_versioning\
```

### STEP 2: Sostituisci file (1 minuto)
```cmd
REM FILE VERSIONED DA SOSTITUIRE

copy package_versioned.json package.json
copy config_versioned.js server\config\config.js
copy index_versioned.js server\index.js
copy index_versioned.html public\index.html
copy style.css public\css\style.css
copy config_versioned_client.js public\js\config.js
copy CHANGELOG.md CHANGELOG.md
```

### STEP 3: Restart server (30 secondi)
```cmd
npm start
```

**Output atteso**:
```
============================================================
  Ephemeral SecureChat v1.2.0 - Rate Limit
============================================================
  Server in esecuzione: http://localhost:3000
  Ambiente: development
  Build: 2025-10-15
============================================================
  Features:
    - E2EE (AES-256-GCM)
    - Codice 20 parole
    - Rate Limiting attivo
    - Auto-cleanup messaggi
    - Upload file cifrati
============================================================
Rate limiting attivato:
- API generali: 100 req/15min
- Creazione stanze: 5 req/1h
- Messaggi: 10 msg/1min
- Upload file: 20MB/1giorni
```

### STEP 4: Verifica browser (1 minuto)
```
1. Apri http://localhost:3000
2. VERIFICA: Titolo "Ephemeral v1.2.0"
3. VERIFICA: Badge verde "v1.2.0" accanto a titolo
4. VERIFICA: Footer welcome screen "Versione 1.2.0 - Rate Limit"
5. F12 -> Console
6. VERIFICA: Log colorato "Ephemeral v1.2.0"
```

---

## MODIFICHE AI FILE

### 1. `package.json`
**Prima**:
```json
{
  "version": "1.0.0",
  "description": "Piattaforma..."
}
```

**Dopo**:
```json
{
  "version": "1.2.0",
  "description": "Piattaforma... v1.2.0",
  "changelog": {
    "1.2.0": "Rate limiting implementation",
    "1.1.0": "Fix codice stanza recuperabile",
    "1.0.0": "Base release"
  }
}
```

---

### 2. `server/config/config.js`
**Header aggiunto**:
```javascript
/**
 * SecureChat Configuration
 * @version 1.2.0
 * @description Configurazione con rate limiting
 * @changelog
 *   - v1.0.0: Base
 *   - v1.1.0: Fix recupero codice
 *   - v1.2.0: Rate limiting
 */

module.exports = {
  VERSION: '1.2.0',
  VERSION_NAME: 'Rate Limit',
  BUILD_DATE: '2025-10-15',
  // ... resto config
};
```

---

### 3. `server/index.js`
**Log startup migliorato**:
```javascript
server.listen(config.PORT, () => {
  console.log('='.repeat(60));
  console.log(`  Ephemeral SecureChat v${config.VERSION} - ${config.VERSION_NAME}`);
  console.log('='.repeat(60));
  // ... resto log
});
```

---

### 4. `public/index.html`
**Titolo**:
```html
<title>Ephemeral v1.2.0 - Comunicazione Cifrata</title>
```

**Header**:
```html
<h1>Ephemeral <span class="version">v1.2.0</span></h1>
```

**Footer welcome screen**:
```html
<div class="version-info">
    <small>Versione 1.2.0 - Rate Limit</small>
</div>
```

---

### 5. `public/css/style.css`
**Stili aggiunti**:
```css
.header h1 .version {
    font-size: 0.75rem;
    font-weight: 400;
    color: var(--success);
    background-color: rgba(6, 255, 165, 0.1);
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--success);
}

.version-info {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.1);
}
```

---

### 6. `public/js/config.js`
**Header aggiunto**:
```javascript
/**
 * SecureChat - Client Configuration
 * @version 1.2.0
 * @description Configurazione client con versioning
 */

const CONFIG = {
  VERSION: '1.2.0',
  VERSION_NAME: 'Rate Limit',
  BUILD_DATE: '2025-10-15',
  // ... resto config
};

// Log versione in console
console.log('%c Ephemeral v' + CONFIG.VERSION, 
  'background: #533483; color: #06ffa5; font-weight: bold');
```

---

### 7. `CHANGELOG.md` (NUOVO)
File completo con storia modifiche strutturato in:
- [Added]: Nuove feature
- [Changed]: Modifiche esistenti
- [Fixed]: Bug fix
- [Security]: Miglioramenti sicurezza

---

## COME AGGIORNARE VERSIONE (Prossime Release)

### Scenario: Release v1.3.0 (QW-002 + QW-003)

#### Step 1: Decidi numero versione
```
Feature nuove (QW-002, QW-003) = MINOR bump
v1.2.0 -> v1.3.0
```

#### Step 2: Aggiorna file
```javascript
// server/config/config.js
VERSION: '1.3.0',
VERSION_NAME: 'Download & QR',
BUILD_DATE: '2025-10-20',

// public/js/config.js
VERSION: '1.3.0',
VERSION_NAME: 'Download & QR',

// package.json
"version": "1.3.0",

// public/index.html
<title>Ephemeral v1.3.0...</title>
<h1>Ephemeral <span class="version">v1.3.0</span></h1>
<small>Versione 1.3.0 - Download & QR</small>
```

#### Step 3: Aggiorna CHANGELOG.md
```markdown
## [1.3.0] - 2025-10-20

### Added - QW-002 + QW-003
- Download codice stanza in file .txt
- QR Code per condivisione mobile
- Bottone "Scarica Codice" nel modal
- Canvas QR code in area permanente

### Changed
- Modal codice: aggiunto bottone download
- Area permanente: aggiunto QR code
```

#### Step 4: Commit & Tag
```bash
git add .
git commit -m "Release v1.3.0 - Download & QR Code"
git tag -a v1.3.0 -m "Version 1.3.0"
git push origin main --tags
```

---

## TEMPLATE HEADER FILE

### JavaScript
```javascript
/**
 * [NOME FILE] - [DESCRIZIONE]
 * @version 1.2.0
 * @description [Descrizione dettagliata]
 * @features
 *   - [Feature 1]
 *   - [Feature 2]
 * @changelog
 *   - v1.0.0: [Descrizione]
 *   - v1.1.0: [Descrizione]
 *   - v1.2.0: [Descrizione]
 */
```

### CSS
```css
/**
 * [NOME FILE] - [DESCRIZIONE]
 * @version 1.2.0
 * @description Stili per [componente]
 * @changelog
 *   - v1.0.0: Stili base
 *   - v1.1.0: Aggiunto modal codice
 *   - v1.2.0: Aggiunto badge versione
 */
```

---

## VERSIONING BEST PRACTICES

### MAJOR (x.0.0)
**Quando**: Breaking changes incompatibili
**Esempi**:
- Cambio formato codice stanza (20 -> 12 parole)
- Rimozione feature deprecate
- Refactor completo architettura
- Cambio protocollo cifratura

### MINOR (1.x.0)
**Quando**: Nuove feature retrocompatibili
**Esempi**:
- Aggiunta QR Code
- Aggiunta voice messages
- Nuovo tipo file supportato
- Nuova UI component

### PATCH (1.2.x)
**Quando**: Bug fix, miglioramenti minori
**Esempi**:
- Fix bug CSS
- Fix memory leak
- Miglioramento performance
- Fix typo documentazione

---

## CHECKLIST RELEASE

```
PRE-RELEASE:
[ ] Aggiornato VERSION in tutti i file
[ ] Aggiornato VERSION_NAME
[ ] Aggiornato BUILD_DATE
[ ] Aggiornato CHANGELOG.md
[ ] Test funzionalita completi
[ ] Test compatibilita browser
[ ] Documentazione aggiornata

RELEASE:
[ ] Commit modifiche
[ ] Tag versione (git tag)
[ ] Push con tag
[ ] Build produzione
[ ] Deploy staging
[ ] Test staging
[ ] Deploy produzione
[ ] Annuncio release

POST-RELEASE:
[ ] Monitoring errori
[ ] Raccolta feedback
[ ] Pianificazione prossima versione
```

---

## VISUALIZZAZIONE VERSIONE

### Console Server
```
============================================================
  Ephemeral SecureChat v1.2.0 - Rate Limit
============================================================
```

### Console Browser
```
 Ephemeral v1.2.0  (sfondo viola, testo verde)
 Rate Limit - Build 2025-10-15  (grigio)
 E2EE Chat with Rate Limiting  (corsivo grigio)
```

### UI Browser
```
+------------------------------------------+
|  Ephemeral [v1.2.0]                     |
|  Comunicazione Privata e Cifrata        |
+------------------------------------------+
|                                          |
|  Welcome Screen                          |
|  ...                                     |
|  Versione 1.2.0 - Rate Limit            |
+------------------------------------------+
```

---

## FILE CONSEGNATI

[View CHANGELOG.md](computer:///mnt/user-data/outputs/CHANGELOG.md)  
Storia completa modifiche

[View package_versioned.json](computer:///mnt/user-data/outputs/package_versioned.json)  
Package.json con versione 1.2.0

[View config_versioned.js](computer:///mnt/user-data/outputs/config_versioned.js)  
Config server con VERSION constant

[View config_versioned_client.js](computer:///mnt/user-data/outputs/config_versioned_client.js)  
Config client con log console

[View index_versioned.js](computer:///mnt/user-data/outputs/index_versioned.js)  
Server entry point con log startup

[View index_versioned.html](computer:///mnt/user-data/outputs/index_versioned.html)  
HTML con versione in titolo e UI

[View style.css](computer:///mnt/user-data/outputs/style.css)  
CSS con stili badge versione

---

## TROUBLESHOOTING

### Versione non appare nel titolo
**Soluzione**:
```cmd
copy index_versioned.html public\index.html
REM Hard refresh: CTRL+SHIFT+R
```

### Log console non colorato
**Soluzione**:
```cmd
copy config_versioned_client.js public\js\config.js
REM Clear cache
REM Hard refresh: CTRL+SHIFT+R
```

### Log server non formattato
**Soluzione**:
```cmd
copy index_versioned.js server\index.js
npm start
```

---

## CONCLUSIONE

**PROBLEMA**: Nessun versioning, difficile tracciare modifiche  
**SOLUZIONE**: Semantic versioning completo con visual feedback  
**RISULTATO**: Versione visibile ovunque (UI, console, log)  
**STATUS**: ✅ Pronto per uso immediato

---

**VERSIONE ATTUALE: v1.2.0 - Rate Limit**  
**BUILD: 2025-10-15**  
**PRONTO PER DEPLOY**
