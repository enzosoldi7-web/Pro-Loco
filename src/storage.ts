import { Socio, ProLocoInfo, QuotaAssociativa, StatoQuota, ProLocoEvento, StandEvento, SitoWebConfig, GiornalinoConfig, ArticoloGiornalino, EdizioneGiornalino } from './types';

const STORAGE_KEY_SOCI = 'proloco_gestione_soci_v1';
const STORAGE_KEY_CONFIG = 'proloco_gestione_config_v1';
const STORAGE_KEY_EVENTI = 'proloco_gestione_eventi_v2';
const STORAGE_KEY_SITO_WEB = 'proloco_gestione_sito_web_v1';
const STORAGE_KEY_GIORNALINO = 'proloco_gestione_giornalino_v1';
export const STORAGE_KEY_ARCHIVIO_GIORNALINI = 'proloco_archivio_giornalini_v1';
export const STORAGE_KEY_GIORNALINO_ATTIVO_ID = 'proloco_giornalino_attivo_id_v1';

export const DEFAULT_GIORNALINO_CONFIG: GiornalinoConfig = {
  testata: 'La Voce della Pro Loco',
  sottotitoloTestata: 'Periodico Ufficiale di Cultura, Tradizioni Popolari e Vita Associativa',
  motto: 'Al servizio del borgo, custodi della nostra storia dal 1978',
  numeroEdizione: 'Anno XXIV - N. 1',
  periodo: 'Edizione Autunno - Inverno',
  dataPubblicazione: 'Ottobre 2025',
  direttoreResponsabile: 'Marco Valenti (Presidente Pro Loco)',
  redazione: 'Consiglio Direttivo e Comitato Redazionale Volontari',
  tiratura: '1.500 copie ad uso sociale e diffusione digitale gratuita',
  sedeStampa: 'Tipografia Valdelsa & Diffusione Sociale APS',
  totalePagine: 4,
  articoli: [
    {
      id: 'art-1',
      titolo: 'Insieme per Custodire il Passato e Costruire il Futuro del Nostro Borgo',
      sottotitolo: 'L\'editoriale del Presidente: il valore insostituibile del volontariato e dell\'impegno per la comunità',
      sezione: 'editoriale',
      autore: 'Marco Valenti (Presidente)',
      data: 'Ottobre 2025',
      pagina: 1,
      ordine: 1,
      colonna: 'doppia',
      allineamento: 'justify',
      capolettera: true,
      contenuto: `Cari soci, cittadini e amici della nostra Pro Loco,
apriamo questo nuovo numero del nostro notiziario con un sentimento di profonda gratitudine verso tutti coloro che, con dedizione e passione silenziosa, rendono viva la nostra associazione.

La Pro Loco non è solo un comitato organizzatore di sagre o feste paesane: è un presidio di memoria storica, un collante civico e uno spazio aperto in cui generazioni diverse si incontrano. In questo anno sociale abbiamo raggiunto traguardi significativi nel registro RUNTS e nell'albo soci, rinnovando il tesseramento digitale e potenziando la sicurezza di tutte le nostre manifestazioni.

Invitiamo ogni cittadino, in particolare i giovani e le famiglie di nuovo insediamento, ad avvicinarsi alla nostra sede in Piazza del Popolo: c'è bisogno dell'entusiasmo di tutti per continuare a valorizzare i nostri vicoli storici, le nostre tradizioni agricole e il nostro impareggiabile senso di appartenenza. Buona lettura!`,
      inEvidenza: true
    },
    {
      id: 'art-2',
      titolo: 'La Tradizionale Festa d\'Autunno: Record di Presenze e Sapori Ritrovati',
      sottotitolo: 'Tre giorni indimenticabili tra stand gastronomici, musica popolare, antichi mestieri e visitatori da tutta la regione',
      sezione: 'primo_piano',
      autore: 'Redazione Pro Loco',
      data: 'Settembre 2025',
      pagina: 2,
      ordine: 1,
      colonna: 'doppia',
      allineamento: 'justify',
      capolettera: true,
      contenuto: `Si è conclusa con uno straordinario successo di pubblico la 47ª edizione della nostra Festa d'Autunno. I vicoli del centro storico si sono trasformati in un percorso a cielo aperto dedicato alle nostre eccellenze enogastronomiche: castagne del bosco, bruschette con l'olio nuovo, calici di vino tipico e dolci della tradizione contadina preparati secondo le antiche ricette delle nostre nonne.

Oltre 3.500 presenze stimate nell'intero fine settimana, con una gestione impeccabile della sicurezza, della differenziazione dei rifiuti e della viabilità grazie al coordinamento tra il nostro Direttivo, la Polizia Locale e la Protezione Civile. Un ringraziamento speciale va ai 45 volontari attivi che hanno lavorato instancabilmente dietro le quinte.`,
      immagine: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop&q=80',
      didascaliaImmagine: 'I vicoli del centro storico gremiti durante la passeggiata inaugurale della fiera.',
      inEvidenza: true
    },
    {
      id: 'art-3',
      titolo: 'Campagna Tesseramento: Più Soci Siamo, Più Forte Batte il Nostro Territorio',
      sottotitolo: 'Tutti i vantaggi della tessera annuale: sconti convenzionati UNPLI, assicurazione attività e sostegno ai progetti del paese',
      sezione: 'vita_associativa',
      autore: 'Segreteria Associativa',
      data: 'Ottobre 2025',
      pagina: 3,
      ordine: 1,
      colonna: 'singola',
      allineamento: 'justify',
      capolettera: false,
      contenuto: `È ufficialmente aperta la campagna tesseramento per il nuovo anno sociale. Sottoscrivere o rinnovare la quota associativa (Quota Ordinaria 15€, Giovani Under 25 10€, Sostenitori 30€) rappresenta un gesto concreto di vicinanza e supporto al patrimonio culturale della nostra terra.

Con la tessera del socio Pro Loco, riconosciuta a livello nazionale dal circuito UNPLI, si ha diritto a centinaia di convenzioni su ingressi a musei, teatri, parchi archeologici e polizze assicurative per tutte le attività associative. Inoltre quest'anno è possibile richiedere e rinnovare la tessera anche digitalmente con ricezione immediata della ricevuta e del QR Code personale.`,
      inEvidenza: false
    },
    {
      id: 'art-4',
      titolo: 'Scorci e Memoria: Il Recupero della Fontana del Trecento e la Riscoperta dei Sentieri',
      sottotitolo: 'L\'impegno della Pro Loco per la tutela del paesaggio e la posa della nuova segnaletica escursionistica',
      sezione: 'storia_cultura',
      autore: 'Prof. Alberto Conti (Storico locale)',
      data: 'Agosto 2025',
      pagina: 4,
      ordine: 1,
      colonna: 'doppia',
      allineamento: 'justify',
      capolettera: false,
      contenuto: `In sinergia con la Soprintendenza Archeologia e il Comune, i volontari del gruppo sentieri della Pro Loco hanno completato la mappatura e la pulizia del percorso panoramico che unisce il borgo antico alle sorgenti collinari.

L'intervento ha permesso anche di riportare alla luce le antiche vasche di decantazione in pietra serena e di installare una nuova tabella didattica bilingue con QR Code informativo per escursionisti e visitatori. Un tassello fondamentale che arricchisce l'offerta turistica sostenibile del nostro comune.`,
      immagine: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
      didascaliaImmagine: 'Uno scorcio del sentiero naturalistico ripulito dai volontari della Pro Loco.',
      inEvidenza: false
    }
  ],
  sponsor: [
    {
      id: 'sp-1',
      nome: 'Ristorante & Pizzeria Il Borgo Antico',
      categoria: 'Enogastronomia Tipica',
      slogan: 'Cucina tradizionale, pasta fresca fatta a mano e pizza nel forno a legna',
      telefono: '0577 987654',
      indirizzo: 'Piazza del Popolo, 12 - Centro Storico',
      pagina: 4,
      formato: 'box_quarto',
      logoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80'
    },
    {
      id: 'sp-2',
      nome: 'BCC - Credito Cooperativo Locale',
      categoria: 'Banca & Finanza Etica',
      slogan: 'Da oltre 70 anni la banca del nostro territorio al fianco delle famiglie e delle associazioni',
      telefono: '0577 123456',
      indirizzo: 'Via Roma, 45',
      pagina: 4,
      formato: 'box_quarto'
    },
    {
      id: 'sp-3',
      nome: 'Frantoio & Cantina Sociale Colli Nostri',
      categoria: 'Olio EVO & Vini DOCG',
      slogan: 'Vendita diretta olio extravergine d\'oliva IGP e vini tipici del borgo',
      telefono: '0577 654321',
      indirizzo: 'Strada Provinciale dei Vigneti, 8',
      pagina: 4,
      formato: 'banner_striscia',
      logoUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80'
    },
    {
      id: 'sp-4',
      nome: 'Farmacia & Erboristeria Dr. Mori',
      categoria: 'Salute & Benessere',
      slogan: 'Cosmesi naturale, preparazioni galeniche e consulenza nutrizionale',
      telefono: '0577 345678',
      indirizzo: 'Corso Garibaldi, 28',
      pagina: 3,
      formato: 'box_quarto'
    }
  ],
  studioConfig: {
    temaColore: 'inchiostro',
    stileFont: 'serif',
    grigliaPredefinita: 2,
    filettiVerticali: true,
    interlinea: 'standard',
    mostraRighelli: true,
    mostraGuide: true,
    modalitaVisualizzazione: 'singola',
    zoom: 100
  }
};

