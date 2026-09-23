import React, { useState } from 'react';
import { ProLocoInfo, Socio, ProLocoEvento, SitoWebConfig, DonazioneTerzi, CampagnaRaccoltaFondi, EdizioneGiornalino } from '../types';
import { 
  Building2, 
  Calendar, 
  Download, 
  Settings, 
  Upload, 
  FileSpreadsheet, 
  Award, 
  RefreshCw, 
  Smartphone, 
  Users, 
  PartyPopper, 
  Landmark, 
  Printer, 
  Trash2, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  X, 
  Globe,
  Lock,
  Sparkles,
  ArrowLeft,
  LayoutDashboard,
  Newspaper,
  Database,
  HeartHandshake
} from 'lucide-react';
import { esportaLibroSociCSV, esportaBackupJSON, esportaBilancioCompletoCSV } from '../storage';

interface HeaderProps {
  config: ProLocoInfo;
  soci: Socio[];
  eventi: ProLocoEvento[];
  donazioni?: DonazioneTerzi[];
  sitoConfig?: SitoWebConfig;
  tabAttivo: 'soci' | 'eventi' | 'bilancio' | 'conto_terzi' | 'portale';
  annoSelezionato: number;
  onCambiaTab: (tab: 'soci' | 'eventi' | 'bilancio' | 'conto_terzi' | 'portale') => void;
  onCambiaAnno: (anno: number) => void;
  onTornaDashboard?: () => void;
  onVaiGiornalino?: () => void;
  onNuovoSocio?: () => void;
  onNuovoEvento?: () => void;
  onApriImpostazioni: () => void;
  onApriApkModal: () => void;
  onImportaBackup: (dati: { soci: Socio[]; config: ProLocoInfo; eventi?: ProLocoEvento[]; donazioni?: DonazioneTerzi[]; campagne?: CampagnaRaccoltaFondi[]; sitoConfig?: SitoWebConfig; archivioGiornalini?: EdizioneGiornalino[] }) => void;
  onRipristinaDemo: () => void;
  onApriStampaBilancio?: () => void;
  onApriStampaLibroSoci?: () => void;
  onApriStampaProgrammaEventi?: () => void;
  onAzzeraDatabase?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  soci,
  eventi,
  donazioni,
  sitoConfig,
  tabAttivo,
  annoSelezionato,
  onCambiaTab,
  onCambiaAnno,
  onTornaDashboard,
  onVaiGiornalino,
  onNuovoSocio,
  onNuovoEvento,
  onApriImpostazioni,
  onApriApkModal,
  onImportaBackup,
  onRipristinaDemo,
  onApriStampaBilancio,
  onApriStampaLibroSoci,
  onApriStampaProgrammaEventi,
  onAzzeraDatabase
}) => {
  const [mostraMenuBackup, setMostraMenuBackup] = useState(false);
  const [mostraConfermaAzzera, setMostraConfermaAzzera] = useState(false);
  const [mostraConfermaRipristinoDemo, setMostraConfermaRipristinoDemo] = useState(false);
  const [annoDaConfermare, setAnnoDaConfermare] = useState<number | null>(null);
  const [messaggioNotifica, setMessaggioNotifica] = useState<string | null>(null);
  
  // Rilevamento anno corrente del PC per impostazione automatica e lista anni
  const annoSistemaPC = new Date().getFullYear();
  const anniDisponibili = Array.from(new Set([
    annoSistemaPC + 1,
    annoSistemaPC,
    annoSistemaPC - 1,
    annoSistemaPC - 2,
    annoSistemaPC - 3,
    annoSelezionato
  ])).sort((a, b) => b - a);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.soci && Array.isArray(parsed.soci)) {
          onImportaBackup({
            soci: parsed.soci,
            config: parsed.configurazione || config,
            eventi: parsed.eventi && Array.isArray(parsed.eventi) ? parsed.eventi : undefined,
            donazioni: parsed.donazioni && Array.isArray(parsed.donazioni) ? parsed.donazioni : undefined,
            campagne: parsed.campagne && Array.isArray(parsed.campagne) ? parsed.campagne : undefined,
            sitoConfig: parsed.sitoConfig || undefined,
            archivioGiornalini: parsed.archivioGiornalini || undefined
          });
          setMostraMenuBackup(false);
        } else {
          alert('Il file selezionato non è un file di backup valido per la Pro Loco.');
        }
      } catch (err) {
        alert('Errore nella lettura del file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Riga Superiore: Logo, Info Ente e Azioni Generali */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-3 pb-2.5 gap-3">
          
          {/* Logo e Titolo Pro Loco */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-md shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  {config.nome}
                </h1>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <Award className="w-3 h-3 text-emerald-600" />
                  {config.codiceUnpli ? 'UNPLI' : 'APS Pro Loco'}
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-2">
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

          {/* Azioni di Sistema: Anno, Backup, APK, Impostazioni, Nuovo Inserimento */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Selettore Anno con indicazione anno PC e conferma cambio */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
              <select
                id="select-anno-sociale"
                value={annoSelezionato}
                onChange={(e) => {
                  const target = Number(e.target.value);
                  if (target !== annoSelezionato) {
                    setAnnoDaConfermare(target);
                  }
                }}
                aria-label="Seleziona anno sociale"
                className="bg-white border border-slate-300 text-slate-800 text-xs font-bold rounded px-2 py-1 shadow-2xs focus:outline-none cursor-pointer"
              >
                {anniDisponibili.map(anno => (
                  <option key={anno} value={anno}>
                    Anno {anno} {anno === annoSistemaPC ? '• Sistema PC' : ''}
                  </option>
                ))}
              </select>
              {annoSelezionato !== annoSistemaPC && (
                <button
                  type="button"
                  onClick={() => setAnnoDaConfermare(annoSistemaPC)}
                  title={`Torna all'anno attuale del sistema PC (${annoSistemaPC})`}
                  className="hidden md:inline-flex items-center ml-1 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded transition-colors cursor-pointer"
                >
                  PC: {annoSistemaPC}
                </button>
              )}
            </div>

            {/* Menu Backup e Database */}
            <div className="relative">
              <button
                id="btn-menu-dati"
                onClick={() => setMostraMenuBackup(!mostraMenuBackup)}
                title="Gestione Database & Backup (Soci, Eventi e Ripristino Dati Esempio)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs cursor-pointer"
              >
                <Database className="w-3.5 h-3.5 text-emerald-700" />
                <span>Database</span>
              </button>

              {mostraMenuBackup && (
                <div 
                  className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setMostraMenuBackup(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Database Pro Loco
                  </div>
                  <button
                    onClick={() => {
                      esportaBackupJSON(soci, config, eventi, donazioni);
                      setMostraMenuBackup(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-600" />
                    <span>Scarica Backup Completo (JSON)</span>
                  </button>
                  <button
                    onClick={() => {
                      esportaLibroSociCSV(soci, annoSelezionato);
                      setMostraMenuBackup(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Esporta Libro Soci (CSV)</span>
                  </button>
                  <button
                    onClick={() => {
                      esportaBilancioCompletoCSV(soci, eventi, config, annoSelezionato);
                      setMostraMenuBackup(false);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-teal-600" />
                    <span>Esporta Bilancio Unificato (CSV)</span>
                  </button>
                  <label className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-sky-600" />
                    <span>Ripristina da File Backup</span>
                    <input 
                      type="file" 
                      accept=".json" 
                      onChange={handleFileUpload} 
                      className="hidden" 
                    />
                  </label>
                  <div className="my-1 border-t border-slate-100"></div>
                  <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400">
                    Stampe Ufficiali A4
                  </div>
                  {onApriStampaLibroSoci && (
                    <button
                      onClick={() => {
                        onApriStampaLibroSoci();
                        setMostraMenuBackup(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-emerald-600" />
                      <span>Stampa Libro dei Soci (A4)</span>
                    </button>
                  )}
                  {onApriStampaProgrammaEventi && (
                    <button
                      onClick={() => {
                        onApriStampaProgrammaEventi();
                        setMostraMenuBackup(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-teal-600" />
                      <span>Stampa Programma Eventi (A4)</span>
                    </button>
                  )}
                  {onApriStampaBilancio && (
                    <button
                      onClick={() => {
                        onApriStampaBilancio();
                        setMostraMenuBackup(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-100 flex items-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4 text-emerald-700" />
                      <span>Stampa Bilancio Terzo Settore (A4)</span>
                    </button>
                  )}

                  <div className="my-1 border-t border-slate-100"></div>
                  <button
                    id="btn-reimposta-dati-esempio-menu"
                    type="button"
                    onClick={() => {
                      setMostraMenuBackup(false);
                      setMostraConfermaRipristinoDemo(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-amber-800 hover:bg-amber-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-600" />
                    <span>Reimposta Dati Esempio</span>
                  </button>

                  <div className="my-1 border-t border-rose-100"></div>
                  <button
                    id="btn-azzera-database-menu"
                    type="button"
                    onClick={() => {
                      setMostraMenuBackup(false);
                      setMostraConfermaAzzera(true);
                    }}
                    className="w-full text-left px-3 py-2 text-xs text-rose-700 hover:bg-rose-50 flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-semibold">Azzera Tutto il Database</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pulsante App Android / APK */}
            <button
              id="btn-apri-apk-modal"
              onClick={onApriApkModal}
              title="Installa App su Android o Scarica file APK"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors shadow-2xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-700" />
              <span>App Android</span>
            </button>

            {/* Impostazioni Pro Loco */}
            <button
              id="btn-impostazioni-proloco"
              onClick={onApriImpostazioni}
              title="Configurazione Associazione e Quote"
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Azioni di Stampa Rapida A4 per ogni Sezione Attiva */}
            {tabAttivo === 'soci' && onApriStampaLibroSoci && (
              <button
                id="btn-stampa-soci-header"
                onClick={onApriStampaLibroSoci}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg shadow-sm transition-colors cursor-pointer"
                title="Stampa Ufficiale Libro dei Soci A4"
              >
                <Printer className="w-4 h-4" />
                <span>Stampa Libro Soci A4</span>
              </button>
            )}

            {tabAttivo === 'eventi' && onApriStampaProgrammaEventi && (
              <button
                id="btn-stampa-eventi-header"
                onClick={onApriStampaProgrammaEventi}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-700 hover:bg-teal-800 active:bg-teal-900 rounded-lg shadow-sm transition-colors cursor-pointer"
                title="Stampa Calendario & Programma Eventi A4"
              >
                <Printer className="w-4 h-4" />
                <span>Stampa Programma Eventi A4</span>
              </button>
            )}

            {tabAttivo === 'bilancio' && onApriStampaBilancio && (
              <button
                id="btn-stampa-bilancio-header"
                onClick={onApriStampaBilancio}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg shadow-sm transition-colors cursor-pointer"
                title="Stampa Rendiconto A4 Ufficiale per Assemblea dei Soci"
              >
                <Printer className="w-4 h-4" />
                <span>Stampa Bilancio A4</span>
              </button>
            )}

          </div>

        </div>

        {/* Riga Inferiore: Schede di Navigazione Primarie dell'Associazione */}
        <div className="flex items-center gap-2 pt-1 overflow-x-auto no-scrollbar">
          
          {/* Tasto Ritorno alla Dashboard Principale */}
          {onTornaDashboard && (
            <button
              id="tab-nav-torna-dashboard"
              onClick={onTornaDashboard}
              title="Torna alla Dashboard Generale con i tre moduli"
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-black text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer shrink-0 mr-1"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-700" />
              <span>← Dashboard</span>
            </button>
          )}

          <button
            id="tab-nav-soci"
            onClick={() => onCambiaTab('soci')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              tabAttivo === 'soci'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>1.1 Albo & Libro Soci</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tabAttivo === 'soci' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {soci.length}
            </span>
          </button>

          <button
            id="tab-nav-eventi"
            onClick={() => onCambiaTab('eventi')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              tabAttivo === 'eventi'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <PartyPopper className="w-4 h-4" />
            <span>1.2 Calendario & Gestione Eventi</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tabAttivo === 'eventi' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {eventi.length}
            </span>
          </button>

          <button
            id="tab-nav-bilancio"
            onClick={() => onCambiaTab('bilancio')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              tabAttivo === 'bilancio'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>1.3 Bilancio Generale</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tabAttivo === 'bilancio' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Quote + Eventi
            </span>
          </button>

          {/* 1.4 DONAZIONI CONTO TERZI */}
          <button
            id="tab-nav-conto-terzi"
            onClick={() => onCambiaTab('conto_terzi')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer shrink-0 ${
              tabAttivo === 'conto_terzi'
                ? 'border-emerald-700 text-emerald-800 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            <span>1.4 Donazioni & Erogazioni Liberali</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tabAttivo === 'conto_terzi' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
            }`}>
              Art. 83 CTS
            </span>
          </button>
        </div>

      </div>

      {/* MODALE DI CONFERMA AZZERAMENTO DATABASE (Sicuro? Sì / No) */}
      {mostraConfermaAzzera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative animate-in zoom-in-95 duration-150">
            
            {/* Intestazione Avviso */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Azzera Tutto il Database
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Archivio Pro Loco • Procedura irreversibile
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostraConfermaAzzera(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo con Dettagli della Cancellazione */}
            <div className="space-y-3 mb-6">
              <div className="bg-rose-50 border border-rose-200/80 rounded-xl p-3.5 text-xs text-rose-950 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-rose-900">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Attenzione: tutti i seguenti record verranno eliminati:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11.5px] text-rose-800 pl-1">
                  <li>Tutti i <strong>soci iscritti</strong> e le relative schede anagrafiche</li>
                  <li>Tutte le <strong>quote associative</strong> e le ricevute emesse</li>
                  <li>Tutti gli <strong>eventi</strong>, locandine, bilanci e assegnazioni volontari</li>
                </ul>
              </div>

              {/* Riquadro con domanda esplicita Sicuro? Sì / No */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-800">
                  Sei sicuro di voler azzerare l'intero database?
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  Specifica di conferma richiesta: <span className="font-bold text-rose-600">"Sì / No"</span>
                </p>
              </div>
            </div>

            {/* Pulsanti di scelta Sicuro? Sì / No */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                id="btn-conferma-no-azzera"
                type="button"
                onClick={() => setMostraConfermaAzzera(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                No, Annulla
              </button>
              <button
                id="btn-conferma-si-azzera"
                type="button"
                onClick={() => {
                  if (onAzzeraDatabase) {
                    onAzzeraDatabase();
                  }
                  setMostraConfermaAzzera(false);
                  setMessaggioNotifica('Database azzerato con successo: tutti i soci ed eventi sono stati eliminati.');
                  setTimeout(() => setMessaggioNotifica(null), 4500);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 active:bg-rose-800 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sì, Azzera Tutto</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODALE DI CONFERMA REIMPOSTA DATI ESEMPIO ("Sicuro reimposta dati esempio? Sì / No") */}
      {mostraConfermaRipristinoDemo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative animate-in zoom-in-95 duration-150">
            
            {/* Intestazione Avviso */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Reimposta Dati Esempio
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Database Pro Loco • Dati dimostrativi predefiniti
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMostraConfermaRipristinoDemo(false)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corpo con Dettagli del Ripristino */}
            <div className="space-y-3 mb-6">
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950 space-y-2">
                <p className="font-bold flex items-center gap-1.5 text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Cosa succederà confermando l'operazione:</span>
                </p>
                <ul className="list-disc list-inside space-y-1 text-[11.5px] text-amber-900 pl-1">
                  <li>Verranno caricati gli <strong>anagrafici dei soci di esempio</strong> con quote e tessere dimostrative</li>
                  <li>Verrà ripristinato il <strong>calendario manifestazioni ed eventi</strong> tipici della Pro Loco</li>
                  <li>Verranno ripristinate le <strong>impostazioni societarie predefinite</strong></li>
                </ul>
              </div>

              {/* Riquadro con domanda esplicita Sicuro? Sì / No */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-center">
                <p className="text-xs font-bold text-slate-800">
                  Sei sicuro di voler reimpostare i dati dimostrativi di esempio?
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  I dati attualmente presenti verranno sovrascritti dai dati demo.
                </p>
              </div>
            </div>

            {/* Pulsanti di scelta Sicuro? Sì / No */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                id="btn-annulla-reimposta-demo"
                type="button"
                onClick={() => setMostraConfermaRipristinoDemo(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                No, Annulla
              </button>
              <button
                id="btn-conferma-reimposta-demo"
                type="button"
                onClick={() => {
                  onRipristinaDemo();
                  setMostraConfermaRipristinoDemo(false);
                  setMessaggioNotifica('Dati dimostrativi di esempio ripristinati con successo!');
                  setTimeout(() => setMessaggioNotifica(null), 4000);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sì, Reimposta Dati</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODALE DI CONFERMA CAMBIO ANNO ("Sicuro cambio anno? Sì / No") */}
      {annoDaConfermare !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative animate-in zoom-in-95 duration-150">
            
            {/* Intestazione */}
            <div className="flex items-start gap-3.5 mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Cambio Anno di Riferimento
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Archivio Pro Loco • Filtro temporale gestionale
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAnnoDaConfermare(null)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                title="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Domanda esplicita e dettagli */}
            <div className="space-y-3 mb-6">
              <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-xl text-center space-y-2">
                <p className="text-sm sm:text-base font-bold text-slate-900">
                  Sicuro cambio anno?
                </p>
                <div className="flex items-center justify-center gap-2 text-xs font-semibold pt-1">
                  <span className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 rounded-lg shadow-2xs">
                    Anno attuale: <strong>{annoSelezionato}</strong>
                  </span>
                  <span className="text-blue-500 font-bold">➔</span>
                  <span className="px-2.5 py-1 bg-blue-600 text-white rounded-lg shadow-2xs font-bold">
                    Nuovo anno: <strong>{annoDaConfermare}</strong>
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed text-center px-1">
                Passando all'anno <strong>{annoDaConfermare}</strong> verranno mostrati i rinnovi delle quote, i registri soci, le ricevute e gli eventi di tale annualità.
              </p>
            </div>

            {/* Scelta Sì / No */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                id="btn-annulla-cambio-anno-no"
                type="button"
                onClick={() => setAnnoDaConfermare(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors cursor-pointer"
              >
                No
              </button>
              <button
                id="btn-conferma-cambio-anno-si"
                type="button"
                onClick={() => {
                  const nuovo = annoDaConfermare;
                  onCambiaAnno(nuovo);
                  setAnnoDaConfermare(null);
                  setMessaggioNotifica(`Anno di riferimento impostato al ${nuovo}`);
                  setTimeout(() => setMessaggioNotifica(null), 3500);
                }}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sì</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Banner / Toast di Notifica Azzeramento / Cambio Anno */}
      {messaggioNotifica && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{messaggioNotifica}</span>
          <button 
            type="button"
            onClick={() => setMessaggioNotifica(null)}
            className="ml-2 text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </header>
  );
};
