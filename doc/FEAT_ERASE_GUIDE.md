# FEAT-ERASE - GUIDA IMPLEMENTAZIONE

## FILE MODIFICATI (4 totali)

### 1. server/routes/room.js
**File:** room.js.ERASE
**Modifiche:** Aggiunta route DELETE /api/room/:roomId/erase
**Righe:** +17 nuove

### 2. public/index.html
**File:** index.html.ERASE
**Modifiche:** Aggiunto bottone Erase nella input-area
**Righe:** +1 riga (bottone)

### 3. public/js/SecureChat.js
**File:** SecureChat.js.ERASE
**Modifiche:** 
- Event listener per erase-btn
- Metodo eraseRoom()
- Metodo handleRoomErased()
- Metodo closeChat()
- Socket listener room_erased
**Righe:** +50 nuove

### 4. public/css/style.css
**File:** style.css.ERASE
**Modifiche:** Styling .erase-btn + mobile responsive
**Righe:** +20 nuove

---

## PROCEDURA INSTALLAZIONE

### WINDOWS

```cmd
cd C:\Users\TUONOME\Desktop\securechat_modular

REM Backup file originali
copy server\routes\room.js server\routes\room.js.backup
copy public\index.html public\index.html.backup
copy public\js\SecureChat.js public\js\SecureChat.js.backup
copy public\css\style.css public\css\style.css.backup

REM Scarica i 4 file .ERASE da Claude
REM Poi copiali nelle cartelle corrette:

copy room.js.ERASE server\routes\room.js
copy index.html.ERASE public\index.html
copy SecureChat.js.ERASE public\js\SecureChat.js
copy style.css.ERASE public\css\style.css

REM Riavvia server
npm start
```

### LINUX/MAC

```bash
cd ~/securechat_modular

# Backup
cp server/routes/room.js server/routes/room.js.backup
cp public/index.html public/index.html.backup
cp public/js/SecureChat.js public/js/SecureChat.js.backup
cp public/css/style.css public/css/style.css.backup

# Scarica i 4 file .ERASE da Claude
# Poi copiali:

cp room.js.ERASE server/routes/room.js
cp index.html.ERASE public/index.html
cp SecureChat.js.ERASE public/js/SecureChat.js
cp style.css.ERASE public/css/style.css

# Riavvia
npm start
```

---

## TEST CHECKLIST

### TEST 1: Funzionalita base
```
1. Browser 1: http://localhost:3000
2. Crea stanza
3. Verifica bottone "Erase" visibile (rosso, accanto a Invia)
4. Invia 2-3 messaggi
5. Click su "Erase"
6. ATTESO: 
   - Chat chiusa immediatamente
   - Ritorno a schermata iniziale
   - NO messaggi visibili
```

### TEST 2: Notifica altri utenti
```
1. Browser 1: Crea stanza, copia codice
2. Browser 2 (incognito): Incolla codice, join
3. Browser 1: Invia messaggio "ciao"
4. Browser 2: Verifica messaggio ricevuto
5. Browser 2: Click "Erase"
6. ATTESO Browser 1:
   - Notifica rossa "Stanza cancellata"
   - Chat chiude dopo 3 secondi
7. ATTESO Browser 2:
   - Chat chiude immediatamente
   - NO notifica (e' chi ha cancellato)
```

### TEST 3: Mobile responsive
```
1. Chrome DevTools: Device toolbar
2. iPhone SE (375x667)
3. Crea stanza
4. Verifica bottone Erase:
   - Dimensione: minimo 48x48px
   - Touch-friendly
   - Colore rosso
   - NO overflow layout
5. Click Erase (con mouse/touch simulato)
6. ATTESO: Funziona come desktop
```

### TEST 4: Cross-browser
```
Test su:
- Chrome (Windows/Mac/Linux)
- Firefox
- Safari (Mac/iOS)
- Edge
- Chrome Android

ATTESO: Comportamento identico su tutti
```

### TEST 5: Errore API
```
1. Ferma server (Ctrl+C)
2. Browser: Join stanza
3. Click Erase
4. ATTESO:
   - Notifica rossa "Errore nella cancellazione della stanza"
   - Chat NON chiude
   - Console: errore fetch logged
```

### TEST 6: Stanza gia eliminata
```
1. Browser 1: Crea stanza
2. Browser 2: Join stanza
3. Browser 1: Click Erase
4. Browser 2: (dopo notifica) tenta invio messaggio
5. ATTESO:
   - Errore "Non connesso alla stanza"
   - Impossibile inviare
```

---

## CARATTERISTICHE IMPLEMENTATE

### Backend
- Route DELETE /api/room/:roomId/erase
- Elimina rooms.delete(roomId)
- Elimina messages.delete(roomId)
- Emit Socket.IO broadcast room_erased
- NO log (privacy)
- NO autenticazione (qualsiasi utente)

### Frontend
- Bottone "Erase" rosso (#e63946)
- Posizione: input-area, tra Allega e Invia
- Click: chiamata API DELETE
- Success: closeChat() immediato
- Socket listener: notifica + closeChat() dopo 3sec
- Mobile: 48x48px touch-friendly

### Sicurezza
- NO conferma popup (by design)
- Cancellazione immediata
- Broadcast a tutti utenti
- NO audit trail
- Massima privacy

---

## ROLLBACK (se problemi)

```cmd
REM Windows
copy server\routes\room.js.backup server\routes\room.js
copy public\index.html.backup public\index.html
copy public\js\SecureChat.js.backup public\js\SecureChat.js
copy public\css\style.css.backup public\css\style.css

npm start
```

```bash
# Linux/Mac
cp server/routes/room.js.backup server/routes/room.js
cp public/index.html.backup public/index.html
cp public/js/SecureChat.js.backup public/js/SecureChat.js
cp public/css/style.css.backup public/css/style.css

npm start
```

---

## TEMPO STIMATO

- Download file: 2 minuti
- Backup + copia: 2 minuti
- Riavvio server: 30 secondi
- Test base: 5 minuti
- Test completi: 15 minuti

**TOTALE: 25 minuti**

---

## NOTE TECNICHE

### Differenza Erase vs Report
- **Report**: Blocca stanza (room.isBlocked = true), utenti non possono piu accedere
- **Erase**: Elimina stanza completamente (rooms.delete), nessuna traccia rimane

### Socket.IO broadcast
```javascript
io.to(roomId).emit('room_erased', {...})
```
Invia a TUTTI utenti connessi nella room, incluso chi ha chiamato erase.
Il frontend distingue (chi ha chiamato non mostra notifica).

### Mobile optimization
```css
@media (max-width: 480px) {
  .erase-btn {
    min-width: 48px;
    height: 48px;
  }
}
```
Standard touch target: minimo 48x48px (Apple/Google HIG).

---

## SUPPORTO

Problemi? Controlla:
1. Console browser (F12) - errori JavaScript
2. Console server - errori backend
3. Network tab - verifica DELETE call
4. File copiati correttamente
5. Server riavviato dopo modifiche

---

## PROSSIMI STEP

Dopo implementazione FEAT-ERASE:
1. Test completi (25 min)
2. Deploy staging (15 min)
3. Monitor 24h
4. Procedi con FEAT-001 o Quick Wins

---

**FEATURE PRONTA PER IMPLEMENTAZIONE**

**TEMPO: 3 ore (incluso testing completo)**

**RISCHIO: BASSO**

**IMPATTO: ALTO**