export const DEFAULT_SITO_WEB_CONFIG: SitoWebConfig = {
  titoloHero: 'Benvenuti nel Cuore delle Nostre Tradizioni',
  sottotitoloHero: 'Vivi la cultura, gli eventi e l\'ospitalità della nostra terra',
  mottoPersonalizzato: 'Custodi delle tradizioni popolari, promotori del territorio e del patrimonio culturale.',
  testoBenvenuto: 'La nostra Associazione Pro Loco opera ogni giorno come Ente del Terzo Settore per valorizzare il borgo, organizzare feste paesane e manifestazioni culturali, e accogliere con calore residenti e turisti.',
  immagineCopertina: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&auto=format&fit=crop&q=80',
  avvisoImportante: 'Campagna tesseramento in corso: richiedi la tua tessera socio online!',
  mostraAvviso: true,
  tipoAvviso: 'success',
  abilitaEventi: true,
  abilitaTesseramentoOnline: true,
  abilitaTerritorio: true,
  abilitaDirettivo: true,
  abilitaContatti: true,
  titoloTerritorio: 'Scopri il Nostro Borgo & le Tradizioni',
  testoTerritorio: 'Un territorio ricco di scorci medievali, sentieri escursionistici immersi nel verde e prodotti tipici a chilometro zero, custoditi con passione dalla nostra comunità.',
  orariAperturaSede: 'Lunedì - Venerdì: 09:30 - 12:30 | Sabato mattina su appuntamento',
  linkFacebook: 'https://facebook.com',
  linkInstagram: 'https://instagram.com',
  linkWhatsApp: '+39 0577 920314',
  pubblicato: false,
  dataPubblicazione: undefined,
  blindatoVisitatori: false,
  pinSbloccoAdmin: '1234',
  temaColore: 'emerald',
  stileTipografico: 'classico',
  testoInvitoTesseramento: 'Diventa parte attiva della comunità: sostieni gli eventi, partecipa alla vita associativa e accedi alle convenzioni nazionali UNPLI.',
  schedeTerritorio: [
    {
      id: 'terr-1',
      titolo: 'Borgo Storico & Cinta Muraria',
      descrizione: 'Un intatto dedalo di vicoli in pietra serena, botteghe artigiane e bastioni panoramici affacciati sulla vallata.',
      immagine: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop&q=80',
      categoria: 'monumento'
    },
    {
      id: 'terr-2',
      titolo: 'Sapori della Tradizione & Olio EVO',
      descrizione: 'Degustazioni di prodotti tipici a km zero, vino DOCG e ricette secolari tramandate dai mastri cuochi locali.',
      immagine: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=800&auto=format&fit=crop&q=80',
      categoria: 'enogastronomia'
    },
    {
      id: 'terr-3',
      titolo: 'Sentieri Naturalistici & Trekking',
      descrizione: 'Itinerari immersi tra uliveti, boschi di querce e sorgenti d\'acqua limpida, perfetti per famiglie ed escursionisti.',
      immagine: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
      categoria: 'natura'
    }
  ]
};

export const DEFAULT_PRO_LOCO: ProLocoInfo = {
  nome: 'Pro Loco Valdelsa & Colline',
  codiceFiscale: '90023410523',
  partitaIva: '01293840521',
  indirizzo: 'Piazza del Popolo, 12',
  cap: '53034',
  comune: 'Colle di Val d\'Elsa',
  provincia: 'SI',
  email: 'info@prolocovaldelsa.it',
  telefono: '+39 0577 920314',
  sitoWeb: 'www.prolocovaldelsa.it',
  codiceUnpli: 'UNPLI-TOS-5219',
  numeroRunts: 'RUNTS-APS-2022-84912',
  annoCorrente: new Date().getFullYear(),
  quotaStandardOrdinario: 15,
  quotaStandardSostenitore: 30,
  quotaStandardGiovane: 10,
  nomePresidente: 'Marco Valenti',
  motto: 'Custodi delle tradizioni, promotori del territorio e della comunità'
};

export const INITIAL_SOCI: Socio[] = [
  {
    id: 'socio-1',
    numeroTessera: 'PL-2025-001',
    nome: 'Marco',
    cognome: 'Valenti',
    codiceFiscale: 'VLNMCR75M14C847K',
    dataNascita: '1975-08-14',
    luogoNascita: 'Siena (SI)',
    indirizzo: 'Via Roma, 45',
    cap: '53034',
    citta: 'Colle di Val d\'Elsa',
    provincia: 'SI',
    telefono: '338 1234567',
    email: 'm.valenti@email.it',
    categoria: 'Membro Direttivo',
    ruoloDirettivo: 'Presidente',
    dataIscrizione: '2015-02-10',
    attivo: true,
    consensoPrivacy: true,
    foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    note: 'Coordinamento generale sagre e rapporti con il Comune.',
    competenzeVolontariato: ['Organizzazione Eventi', 'Rapporti Istituzionali'],
    quote: [
      {
        id: 'q-1-2024',
        socioId: 'socio-1',
        anno: 2024,
        importo: 15,
        dataPagamento: '2024-01-15',
        metodo: 'Bonifico Bancario',
        ricevutaNumero: 'REC-2024/001',
        note: 'Rinnovo quota annuale ordinaria'
      },
      {
        id: 'q-1-2025',
        socioId: 'socio-1',
        anno: 2025,
        importo: 15,
        dataPagamento: '2025-01-12',
        metodo: 'Bonifico Bancario',
        ricevutaNumero: 'REC-2025/001',
        note: 'Rinnovo quota annuale ordinaria'
      },
      {
        id: 'q-1-2026',
        socioId: 'socio-1',
        anno: 2026,
        importo: 15,
        dataPagamento: '2026-01-10',
        metodo: 'Bonifico Bancario',
        ricevutaNumero: 'REC-2026/001',
        note: 'Quota anno 2026'
      }
    ]
  },
  {
    id: 'socio-2',
    numeroTessera: 'PL-2025-002',
    nome: 'Giulia',
    cognome: 'Bernardi',
    codiceFiscale: 'BRNGLI84P52C847E',
    dataNascita: '1984-09-12',
    luogoNascita: 'Poggibonsi (SI)',
    indirizzo: 'Via Garibaldi, 8',
    cap: '53034',
    citta: 'Colle di Val d\'Elsa',
    provincia: 'SI',
    telefono: '347 9876543',
    email: 'giulia.bernardi@studio.it',
    categoria: 'Membro Direttivo',
    ruoloDirettivo: 'Segretario',
    dataIscrizione: '2018-04-15',
    attivo: true,
    consensoPrivacy: true,
    foto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    note: 'Gestione verbali assemblea e comunicazioni soci.',
    competenzeVolontariato: ['Segreteria', 'Social Media'],
    quote: [
      {
        id: 'q-2-2025',
        socioId: 'socio-2',
        anno: 2025,
        importo: 15,
        dataPagamento: '2025-01-20',
        metodo: 'POS / Carta',
        ricevutaNumero: 'REC-2025/004'
      },
      {
        id: 'q-2-2026',
        socioId: 'socio-2',
        anno: 2026,
        importo: 15,
        dataPagamento: '2026-01-18',
        metodo: 'POS / Carta',
        ricevutaNumero: 'REC-2026/003'
      }
    ]
  },
  {
    id: 'socio-3',
    numeroTessera: 'PL-2025-003',
    nome: 'Alessandro',
    cognome: 'Moretti',
    codiceFiscale: 'MRTLSN68D20D612Z',
    dataNascita: '1968-04-20',
    luogoNascita: 'Firenze (FI)',
    indirizzo: 'Viale Matteotti, 102',
    cap: '53034',
    citta: 'Colle di Val d\'Elsa',
    provincia: 'SI',
    telefono: '335 4433221',
    email: 'a.moretti@fattoria.com',
    categoria: 'Sostenitore',
    ruoloDirettivo: 'Nessuno',
    dataIscrizione: '2019-06-01',
    attivo: true,
    consensoPrivacy: true,
    foto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    note: 'Azienda vinicola locale, sponsor tecnico per rassegne enogastronomiche.',
    competenzeVolontariato: ['Logistica', 'Enogastronomia'],
    quote: [
      {
        id: 'q-3-2025',
        socioId: 'socio-3',
        anno: 2025,
        importo: 30,
        dataPagamento: '2025-02-05',
        metodo: 'Bonifico Bancario',
        ricevutaNumero: 'REC-2025/012',
        note: 'Quota Socio Sostenitore'
      },
      {
        id: 'q-3-2026',
        socioId: 'socio-3',
        anno: 2026,
        importo: 30,
        dataPagamento: '2026-02-02',
        metodo: 'Bonifico Bancario',
        ricevutaNumero: 'REC-2026/008',
        note: 'Quota Socio Sostenitore'
      }
    ]
  },
  {
    id: 'socio-4',
    numeroTessera: 'PL-2025-004',
    nome: 'Elena',
    cognome: 'Rossi',
    codiceFiscale: 'RSSLNE92C65A564Q',
    dataNascita: '1992-03-25',
    luogoNascita: 'Bologna (BO)',
    indirizzo: 'Via delle Fonti, 14',
    cap: '53034',
    citta: 'Colle di Val d\'Elsa',
    provincia: 'SI',
    telefono: '349 5566778',
    email: 'elena.rossi@architettura.org',
    categoria: 'Volontario Attivo',
    ruoloDirettivo: 'Consigliere',
    dataIscrizione: '2021-03-10',
    attivo: true,
    consensoPrivacy: true,
    foto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    note: 'Guida turistica abilitata per visite nel borgo storico medievale.',
    competenzeVolontariato: ['Visite Guidate', 'Grafica e Allestimento'],
    quote: [
      {
        id: 'q-4-2025',
        socioId: 'socio-4',
        anno: 2025,
        importo: 15,
        dataPagamento: '2025-03-01',
        metodo: 'Satispay',
        ricevutaNumero: 'REC-2025/023'
      }
      // Quota 2026 ancora da rinnovare!
    ]
  },
  {
    id: 'socio-5',
    numeroTessera: 'PL-2025-005',
    nome: 'Federico',
    cognome: 'Conti',
    codiceFiscale: 'CNTFDC01M18C847J',
    dataNascita: '2001-08-18',
    luogoNascita: 'Poggibonsi (SI)',
    indirizzo: 'Via Dante, 3',
    cap: '53034',
    citta: 'Colle di Val d\'Elsa',
    provincia: 'SI',
    telefono: '320 8765412',
    email: 'fede.conti@studenti.unisi.it',
    categoria: 'Giovane',
    ruoloDirettivo: 'Nessuno',
    dataIscrizione: '2023-09-01',
    attivo: true,
    consensoPrivacy: true,
    note: 'Responsabile gruppo giovani volontari per la notte bianca.',
    competenzeVolontariato: ['Audio/Luci', 'Animazione'],
    quote: [
      {
        id: 'q-5-2025',
        socioId: 'socio-5',
        anno: 2025,
        importo: 10,
        dataPagamento: '2025-01-25',
        metodo: 'Contanti',
        ricevutaNumero: 'REC-2025/007',
        note: 'Quota agevolata Under 25'
      }
    ]
  },
  {
    id: 'socio-6',
    numeroTessera: 'PL-2025-006',
    nome: 'Donatella',
    cognome: 'Mancini',
    codiceFiscale: 'MNCDTL56H55I726W',
    dataNascita: '1956-06-15',
    luogoNascita: 'San Gimignano (SI)',
    indirizzo: 'Borgo Santa Caterina, 21',
    cap: '53034',
    citta: 'Colle di Val d\'Elsa',
    provincia: 'SI',
    telefono: '333 7162534',
    email: 'dona.mancini@libero.it',
    categoria: 'Onorario',
    ruoloDirettivo: 'Nessuno',
    dataIscrizione: '2010-01-01',
    attivo: true,
    consensoPrivacy: true,
    note: 'Socia fondatrice e decana della Pro Loco. Quota onoraria esente da statuto.',
    competenzeVolontariato: ['Storia Locale', 'Archivio Storico'],
    quote: [
      {
        id: 'q-6-2025',
        socioId: 'socio-6',
        anno: 2025,
        importo: 0,
        dataPagamento: '2025-01-02',
        metodo: 'Contanti',
        ricevutaNumero: 'REC-2025/002',
        note: 'Socio Onorario (Esente)'
      },
      {
        id: 'q-6-2026',
        socioId: 'socio-6',
        anno: 2026,
        importo: 0,
        dataPagamento: '2026-01-02',
        metodo: 'Contanti',
        ricevutaNumero: 'REC-2026/002',
        note: 'Socio Onorario (Esente)'
      }
    ]
  },
  {
    id: 'socio-7',
    numeroTessera: 'PL-2025-007',
    nome: 'Roberto',
    cognome: 'Bianchi',
    codiceFiscale: 'BNCRRT80T10G752X',
    dataNascita: '1980-12-10',
    luogoNascita: 'Pontedera (PI)',
    indirizzo: 'Via dei Fossi, 9',
    cap: '53034',
    citta: 'Colle di Val d\'Elsa',
    provincia: 'SI',
    telefono: '340 1122334',
    email: 'roberto.bianchi@officina.net',
    categoria: 'Ordinario',
    ruoloDirettivo: 'Tesoriere',
    dataIscrizione: '2017-05-18',
    attivo: true,
    consensoPrivacy: true,
    note: 'Tenuta della contabilità e rendiconto annuale.',
    competenzeVolontariato: ['Amministrazione', 'Logistica'],
    quote: [
      {
        id: 'q-7-2025',
        socioId: 'socio-7',
        anno: 2025,
        importo: 15,
        dataPagamento: '2025-01-15',
        metodo: 'Bonifico Bancario',
        ricevutaNumero: 'REC-2025/003'
      },
      {
        id: 'q-7-2026',
        socioId: 'socio-7',
        anno: 2026,
        importo: 15,
        dataPagamento: '2026-01-14',
        metodo: 'Bonifico Bancario',
        ricevutaNumero: 'REC-2026/004'
      }
    ]
  },
  {
    id: 'socio-8',
    numeroTessera: 'PL-2025-008',
    nome: 'Chiara',
    cognome: 'Neri',
    codiceFiscale: 'NRICHR88R48G752D',
    dataNascita: '1988-10-08',
    luogoNascita: 'Siena (SI)',
    indirizzo: 'Vicolo Corto, 2',
    cap: '53034',
    citta: 'Colle di Val d\'Elsa',
    provincia: 'SI',
    telefono: '348 9900112',
    email: 'chiara.neri@comunicazione.it',
    categoria: 'Ordinario',
    ruoloDirettivo: 'Nessuno',
    dataIscrizione: '2022-11-20',
    attivo: true,
    consensoPrivacy: true,
    note: 'Disponibile per allestimento stand sagre estive.',
    competenzeVolontariato: ['Allestimenti', 'Cucina Tradizionale'],
    quote: [
      {
        id: 'q-8-2024',
        socioId: 'socio-8',
        anno: 2024,
        importo: 15,
        dataPagamento: '2024-02-14',
        metodo: 'Contanti',
        ricevutaNumero: 'REC-2024/015'
      }
      // Non ha rinnovato né per 2025 né per 2026 (scaduta)
    ]
  }
];

