# FEAT-ERASE - CHECKLIST IMPLEMENTAZIONE

## FASE 1: PREPARAZIONE (2 min)

- [ ] Progetto securechat_modular funzionante
- [ ] Tutti i 3 bug fixati e testati
- [ ] Server fermo (Ctrl+C)
- [ ] Backup cartella completa (opzionale)

## FASE 2: BACKUP FILE (30 sec)

```cmd
cd securechat_modular

copy server\routes\room.js server\routes\room.js.backup
copy public\index.html public\index.html.backup
copy public\js\SecureChat.js public\js\SecureChat.js.backup
copy public\css\style.css public\css\style.css.backup
```

- [ ] Backup room.js
- [ ] Backup index.html
- [ ] Backup SecureChat.js
- [ ] Backup style.css

## FASE 3: DOWNLOAD FILE (1 min)

Scarica da Claude:

- [ ] room.js.ERASE
- [ ] index.html.ERASE
- [ ] SecureChat.js.ERASE
- [ ] style.css.ERASE
- [ ] FEAT_ERASE_GUIDE.md

## FASE 4: COPIA FILE (1 min)

```cmd
copy room.js.ERASE server\routes\room.js
copy index.html.ERASE public\index.html
copy SecureChat.js.ERASE public\js\SecureChat.js
copy style.css.ERASE public\css\style.css
```

- [ ] Copiato room.js
- [ ] Copiato index.html
- [ ] Copiato SecureChat.js
- [ ] Copiato style.css

## FASE 5: RIAVVIO SERVER (30 sec)

```cmd
npm start
```

- [ ] Server avviato
- [ ] Console: "Server SecureChat in esecuzione sulla porta 3000"
- [ ] NO errori nella console

## FASE 6: TEST BASE (2 min)

### Browser 1
- [ ] Apri http://localhost:3000
- [ ] Click "Crea Stanza Sicura"
- [ ] Codice copiato automaticamente
- [ ] Chat aperta
- [ ] Bottone "Erase" visibile (rosso, input area)
- [ ] Invia messaggio "test 1"
- [ ] Messaggio visibile

### Click Erase
- [ ] Click bottone "Erase"
- [ ] Chat chiusa IMMEDIATAMENTE
- [ ] Ritorno a schermata iniziale
- [ ] NO errori console

### Verifica stanza eliminata
- [ ] Incolla codice in input
- [ ] Click "Accedi"
- [ ] ATTESO: Errore "Stanza non trovata o scaduta"

## FASE 7: TEST NOTIFICA (3 min)

### Browser 1
- [ ] Crea nuova stanza
- [ ] Copia codice

### Browser 2 (incognito)
- [ ] Apri http://localhost:3000
- [ ] Incolla codice
- [ ] Click "Accedi"
- [ ] Chat aperta

### Browser 1
- [ ] Invia "ciao da browser 1"

### Browser 2
- [ ] Messaggio ricevuto
- [ ] Click "Erase"
- [ ] Chat chiusa immediatamente

### Browser 1 (verifica notifica)
- [ ] Notifica rossa: "Stanza cancellata"
- [ ] Chat chiude dopo 3 secondi
- [ ] Ritorno a schermata iniziale

## FASE 8: TEST MOBILE (2 min)

### Chrome DevTools
- [ ] F12 > Device toolbar
- [ ] Seleziona iPhone SE
- [ ] Refresh pagina

### Test mobile
- [ ] Crea stanza
- [ ] Bottone Erase: minimo 48x48px
- [ ] Touch-friendly (no troppo piccolo)
- [ ] Click Erase (mouse simula touch)
- [ ] Funziona come desktop

## FASE 9: TEST CROSS-BROWSER (5 min)

- [ ] Chrome: Funziona
- [ ] Firefox: Funziona
- [ ] Edge: Funziona
- [ ] Safari (se Mac): Funziona

## FASE 10: TEST ERRORE (2 min)

- [ ] Ferma server (Ctrl+C)
- [ ] Browser: Prova click Erase
- [ ] ATTESO: Notifica errore
- [ ] Chat NON chiude
- [ ] Console: errore fetch logged
- [ ] Riavvia server

## RIEPILOGO TEST

```
TEST PASSATI: ____ / 10
TEMPO TOTALE: ____ minuti
```

### Tutti test passati?
- [ ] SI -> Procedi deploy staging
- [ ] NO -> Controlla console errori

## ROLLBACK (se necessario)

```cmd
copy server\routes\room.js.backup server\routes\room.js
copy public\index.html.backup public\index.html
copy public\js\SecureChat.js.backup public\js\SecureChat.js
copy public\css\style.css.backup public\css\style.css
npm start
```

- [ ] File ripristinati
- [ ] Server riavviato
- [ ] Funziona come prima

## NOTE

**Data implementazione:** ______________

**Ora inizio:** ______________

**Ora fine:** ______________

**Problemi riscontrati:**
_____________________________________________
_____________________________________________
_____________________________________________

**Risoluzione:**
_____________________________________________
_____________________________________________
_____________________________________________

---

## PROSSIMI STEP

- [ ] Deploy staging (Render/Railway)
- [ ] Test produzione 24h
- [ ] Monitor errori
- [ ] Procedi FEAT-001 o Quick Wins

---

**IMPLEMENTAZIONE COMPLETATA**

**FEAT-ERASE ATTIVA**

**FIRMA:** ______________
