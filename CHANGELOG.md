# Changelog - Ephemeral SecureChat

Tutte le modifiche notevoli a questo progetto saranno documentate in questo file.

Il formato è basato su [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e questo progetto aderisce a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2025-10-15

### Added - INF-003: Rate Limiting
- **Rate limiting HTTP**: Express middleware per API
  - Creazione stanze: max 5/ora per IP
  - API generali: max 100 richieste/15min per IP
- **Rate limiting WebSocket**: Controllo messaggi e upload
  - Messaggi: max 10/minuto per socket
  - Upload file: max 20 MB/24h per stanza
- **UX rate limiting**: Feedback utente
  - Notifiche errore chiare
  - Countdown timer visivo
  - Disabilitazione controlli durante cooldown
  - Recovery automatico
- **Cleanup automatico**: Prevenzione memory leak
  - Cleanup messaggi ogni 60s
  - Cleanup upload ogni 3600s
- **Logging**: Eventi rate limit loggati
- **Dipendenza**: express-rate-limit@7.1.5

### Changed
- `server/config/config.js`: Aggiunta sezione RATE_LIMIT
- `server/middleware/index.js`: Implementati rate limiters
- `server/routes/room.js`: Applicato createRoomLimiter
- `server/websocket/handlers.js`: Aggiunti check rate limit
- `public/js/SecureChat.js`: Gestione rate limit client-side
- `package.json`: Aggiunta dipendenza express-rate-limit

### Security
- Protezione da spam messaggi
- Protezione da abuse creazione stanze
- Protezione da flooding upload
- Mitigazione attacchi DDoS

---

## [1.1.0] - 2025-10-15

### Added - Fix Recupero Codice Stanza
- **Modal codice stanza**: Visualizzazione alla creazione
  - Mostra codice completo 20 parole
  - Bottone "Copia Codice"
  - Richiede conferma esplicita prima di procedere
  - Warning "Salva questo codice!"
- **Area permanente codice**: Sopra messaggi durante chat
  - Campo readonly con codice
  - Bottone "Copia" sempre disponibile
  - Visibile sia per creatore che ospite
- **Salvataggio in memoria**: `this.roomCode` in SecureChat class
- **UX migliorata**: Codice sempre recuperabile durante sessione

### Changed
- `public/index.html`: Aggiunto modal e area permanente
- `public/css/style.css`: Stili modal e area codice (180 righe)
- `public/js/SecureChat.js`: Logica gestione codice (85 righe)
  - Metodi: `showRoomCodeModal()`, `closeModal()`, `copyRoomCode()`
  - Gestione area permanente in `joinChat()` e `closeChat()`

### Fixed
- BUG CRITICO: Codice perso dopo primo copia
- Impossibilità condividere codice dopo cache sovrascritta
- UX: Utente non poteva vedere codice dopo prima copia

---

## [1.0.0] - 2025-10-14

### Added - Base Release
- **Cifratura E2E**: AES-256-GCM
  - PBKDF2 key derivation (100k iterations)
  - IV randomizzato per ogni messaggio
  - Nessuna chiave conservata sul server
- **Codice 20 parole**: Encoding/decoding
  - 8 byte roomId + 12 byte seed
  - Wordlist italiana 256 parole
  - Sanitize input (spazi/newline)
- **Upload immagini cifrate**: Max 2MB
  - Cifratura client-side
  - Base64 encoding
  - Preview inline
- **Differenziazione utenti**:
  - Colori utente automatici
  - Icone utente automatiche
  - Border laterale colorato
- **Sistema segnalazioni**:
  - Bottone "Segnala" su messaggi
  - Blocco stanza immediato
  - Broadcast a tutti gli utenti
- **Cleanup automatico**:
  - Messaggi scadono dopo 1 ora
  - Stanze inattive eliminate dopo 24h
  - Task cleanup ogni 30 minuti
- **FEAT-ERASE**: Cancellazione stanza
  - Bottone rosso "Erase"
  - DELETE /api/room/:roomId/erase
  - Broadcast `room_erased` event
  - Zero log/audit trail
- **QW-001**: 5 notifiche UI
  1. "Creazione stanza in corso..." (verde)
  2. "Connessione alla stanza..." (verde)
  3. "Connesso alla chat cifrata!" (verde)
  4. "Connessione persa..." (rosso)
  5. "Riconnesso al server" (verde)

### Technical
- **Server**: Node.js + Express + Socket.io
- **Frontend**: Vanilla JS (no framework)
- **Storage**: In-memory (Map)
- **WebSocket**: Real-time messaging
- **Dependencies**:
  - express@4.18.2
  - socket.io@4.7.2
  - cors@2.8.5

### Fixed (da versione originale)
1. Copy-paste codice 20 parole (sanitize input spazi/newline)
2. Scrollbar area messaggi (CSS corretto)
3. OperationError decifratura (QW-001 non tocca cifratura)

---

## Roadmap

### Quick Wins (Pianificato)
- [QW-002] Download codice stanza (.txt file)
- [QW-003] QR Code condivisione mobile
- [QW-004] Timer scadenza messaggi visivo
- [QW-005] Indicatore utenti attivi
- [QW-006] Suoni notifica

### Feature Medie (Pianificato)
- [FEAT-002] Codice 12 parole (opzionale vs 20)
- [FEAT-003] Timer auto-distruzione custom (15m/1h/24h)
- [FEAT-004] Modalità solo-lettura (read-only link)
- [FEAT-005] Upload documenti (PDF, DOCX, XLSX)
- [FEAT-006] Ricerca messaggi

### Feature Avanzate (Pianificato)
- [FEAT-001] Forward Secrecy (rotazione chiavi)
- [FEAT-007] Voice messages cifrati
- [FEAT-008] Video call P2P (WebRTC)
- [FEAT-009] Thread risposte (quote)
- [FEAT-010] Multi-stanza (tabs)
- [FEAT-011] Screen sharing

### Infrastruttura (Pianificato)
- [INF-001] Database PostgreSQL
- [INF-002] Redis cache
- [INF-004] Monitoring & logging
- [INF-005] Docker deployment
- [INF-006] CI/CD pipeline

---

## Versioning Strategy

**Semantic Versioning**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes, incompatibilità
- **MINOR**: Nuove feature, retrocompatibili
- **PATCH**: Bug fix, miglioramenti minori

**Branch Strategy**:
- `main`: Versione stabile in produzione
- `develop`: Sviluppo feature
- `feature/*`: Feature branch individuali
- `hotfix/*`: Fix urgenti su produzione

**Release Process**:
1. Sviluppo in `feature/*`
2. Merge in `develop`
3. Test estesi
4. Merge in `main` + tag versione
5. Deploy produzione
6. Update CHANGELOG.md

---

## Contributors

- **SecureChat Team** - Initial work
- **Community** - Bug reports and suggestions

---

## License

This project is licensed under the MIT License - see LICENSE file for details.

---

## Support

Per bug report o feature request, apri un issue su GitHub.

Per domande o supporto, consulta la documentazione.