export const STAND_SIMULATI_DEFAULT: StandEvento[] = [
  {
    id: 'std-1',
    numero: 1,
    nome: 'Cucina Tradizionale & Primi Piatti',
    tipologia: 'Food / Gastronomia',
    riferimentoFood: true,
    responsabile: 'Marco Valenti (Chef Volontario)',
    descrizione: 'Pasta fresca tirata a mano, sughi tipici della tradizione contadina e polenta rustica. Cucina coperta certificata HACCP.',
    incassoStimato: 3800
  },
  {
    id: 'std-2',
    numero: 2,
    nome: 'Griglia, Carni & Rosticceria alla Brace',
    tipologia: 'Food / Griglia & Brace',
    riferimentoFood: true,
    responsabile: 'Roberto Ferri (Mastro Fuochista)',
    descrizione: 'Salsicce artigianali, tagliata, arrosticini e contorni cotti alla brace a vista. Impianto con cappa aspirante e braciere protetto.',
    incassoStimato: 3200
  },
  {
    id: 'std-3',
    numero: 3,
    nome: 'Friggitoria & Dolci Tradizionali del Borgo',
    tipologia: 'Food / Friggitoria & Dolci',
    riferimentoFood: true,
    responsabile: 'Lucia Bianchi',
    descrizione: 'Fritti dorati al cartoccio, frittelle di castagne, bomboloni caldi e ciambelle della festa preparate al momento.',
    incassoStimato: 1100
  },
  {
    id: 'std-4',
    numero: 4,
    nome: 'Punto Beverage, Birreria Artigianale & Vini DOC',
    tipologia: 'Beverage / Bar & Vini',
    riferimentoFood: true,
    responsabile: 'Simone Rossi',
    descrizione: 'Vini tipici delle colline, birre artigianali alla spina, acqua minerale e bibite fresche. Banco spillatura a flusso continuo.',
    incassoStimato: 1400
  },
  {
    id: 'std-5',
    numero: 5,
    nome: 'Cassa Centrale & Ritiro Ticket Ristoro',
    tipologia: 'Cassa & Ticket',
    riferimentoFood: false,
    responsabile: 'Elena Moretti (Tesoriere)',
    descrizione: 'Postazione scontrini e gettoni unificata per gli stand gastronomici con terminale POS contactless e contanti.',
    incassoStimato: 0
  },
  {
    id: 'std-6',
    numero: 6,
    nome: 'Mercatino Artigianato & Prodotti Tipici Km 0',
    tipologia: 'Mercatino & Artigianato',
    riferimentoFood: false,
    responsabile: 'Alessandro Donati',
    descrizione: 'Bancarelle espositive di hobbisti locali, miele, olio extravergine d\'oliva e artigianato artistico del territorio.',
    incassoStimato: 0
  }
];

export const INITIAL_EVENTI: ProLocoEvento[] = [
  // 1. EVENTO NATIVO (100% Organizzazione & Rischio Pro Loco)
  {
    id: 'evento-sim-1',
    titolo: '1. Sagra del Borgo Antico (Evento Nativo)',
    categoria: 'Enogastronomia & Sagra',
    dataInizio: '2026-10-17',
    oraInizio: '12:00',
    dataFine: '2026-10-18',
    oraFine: '23:30',
    luogo: 'Piazza del Popolo e Borgo Antico',
    stato: 'in_programma',
    tipoEvento: 'nativo',
    descrizione: 'Sagra autunnale con stand gastronomici numerati, specialità culinarie tipiche del borgo, caldarroste, vino DOC, mercatino artigianale e intrattenimento popolare. Organizzazione e gestione 100% Pro Loco.',
    locandina: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=700&auto=format&fit=crop&q=80',
    standNumerati: STAND_SIMULATI_DEFAULT,
    budgetPrevisto: 6500,
    costiSostenuti: 5900,
    entratePreviste: 9000,
    entrateRealizzate: 9500,
    spesePreventivo: {
      food: 3500,
      intrattenimento: 1200,
      altreSpese: 1300,
      varie: 500
    },
    speseConsuntivo: {
      food: 3200,
      intrattenimento: 1200,
      altreSpese: 1100,
      varie: 400
    },
    volontariIds: ['socio-1', 'socio-2', 'socio-3', 'socio-5'],
    responsabileId: 'socio-1',
    permessoComunale: true,
    licenzaSIAE: true,
    pianoSicurezzaSafety: true,
    aslHaccp: true,
    partecipantiStimati: 1800,
    noteOrganizzative: 'Gestione Economica Nativa: 100% costi sostenuti (5.900 €) ed entrate lorde incassate (9.500 €) di competenza esclusiva della Pro Loco. Utile netto interamente a bilancio sociale (+3.600 €).'
  },

  // 2. EVENTO IBRIDO (Co-organizzazione con Partner / Ripartizione Quote)
  {
    id: 'evento-sim-2',
    titolo: '2. Sagra del Borgo Antico (Evento Ibrido)',
    categoria: 'Enogastronomia & Sagra',
    dataInizio: '2026-10-17',
    oraInizio: '12:00',
    dataFine: '2026-10-18',
    oraFine: '23:30',
    luogo: 'Piazza del Popolo e Borgo Antico',
    stato: 'in_programma',
    tipoEvento: 'ibrido',
    partnerIbridoNome: 'Comune & Associazione Commercianti del Centro Storico',
    percentualeSpeseProLoco: 50,
    percentualeEntrateProLoco: 50,
    contributoPartner: 0,
    descrizione: 'Sagra autunnale con le stesse identiche voci di costo, incassi e 6 stand numerati, co-organizzata in partnership con il Comune e i Commercianti. Ripartizione costi ed entrate al 50%.',
    locandina: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=700&auto=format&fit=crop&q=80',
    standNumerati: STAND_SIMULATI_DEFAULT,
    budgetPrevisto: 6500,
    costiSostenuti: 5900,
    entratePreviste: 9000,
    entrateRealizzate: 9500,
    spesePreventivo: {
      food: 3500,
      intrattenimento: 1200,
      altreSpese: 1300,
      varie: 500
    },
    speseConsuntivo: {
      food: 3200,
      intrattenimento: 1200,
      altreSpese: 1100,
      varie: 400
    },
    volontariIds: ['socio-1', 'socio-2', 'socio-3', 'socio-5'],
    responsabileId: 'socio-1',
    permessoComunale: true,
    licenzaSIAE: true,
    pianoSicurezzaSafety: true,
    aslHaccp: true,
    partecipantiStimati: 1800,
    noteOrganizzative: 'Gestione Economica Ibrida (50/50): Le stesse spese lorde (5.900 €) e gli stessi incassi (9.500 €) sono ripartiti pariteticamente col Partner. Quota costi Pro Loco: 2.950 € (50%), Quota incassi Pro Loco: 4.750 € (50%), Utile netto Pro Loco: +1.800 €.'
  },

  // 3. EVENTO GESTIONE (Conto Terzi per Committente / Rimborso Spese + Fee)
  {
    id: 'evento-sim-3',
    titolo: '3. Sagra del Borgo Antico (Evento Gestione)',
    categoria: 'Enogastronomia & Sagra',
    dataInizio: '2026-10-17',
    oraInizio: '12:00',
    dataFine: '2026-10-18',
    oraFine: '23:30',
    luogo: 'Piazza del Popolo e Borgo Antico',
    stato: 'in_programma',
    tipoEvento: 'gestione',
    committenteNome: 'Comune - Assessorato al Turismo & Grandi Eventi',
    tipoAccordoGestione: 'rimborso_piu_fee',
    compensoGestione: 2500,
    rimborsoSpeseCommittente: 5900,
    descrizione: 'Sagra autunnale con le stesse identiche voci di costo e 6 stand numerati, svolta dalla Pro Loco per conto terzi del Comune committente. Spese vive anticipate rimborsate al 100% dal Comune + compenso/fee di gestione di 2.500 €.',
    locandina: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=700&auto=format&fit=crop&q=80',
    standNumerati: STAND_SIMULATI_DEFAULT,
    budgetPrevisto: 6500,
    costiSostenuti: 5900,
    entratePreviste: 9000,
    entrateRealizzate: 9500,
    spesePreventivo: {
      food: 3500,
      intrattenimento: 1200,
      altreSpese: 1300,
      varie: 500
    },
    speseConsuntivo: {
      food: 3200,
      intrattenimento: 1200,
      altreSpese: 1100,
      varie: 400
    },
    volontariIds: ['socio-1', 'socio-2', 'socio-3', 'socio-5'],
    responsabileId: 'socio-1',
    permessoComunale: true,
    licenzaSIAE: true,
    pianoSicurezzaSafety: true,
    aslHaccp: true,
    partecipantiStimati: 1800,
    noteOrganizzative: 'Gestione Economica Conto Terzi: Le spese sostenute (5.900 €) sono integralmente rimborsate a piè di lista dal Comune (+5.900 €). La Pro Loco incassa il compenso convenzionato di gestione (+2.500 €), che costituisce l\'utile netto per l\'associazione.'
  }
];

