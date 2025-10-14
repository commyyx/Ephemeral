const CryptoHelper = {
  bytesToWords(bytes) {
    const words = [];
    for (let i = 0; i < bytes.length; i++) {
      words.push(CONFIG.WORDLIST[bytes[i]]);
    }
    return words.join('-');
  },

  wordsToBytes(wordsString) {
    // SANITIZE INPUT: rimuovi spazi, newline, tab
    const sanitized = wordsString
      .trim()                           // rimuovi spazi inizio/fine
      .replace(/\s+/g, '')              // rimuovi TUTTI gli spazi bianchi
      .replace(/[\r\n\t]/g, '')         // rimuovi newline e tab
      .toLowerCase();                   // lowercase per sicurezza
    
    const words = sanitized.split('-').filter(w => w.length > 0);  // filtra stringhe vuote
    const bytes = new Uint8Array(words.length);
    
    for (let i = 0; i < words.length; i++) {
      const index = CONFIG.WORDLIST.indexOf(words[i]);
      if (index === -1) {
        throw new Error(`Parola non valida: "${words[i]}" (posizione ${i+1}/${words.length})`);
      }
      bytes[i] = index;
    }
    return bytes;
  },

  async generateKeyFromSeed(seed) {
    const seedBuffer = new TextEncoder().encode(seed);
    const baseKey = await crypto.subtle.importKey(
      'raw',
      seedBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    );
    
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: CONFIG.PBKDF2_SALT,
        iterations: CONFIG.PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      CONFIG.AES_KEY_LENGTH
    );
    
    return await crypto.subtle.importKey(
      'raw',
      derivedBits,
      { name: 'AES-GCM', length: CONFIG.AES_KEY_LENGTH },
      true,
      ['encrypt', 'decrypt']
    );
  },

  async encodeRoomCode(roomId, encryptionKey) {
    const keyExport = await crypto.subtle.exportKey("raw", encryptionKey);
    const keyArray = new Uint8Array(keyExport);
    const seed = keyArray.slice(0, 12);
    const roomIdBytes = new Uint8Array(roomId.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    
    const combined = new Uint8Array(20);
    combined.set(roomIdBytes.slice(0, 8), 0);
    combined.set(seed, 8);
    
    return this.bytesToWords(combined);
  },

  async decodeRoomCode(wordsString) {
    const bytes = this.wordsToBytes(wordsString);
    
    if (bytes.length !== 20) {
      throw new Error(`Codice non valido (attese 20 parole, ricevute ${bytes.length})`);
    }
    
    const roomIdBytes = bytes.slice(0, 8);
    const roomId = Array.from(roomIdBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const seed = Array.from(bytes.slice(8, 20)).map(b => b.toString(16).padStart(2, '0')).join('');
    const key = await this.generateKeyFromSeed(seed);
    
    return { roomId, key };
  },

  async encryptMessage(message, encryptionKey) {
    const encoder = new TextEncoder();
    const data = encoder.encode(message);
    const iv = crypto.getRandomValues(new Uint8Array(CONFIG.AES_IV_LENGTH));
    
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      encryptionKey,
      data
    );
    
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Chunk processing per evitare stack overflow
    let binaryString = '';
    for (let i = 0; i < combined.length; i += CONFIG.CHUNK_SIZE) {
      const chunk = combined.subarray(i, Math.min(i + CONFIG.CHUNK_SIZE, combined.length));
      binaryString += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binaryString);
  },

  async decryptMessage(encryptedData, encryptionKey) {
    const binaryString = atob(encryptedData);
    const combined = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      combined[i] = binaryString.charCodeAt(i);
    }
    
    const iv = combined.slice(0, CONFIG.AES_IV_LENGTH);
    const data = combined.slice(CONFIG.AES_IV_LENGTH);
    
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv },
      encryptionKey,
      data
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }
};
