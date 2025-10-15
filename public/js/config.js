const CONFIG = {
  WORDLIST: [
    'mare','sole','luna','cielo','terra','acqua','fuoco','vento','stella','notte',
    'giorno','alba','tramonto','nuvola','pioggia','neve','ghiaccio','fiamma','onda','sabbia',
    'monte','valle','fiume','lago','isola','bosco','fiore','albero','foglia','radice',
    'casa','porta','finestra','tetto','muro','scala','stanza','cucina','letto','tavolo',
    'sedia','libro','penna','carta','lettera','parola','frase','storia','poesia','musica',
    'canto','voce','suono','silenzio','eco','ritmo','nota','melodia','armonia','danza',
    'arte','colore','rosso','blu','verde','giallo','nero','bianco','grigio','rosa',
    'oro','argento','bronzo','ferro','pietra','legno','vetro','stoffa','seta','lana',
    'pane','vino','olio','sale','pepe','zucchero','miele','latte','formaggio','frutta',
    'mela','pera','uva','arancia','limone','banana','ciliegia','pesca','prugna','fragola',
    'cane','gatto','cavallo','leone','tigre','orso','lupo','volpe','coniglio','topo',
    'uccello','aquila','colomba','corvo','gufo','gallo','gallina','anatra','cigno','pappagallo',
    'pesce','balena','delfino','squalo','tonno','salmone','trota','anguilla','polpo','granchio',
    'farfalla','ape','mosca','formica','ragno','serpente','lucertola','rana','tartaruga','lumaca',
    'uomo','donna','bambino','padre','madre','figlio','figlia','fratello','sorella','nonno',
    'nonna','zio','zia','cugino','amico','vicino','maestro','dottore','poeta','artista',
    're','regina','principe','principessa','cavaliere','guerriero','mago','fata','angelo','demone',
    'dio','dea','eroe','gigante','nano','elfo','drago','unicorno','fenice','sirena',
    'tempo','anno','mese','giorno','ora','minuto','secondo','mattina','sera','notte',
    'passato','presente','futuro','storia','memoria','ricordo','sogno','pensiero','idea','mente',
    'cuore','anima','spirito','corpo','mano','piede','occhio','orecchio','bocca','naso',
    'testa','viso','capello','barba','dente','lingua','voce','respiro','sangue','osso',
    'forza','coraggio','paura','gioia','dolore','amore','odio','pace','guerra','vita',
    'morte','nascita','fine','inizio','viaggio','strada','ponte','porto','nave','vela',
    'luce','ombra','spazio','mondo','citta','paese','piano','posto','punto','parte',
    'fatto','modo','caso','numero','gente','volta'
  ],
  
  USER_COLORS: [
    '#e63946', '#f77f00', '#06ffa5', '#0096c7',
    '#9d4edd', '#ff006e', '#06d6a0', '#ffd60a'
  ],
  
  USER_ICONS: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
  
  MAX_FILE_SIZE: 2 * 1024 * 1024, // 2MB
  
  PBKDF2_ITERATIONS: 100000,
  PBKDF2_SALT: new Uint8Array([83,101,99,117,114,101,67,104,97,116]), // "SecureChat"
  
  AES_KEY_LENGTH: 256,
  AES_IV_LENGTH: 12,
  
  CHUNK_SIZE: 8192 // Per evitare stack overflow
};