export function loadProLocoConfig(): ProLocoInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (!raw) {
      saveProLocoConfig(DEFAULT_PRO_LOCO);
      return DEFAULT_PRO_LOCO;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Errore nel caricamento della configurazione Pro Loco:', err);
    return DEFAULT_PRO_LOCO;
  }
}

export function saveProLocoConfig(config: ProLocoInfo): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.error('Errore nel salvataggio della configurazione:', err);
  }
}

export function loadSitoWebConfig(): SitoWebConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SITO_WEB);
    if (!raw) {
      saveSitoWebConfig(DEFAULT_SITO_WEB_CONFIG);
      return DEFAULT_SITO_WEB_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SITO_WEB_CONFIG, ...parsed };
  } catch (err) {
    console.error('Errore nel caricamento della configurazione del sito web:', err);
    return DEFAULT_SITO_WEB_CONFIG;
  }
}

export function saveSitoWebConfig(config: SitoWebConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_SITO_WEB, JSON.stringify(config));
  } catch (err) {
    console.error('Errore nel salvataggio della configurazione del sito web:', err);
  }
}

export const INITIAL_ARCHIVIO_GIORNALINI: EdizioneGiornalino[] = [
  {
    ...DEFAULT_GIORNALINO_CONFIG,
    id: 'ed-2026-primavera',
    anno: 2026,
    dataUscita: '15 Maggio 2026',
    dataPubblicazione: 'Maggio 2026',
    numeroEdizione: 'Anno XXV - N. 1',
    periodo: 'Edizione Primavera - Estate 2026',
    statoUscita: 'in_stampa',
    copertinaPreview: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop&q=80',
    protocolloStampa: 'REG-2026/01-STAMPA',
    noteRedazione: 'Numero celebrativo del 25° Anniversario con programma completo dell\'Estate nel Borgo e bando fotografico.',
    tiratura: '1.800 copie cartacee e diffusione digitale',
    dataCreazione: '2026-03-01',
    dataUltimaModifica: '2026-04-18',
    articoli: [
      {
        id: 'art-2026-1',
        titolo: 'Venticinque Anni Insieme: Il Cuore Pulsante del Nostro Borgo',
        sottotitolo: 'Un quarto di secolo di volontariato, radici storiche e passione civile per la nostra comunità',
        occhiello: 'L\'EDITORIALE DEL PRESIDENTE',
        sezione: 'editoriale',
        autore: 'Marco Valenti',
        data: 'Maggio 2026',
        pagina: 1,
        ordine: 1,
        colonna: 'doppia',
        allineamento: 'justify',
        capolettera: true,
        contenuto: `Cari soci, cittadini e amici della Pro Loco,

Tagliare il traguardo dei venticinque anni di attività non è solo una lieta ricorrenza anagrafica, ma il segno tangibile di quanto la dedizione gratuita e appassionata di tante persone possa trasformarsi in un bene comune duraturo e insostituibile.

In questo quarto di secolo la nostra Pro Loco ha saputo reinventarsi senza mai smarrire la propria anima: abbiamo custodito con devozione le antiche memorie orali, valorizzato monumenti dimenticati e animato piazze che altrimenti rischierebbero lo spopolamento. L'energia dei nuovi volontari ci dà la certezza che il futuro della nostra comunità è ricco di speranza e creatività.`,
        immagine: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&auto=format&fit=crop&q=80',
        didascaliaImmagine: 'La piazza centrale durante la storica assemblea dei soci fondatori.',
        inEvidenza: true
      },
      {
        id: 'art-2026-2',
        titolo: 'Estate nel Borgo 2026: Musica, Notte Bianca e Sapori Autentici',
        sottotitolo: 'Svelato il cartellone estivo: oltre venti appuntamenti tra concerti sotto le stelle e rievocazioni',
        occhiello: 'GRANDI EVENTI & TURISMO',
        sezione: 'eventi',
        autore: 'Comitato Festeggiamenti',
        data: 'Maggio 2026',
        pagina: 2,
        ordine: 1,
        colonna: 'singola',
        allineamento: 'justify',
        capolettera: true,
        contenuto: `Si preannuncia una stagione estiva straordinaria per il nostro comune. Tra i momenti clou spicca la Notte Bianca dei Vicoli (18 luglio), con degustazioni guidate, spettacoli itineranti di artisti di strada e botteghe artigiane aperte fino a tarda notte.

Confermatissima la Sagra del Piatto Tipico nella seconda settimana di agosto, interamente rifornita da filiera corta a chilometro zero, con stand gastronomici rinnovati ed ecocompatibili secondo le linee guida Plastic-Free adottate dal nostro Direttivo.`,
        immagine: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
        didascaliaImmagine: 'Uno scorcio degli allestimenti enogastronomici all\'aperto.',
        inEvidenza: false
      },
      {
        id: 'art-2026-3',
        titolo: 'Aperte le Iscrizioni al Concorso Fotografico "Scorci e Tradizioni"',
        sottotitolo: 'Partecipazione aperta a soci e visitatori: mostra finale e premiazione in autunno',
        occhiello: 'VITA ASSOCIATIVA & CULTURA',
        sezione: 'vita_associativa',
        autore: 'Elena Bianchi',
        data: 'Maggio 2026',
        pagina: 3,
        ordine: 1,
        colonna: 'singola',
        allineamento: 'justify',
        capolettera: false,
        contenuto: `Giunge alla terza edizione il concorso fotografico promosso dalla Pro Loco in collaborazione con l'Assessorato alla Cultura. Le opere selezionate da una giuria di esperti comporranno il calendario sociale 2027 e saranno esposte nella Sala delle Volte durante la Fiera Patronale. I moduli di iscrizione sono disponibili presso la sede e sul nostro sito web ufficiale.`,
        inEvidenza: false
      }
    ]
  },
  {
    ...DEFAULT_GIORNALINO_CONFIG,
    id: 'ed-2025-autunno',
    anno: 2025,
    dataUscita: '20 Ottobre 2025',
    dataPubblicazione: 'Ottobre 2025',
    numeroEdizione: 'Anno XXIV - N. 2',
    periodo: 'Edizione Autunno - Inverno 2025',
    statoUscita: 'pubblicato',
    copertinaPreview: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&auto=format&fit=crop&q=80',
    protocolloStampa: 'REG-2025/02-STAMPA',
    noteRedazione: 'Fascicolo distribuito ai soci e depositato presso la biblioteca comunale. Tiratura 1.500 copie.',
    tiratura: '1.500 copie ad uso sociale e diffusione digitale gratuita',
    dataCreazione: '2025-08-10',
    dataUltimaModifica: '2025-10-18'
  },
  {
    ...DEFAULT_GIORNALINO_CONFIG,
    id: 'ed-2025-primavera',
    anno: 2025,
    dataUscita: '10 Maggio 2025',
    dataPubblicazione: 'Maggio 2025',
    numeroEdizione: 'Anno XXIV - N. 1',
    periodo: 'Edizione Speciale Fiere e Borgo Antico',
    statoUscita: 'archiviato',
    copertinaPreview: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=1200&auto=format&fit=crop&q=80',
    protocolloStampa: 'REG-2025/01-STAMPA',
    noteRedazione: 'Focus sulla riqualificazione dei vicoli storici e il mercatino artigianale.',
    tiratura: '1.200 copie',
    dataCreazione: '2025-03-05',
    dataUltimaModifica: '2025-05-08',
    articoli: [
      {
        id: 'art-2025-p1',
        titolo: 'Riscoprire la Primavera: Il Borgo si Riapre all\'Accoglienza',
        sottotitolo: 'Dalle fioriture al ritorno delle escursioni guidate tra storia e natura',
        occhiello: 'EDITORIALE DI PRIMAVERA',
        sezione: 'editoriale',
        autore: 'Marco Valenti',
        data: 'Maggio 2025',
        pagina: 1,
        ordine: 1,
        colonna: 'doppia',
        allineamento: 'justify',
        capolettera: true,
        contenuto: `La primavera risveglia i nostri sentieri e riporta residenti e viaggiatori ad affollare i vicoli del borgo. Questa edizione speciale del nostro periodico offre una bussola ricca di approfondimenti su percorsi naturalistici, mostre d'artigianato locale e la rinascita dei nostri orti comunitari.`,
        inEvidenza: true
      },
      {
        id: 'art-2025-p2',
        titolo: 'Fiera dei Mestieri Antichi: Oltre 40 Artigiani in Piazza',
        sottotitolo: 'Tessitura a mano, ferro battuto e ceramica tradizionale incantano i visitatori',
        occhiello: 'TRADIZIONI & MEMORIE',
        sezione: 'storia_cultura',
        autore: 'Redazione Storica',
        data: 'Maggio 2025',
        pagina: 2,
        ordine: 1,
        colonna: 'singola',
        allineamento: 'justify',
        capolettera: true,
        contenuto: `Il successo della Fiera dei Mestieri Antichi ha superato ogni aspettativa. Mastri scalpellini, tessitrici e impagliatori hanno allestito dimostrazioni dal vivo nei cortili storici del borgo, offrendo ai più giovani l'opportunità di riscoprire professioni artigianali dal fascino intramontabile.`,
        inEvidenza: false
      }
    ]
  },
  {
    ...DEFAULT_GIORNALINO_CONFIG,
    id: 'ed-2024-natale',
    anno: 2024,
    dataUscita: '15 Dicembre 2024',
    dataPubblicazione: 'Dicembre 2024',
    numeroEdizione: 'Anno XXIII - N. 3',
    periodo: 'Speciale Festività Natalizie & Memorie',
    statoUscita: 'archiviato',
    copertinaPreview: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&auto=format&fit=crop&q=80',
    protocolloStampa: 'REG-2024/03-STAMPA',
    noteRedazione: 'Edizione natalizia con resoconto delle attività annuali e inaugurazione del presepe artistico.',
    tiratura: '1.000 copie',
    dataCreazione: '2024-11-10',
    dataUltimaModifica: '2024-12-14',
    articoli: [
      {
        id: 'art-2024-n1',
        titolo: 'La Magia del Natale Accende la Comunità',
        sottotitolo: 'Un anno ricco di soddisfazioni e progetti condivisi giunge a conclusione',
        occhiello: 'EDITORIALE DI FINE ANNO',
        sezione: 'editoriale',
        autore: 'Marco Valenti',
        data: 'Dicembre 2024',
        pagina: 1,
        ordine: 1,
        colonna: 'doppia',
        allineamento: 'justify',
        capolettera: true,
        contenuto: `Volge al termine un anno intenso e fecondo. Con il consueto fascicolo di dicembre desideriamo esprimere la nostra più sincera gratitudine a ogni volontario, socio e sostenitore che ha dedicato tempo ed entusiasmo alla nostra associazione.`,
        inEvidenza: true
      },
      {
        id: 'art-2024-n2',
        titolo: 'Inaugurato il Presepe Artistico Monumentale nelle Grotte della Pieve',
        sottotitolo: 'Scene animate e costumi d\'epoca realizzati a mano dai volontari',
        occhiello: 'FESTE & TRADIZIONE',
        sezione: 'storia_cultura',
        autore: 'Giuseppe Rinaldi',
        data: 'Dicembre 2024',
        pagina: 2,
        ordine: 1,
        colonna: 'singola',
        allineamento: 'justify',
        capolettera: false,
        contenuto: `Il suggestivo ambiente delle antiche cantine della Pieve ospita la nuova installazione del presepe meccanico monumentale. Più di cinquanta figure in movimento riproducono la vita agreste del secolo scorso, riscuotendo grande ammirazione da scolaresche e comitive turistiche.`,
        inEvidenza: false
      }
    ]
  }
];

