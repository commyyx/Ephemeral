# SISTEMA CODICE PAROLE

## IMPLEMENTATO ✅

Invece di condividere URL lunghi come:
```
https://localhost:3000/#room=abc123def456&key=dGhpc2lz...
```

Ora condividi **20 parole italiane**:
```
mare-sole-luna-cielo-terra-acqua-fuoco-vento-stella-notte-giorno-alba-tramonto-nuvola-pioggia-neve-ghiaccio-fiamma-onda-sabbia
```

---

## COME FUNZIONA

### ENCODING (Creazione Stanza)

**1. Server genera roomId:**
```
roomId = "abc123def4567890" (16 caratteri hex = 8 bytes)
```

**2. Client genera chiave AES-256:**
```
key = 32 bytes casuali
```

**3. Estrai seed dalla chiave:**
```
seed = primi 12 bytes della chiave (96 bit)
```

**4. Combina roomId + seed:**
```
combined = [8 bytes roomId] + [12 bytes seed] = 20 bytes
```

**5. Converti ogni byte in parola:**
```
Dizionario di 256 parole italiane
Byte 0 (valore 42) → parola 42 ("mare")
Byte 1 (valore 156) → parola 156 ("sole")
...
Byte 19 (valore 89) → parola 89 ("sabbia")

Risultato: "mare-sole-luna-cielo-terra-acqua-fuoco-vento-stella-notte-giorno-alba-tramonto-nuvola-pioggia-neve-ghiaccio-fiamma-onda-sabbia"
```

---

### DECODING (Accesso Stanza)

**1. Ricevi 20 parole:**
```
"mare-sole-luna-cielo-terra-acqua-fuoco-vento-stella-notte-giorno-alba-tramonto-nuvola-pioggia-neve-ghiaccio-fiamma-onda-sabbia"
```

**2. Converti parole in bytes:**
```
"mare" → indice 42 nel dizionario → byte valore 42
"sole" → indice 156 nel dizionario → byte valore 156
...
Risultato: 20 bytes
```

**3. Separa roomId e seed:**
```
roomId = primi 8 bytes → "abc123def4567890"
seed = ultimi 12 bytes → "0a1b2c3d4e5f..."
```

**4. Rigenera chiave AES-256 dal seed:**
```
Usa PBKDF2 con:
- Input: seed (12 bytes)
- Salt: "SecureChat" 
- Iterazioni: 100.000
- Output: 256 bit chiave AES

key = PBKDF2(seed) → chiave AES-256 completa
```

**5. Connessione stabilita:**
```
roomId + key → connessione E2EE alla stanza
```

---

## SICUREZZA

### E2EE Mantenuto ✅

**Server NON conosce MAI:**
- Seed (12 bytes)
- Chiave AES-256 completa
- Contenuto messaggi

**Server conosce SOLO:**
- roomId (8 bytes) - identificatore pubblico

**Tutto il resto è CLIENT-SIDE:**
- Seed → Chiave derivation
- Cifratura messaggi
- Decifratura messaggi

### Forza Crittografica

**Seed: 96 bit (12 bytes)**
- 2^96 = 79 quintilioni di combinazioni
- Impossibile da brute-force
- Sicuro per chat temporanee

**PBKDF2 con 100.000 iterazioni:**
- Rallenta drasticamente attacchi brute-force
- Standard industria per key derivation
- Genera chiave AES-256 completa da seed corto

**AES-256-GCM:**
- Standard militare
- Authenticated encryption
- Sicuro contro modifiche

---

## DIZIONARIO

**256 parole italiane comuni:**
- Facili da pronunciare
- Facili da scrivere
- Nessuna parola ambigua o simile
- 1 byte = 1 parola (perfetto)

**Categorie:**
- Natura: mare, sole, luna, cielo, terra...
- Casa: porta, finestra, tavolo, sedia...
- Cibo: pane, vino, olio, miele...
- Animali: cane, gatto, leone, aquila...
- Colori: rosso, blu, verde, giallo...
- Persone: padre, madre, amico, maestro...
- Tempo: anno, mese, giorno, ora...
- Emozioni: gioia, dolore, amore, pace...

---

## USABILITÀ

### Condivisione

**Via testo (WhatsApp, SMS, email):**
```
Incolla: mare-sole-luna-cielo-terra-acqua-fuoco-vento-stella-notte-giorno-alba-tramonto-nuvola-pioggia-neve-ghiaccio-fiamma-onda-sabbia
```

**Via voce (telefono, persona):**
```
"Mare, sole, luna, cielo, terra, acqua, fuoco, vento, stella, notte, giorno, alba, tramonto, nuvola, pioggia, neve, ghiaccio, fiamma, onda, sabbia"
```

