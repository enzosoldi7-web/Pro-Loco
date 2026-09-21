import React, { useState } from 'react';
import { ProLocoInfo, Socio, ProLocoEvento, SitoWebConfig, GiornalinoConfig, PaginaPrincipale, SottoTabGestionale, EdizioneGiornalino } from '../types';
import { 
  Building2, 
  Calendar, 
  Settings, 
  Smartphone, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  Award, 
  Globe, 
  Newspaper, 
  FolderKanban, 
  Users, 
  PartyPopper, 
  Landmark, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  BookOpen, 
  FileText, 
  PenTool, 
  Printer, 
  Lock, 
  ChevronRight,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  X,
  Eye,
  Layers,
  Send,
  Bell,
  Palette,
  Compass,
  Database,
  Archive
} from 'lucide-react';
import { esportaLibroSociCSV, esportaBackupJSON, esportaBilancioCompletoCSV, esportaCodiceSitoHTML } from '../storage';

interface DashboardViewProps {
  config: ProLocoInfo;
  soci: Socio[];
  eventi: ProLocoEvento[];
  sitoConfig: SitoWebConfig;
  giornalinoConfig: GiornalinoConfig;
  archivioGiornalini?: EdizioneGiornalino[];
  annoSelezionato: number;
  onNavigaPagina: (
    pagina: PaginaPrincipale, 
    sottoTab?: SottoTabGestionale, 
    opzioni?: { 
      forzatureEditor?: boolean; 
      soloPubblico?: boolean; 
      tabGiornalino?: 'studio' | 'articoli' | 'sponsor' | 'paginazione' | 'testata' | 'anteprima';
      tabEditorSito?: 'generale' | 'sezioni' | 'avvisi' | 'territorio' | 'aspetto' | 'sicurezza';
    }
  ) => void;
  onCambiaAnno: (anno: number) => void;
  onApriImpostazioni: () => void;
  onApriApkModal: () => void;
  onImportaBackup: (dati: { soci: Socio[]; config: ProLocoInfo; eventi?: ProLocoEvento[] }) => void;
  onRipristinaDemo: () => void;
  onAzzeraDatabase?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  config,
  soci,
  eventi,
  sitoConfig,
  giornalinoConfig,
  archivioGiornalini = [],
  annoSelezionato,
  onNavigaPagina,
  onCambiaAnno,
  onApriImpostazioni,
  onApriApkModal,
  onImportaBackup,
  onRipristinaDemo,
  onAzzeraDatabase
}) => {
  const [mostraMenuBackup, setMostraMenuBackup] = useState(false);
  const [mostraConfermaAzzera, setMostraConfermaAzzera] = useState(false);
  const [mostraConfermaRipristinoDemo, setMostraConfermaRipristinoDemo] = useState(false);
  const [annoDaConfermare, setAnnoDaConfermare] = useState<number | null>(null);

  // Calcolo statistiche rapide per la dashboard
  const sociAnno = soci.filter(s => s.quote.some(q => q.anno === annoSelezionato));
  const totaleSociInRegola = sociAnno.length;
  const totaleIncassiQuote = soci.reduce((acc, s) => {
    const qAnno = s.quote.find(q => q.anno === annoSelezionato);
    return acc + (qAnno ? qAnno.importo : 0);
  }, 0);

  const eventiAnno = eventi.filter(e => {
    const annoEv = new Date(e.dataInizio).getFullYear();
    return annoEv === annoSelezionato;
  });

  const totaleSpeseEventi = eventiAnno.reduce((acc, e) => acc + (e.costiSostenuti || e.budgetPrevisto || 0), 0);
  const totaleEntrateEventi = eventiAnno.reduce((acc, e) => acc + (e.entrateRealizzate || e.entratePreviste || 0), 0);
  const totaleEntrateComplessive = totaleIncassiQuote + totaleEntrateEventi;
  const avanzoEconomico = totaleEntrateComplessive - totaleSpeseEventi;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (parsed.soci && Array.isArray(parsed.soci) && parsed.configurazione) {
          onImportaBackup({
            soci: parsed.soci,
            config: parsed.configurazione,
            eventi: parsed.eventi || []
          });
          alert('Backup ripristinato con successo!');
          setMostraMenuBackup(false);
        } else {
          alert('File di backup non valido.');
        }
      } catch (err) {
        alert('Errore nella lettura del file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* 1. INTESTAZIONE PRINCIPALE DELLA DASHBOARD (Come richiesto: Tutta l'intestazione proloco, tasto anno, database & backup, app android, configurazione) */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3 gap-3">
            
            {/* Logo, Denominazione e Riconoscimenti Pro Loco */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md shrink-0">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    {config.nome}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    {config.codiceUnpli ? 'UNPLI' : 'APS Pro Loco'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                  <span>C.F. {config.codiceFiscale}</span>
                  <span>•</span>
                  <span>{config.comune} ({config.provincia})</span>
                  {config.numeroRunts && (
                    <>
                      <span>•</span>
                      <span className="hidden sm:inline">RUNTS: {config.numeroRunts}</span>
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Tasti di Controllo Richiesti: Anno, Database & Backup, App Android, Configurazione */}
            <div className="flex flex-wrap items-center gap-2">
              
              {/* Tasto 1: Anno Sociale */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                <Calendar className="w-4 h-4 text-slate-500 ml-1.5 mr-1" />
                <span className="text-[11px] font-bold text-slate-500 mr-1 hidden sm:inline">Anno:</span>
                <select
                  id="select-anno-dashboard"
                  value={annoSelezionato}
                  onChange={(e) => {
                    const target = Number(e.target.value);
                    if (target !== annoSelezionato) {
                      setAnnoDaConfermare(target);
                    }
                  }}
                  aria-label="Seleziona anno sociale"
                  className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded-lg px-2.5 py-1 shadow-2xs focus:outline-hidden cursor-pointer"
                >
                  <option value={new Date().getFullYear() + 1}>{new Date().getFullYear() + 1} (Successivo)</option>
                  <option value={new Date().getFullYear()}>{new Date().getFullYear()} (Anno Corrente)</option>
                  <option value={new Date().getFullYear() - 1}>{new Date().getFullYear() - 1} (Precedente)</option>
                  <option value={new Date().getFullYear() - 2}>{new Date().getFullYear() - 2}</option>
                  <option value={new Date().getFullYear() - 3}>{new Date().getFullYear() - 3}</option>
                </select>
              </div>

              {/* Tasto 2: Database & Backup con Menu */}
              <div className="relative">
                <button
                  id="btn-database-backup-dashboard"
                  onClick={() => setMostraMenuBackup(!mostraMenuBackup)}
                  title="Gestione Database, Backup e Ripristino"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Database</span>
                </button>

                {mostraMenuBackup && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-slate-800 animate-in fade-in-50 zoom-in-95">
                    <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Database Pro Loco
                    </div>
                    
                    <button
                      onClick={() => {
                        esportaBackupJSON(soci, config, eventi);
                        setMostraMenuBackup(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Esporta Backup Completo (JSON)</span>
                    </button>

                    <label className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium">
                      <Upload className="w-4 h-4 text-teal-600" />
                      <span>Importa Backup (JSON)</span>
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    <button
                      onClick={() => {
                        esportaLibroSociCSV(soci, annoSelezionato);
                        setMostraMenuBackup(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Download className="w-4 h-4 text-blue-600" />
                      <span>Scarica Libro Soci (CSV)</span>
                    </button>

                    <button
                      onClick={() => {
                        esportaBilancioCompletoCSV(soci, eventi, annoSelezionato);
                        setMostraMenuBackup(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <Download className="w-4 h-4 text-amber-600" />
                      <span>Scarica Bilancio Generale (CSV)</span>
                    </button>

                    <div className="my-1.5 border-t border-slate-100"></div>
                    
                    <button
                      id="btn-reimposta-demo-dashboard"
                      type="button"
                      onClick={() => {
                        setMostraMenuBackup(false);
                        setMostraConfermaRipristinoDemo(true);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs text-amber-800 hover:bg-amber-50 flex items-center gap-2 cursor-pointer font-semibold transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-amber-600" />
                      <span>Reimposta Dati Esempio</span>
                    </button>

                    {onAzzeraDatabase && (
                      <>
                        <div className="my-1.5 border-t border-rose-100"></div>
                        <button
                          onClick={() => {
                            setMostraMenuBackup(false);
                            setMostraConfermaAzzera(true);
                          }}
                          className="w-full text-left px-3.5 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer font-semibold"
                        >
                          <Trash2 className="w-4 h-4 text-rose-600" />
                          <span>Azzera Tutto il Database</span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Tasto 3: App Android */}
              <button
                id="btn-app-android-dashboard"
                onClick={onApriApkModal}
                title="Scarica APK Android o Installa come App Web PWA"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-slate-700" />
                <span>App Android</span>
              </button>

              {/* Tasto 4: Configurazione */}
              <button
                id="btn-configurazione-dashboard"
                onClick={onApriImpostazioni}
                title="Configurazione Ente, Quote e Parametri Istituzionali"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Settings className="w-3.5 h-3.5 text-slate-600" />
                <span>Configurazione</span>
              </button>

            </div>

          </div>

        </div>
      </header>

      {/* CORPO PRINCIPALE DELLA DASHBOARD */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner di Benvenuto e Riepilogo Anno Sociale */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md border border-emerald-700/40 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 uppercase tracking-widest">
                  Pannello di Controllo Generale
                </span>
                <span className="text-xs text-emerald-200 font-medium">
                  Anno Sociale {annoSelezionato}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Dashboard Istituzionale • {config.nome}
              </h2>
              <p className="text-sm text-emerald-100/90 leading-relaxed italic">
                «{config.motto || 'Promozione delle tradizioni, valorizzazione del territorio e animazione civica.'}»
              </p>
              <div className="pt-1 text-xs text-emerald-200/80 flex items-center gap-2">
                <span>Presidente: <strong className="text-white font-bold">{config.nomePresidente}</strong></span>
                <span>•</span>
                <span>Sede: {config.indirizzo}, {config.comune}</span>
              </div>
            </div>

            {/* Metriche Rapide di Sintesi */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[11px] text-emerald-200 font-medium block">Soci Iscritti {annoSelezionato}</span>
                <span className="text-2xl font-black text-white">{totaleSociInRegola}</span>
                <span className="text-[10px] text-emerald-300 block">in regola con la quota</span>
              </div>
              <div className="bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[11px] text-teal-200 font-medium block">Eventi in Calendario</span>
                <span className="text-2xl font-black text-white">{eventiAnno.length}</span>
                <span className="text-[10px] text-teal-300 block">manifestazioni {annoSelezionato}</span>
              </div>
              <div className="col-span-2 sm:col-span-1 bg-white/10 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10 text-center">
                <span className="text-[11px] text-emerald-200 font-medium block">Saldo Cassa {annoSelezionato}</span>
                <span className={`text-2xl font-black ${(avanzoEconomico || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  € {(avanzoEconomico || 0).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-slate-300 block">entrate totali - uscite</span>
              </div>
            </div>

          </div>
        </div>

        {/* GUIDA & TITOLO SEZIONE DI NAVIGAZIONE */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Seleziona l'ambiente di lavoro
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Tre moduli autonomi e integrati per gestire l'amministrazione interna, la presenza web e la comunicazione editoriale.
          </p>
        </div>

        {/* I TRE GRANDI TASTI / CARD RICHIESTI:
            1. GESTIONALE (1.1 Albo & Libro Soci, 1.2 Calendario & Gestione Eventi, 1.3 Bilancio Generale)
            2. SITO WEB (2.1 Editor Sito Web)
            3. GIORNALINO (3.1 Editor Giornalino)
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* CARD 1: GESTIONALE */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-emerald-500/60 relative">
            <div className="space-y-5">
              
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <FolderKanban className="w-7 h-7 text-emerald-700" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                  1. Modulo Amministrativo
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-emerald-800 transition-colors">
                  1. Gestionale Pro Loco
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Pannello operativo per il Consiglio Direttivo e la segreteria. Include anagrafica soci, quote, calendario manifestazioni e rendiconto.
                </p>
              </div>

              {/* Elenco sottomoduli racchiusi nel Gestionale (1.1, 1.2, 1.3) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Sezioni Racchiuse nel Gestionale:
                </span>
                
                <button
                  onClick={() => onNavigaPagina('gestionale', 'soci')}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between cursor-pointer group/item"
                >
                  <div className="flex items-center gap-2.5">
                    <Users className="w-4 h-4 text-emerald-700" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 group-hover/item:text-emerald-900 block">
                        1.1 Albo & Libro Soci
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {soci.length} soci censiti • {totaleSociInRegola} in regola {annoSelezionato}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:text-emerald-700" />
                </button>

                <button
                  onClick={() => onNavigaPagina('gestionale', 'eventi')}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 transition flex items-center justify-between cursor-pointer group/item"
                >
                  <div className="flex items-center gap-2.5">
                    <PartyPopper className="w-4 h-4 text-teal-700" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 group-hover/item:text-teal-900 block">
                        1.2 Calendario & Gestione Eventi
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {eventi.length} manifestazioni con budget a 4 voci
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:text-teal-700" />
                </button>

                <button
                  onClick={() => onNavigaPagina('gestionale', 'bilancio')}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition flex items-center justify-between cursor-pointer group/item"
                >
                  <div className="flex items-center gap-2.5">
                    <Landmark className="w-4 h-4 text-emerald-800" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 group-hover/item:text-emerald-900 block">
                        1.3 Bilancio Generale
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Rendiconto Terzo Settore RUNTS quote + eventi
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover/item:text-emerald-800" />
                </button>

              </div>

            </div>

            {/* Pulsante Principale di Ingresso */}
            <div className="pt-6">
              <button
                id="btn-entra-gestionale"
                onClick={() => onNavigaPagina('gestionale', 'soci')}
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white text-sm font-black rounded-2xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accedi al Gestionale</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* CARD 2: SITO WEB - RIQUADRO POTENZIATO */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-teal-500/60 relative">
            <div className="space-y-5">
              
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Globe className="w-7 h-7 text-teal-700" />
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-black border ${
                    sitoConfig.blindatoVisitatori
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {sitoConfig.blindatoVisitatori ? 'Online & Blindato' : 'In Bozza (Editor)'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">
                    PIN: {sitoConfig.pinSbloccoAdmin ? '••••' : 'Non impostato'}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-teal-800 transition-colors">
                  2. Sito Web Pubblico
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Portale vetrina per cittadini e turisti con informazioni, calendario manifestazioni, tesseramento online e galleria del territorio.
                </p>
              </div>

              {/* Mini-Snapshot Anteprima Copertina Portale */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xs group/snap">
                <img 
                  src={sitoConfig.immagineCopertina || 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=800&auto=format&fit=crop&q=80'} 
                  alt="Anteprima Portale" 
                  className="w-full h-24 object-cover group-hover/snap:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[10px] font-extrabold text-teal-300 uppercase tracking-widest">
                    {config.comune} • Portale Ufficiale
                  </span>
                  <h4 className="text-xs font-black text-white truncate drop-shadow-xs">
                    {sitoConfig.titoloHero || 'Benvenuti nel Nostro Borgo'}
                  </h4>
                </div>
              </div>

              {/* Elenco Sottomoduli e Sezioni del Riquadro Sito Web */}
              <div className="bg-slate-50 rounded-2xl p-3.5 sm:p-4 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-1 border-b border-slate-200/60">
                  <span className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    Moduli & Configurazione Riquadro:
                  </span>
                  <span className="text-[10.5px] font-bold text-teal-800 bg-teal-100/80 px-2 py-0.5 rounded-md">
                    UNPLI Web
                  </span>
                </div>

                {/* 2.1 Editor Copertina & Hero */}
                <button
                  type="button"
                  id="btn-sub-editor-hero"
                  onClick={() => onNavigaPagina('sitoweb', undefined, { forzatureEditor: true, tabEditorSito: 'generale' })}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 transition group/sub flex items-center justify-between cursor-pointer"
                  title="Modifica Copertina, Titolo e Messaggio di Benvenuto"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-xs font-bold text-slate-800 group-hover/sub:text-teal-900">
                        2.1 Copertina, Hero & Sfondo Borgo
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      Motto: «{sitoConfig.sottotitoloHero || config.motto || 'Custodi delle tradizioni'}»
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover/sub:text-teal-700 shrink-0 ml-1" />
                </button>

                {/* 2.2 Sezioni & Moduli Pubblici */}
                <button
                  type="button"
                  id="btn-sub-editor-sezioni"
                  onClick={() => onNavigaPagina('sitoweb', undefined, { forzatureEditor: true, tabEditorSito: 'sezioni' })}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 transition group/sub flex items-center justify-between cursor-pointer"
                  title="Gestisci le Sezioni Pubbliche Attive"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-xs font-bold text-slate-800 group-hover/sub:text-teal-900">
                        2.2 Sezioni & Moduli Pubblici
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-600">
                      <span>Eventi: <strong>{sitoConfig.abilitaEventi ? `${eventi.length} pubbl.` : 'Off'}</strong></span>
                      <span>•</span>
                      <span>Tessere Online: <strong>{sitoConfig.abilitaTesseramentoOnline ? 'Sì' : 'No'}</strong></span>
                      <span>•</span>
                      <span>Direttivo: <strong>{sitoConfig.abilitaDirettivo ? 'Attivo' : 'No'}</strong></span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover/sub:text-teal-700 shrink-0 ml-1" />
                </button>

                {/* 2.3 Bacheca Avvisi Cittadini */}
                <button
                  type="button"
                  id="btn-sub-editor-avvisi"
                  onClick={() => onNavigaPagina('sitoweb', undefined, { forzatureEditor: true, tabEditorSito: 'avvisi' })}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 transition group/sub flex items-center justify-between cursor-pointer"
                  title="Configura la Bacheca degli Avvisi Cittadini"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Bell className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-xs font-bold text-slate-800 group-hover/sub:text-teal-900">
                        2.3 Bacheca Avviso Cittadini
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        sitoConfig.mostraAvviso ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {sitoConfig.mostraAvviso ? 'Banner Attivo' : 'Spento'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">
                      {sitoConfig.avvisoImportante || 'Nessun avviso urgente in corso'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover/sub:text-teal-700 shrink-0 ml-1" />
                </button>

                {/* 2.4 Territorio & Canali Turistici */}
                <button
                  type="button"
                  id="btn-sub-editor-territorio"
                  onClick={() => onNavigaPagina('sitoweb', undefined, { forzatureEditor: true, tabEditorSito: 'territorio' })}
                  className="w-full text-left p-2.5 rounded-xl bg-white hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 transition group/sub flex items-center justify-between cursor-pointer"
                  title="Configura Schede Territorio, Orari Sede e Canali Social"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <Compass className="w-3.5 h-3.5 text-teal-600" />
                      <span className="text-xs font-bold text-slate-800 group-hover/sub:text-teal-900">
                        2.4 Territorio, Schede & Canali Sede
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10.5px] text-slate-500">
                      <span>{sitoConfig.schedeTerritorio?.length || 3} schede illustrate</span>
                      <span>•</span>
                      <span>WhatsApp: {sitoConfig.linkWhatsApp ? 'Attivo' : 'Off'}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover/sub:text-teal-700 shrink-0 ml-1" />
                </button>

                {/* 2.5 Aspetto Grafico & Sicurezza */}
                <div className="grid grid-cols-2 gap-2 pt-0.5">
                  <button
                    type="button"
                    id="btn-sub-editor-aspetto"
                    onClick={() => onNavigaPagina('sitoweb', undefined, { forzatureEditor: true, tabEditorSito: 'aspetto' })}
                    className="p-2 rounded-xl bg-white hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                      <Palette className="w-3 h-3 text-teal-600" />
                      <span>2.5 Aspetto & Tema</span>
                    </div>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {sitoConfig.temaColore || 'emerald'} • {sitoConfig.stileTipografico || 'classico'}
                    </p>
                  </button>

                  <button
                    type="button"
                    id="btn-sub-editor-sicurezza"
                    onClick={() => onNavigaPagina('sitoweb', undefined, { forzatureEditor: true, tabEditorSito: 'sicurezza' })}
                    className="p-2 rounded-xl bg-white hover:bg-teal-50/60 border border-slate-200 hover:border-teal-300 text-left transition cursor-pointer"
                  >
                    <div className="flex items-center gap-1 text-slate-700 font-bold text-[11px]">
                      <Lock className="w-3 h-3 text-teal-600" />
                      <span>2.6 Sicurezza Kiosk</span>
                    </div>
                    <p className="text-[10px] text-slate-500">
                      PIN: {sitoConfig.pinSbloccoAdmin || '1234'}
                    </p>
                  </button>
                </div>

              </div>

            </div>

            {/* Pulsanti di Ingresso e Strumenti Rapidi */}
            <div className="pt-6 space-y-2">
              <button
                id="btn-entra-sitoweb"
                onClick={() => onNavigaPagina('sitoweb', undefined, { forzatureEditor: true })}
                className="w-full py-3.5 px-4 bg-teal-800 hover:bg-teal-700 active:bg-teal-900 text-white text-sm font-black rounded-2xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                title="Accedi direttamente all'Editor del Sito Web per effettuare modifiche"
              >
                <PenTool className="w-4 h-4 text-teal-200" />
                <span>Accedi all'Editor Sito Web</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-anteprima-sito-pubblico"
                  onClick={() => onNavigaPagina('sitoweb', undefined, { soloPubblico: true })}
                  className="py-2.5 px-3 text-xs font-bold text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-teal-50 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                  title="Visualizza il portale così come appare ai visitatori"
                >
                  <Eye className="w-3.5 h-3.5 text-teal-700" />
                  <span>{sitoConfig.blindatoVisitatori ? 'Portale Pubblico' : 'Anteprima Live'}</span>
                </button>

                <button
                  type="button"
                  id="btn-scarica-sito-html-dashboard"
                  onClick={() => esportaCodiceSitoHTML(config, eventi, soci, sitoConfig)}
                  className="py-2.5 px-3 text-xs font-bold text-slate-700 hover:text-teal-900 bg-slate-100 hover:bg-teal-50 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                  title="Scarica il file HTML autonomo del sito web pronto per essere caricato su qualsiasi server web"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Esporta HTML</span>
                </button>
              </div>
            </div>
          </div>

          {/* CARD 3: GIORNALINO */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group hover:border-indigo-500/60 relative">
            <div className="space-y-5">
              
              <div className="flex items-start justify-between gap-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                  <Newspaper className="w-7 h-7 text-indigo-700" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
                  3. Periodico Ufficiale
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-800 transition-colors">
                  3. Giornalino Pro Loco
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Periodico e bollettino d'informazione per la comunità. Redazione articoli, editoriale del Presidente, memorie storiche e stampa A4/PDF.
                </p>
              </div>

              {/* Elenco sottomoduli racchiusi nel Giornalino (3.0 Archivio, 3.1 Studio, 3.2 Articoli, 3.3 Sponsor, 3.4 Impaginazione & Stampa) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Suite Editoriale & Archivio Uscite:
                </span>

                {/* 3.0 Archivio Dati Uscite (Novità Dashboard!) */}
                <div 
                  id="punto-3-archivio-uscite"
                  onClick={() => onNavigaPagina('archivio_giornalino')}
                  className="p-3 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white space-y-1.5 hover:shadow-md transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-indigo-700 text-white flex items-center justify-center">
                        <Archive className="w-3 h-3 text-indigo-200" />
                      </div>
                      <span className="text-xs font-black text-white">
                        3.0 Archivio Storico Uscite
                      </span>
                    </div>
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-indigo-800 text-indigo-200 border border-indigo-700">
                      {archivioGiornalini?.length || 4} USCITE
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Dashboard uscite catalogate per anno e data, visualizzatore fascicoli, anteprima di visione e selezione rapida del periodico.
                  </p>
                </div>

                {/* 3.1 Studio Editor DTP (Novità Potenziata!) */}
                <div 
                  id="punto-3-studio-editor"
                  onClick={() => onNavigaPagina('giornalino', undefined, { tabGiornalino: 'studio' })}
                  className="p-3 rounded-xl bg-gradient-to-br from-white to-indigo-50/60 border border-indigo-300 space-y-1.5 hover:border-indigo-500 hover:shadow-xs transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-indigo-900 text-white flex items-center justify-center">
                        <PenTool className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-black text-indigo-950">
                        3.1 Studio Editor DTP & Menabò
                      </span>
                    </div>
                    <span className="text-[9.5px] font-black px-2 py-0.5 rounded-md bg-indigo-600 text-white shadow-2xs">
                      STUDIO PRO
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Canvas interattivo A4 con righelli millimetrici, gabbia a colonne, temi d'inchiostro, gestione blocchi e visualizzazione a libro (spread).
                  </p>
                </div>

                {/* 3.2 Redazione Articoli Word */}
                <div 
                  onClick={() => onNavigaPagina('giornalino', undefined, { tabGiornalino: 'articoli' })}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1 hover:border-slate-300 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      3.2 Articoli & Redazione Word
                    </span>
                    <span className="text-[10px] text-slate-500 font-bold">
                      {giornalinoConfig.articoli.length} articoli
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    Editor stile Word, capolettera decorativo, formattazione ricca e galleria fotografica.
                  </p>
                </div>

                {/* 3.3 Gestione Sponsor & Inserzionisti Locali */}
                <div 
                  onClick={() => onNavigaPagina('giornalino', undefined, { tabGiornalino: 'sponsor' })}
                  className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1 hover:border-amber-300 transition cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <span className="text-amber-600 font-black text-xs">★</span>
                      3.3 Sponsor & Inserzioni Locali
                    </span>
                    <span className="text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.2 rounded font-bold">
                      {(giornalinoConfig.sponsor || []).length} sponsor
                    </span>
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    Spazi pubblicitari e inserzioni per finanziare le spese di stampa del notiziario.
                  </p>
                </div>

                {/* Dati Riepilogativi Giornalino */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10.5px]">Testata Periodico:</span>
                    <span className="font-bold text-slate-900 text-[11px] truncate max-w-[140px]">
                      {giornalinoConfig.testata}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 text-[10.5px]">Edizione Attiva:</span>
                    <span className="font-bold text-indigo-700 text-[11px]">
                      {giornalinoConfig.numeroEdizione} ({giornalinoConfig.totalePagine || 4} pag.)
                    </span>
                  </div>
                </div>

              </div>

            </div>

            {/* Pulsanti di Ingresso: Archivio Dati Uscite e Studio Editor DTP */}
            <div className="pt-6 space-y-2">
              <button
                id="btn-archivio-giornalino-card"
                onClick={() => onNavigaPagina('archivio_giornalino')}
                className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-950 text-xs font-bold rounded-xl border border-indigo-200 transition flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                title="Accedi all'archivio con tutte le uscite catalogate per anno e data"
              >
                <Archive className="w-4 h-4 text-indigo-700" />
                <span>Archivio Dati & Uscite ({archivioGiornalini?.length || 4} edizioni)</span>
              </button>

              <button
                id="btn-entra-giornalino"
                onClick={() => onNavigaPagina('giornalino', undefined, { tabGiornalino: 'studio' })}
                className="w-full py-3 px-4 bg-indigo-900 hover:bg-indigo-800 active:bg-black text-white text-sm font-black rounded-2xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Accedi allo Studio Editor DTP</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* FOOTER DELLA DASHBOARD */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-emerald-700" />
            <span className="font-semibold text-slate-800">{config.nome}</span>
            <span>•</span>
            <span>{config.comune} ({config.provincia})</span>
          </div>

          <div className="flex items-center gap-3 text-[11.5px]">
            <span>Architettura Unificata: Dashboard, Gestionale, Sito Web e Giornalino</span>
            <span>•</span>
            <span className="text-slate-400">Archivio Locale Sicuro</span>
          </div>
        </div>
      </footer>

      {/* MODALE DI CONFERMA CAMBIO ANNO SOCIALE */}
      {annoDaConfermare !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-sm w-full p-6 text-slate-900 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold">Cambiare Anno Sociale?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stai per passare all'anno sociale <strong>{annoDaConfermare}</strong>. Le statistiche, il libro soci e il bilancio verranno ricalcolati per questo esercizio.
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setAnnoDaConfermare(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onCambiaAnno(annoDaConfermare);
                  setAnnoDaConfermare(null);
                }}
                className="flex-1 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Conferma {annoDaConfermare}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DI CONFERMA AZZERAMENTO DATABASE */}
      {mostraConfermaAzzera && onAzzeraDatabase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative animate-in zoom-in-95">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Sei sicuro di azzerare il database?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Questa operazione cancellerà tutti i soci, le quote e gli eventi inseriti nel database locale.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setMostraConfermaAzzera(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Annulla
              </button>
              <button
                onClick={() => {
                  onAzzeraDatabase();
                  setMostraConfermaAzzera(false);
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
              >
                Sì, Azzera Tutto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DI CONFERMA REIMPOSTA DATI ESEMPIO */}
      {mostraConfermaRipristinoDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative animate-in zoom-in-95">
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Reimpostare i Dati di Esempio?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Verranno caricati gli elenchi dimostrativi completi di soci, quote, tessere ed eventi della Pro Loco.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                id="btn-annulla-reimposta-dashboard"
                onClick={() => setMostraConfermaRipristinoDemo(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                No, Annulla
              </button>
              <button
                id="btn-conferma-reimposta-dashboard"
                onClick={() => {
                  onRipristinaDemo();
                  setMostraConfermaRipristinoDemo(false);
                }}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sì, Reimposta Dati</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