export function loadArchivioGiornalini(): EdizioneGiornalino[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ARCHIVIO_GIORNALINI);
    if (!raw) {
      saveArchivioGiornalini(INITIAL_ARCHIVIO_GIORNALINI);
      return INITIAL_ARCHIVIO_GIORNALINI;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveArchivioGiornalini(INITIAL_ARCHIVIO_GIORNALINI);
      return INITIAL_ARCHIVIO_GIORNALINI;
    }
    return parsed;
  } catch (err) {
    console.error('Errore nel caricamento archivio giornalini:', err);
    return INITIAL_ARCHIVIO_GIORNALINI;
  }
}

export function saveArchivioGiornalini(edizioni: EdizioneGiornalino[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ARCHIVIO_GIORNALINI, JSON.stringify(edizioni));
  } catch (err) {
    console.error('Errore nel salvataggio archivio giornalini:', err);
  }
}

export function loadGiornalinoAttivoId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY_GIORNALINO_ATTIVO_ID);
    if (id) return id;
    return INITIAL_ARCHIVIO_GIORNALINI[0].id;
  } catch {
    return INITIAL_ARCHIVIO_GIORNALINI[0].id;
  }
}

export function saveGiornalinoAttivoId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GIORNALINO_ATTIVO_ID, id);
  } catch (err) {
    console.error('Errore salvataggio ID giornalino attivo:', err);
  }
}

export function loadGiornalinoConfig(): GiornalinoConfig {
  try {
    const archivio = loadArchivioGiornalini();
    const attivoId = loadGiornalinoAttivoId();
    const trovatoInArchivio = archivio.find(ed => ed.id === attivoId);

    const raw = localStorage.getItem(STORAGE_KEY_GIORNALINO);
    let sorgente = trovatoInArchivio || (raw ? JSON.parse(raw) : DEFAULT_GIORNALINO_CONFIG);

    const rawArticoli = (sorgente.articoli && sorgente.articoli.length > 0) 
      ? sorgente.articoli 
      : DEFAULT_GIORNALINO_CONFIG.articoli;
    
    const articoliNormalizzati = rawArticoli.map((art: ArticoloGiornalino, idx: number) => ({
      ...art,
      pagina: typeof art.pagina === 'number' && art.pagina >= 1 ? art.pagina : ((idx % 4) + 1),
      ordine: typeof art.ordine === 'number' ? art.ordine : idx + 1,
      colonna: art.colonna || (idx === 0 ? 'doppia' : 'singola'),
      allineamento: art.allineamento || 'justify',
      capolettera: art.capolettera !== undefined ? art.capolettera : (idx < 2)
    }));

    const sponsorList = Array.isArray(sorgente.sponsor) && sorgente.sponsor.length > 0
      ? sorgente.sponsor
      : DEFAULT_GIORNALINO_CONFIG.sponsor;

    const studioCfg = sorgente.studioConfig
      ? { ...DEFAULT_GIORNALINO_CONFIG.studioConfig, ...sorgente.studioConfig }
      : DEFAULT_GIORNALINO_CONFIG.studioConfig;

    return { 
      ...DEFAULT_GIORNALINO_CONFIG, 
      ...sorgente,
      id: sorgente.id || attivoId,
      totalePagine: sorgente.totalePagine || 4,
      articoli: articoliNormalizzati,
      sponsor: sponsorList,
      studioConfig: studioCfg
    };
  } catch (err) {
    console.error('Errore nel caricamento del giornalino:', err);
    return DEFAULT_GIORNALINO_CONFIG;
  }
}

export function saveGiornalinoConfig(config: GiornalinoConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_GIORNALINO, JSON.stringify(config));

    // Sincronizza anche nell'archivio storico delle edizioni
    const archivio = loadArchivioGiornalini();
    const configId = config.id || loadGiornalinoAttivoId();
    const idx = archivio.findIndex(ed => ed.id === configId);
    
    // Ricava l'anno dalla data di pubblicazione o numero edizione
    const annoMatch = (config.dataPubblicazione || config.numeroEdizione || '').match(/20\d{2}/);
    const annoCalcolato = annoMatch ? parseInt(annoMatch[0], 10) : new Date().getFullYear();

    const edizioneAggiornata: EdizioneGiornalino = {
      ...(idx >= 0 ? archivio[idx] : {}),
      ...config,
      id: configId,
      anno: (idx >= 0 && archivio[idx].anno) ? archivio[idx].anno : annoCalcolato,
      dataUscita: (idx >= 0 && archivio[idx].dataUscita) ? archivio[idx].dataUscita : (config.dataPubblicazione || 'Data non indicata'),
      statoUscita: (idx >= 0 && archivio[idx].statoUscita) ? archivio[idx].statoUscita : 'bozza',
      dataUltimaModifica: new Date().toISOString().split('T')[0]
    };

    let nuovoArchivio: EdizioneGiornalino[];
    if (idx >= 0) {
      nuovoArchivio = archivio.map((ed, i) => i === idx ? edizioneAggiornata : ed);
    } else {
      nuovoArchivio = [edizioneAggiornata, ...archivio];
    }
    saveArchivioGiornalini(nuovoArchivio);
    saveGiornalinoAttivoId(configId);
  } catch (err) {
    console.error('Errore nel salvataggio del giornalino:', err);
  }
}

export function esportaRegistroGiornaliniCSV(edizioni: EdizioneGiornalino[]): void {
  const headers = [
    'Anno',
    'Data Uscita',
    'Numero Edizione',
    'Periodo',
    'Testata',
    'Stato',
    'Tiratura',
    'Pagine',
    'N. Articoli',
    'N. Sponsor',
    'Protocollo Stampa',
    'Direttore Responsabile',
    'Data Creazione'
  ];

  const righe = edizioni.map(ed => [
    `"${ed.anno}"`,
    `"${ed.dataUscita || ed.dataPubblicazione}"`,
    `"${ed.numeroEdizione.replace(/"/g, '""')}"`,
    `"${ed.periodo.replace(/"/g, '""')}"`,
    `"${ed.testata.replace(/"/g, '""')}"`,
    `"${ed.statoUscita.toUpperCase()}"`,
    `"${(ed.tiratura || '').replace(/"/g, '""')}"`,
    `"${ed.totalePagine || 4}"`,
    `"${(ed.articoli || []).length}"`,
    `"${(ed.sponsor || []).length}"`,
    `"${ed.protocolloStampa || '-'}"`,
    `"${(ed.direttoreResponsabile || '').replace(/"/g, '""')}"`,
    `"${ed.dataCreazione || '-'}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...righe.map(r => r.join(';'))].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `registro_uscite_giornalino_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


export function loadSoci(): Socio[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SOCI);
    if (raw === null) {
      saveSoci(INITIAL_SOCI);
      return INITIAL_SOCI;
    }
    const parsed: Socio[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      saveSoci(INITIAL_SOCI);
      return INITIAL_SOCI;
    }
    if (parsed.length === 0) {
      return [];
    }

    // Assicura che i soci demo ricevano la fototessera predefinita se non impostata
    const fotoMappa: Record<string, string> = {};
    INITIAL_SOCI.forEach(s => {
      if (s.foto) fotoMappa[s.id] = s.foto;
    });

    const arricchiti = parsed.map(socio => {
      if (!socio.foto && fotoMappa[socio.id]) {
        return { ...socio, foto: fotoMappa[socio.id] };
      }
      return socio;
    });

    return arricchiti;
  } catch (err) {
    console.error('Errore nel caricamento dei soci:', err);
    return INITIAL_SOCI;
  }
}

export function saveSoci(soci: Socio[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SOCI, JSON.stringify(soci));
  } catch (err) {
    console.error('Errore nel salvataggio dei soci:', err);
  }
}