**Via nota scritta:**
```
mare-sole-luna-cielo-terra
acqua-fuoco-vento-stella-notte
giorno-alba-tramonto-nuvola-pioggia
neve-ghiaccio-fiamma-onda-sabbia
```

### Confronto

| Metodo | Lunghezza | Dettabile | Memorabile |
|--------|-----------|-----------|------------|
| URL completo | ~120 caratteri | ❌ No | ❌ No |
| Codice parole | 20 parole | ✅ Sì | ✅ Parziale |

**20 parole è un compromesso accettabile:**
- Meno di 30 secondi per dettare
- Più facile che URL
- Mantiene sicurezza E2EE

---

## RETROCOMPATIBILITÀ

**joinRoom() accetta ENTRAMBI i formati:**

**Formato vecchio (URL):**
```javascript
if (input.includes('://') || input.includes('#room=')) {
    // Parsing URL...
}
```

**Formato nuovo (parole):**
```javascript
else {
    // Decoding parole...
}
```

**Link vecchi funzionano ancora!**

---

## IMPLEMENTAZIONE TECNICA

### Metodi Principali

**bytesToWords(bytes)**
- Input: Uint8Array
- Output: stringa "parola1-parola2-..."
- Conversione: ogni byte → parola dal dizionario

**wordsToBytes(wordsString)**
- Input: stringa "parola1-parola2-..."
- Output: Uint8Array
- Conversione: ogni parola → byte (indice dizionario)

**generateKeyFromSeed(seed)**
- Input: seed (12 bytes hex string)
- Output: CryptoKey AES-256
- Usa: PBKDF2 con 100k iterazioni

**encodeRoomCode(roomId, key)**
- Input: roomId (hex), chiave AES-256
- Output: 20 parole
- Estrae seed dalla chiave, combina con roomId

**decodeRoomCode(wordsString)**
- Input: 20 parole
- Output: {roomId, key}
- Estrae roomId e seed, rigenera chiave

---

## TEST

### Scenario 1: Creazione e Join

**Browser 1:**
1. Click "Crea Stanza Sicura"
2. Notifica: "✅ Codice copiato! (20 parole)"
3. Console mostra codice completo
4. Esempio: `mare-sole-luna-...-sabbia`

**Browser 2:**
1. Incolla codice: `mare-sole-luna-...-sabbia`
2. Click "Accedi"
3. Connessione stabilita
4. Chat funziona normalmente

### Scenario 2: Retrocompatibilità

**Browser 1:**
1. Ha vecchio URL: `https://localhost:3000/#room=abc&key=xyz`
2. Incolla vecchio URL
3. Click "Accedi"
4. **Funziona!** Sistema riconosce formato

### Scenario 3: Errore Parole

**Browser 1:**
1. Incolla: `mare-sole-XXX-cielo` (parola errata)
2. Click "Accedi"
3. Errore: "Codice non valido: Parola non valida: XXX"

**Browser 1:**
1. Incolla: `mare-sole-luna` (troppo corto)
2. Click "Accedi"
3. Errore: "Codice non valido (attese 20 parole, ricevute 3)"

---

## LIMITAZIONI

**1. Lunghezza:**
- 20 parole sono tante da dettare
- Compromesso necessario per sicurezza

**2. Errori di battitura:**
- Una parola sbagliata = codice invalido
- Serve attenzione nel copiare/dettare

**3. Lingua:**
- Dizionario italiano = target italiano
- Per altri paesi servirebbero altri dizionari

---

## VANTAGGI

✅ **E2EE mantenuto** - server non conosce chiave
✅ **Più corto di URL** - ~60 caratteri vs ~120
✅ **Dettabile** - parole comuni italiane
✅ **Retrocompatibile** - vecchi URL funzionano
✅ **Sicuro** - 96 bit seed + PBKDF2
✅ **No registrazione** - completamente anonimo
✅ **Client-side** - tutto nel browser

---

## ESEMPIO COMPLETO

**Codice generato:**
```
mare-sole-luna-cielo-terra-acqua-fuoco-vento-stella-notte-giorno-alba-tramonto-nuvola-pioggia-neve-ghiaccio-fiamma-onda-sabbia
```

**Rappresenta:**
- roomId: `abc123def4567890`
- seed: `0a1b2c3d4e5f6789a1b2`
- chiave AES-256: derivata da seed via PBKDF2

**Risultato:**
- Connessione E2EE sicura
- Server conosce solo: `abc123def4567890`
- Messaggi cifrati lato client

---

**Sistema implementato e testabile!**