export function getStatoQuotaSocio(socio: Socio, anno: number): StatoQuota {
  if (socio.categoria === 'Onorario') {
    return 'in_regola';
  }
  const haPagatoAnno = socio.quote?.some(q => q.anno === anno);
  if (haPagatoAnno) {
    return 'in_regola';
  }
  const haPagatoAnnoPrecedente = socio.quote?.some(q => q.anno === anno - 1);
  if (haPagatoAnnoPrecedente) {
    return 'da_rinnovare';
  }
  return 'scaduta';
}

export function generaNumeroTessera(soci: Socio[], anno: number): string {
  const annoStr = anno.toString();
  const prefisso = `PL-${annoStr}-`;
  
  const numeri = soci
    .map(s => {
      if (s.numeroTessera && s.numeroTessera.startsWith(prefisso)) {
        const numPart = parseInt(s.numeroTessera.replace(prefisso, ''), 10);
        return isNaN(numPart) ? 0 : numPart;
      }
      // Se il numero tessera ha un formato diverso (es. anno precedente)
      const matches = s.numeroTessera?.match(/\d+$/);
      return matches ? parseInt(matches[0], 10) : 0;
    })
    .filter(n => n > 0);

  const maxNum = numeri.length > 0 ? Math.max(...numeri) : 0;
  const nextNum = maxNum + 1;
  return `${prefisso}${nextNum.toString().padStart(3, '0')}`;
}

export function generaNumeroRicevuta(soci: Socio[], anno: number): string {
  const allQuote = soci.flatMap(s => s.quote || []).filter(q => q.anno === anno);
  const prefisso = `REC-${anno}/`;
  const numeri = allQuote
    .map(q => {
      if (q.ricevutaNumero && q.ricevutaNumero.startsWith(prefisso)) {
        const n = parseInt(q.ricevutaNumero.replace(prefisso, ''), 10);
        return isNaN(n) ? 0 : n;
      }
      return 0;
    })
    .filter(n => n > 0);

  const maxNum = numeri.length > 0 ? Math.max(...numeri) : 0;
  const nextNum = maxNum + 1;
  return `${prefisso}${nextNum.toString().padStart(3, '0')}`;
}

export function esportaLibroSociCSV(soci: Socio[], annoCorrente: number): void {
  const intestazioni = [
    'Numero Tessera',
    'Cognome',
    'Nome',
    'Codice Fiscale',
    'Data di Nascita',
    'Luogo di Nascita',
    'Indirizzo',
    'Città',
    'Provincia',
    'CAP',
    'Telefono',
    'Email',
    'Categoria Socio',
    'Ruolo Direttivo',
    'Data Prima Iscrizione',
    `Stato Quota ${annoCorrente}`,
    `Ultima Quota Pagata (Anno)`,
    'Stato Socio'
  ];

  const righe = soci.map(s => {
    const statoQuota = getStatoQuotaSocio(s, annoCorrente);
    const ultimaQuota = s.quote?.length > 0 ? [...s.quote].sort((a, b) => b.anno - a.anno)[0].anno : 'Nessuna';
    return [
      `"${s.numeroTessera || ''}"`,
      `"${s.cognome || ''}"`,
      `"${s.nome || ''}"`,
      `"${s.codiceFiscale || ''}"`,
      `"${s.dataNascita || ''}"`,
      `"${s.luogoNascita || ''}"`,
      `"${s.indirizzo || ''}"`,
      `"${s.citta || ''}"`,
      `"${s.provincia || ''}"`,
      `"${s.cap || ''}"`,
      `"${s.telefono || ''}"`,
      `"${s.email || ''}"`,
      `"${s.categoria || ''}"`,
      `"${s.ruoloDirettivo || ''}"`,
      `"${s.dataIscrizione || ''}"`,
      `"${statoQuota === 'in_regola' ? 'IN REGOLA' : statoQuota === 'da_rinnovare' ? 'DA RINNOVARE' : 'SCADUTA'}"`,
      `"${ultimaQuota}"`,
      `"${s.attivo ? 'Attivo' : 'Non Attivo'}"`
    ].join(';');
  });

  const csvContent = '\uFEFF' + [intestazioni.join(';'), ...righe].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Libro_Soci_ProLoco_${annoCorrente}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function loadEventi(): ProLocoEvento[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVENTI);
    if (raw === null) {
      saveEventi(INITIAL_EVENTI);
      return INITIAL_EVENTI;
    }
    const parsed: ProLocoEvento[] = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      saveEventi(INITIAL_EVENTI);
      return INITIAL_EVENTI;
    }
    if (parsed.length === 0) {
      return [];
    }

    // Mappa fallback per eventi demo
    const demoMappa: Record<string, ProLocoEvento> = {};
    INITIAL_EVENTI.forEach(e => {
      demoMappa[e.id] = e;
    });

    // Assicuriamo che ogni evento abbia le voci di costo compilate
    const arricchiti = parsed.map(e => {
      const demo = demoMappa[e.id];
      const spesePrev = e.spesePreventivo || demo?.spesePreventivo || {
        food: Math.round((e.budgetPrevisto || 0) * 0.45),
        intrattenimento: Math.round((e.budgetPrevisto || 0) * 0.25),
        altreSpese: Math.round((e.budgetPrevisto || 0) * 0.20),
        varie: Math.round((e.budgetPrevisto || 0) * 0.10)
      };

      const speseCons = e.speseConsuntivo || demo?.speseConsuntivo || {
        food: Math.round((e.costiSostenuti || 0) * 0.50),
        intrattenimento: Math.round((e.costiSostenuti || 0) * 0.25),
        altreSpese: Math.round((e.costiSostenuti || 0) * 0.15),
        varie: Math.round((e.costiSostenuti || 0) * 0.10)
      };

      const totPrev = (spesePrev.food || 0) + (spesePrev.intrattenimento || 0) + (spesePrev.altreSpese || 0) + (spesePrev.varie || 0);
      const totCons = (speseCons.food || 0) + (speseCons.intrattenimento || 0) + (speseCons.altreSpese || 0) + (speseCons.varie || 0);

      return {
        ...e,
        standNumerati: e.standNumerati && e.standNumerati.length > 0 ? e.standNumerati : (demo?.standNumerati || STAND_SIMULATI_DEFAULT),
        tipoEvento: e.tipoEvento || demo?.tipoEvento || 'nativo',
        partnerIbridoNome: e.partnerIbridoNome ?? demo?.partnerIbridoNome,
        percentualeSpeseProLoco: e.percentualeSpeseProLoco ?? demo?.percentualeSpeseProLoco ?? 50,
        percentualeEntrateProLoco: e.percentualeEntrateProLoco ?? demo?.percentualeEntrateProLoco ?? 50,
        contributoPartner: e.contributoPartner ?? demo?.contributoPartner ?? 0,
        committenteNome: e.committenteNome ?? demo?.committenteNome,
        tipoAccordoGestione: e.tipoAccordoGestione ?? demo?.tipoAccordoGestione ?? 'compenso_forfettario',
        compensoGestione: e.compensoGestione ?? demo?.compensoGestione ?? 0,
        rimborsoSpeseCommittente: e.rimborsoSpeseCommittente ?? demo?.rimborsoSpeseCommittente ?? 0,
        spesePreventivo: spesePrev,
        speseConsuntivo: speseCons,
        budgetPrevisto: totPrev > 0 ? totPrev : (e.budgetPrevisto || 0),
        costiSostenuti: totCons > 0 ? totCons : (e.costiSostenuti || 0),
        entratePreviste: e.entratePreviste ?? demo?.entratePreviste ?? e.budgetPrevisto
      };
    });

    return arricchiti;
  } catch (err) {
    console.error('Errore nel caricamento degli eventi:', err);
    return INITIAL_EVENTI;
  }
}

export function ripristinaEventiSimulati(): ProLocoEvento[] {
  try {
    saveEventi(INITIAL_EVENTI);
    return INITIAL_EVENTI;
  } catch (err) {
    console.error('Errore nel ripristino degli eventi simulati:', err);
    return INITIAL_EVENTI;
  }
}

export function saveEventi(eventi: ProLocoEvento[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_EVENTI, JSON.stringify(eventi));
  } catch (err) {
    console.error('Errore nel salvataggio degli eventi:', err);
  }
}

export function esportaEventiCSV(eventi: ProLocoEvento[], anno?: number): void {
  const intestazioni = [
    'ID Evento',
    'Titolo Evento',
    'Tipologia Evento',
    'Categoria',
    'Data Inizio',
    'Ora Inizio',
    'Data Fine',
    'Ora Fine',
    'Luogo',
    'Stato',
    'Ente Partner / Committente',
    'Prev. Food (€)',
    'Prev. Intrattenimento (€)',
    'Prev. Altre Spese (€)',
    'Prev. Varie (€)',
    'Totale Preventivo Costi (€)',
    'Cons. Food (€)',
    'Cons. Intrattenimento (€)',
    'Cons. Altre Spese (€)',
    'Cons. Varie (€)',
    'Totale Costi Consuntivati (€)',
    'Differenza Scostamento Costi (€)',
    'Entrate Previste (€)',
    'Entrate Realizzate (€)',
    'Risultato Netto Manifestazione (€)',
    'Costi Competenza Pro Loco (€)',
    'Entrate Competenza Pro Loco (€)',
    'Margine Netto Bilancio Pro Loco (€)',
    'Partecipanti Stimati',
    'Permesso Comune',
    'Licenza SIAE',
    'Piano Sicurezza Safety',
    'Notifica ASL HACCP',
    'Volontari Coinvolti (N°)'
  ];

  const filtrati = anno ? eventi.filter(e => e.dataInizio.startsWith(anno.toString())) : eventi;

  const righe = filtrati.map(e => {
    const tipo = e.tipoEvento || 'nativo';
    const etichettaTipo = tipo === 'nativo' ? '1. Nativo (100% Pro Loco)' : tipo === 'ibrido' ? '2. Ibrido (Co-organizzato)' : '3. Gestione (Conto Terzi)';
    const partnerOCommittente = tipo === 'ibrido' ? (e.partnerIbridoNome || 'Partner') : tipo === 'gestione' ? (e.committenteNome || 'Committente') : 'Pro Loco Diretta';

    const prevFood = e.spesePreventivo?.food || 0;
    const prevIntr = e.spesePreventivo?.intrattenimento || 0;
    const prevAltre = e.spesePreventivo?.altreSpese || 0;
    const prevVarie = e.spesePreventivo?.varie || 0;
    const totPrev = prevFood + prevIntr + prevAltre + prevVarie || e.budgetPrevisto || 0;

    const consFood = e.speseConsuntivo?.food || 0;
    const consIntr = e.speseConsuntivo?.intrattenimento || 0;
    const consAltre = e.speseConsuntivo?.altreSpese || 0;
    const consVarie = e.speseConsuntivo?.varie || 0;
    const totCons = consFood + consIntr + consAltre + consVarie || e.costiSostenuti || 0;

    const deltaCosti = totCons - totPrev;
    const margine = (e.entrateRealizzate || 0) - totCons;

    // Calcolo quota bilancio Pro Loco
    let costiProLoco = totCons;
    let entrateProLoco = e.entrateRealizzate || 0;
    if (tipo === 'ibrido') {
      const pSpese = e.percentualeSpeseProLoco !== undefined ? e.percentualeSpeseProLoco : 50;
      const pEntr = e.percentualeEntrateProLoco !== undefined ? e.percentualeEntrateProLoco : 50;
      costiProLoco = Math.max(0, Math.round((totCons * pSpese) / 100) - (e.contributoPartner || 0));
      entrateProLoco = Math.round(((e.entrateRealizzate || 0) * pEntr) / 100);
    } else if (tipo === 'gestione') {
      costiProLoco = totCons;
      entrateProLoco = (e.compensoGestione || 0) + (e.rimborsoSpeseCommittente || 0) || (e.entrateRealizzate || 0);
    }
    const margineProLoco = entrateProLoco - costiProLoco;

    return [
      `"${e.id}"`,
      `"${e.titolo.replace(/"/g, '""')}"`,
      `"${etichettaTipo}"`,
      `"${e.categoria}"`,
      `"${e.dataInizio}"`,
      `"${e.oraInizio || ''}"`,
      `"${e.dataFine}"`,
      `"${e.oraFine || ''}"`,
      `"${e.luogo.replace(/"/g, '""')}"`,
      `"${e.stato.toUpperCase()}"`,
      `"${partnerOCommittente.replace(/"/g, '""')}"`,
      `"${prevFood}"`,
      `"${prevIntr}"`,
      `"${prevAltre}"`,
      `"${prevVarie}"`,
      `"${totPrev}"`,
      `"${consFood}"`,
      `"${consIntr}"`,
      `"${consAltre}"`,
      `"${consVarie}"`,
      `"${totCons}"`,
      `"${deltaCosti}"`,
      `"${e.entratePreviste || 0}"`,
      `"${e.entrateRealizzate || 0}"`,
      `"${margine}"`,
      `"${costiProLoco}"`,
      `"${entrateProLoco}"`,
      `"${margineProLoco}"`,
      `"${e.partecipantiStimati || 0}"`,
      `"${e.permessoComunale ? 'SI' : 'NO'}"`,
      `"${e.licenzaSIAE ? 'SI' : 'NO'}"`,
      `"${e.pianoSicurezzaSafety ? 'SI' : 'NO'}"`,
      `"${e.aslHaccp ? 'SI' : 'NO'}"`,
      `"${e.volontariIds ? e.volontariIds.length : 0}"`
    ].join(';');
  });

  const csvContent = '\uFEFF' + [intestazioni.join(';'), ...righe].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Calendario_Eventi_ProLoco_${anno || 'completo'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function esportaBilancioCompletoCSV(
  soci: Socio[], 
  eventi: ProLocoEvento[], 
  config: ProLocoInfo, 
  anno?: number
): void {
  const annoRif = anno || config.annoCorrente;
  const annoFiltro = anno && anno !== 0 ? anno : null;

  // Filtro quote dell'anno
  const tutteQuote = soci.flatMap(s => s.quote || []);
  const quoteAnno = annoFiltro 
    ? tutteQuote.filter(q => q.anno === annoFiltro)
    : tutteQuote;
  
  const totaleQuote = quoteAnno.reduce((sum, q) => sum + (q.importo || 0), 0);

  // Filtro eventi dell'anno
  const eventiAnno = annoFiltro
    ? eventi.filter(e => e.dataInizio.startsWith(annoFiltro.toString()))
    : eventi;

  const totaleEntrateEventi = eventiAnno.reduce((sum, e) => sum + (e.entrateRealizzate || 0), 0);
  const totaleCostiEventi = eventiAnno.reduce((sum, e) => sum + (e.costiSostenuti || 0), 0);
  const totaleEntrateGenerali = totaleQuote + totaleEntrateEventi;
  const totaleUsciteGenerali = totaleCostiEventi;
  const avanzoGestione = totaleEntrateGenerali - totaleUsciteGenerali;

  const righeCsv: string[] = [
    `"PRO LOCO ${config.nome.toUpperCase()}"`,
    `"RENDICONTO ECONOMICO FINANZIARIO GENERALE - ESERCIZIO ${annoFiltro || 'STORICO COMPLESSIVO'}"`,
    `"C.F.: ${config.codiceFiscale} - COMUNE: ${config.comune} (${config.provincia})"`,
    `"Data estrazione database: ${new Date().toLocaleDateString('it-IT')}"`,
    '""',
    '"QUADRO SINTETICO DI BILANCIO"',
    `"Voce";"Importo (€)"`,
    `"Entrate Totali da Tesseramento (Quote Sociali)";"${totaleQuote.toFixed(2)}"`,
    `"Entrate Totali da Eventi & Manifestazioni";"${totaleEntrateEventi.toFixed(2)}"`,
    `"TOTALE GENERALE ENTRATE PRO LOCO";"${totaleEntrateGenerali.toFixed(2)}"`,
    `"TOTALE GENERALE USCITE & COSTI PRO LOCO";"${totaleUsciteGenerali.toFixed(2)}"`,
    `"RISULTATO ECONOMICO (AVANZO/DISAVANZO DI GESTIONE)";"${avanzoGestione.toFixed(2)}"`,
    '""',
    '"DETTAGLIO TESSERAMENTI & QUOTE ASSOCIATIVE"',
    `"ID Ricevuta";"Numero Tessera";"Nominativo Socio";"Categoria";"Anno";"Importo (€)";"Data Pagamento";"Data Scadenza";"Metodo"`
  ];

  // Aggiungi righe quote
  quoteAnno.forEach(q => {
    const s = soci.find(soc => soc.id === q.socioId);
    righeCsv.push([
      `"${q.ricevutaNumero || ''}"`,
      `"${s?.numeroTessera || ''}"`,
      `"${s ? `${s.cognome} ${s.nome}` : 'Socio sconosciuto'}"`,
      `"${s?.categoria || ''}"`,
      `"${q.anno}"`,
      `"${q.importo}"`,
      `"${q.dataPagamento}"`,
      `"${q.dataScadenza || `${q.anno}-12-31`}"`,
      `"${q.metodo}"`
    ].join(';'));
  });

  righeCsv.push('""');
  righeCsv.push('"DETTAGLIO EVENTI E MANIFESTAZIONI"');
  righeCsv.push(
    `"Titolo Evento";"Categoria";"Data";"Stato";"Prev. Costi (€)";"Cons. Food (€)";"Cons. Spettacolo (€)";"Cons. Altre (€)";"Cons. Varie (€)";"Totale Costi Consuntivo (€)";"Entrate Realizzate (€)";"Margine Evento (€)"`
  );

  eventiAnno.forEach(e => {
    const consFood = e.speseConsuntivo?.food || 0;
    const consIntr = e.speseConsuntivo?.intrattenimento || 0;
    const consAltre = e.speseConsuntivo?.altreSpese || 0;
    const consVarie = e.speseConsuntivo?.varie || 0;
    const totCons = consFood + consIntr + consAltre + consVarie || e.costiSostenuti || 0;
    const margine = (e.entrateRealizzate || 0) - totCons;

    righeCsv.push([
      `"${e.titolo.replace(/"/g, '""')}"`,
      `"${e.categoria}"`,
      `"${e.dataInizio}"`,
      `"${e.stato.toUpperCase()}"`,
      `"${e.budgetPrevisto || 0}"`,
      `"${consFood}"`,
      `"${consIntr}"`,
      `"${consAltre}"`,
      `"${consVarie}"`,
      `"${totCons}"`,
      `"${e.entrateRealizzate || 0}"`,
      `"${margine}"`
    ].join(';'));
  });

  const csvContent = '\uFEFF' + righeCsv.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bilancio_Completo_ProLoco_${annoFiltro || 'globale'}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function esportaBackupJSON(soci: Socio[], config: ProLocoInfo, eventi?: ProLocoEvento[]): void {
  const data = {
    versione: '2.0',
    dataEsportazione: new Date().toISOString(),
    configurazione: config,
    soci: soci,
    eventi: eventi || loadEventi()
  };
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Backup_ProLoco_Completo_${config.annoCorrente}_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function azzeraDatabase(): void {
  saveSoci([]);
  saveEventi([]);
}

export function esportaCodiceSitoHTML(
  config: ProLocoInfo,
  eventi: ProLocoEvento[],
  soci: Socio[],
  sitoConfig: SitoWebConfig
): void {
  const direttivo = soci.filter(s => s.ruoloDirettivo && s.ruoloDirettivo !== 'Nessuno');
  const eventiAttivi = eventi
    .filter(e => e.stato !== 'annullato')
    .sort((a, b) => new Date(a.dataInizio).getTime() - new Date(b.dataInizio).getTime());

  const colorePrimario = sitoConfig.temaColore === 'blue' ? 'sky'
    : sitoConfig.temaColore === 'amber' ? 'amber'
    : sitoConfig.temaColore === 'rose' ? 'rose'
    : sitoConfig.temaColore === 'purple' ? 'purple'
    : 'emerald';

  const htmlContenuto = `<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${config.nome} - Sito Web Ufficiale</title>
  <meta name="description" content="${sitoConfig.sottotitoloHero || config.motto || 'Portale ufficiale della Pro Loco'}">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,800;0,900;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    .font-serif { font-family: 'Playfair Display', serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen">
  ${sitoConfig.mostraAvviso && sitoConfig.avvisoImportante ? `
  <!-- Banner Avviso Ufficiale -->
  <div class="px-4 py-2.5 text-xs font-bold text-center border-b flex items-center justify-center gap-2 ${
    sitoConfig.tipoAvviso === 'warning' ? 'bg-amber-100 text-amber-900 border-amber-300' :
    sitoConfig.tipoAvviso === 'evento' ? 'bg-purple-100 text-purple-900 border-purple-300' :
    sitoConfig.tipoAvviso === 'info' ? 'bg-sky-100 text-sky-900 border-sky-300' :
    'bg-emerald-100 text-emerald-900 border-emerald-300'
  }">
    <span>📢</span>
    <span>${sitoConfig.avvisoImportante}</span>
  </div>` : ''}

  <!-- Intestazione Principale -->
  <header class="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
    <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-lg shadow-xs">
          🏛️
        </div>
        <div>
          <h1 class="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">${config.nome}</h1>
          <p class="text-[11px] text-slate-500">${config.comune} (${config.provincia}) • Affiliata UNPLI • RUNTS APS</p>
        </div>
      </div>
      <div class="flex items-center gap-2">
        ${sitoConfig.abilitaEventi ? `
        <a href="#eventi" class="px-3.5 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition">
          Eventi
        </a>` : ''}
        ${sitoConfig.linkWhatsApp ? `
        <a href="https://wa.me/${sitoConfig.linkWhatsApp.replace(/[^0-9]/g, '')}" target="_blank" class="px-3 py-1.5 bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl border border-emerald-300 hover:bg-emerald-200 transition">
          WhatsApp
        </a>` : ''}
      </div>
    </div>
  </header>

  <!-- Hero Section con Copertina -->
  <section class="relative bg-slate-900 text-white py-20 sm:py-28 px-4 overflow-hidden">
    <img 
      src="${sitoConfig.immagineCopertina || 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1600&auto=format&fit=crop&q=80'}" 
      alt="Copertina Borgo" 
      class="absolute inset-0 w-full h-full object-cover opacity-35"
      referrerpolicy="no-referrer"
    />
    <div class="relative max-w-4xl mx-auto text-center space-y-4">
      <span class="inline-block px-3.5 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase border border-white/20">
        Associazione Turistica Pro Loco
      </span>
      <h2 class="text-3xl sm:text-5xl font-black font-serif tracking-tight leading-tight">
        ${sitoConfig.titoloHero || `Benvenuti a ${config.comune}`}
      </h2>
      <p class="text-base sm:text-lg text-emerald-100 max-w-2xl mx-auto font-light leading-relaxed">
        «${sitoConfig.sottotitoloHero || sitoConfig.mottoPersonalizzato || config.motto || 'Custodi delle tradizioni, promotori del territorio.'}»
      </p>

      ${sitoConfig.testoBenvenuto ? `
      <div class="pt-4 max-w-2xl mx-auto bg-slate-900/75 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-xs sm:text-sm text-slate-200 leading-relaxed italic">
        «${sitoConfig.testoBenvenuto}»
      </div>` : ''}

      <div class="pt-6 flex flex-wrap justify-center gap-3 text-xs">
        <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
          📍 Sede: <strong>${config.indirizzo}</strong>
        </div>
        <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
          📞 Tel: <strong>${config.telefono}</strong>
        </div>
        <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
          ✉️ Email: <strong>${config.email}</strong>
        </div>
        <div class="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/15">
          🕒 <strong>${sitoConfig.orariAperturaSede || 'Orari Sede: Lun-Ven 09:30-12:30'}</strong>
        </div>
      </div>
    </div>
  </section>

  ${sitoConfig.abilitaEventi ? `
  <!-- Sezione Calendario Manifestazioni -->
  <section id="eventi" class="max-w-6xl mx-auto px-4 py-16">
    <div class="text-center mb-10 space-y-2">
      <span class="text-xs font-black uppercase tracking-widest text-emerald-700">Appuntamenti della Comunità</span>
      <h3 class="text-3xl font-black text-slate-900 font-serif">Calendario Manifestazioni & Feste</h3>
      <p class="text-xs text-slate-500">Tutti gli eventi organizzati e patrocinati dalla Pro Loco</p>
    </div>
    ${eventiAttivi.length === 0 ? `
      <div class="text-center py-10 bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
        Nessun evento in programma al momento. Torna a visitarci presto!
      </div>` : `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        ${eventiAttivi.map(ev => `
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between">
            <div class="p-5 space-y-3">
              <span class="inline-block px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-bold rounded-lg border border-emerald-200">
                ${ev.categoria}
              </span>
              <h4 class="text-lg font-bold text-slate-900 leading-snug">${ev.titolo}</h4>
              <div class="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p>📅 <strong>Data:</strong> ${ev.dataInizio} ${ev.oraInizio ? `alle ${ev.oraInizio}` : ''}</p>
                <p>📍 <strong>Luogo:</strong> ${ev.luogo}</p>
              </div>
              <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">${ev.descrizione || ''}</p>
            </div>
          </div>
        `).join('')}
      </div>`}
  </section>` : ''}

  ${sitoConfig.abilitaTerritorio && sitoConfig.schedeTerritorio && sitoConfig.schedeTerritorio.length > 0 ? `
  <!-- Sezione Territorio & Borgo -->
  <section class="bg-slate-100/80 py-16 px-4 border-t border-b border-slate-200">
    <div class="max-w-6xl mx-auto space-y-8">
      <div class="text-center space-y-2 max-w-2xl mx-auto">
        <span class="text-xs font-black uppercase tracking-widest text-emerald-700">Guida per Visitatori & Turisti</span>
        <h3 class="text-3xl font-black text-slate-900 font-serif">${sitoConfig.titoloTerritorio || 'Territorio, Borgo & Sapori Tipici'}</h3>
        <p class="text-xs text-slate-600 leading-relaxed">${sitoConfig.testoTerritorio || 'Vivi la nostra terra attraverso i suoi monumenti, le bellezze naturalistiche e i sapori autentici.'}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        ${sitoConfig.schedeTerritorio.map(sch => `
          <div class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
            ${sch.immagine ? `
            <img src="${sch.immagine}" alt="${sch.titolo}" class="w-full h-44 object-cover" referrerpolicy="no-referrer" />
            ` : ''}
            <div class="p-5 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <span class="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                  ${sch.categoria ? sch.categoria.toUpperCase() : 'ATTRAZIONE'}
                </span>
                <h4 class="text-base font-bold text-slate-900 mt-1">${sch.titolo}</h4>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">${sch.descrizione}</p>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>` : ''}

  ${sitoConfig.abilitaTesseramentoOnline ? `
  <!-- Sezione Invito Tesseramento -->
  <section class="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
    <div class="bg-gradient-to-br from-emerald-800 to-teal-900 text-white rounded-3xl p-8 sm:p-12 shadow-lg space-y-4">
      <span class="px-3.5 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider">Partecipazione Attiva</span>
      <h3 class="text-2xl sm:text-4xl font-black font-serif">Diventa Socio della Pro Loco</h3>
      <p class="text-xs sm:text-sm text-emerald-100 max-w-xl mx-auto leading-relaxed">
        ${sitoConfig.testoInvitoTesseramento || 'Sostieni la nostra associazione, partecipa alle assemblee e agli eventi da protagonista, e usufruisci della Tessera del Socio Pro Loco UNPLI.'}
      </p>
      <div class="pt-2 flex flex-wrap justify-center gap-4 text-xs font-bold">
        <span class="bg-white/10 px-4 py-2 rounded-xl border border-white/20">Quota Ordinario: €${config.quotaStandardOrdinario || 15}</span>
        <span class="bg-white/10 px-4 py-2 rounded-xl border border-white/20">Quota Sostenitore: €${config.quotaStandardSostenitore || 30}</span>
        <span class="bg-white/10 px-4 py-2 rounded-xl border border-white/20">Quota Giovane: €${config.quotaStandardGiovane || 10}</span>
      </div>
    </div>
  </section>` : ''}

  ${sitoConfig.abilitaDirettivo && direttivo.length > 0 ? `
  <!-- Sezione Consiglio Direttivo & Trasparenza RUNTS -->
  <section class="max-w-6xl mx-auto px-4 py-12 border-t border-slate-200">
    <div class="text-center mb-8 space-y-1">
      <span class="text-xs font-black uppercase tracking-widest text-emerald-700">Trasparenza Istituzionale</span>
      <h3 class="text-2xl font-black text-slate-900 font-serif">Consiglio Direttivo in Carica</h3>
      <p class="text-xs text-slate-500">Organi sociali regolarmente depositati nel Registro Unico Nazionale del Terzo Settore</p>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      ${direttivo.map(m => `
        <div class="bg-white p-4 rounded-xl border border-slate-200 text-center space-y-1 shadow-2xs">
          <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold mx-auto flex items-center justify-center text-xs">
            ${m.nome.charAt(0)}${m.cognome.charAt(0)}
          </div>
          <h4 class="text-xs font-bold text-slate-900">${m.nome} ${m.cognome}</h4>
          <span class="text-[10.5px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block">
            ${m.ruoloDirettivo}
          </span>
        </div>
      `).join('')}
    </div>
  </section>` : ''}

  <!-- Footer Istituzionale -->
  <footer class="bg-white border-t border-slate-200 py-10 px-4 text-xs text-slate-500 space-y-3">
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-100 pb-6">
      <div class="text-center sm:text-left space-y-1">
        <h4 class="font-bold text-slate-900 text-sm">${config.nome}</h4>
        <p>Codice Fiscale: <strong>${config.codiceFiscale}</strong> ${config.partitaIva ? `• P.IVA: ${config.partitaIva}` : ''} • Iscrizione RUNTS: ${config.numeroRunts || 'In Corso'}</p>
        <p>Presidente: <strong>${config.nomePresidente}</strong> • Sede: ${config.indirizzo}, ${config.cap} ${config.comune} (${config.provincia})</p>
      </div>
      <div class="flex items-center gap-3">
        ${sitoConfig.linkFacebook ? `<a href="${sitoConfig.linkFacebook}" target="_blank" class="p-2 bg-slate-100 rounded-xl text-slate-700 hover:text-emerald-700 transition font-bold">Facebook</a>` : ''}
        ${sitoConfig.linkInstagram ? `<a href="${sitoConfig.linkInstagram}" target="_blank" class="p-2 bg-slate-100 rounded-xl text-slate-700 hover:text-emerald-700 transition font-bold">Instagram</a>` : ''}
        ${sitoConfig.linkWhatsApp ? `<a href="https://wa.me/${sitoConfig.linkWhatsApp.replace(/[^0-9]/g, '')}" target="_blank" class="p-2 bg-emerald-50 rounded-xl text-emerald-800 font-bold border border-emerald-200">WhatsApp</a>` : ''}
      </div>
    </div>
    <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
      <span>Affiliata UNPLI Unione Nazionale Pro Loco d'Italia ${config.codiceUnpli ? `(${config.codiceUnpli})` : ''}</span>
      <span>Generato tramite Gestionale Pro Loco con Editor Sito Web Autonomo</span>
    </div>
  </footer>
</body>
</html>`;

  const blob = new Blob([htmlContenuto], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Sito_Web_${config.comune.replace(/[^a-zA-Z0-9]/g, '_')}_ProLoco.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}



