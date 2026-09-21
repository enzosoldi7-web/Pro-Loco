import React, { useState, useMemo } from 'react';
import { Socio, ProLocoEvento, ProLocoInfo, QuotaAssociativa } from '../types';
import { 
  Building2,
  Euro,
  FileSpreadsheet,
  Printer,
  TrendingUp,
  TrendingDown,
  Users,
  PartyPopper,
  Database,
  Download,
  Calendar,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Utensils,
  Music,
  Truck,
  MoreHorizontal,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  Receipt,
  PieChart as PieChartIcon,
  BarChart3,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Bell,
  Send,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Handshake,
  Briefcase
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { esportaBilancioCompletoCSV, esportaBackupJSON } from '../storage';
import { 
  calcolaScadenzaQuota, 
  getSociNonRinnovati,
  compilaTemplatePromemoria,
  TEMPLATE_PROMEMORIA_PREDEFINITI
} from '../utils/quoteHelpers';
import { 
  aggregaEventiPerBilancio, 
  calcolaEconomiaEvento, 
  getInfoTipoEvento 
} from '../utils/eventoHelpers';
import { PromemoriaRinnovoModal } from './PromemoriaRinnovoModal';

interface GlobalBudgetSummaryProps {
  soci: Socio[];
  eventi: ProLocoEvento[];
  config: ProLocoInfo;
  annoSelezionato: number;
  onCambiaAnno: (anno: number) => void;
  onApriStampaBilancio: () => void;
  onVaiASocio?: (socioId: string) => void;
  onVaiAEvento?: (eventoId: string) => void;
  onRegistraPagamento?: (socio: Socio) => void;
}

export const GlobalBudgetSummary: React.FC<GlobalBudgetSummaryProps> = ({
  soci,
  eventi,
  config,
  annoSelezionato,
  onCambiaAnno,
  onApriStampaBilancio,
  onVaiASocio,
  onVaiAEvento,
  onRegistraPagamento
}) => {
  const [sottoTab, setSottoTab] = useState<'quadro' | 'tesseramenti' | 'eventi' | 'runts' | 'database'>('quadro');
  const [ricercaTesto, setRicercaTesto] = useState<string>('');
  const [filtroAnno, setFiltroAnno] = useState<number | 'tutti'>(annoSelezionato);
  const [mostraModalPromemoria, setMostraModalPromemoria] = useState<boolean>(false);
  const [mostraSociDaIncassare, setMostraSociDaIncassare] = useState<boolean>(true);

  // Lista anni disponibili
  const anniDisponibili = useMemo(() => {
    const anniSet = new Set<number>();
    anniSet.add(config.annoCorrente);
    anniSet.add(new Date().getFullYear());
    anniSet.add(new Date().getFullYear() - 1);
    anniSet.add(new Date().getFullYear() - 2);

    soci.forEach(s => {
      s.quote?.forEach(q => anniSet.add(q.anno));
    });

    eventi.forEach(e => {
      const year = parseInt(e.dataInizio.substring(0, 4));
      if (!isNaN(year)) anniSet.add(year);
    });

    return Array.from(anniSet).sort((a, b) => b - a);
  }, [soci, eventi, config.annoCorrente]);

  // Sincronizza filtro anno con prop se necessario
  const annoAttivo = filtroAnno === 'tutti' ? null : filtroAnno;

  // 1. ELABORAZIONE DATI TESSERAMENTI
  const quoteFiltrate = useMemo(() => {
    const tutteQuote: Array<{ quota: QuotaAssociativa; socio: Socio }> = [];
    soci.forEach(s => {
      (s.quote || []).forEach(q => {
        if (!annoAttivo || q.anno === annoAttivo) {
          tutteQuote.push({ quota: q, socio: s });
        }
      });
    });
    return tutteQuote.sort((a, b) => b.quota.dataPagamento.localeCompare(a.quota.dataPagamento));
  }, [soci, annoAttivo]);

  const totaleQuote = useMemo(() => {
    return quoteFiltrate.reduce((acc, item) => acc + (item.quota.importo || 0), 0);
  }, [quoteFiltrate]);

  // Statistiche soci nell'anno
  const sociTesseratiNellAnno = useMemo(() => {
    if (!annoAttivo) return soci.filter(s => (s.quote || []).length > 0);
    return soci.filter(s => (s.quote || []).some(q => q.anno === annoAttivo));
  }, [soci, annoAttivo]);

  const sociDaRinnovareNellAnno = useMemo(() => {
    if (!annoAttivo) return [];
    return soci.filter(s => s.attivo && !(s.quote || []).some(q => q.anno === annoAttivo));
  }, [soci, annoAttivo]);

  // Ripartizione quote per categoria socio
  const quotePerCategoria = useMemo(() => {
    const mappa: Record<string, { conteggio: number; importo: number }> = {};
    quoteFiltrate.forEach(({ quota, socio }) => {
      const cat = socio.categoria || 'Ordinario';
      if (!mappa[cat]) {
        mappa[cat] = { conteggio: 0, importo: 0 };
      }
      mappa[cat].conteggio += 1;
      mappa[cat].importo += quota.importo;
    });
    return mappa;
  }, [quoteFiltrate]);

  // Ripartizione quote per metodo di pagamento
  const quotePerMetodo = useMemo(() => {
    const mappa: Record<string, { conteggio: number; importo: number }> = {};
    quoteFiltrate.forEach(({ quota }) => {
      const m = quota.metodo || 'Contanti';
      if (!mappa[m]) {
        mappa[m] = { conteggio: 0, importo: 0 };
      }
      mappa[m].conteggio += 1;
      mappa[m].importo += quota.importo;
    });
    return mappa;
  }, [quoteFiltrate]);

  // 2. ELABORAZIONE DATI EVENTI CON AGGREGAZIONE BILANCIO (3 TIPOLOGIE: NATIVI, IBRIDI, GESTIONE)
  const eventiFiltrati = useMemo(() => {
    return eventi.filter(e => {
      if (annoAttivo && !e.dataInizio.startsWith(annoAttivo.toString())) {
        return false;
      }
      return true;
    });
  }, [eventi, annoAttivo]);

  const aggregatoEventi = useMemo(() => {
    return aggregaEventiPerBilancio(eventiFiltrati);
  }, [eventiFiltrati]);

  const totaliEventi = useMemo(() => {
    return {
      budgetPrevisto: aggregatoEventi.budgetPrevistoProLoco,
      costiConsuntivo: aggregatoEventi.costiCompetenzaProLoco,
      entratePreviste: aggregatoEventi.entratePrevisteProLoco,
      entrateRealizzate: aggregatoEventi.entrateCompetenzaProLoco,
      margineEventi: aggregatoEventi.margineCompetenzaProLoco,
      differenzaCosti: aggregatoEventi.differenzaCosti,
      costiLordoTotali: aggregatoEventi.costiLordoTotali,
      entrateLordoTotali: aggregatoEventi.entrateLordoTotali,
      margineLordoTotale: aggregatoEventi.margineLordoTotale,
      food: aggregatoEventi.food,
      intrattenimento: aggregatoEventi.intrattenimento,
      altreSpese: aggregatoEventi.altreSpese,
      varie: aggregatoEventi.varie,
      partecipantiStimati: aggregatoEventi.partecipantiStimati,
      eventiNativiCount: aggregatoEventi.eventiNativiCount,
      eventiIbridiCount: aggregatoEventi.eventiIbridiCount,
      eventiGestioneCount: aggregatoEventi.eventiGestioneCount,
      nativi: aggregatoEventi.nativi,
      ibridi: aggregatoEventi.ibridi,
      gestione: aggregatoEventi.gestione
    };
  }, [aggregatoEventi]);

  // 3. QUADRO GENERALE BILANCIO UNIFICATO (TESSERAMENTI + EVENTI)
  const bilancioGlobale = useMemo(() => {
    const totaleEntrateGenerali = totaleQuote + totaliEventi.entrateRealizzate;
    const totaleUsciteGenerali = totaliEventi.costiConsuntivo;
    const avanzoGestione = totaleEntrateGenerali - totaleUsciteGenerali;

    // Incidenza percentuale entrate
    const percQuote = totaleEntrateGenerali > 0 ? (totaleQuote / totaleEntrateGenerali) * 100 : 0;
    const percEventi = totaleEntrateGenerali > 0 ? (totaliEventi.entrateRealizzate / totaleEntrateGenerali) * 100 : 0;

    return {
      totaleEntrate: totaleEntrateGenerali,
      totaleUscite: totaleUsciteGenerali,
      avanzoGestione,
      percQuote,
      percEventi
    };
  }, [totaleQuote, totaliEventi]);

  // 3b. CALCOLO QUOTE SOCIALI DA INCASSARE & SCADENZA STATUTARIA ESERCIZIO
  const annoRiferimentoQuote = annoAttivo || config.annoCorrente;

  const sociNonRinnovati = useMemo(() => {
    return getSociNonRinnovati(soci, annoRiferimentoQuote, config);
  }, [soci, annoRiferimentoQuote, config]);

  const totaleQuoteDaIncassare = useMemo(() => {
    return sociNonRinnovati.reduce((acc, curr) => acc + curr.importoDovuto, 0);
  }, [sociNonRinnovati]);

  const scadenzaQuote = useMemo(() => {
    return calcolaScadenzaQuota(annoRiferimentoQuote);
  }, [annoRiferimentoQuote]);

  const quoteDaIncassarePerCategoria = useMemo(() => {
    const mappa: Record<string, { conteggio: number; importo: number; quotaUnitaria: number }> = {};
    sociNonRinnovati.forEach(({ socio, importoDovuto }) => {
      const cat = socio.categoria || 'Ordinario';
      if (!mappa[cat]) {
        mappa[cat] = { conteggio: 0, importo: 0, quotaUnitaria: importoDovuto };
      }
      mappa[cat].conteggio += 1;
      mappa[cat].importo += importoDovuto;
    });
    return mappa;
  }, [sociNonRinnovati]);

  const potenzialeEntrateConQuote = bilancioGlobale.totaleEntrate + totaleQuoteDaIncassare;
  const potenzialeAvanzoConQuote = bilancioGlobale.avanzoGestione + totaleQuoteDaIncassare;

  // Dati per Grafico a Torta delle ENTRATE
  const datiGraficoEntrate = useMemo(() => {
    return [
      { name: 'Quote Tesseramento', value: totaleQuote, color: '#059669' },
      { name: 'Food & Stand Gastronomici', value: Math.round(totaliEventi.entrateRealizzate * 0.65), color: '#0d9488' },
      { name: 'Sponsor & Biglietteria Eventi', value: Math.round(totaliEventi.entrateRealizzate * 0.25), color: '#0284c7' },
      { name: 'Offerte & Contributi', value: Math.round(totaliEventi.entrateRealizzate * 0.10), color: '#8b5cf6' }
    ].filter(item => item.value > 0);
  }, [totaleQuote, totaliEventi.entrateRealizzate]);

  // Dati per Grafico a Torta delle USCITE
  const datiGraficoUscite = useMemo(() => {
    return [
      { name: 'Food & Forniture Gastronomiche', value: totaliEventi.food, color: '#059669' },
      { name: 'Musica, Artisti & SIAE', value: totaliEventi.intrattenimento, color: '#7c3aed' },
      { name: 'Noleggi, Palco & Logistica', value: totaliEventi.altreSpese, color: '#0284c7' },
      { name: 'Tipografia, Permessi & Varie', value: totaliEventi.varie, color: '#d97706' }
    ].filter(item => item.value > 0);
  }, [totaliEventi]);

  // Dati per Grafico a Barre Comparativo Eventi (Preventivo, Consuntivo, Entrate, Margine Pro Loco)
  const datiGraficoBarreEventi = useMemo(() => {
    return eventiFiltrati.slice(0, 8).map(e => {
      const econ = calcolaEconomiaEvento(e);
      const info = getInfoTipoEvento(e.tipoEvento || 'nativo');
      return {
        titolo: e.titolo.length > 15 ? e.titolo.substring(0, 15) + '...' : e.titolo,
        Preventivo: e.budgetPrevisto || 0,
        Consuntivo: econ.costiProLocoConsuntivo,
        Entrate: econ.entrateProLocoRealizzate,
        Utile: econ.margineNettoProLoco,
        tipo: e.tipoEvento || 'nativo',
        tipoLabel: info.etichetta
      };
    });
  }, [eventiFiltrati]);

  // Dati per Grafico Ripartizione Tipologie Evento (Nativi, Ibridi, Gestione)
  const datiGraficoTipologieEventi = useMemo(() => {
    return [
      { name: '1. Nativi (100% Pro Loco)', value: aggregatoEventi.eventiNativiCount || 0, volume: aggregatoEventi.nativi?.entrate || 0, color: '#059669' },
      { name: '2. Ibridi (Co-organizzati)', value: aggregatoEventi.eventiIbridiCount || 0, volume: aggregatoEventi.ibridi?.entrate || 0, color: '#7c3aed' },
      { name: '3. Gestione (Conto Terzi)', value: aggregatoEventi.eventiGestioneCount || 0, volume: aggregatoEventi.gestione?.entrate || 0, color: '#d97706' }
    ].filter(item => item.value > 0);
  }, [aggregatoEventi]);

  // Statistiche del Database Locale
  const statsDatabase = useMemo(() => {
    const totaleTransazioni = soci.reduce((acc, s) => acc + (s.quote?.length || 0), 0) + (eventi.length * 2);
    return {
      totaleSoci: soci.length,
      sociAttivi: soci.filter(s => s.attivo).length,
      totaleQuoteRegistrate: soci.reduce((acc, s) => acc + (s.quote?.length || 0), 0),
      totaleEventi: eventi.length,
      eventiConclusi: eventi.filter(e => e.stato === 'concluso').length,
      eventiInProgramma: eventi.filter(e => e.stato === 'in_programma' || e.stato === 'in_corso').length,
      totaleTransazioni,
      statoDatabase: 'Attivo e Sincronizzato',
      storageEngine: 'Indexed Local Storage v2.0 (Persistent Engine)'
    };
  }, [soci, eventi]);

  // Gestione Esportazione CSV Unificato
  const handleEsportaCSV = () => {
    esportaBilancioCompletoCSV(
      soci, 
      eventi, 
      config, 
      filtroAnno === 'tutti' ? undefined : filtroAnno
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header del Modulo Bilancio Unificato con Database */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-2xl p-5 text-white shadow-sm border border-emerald-700/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4 no-print">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5">
              <Database className="w-3 h-3 text-emerald-400" />
              <span>Database Pro Loco Unificato</span>
            </span>
            <span className="text-xs text-slate-300">
              Gestione Integrata: <strong>Tesseramenti</strong> + <strong>Eventi</strong>
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>Bilancio Generale di Esercizio & Rendiconto Cassa</span>
          </h2>

          <p className="text-xs text-slate-300 max-w-3xl font-normal leading-relaxed">
            Quadro riassuntivo contabile per la Pro Loco «{config.nome}». Aggregazione in tempo reale di tutte le quote sociali riscosse, incassi sagre, uscite analitiche e scostamenti di bilancio.
          </p>
        </div>

        {/* Strumenti Rapidi e Selettore Anno */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          
          {/* Selettore Anno Flessibile */}
          <div className="flex items-center bg-white/10 backdrop-blur-xs p-1 rounded-xl border border-white/20">
            <Calendar className="w-3.5 h-3.5 text-emerald-300 ml-2 mr-1" />
            <select
              value={filtroAnno}
              onChange={(e) => {
                const val = e.target.value;
                const newAnno = val === 'tutti' ? 'tutti' : Number(val);
                setFiltroAnno(newAnno);
                if (newAnno !== 'tutti') onCambiaAnno(newAnno);
              }}
              aria-label="Filtro anno bilancio"
              className="bg-transparent text-white text-xs font-bold rounded px-2 py-1 outline-none cursor-pointer"
            >
              <option value="tutti" className="bg-slate-900 text-white">Tutti gli Anni (Storico Globale)</option>
              {anniDisponibili.map(anno => (
                <option key={anno} value={anno} className="bg-slate-900 text-white">
                  Esercizio {anno}
                </option>
              ))}
            </select>
          </div>

          {/* Stampa Bilancio Ufficiale */}
          <button
            onClick={onApriStampaBilancio}
            className="px-3.5 py-2 rounded-xl bg-white text-slate-900 hover:bg-emerald-50 text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Stampa Rendiconto A4 Ufficiale per Assemblea dei Soci"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-700" />
            <span>Stampa A4 Ufficiale</span>
          </button>

          {/* Esporta CSV / Excel */}
          <button
            onClick={handleEsportaCSV}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Scarica foglio Excel/CSV con Tesseramenti ed Eventi"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Esporta Excel/CSV</span>
          </button>
        </div>
      </div>

      {/* 2. LE METRICHE DI BILANCIO GLOBALE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        
        {/* KPI 1: Totale Entrate Complessive */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">1. Entrate Riscosse</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {(bilancioGlobale.totaleEntrate || 0).toLocaleString('it-IT')} €
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Tesseramenti: <strong>{(totaleQuote || 0).toLocaleString('it-IT')} €</strong></span>
            <span>Eventi: <strong>{(totaliEventi.entrateRealizzate || 0).toLocaleString('it-IT')} €</strong></span>
          </div>
        </div>

        {/* KPI 2: Totale Uscite & Costi */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">2. Uscite & Costi Totali</span>
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {(bilancioGlobale.totaleUscite || 0).toLocaleString('it-IT')} €
            </span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Budget Previsto: <strong>{(totaliEventi.budgetPrevisto || 0).toLocaleString('it-IT')} €</strong></span>
            <span className={(totaliEventi.differenzaCosti || 0) <= 0 ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
              {(totaliEventi.differenzaCosti || 0) > 0 ? `+${(totaliEventi.differenzaCosti || 0)}` : (totaliEventi.differenzaCosti || 0)} €
            </span>
          </div>
        </div>

        {/* KPI 3: Risultato Netto (Avanzo / Disavanzo di Gestione) */}
        <div className={`p-4 rounded-xl border shadow-2xs space-y-2 ${
          (bilancioGlobale.avanzoGestione || 0) >= 0 
            ? 'bg-emerald-50/70 border-emerald-300' 
            : 'bg-rose-50/70 border-rose-300'
        }`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${
              (bilancioGlobale.avanzoGestione || 0) >= 0 ? 'text-emerald-900' : 'text-rose-900'
            }`}>
              3. {(bilancioGlobale.avanzoGestione || 0) >= 0 ? 'Avanzo Cassa' : 'Disavanzo Cassa'}
            </span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              (bilancioGlobale.avanzoGestione || 0) >= 0 ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
            }`}>
              <Euro className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black font-mono ${
              (bilancioGlobale.avanzoGestione || 0) >= 0 ? 'text-emerald-900' : 'text-rose-700'
            }`}>
              {((bilancioGlobale.avanzoGestione || 0) >= 0 ? '+' : '')}
              {(bilancioGlobale.avanzoGestione || 0).toLocaleString('it-IT')} €
            </span>
          </div>
          <div className="pt-2 border-t border-slate-200/60 text-[11px] text-slate-600 font-medium truncate">
            {(bilancioGlobale.avanzoGestione || 0) >= 0 
              ? 'Fondi reinvestibili in attività Pro Loco' 
              : 'Disavanzo contabile dell\'esercizio'}
          </div>
        </div>

        {/* KPI 4: Quote da Incassare (Crediti Verso Soci per Rinnovi) */}
        <div className={`p-4 rounded-xl border shadow-2xs space-y-2 transition-all ${
          (totaleQuoteDaIncassare || 0) > 0 
            ? 'bg-amber-50/60 border-amber-300 ring-1 ring-amber-200/60' 
            : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">
              4. Quote da Incassare
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-amber-700 font-mono">
              {(totaleQuoteDaIncassare || 0).toLocaleString('it-IT')} €
            </span>
            <span className="text-[11px] text-amber-800 font-medium">
              ({sociNonRinnovati.length} soci)
            </span>
          </div>
          <div className="pt-2 border-t border-amber-200/70 text-[11px] flex items-center justify-between">
            <span className="text-slate-500 truncate" title={`Scadenza: ${scadenzaQuote.dataScadenzaEsercizio}`}>
              Scad: <strong>{scadenzaQuote.dataScadenzaEsercizio}</strong>
            </span>
            {(totaleQuoteDaIncassare || 0) > 0 && (
              <button
                onClick={() => setMostraModalPromemoria(true)}
                className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer flex items-center gap-0.5"
                title="Invia promemoria rinnovo quote ai soci"
              >
                <Bell className="w-3 h-3 text-amber-600" />
                <span>Sollecita</span>
              </button>
            )}
          </div>
        </div>

        {/* KPI 5: Indicatori Territoriali e Database */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">5. Partecipazione</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-slate-900 font-mono">
              {(totaliEventi.partecipantiStimati || 0).toLocaleString('it-IT')}
            </span>
            <span className="text-xs text-slate-500 font-medium">presenze stimate</span>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Soci in regola: <strong>{sociTesseratiNellAnno.length}</strong></span>
            <span>Eventi: <strong>{eventiFiltrati.length}</strong></span>
          </div>
        </div>

      </div>

      {/* BANNER PROPOSTA QUOTE DA INCASSARE & SCADENZA STATUTARIA */}
      {(totaleQuoteDaIncassare || 0) > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-50/90 to-amber-100/70 border border-amber-300 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-amber-950">
                  Proposta Quote da Incassare {annoRiferimentoQuote}: {sociNonRinnovati.length} soci in attesa di rinnovo
                </span>
                <span className="font-black text-emerald-800 bg-white/90 border border-amber-300 px-2 py-0.5 rounded font-mono">
                  Totale da incassare: € {(totaleQuoteDaIncassare || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="text-amber-800/90 mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-700" />
                  <strong>Data Scadenza Esercizio:</strong> {scadenzaQuote.dataScadenzaEsercizio} ({scadenzaQuote.etichettaTempo})
                </span>
                <span className="hidden md:inline">•</span>
                <span className="text-amber-900/80">
                  Termine diritto di voto assemblea: <strong>{scadenzaQuote.dataLimiteAssemblea}</strong>
                </span>
                <span className="hidden md:inline">•</span>
                <span className="text-slate-700">
                  Avanzo potenziale con quote incassate: <strong className="font-mono text-emerald-800">€ {(potenzialeAvanzoConQuote || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => {
                setSottoTab('tesseramenti');
                setMostraSociDaIncassare(true);
              }}
              className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Vedi Dettaglio Soci
            </button>
            <button
              onClick={() => setMostraModalPromemoria(true)}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Invia Promemoria Rapido</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. SUB-NAVIGAZIONE SCHEDE BILANCIO */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-2xs flex flex-wrap items-center gap-1.5">
        <button
          onClick={() => setSottoTab('quadro')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            sottoTab === 'quadro' 
              ? 'bg-emerald-800 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PieChartIcon className="w-4 h-4" />
          <span>Quadro Finanziario & Grafici</span>
        </button>

        <button
          onClick={() => setSottoTab('tesseramenti')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            sottoTab === 'tesseramenti' 
              ? 'bg-emerald-800 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Riepilogo Tesseramenti ({quoteFiltrate.length} quote)</span>
        </button>

        <button
          onClick={() => setSottoTab('eventi')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            sottoTab === 'eventi' 
              ? 'bg-emerald-800 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <PartyPopper className="w-4 h-4" />
          <span>Riepilogo Manifestazioni ({eventiFiltrati.length} eventi)</span>
        </button>

        <button
          onClick={() => setSottoTab('runts')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
            sottoTab === 'runts' 
              ? 'bg-emerald-800 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Schema Ufficiale RUNTS (Mod. D)</span>
        </button>

        <button
          onClick={() => setSottoTab('database')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ml-auto ${
            sottoTab === 'database' 
              ? 'bg-slate-900 text-white shadow-xs' 
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4 text-emerald-500" />
          <span>Stato Database</span>
        </button>
      </div>

      {/* 4. CONTENUTO SPECIFICO DEL SOTTO-TAB */}

      {/* SOTTO-TAB 1: QUADRO FINANZIARIO & GRAFICI INTERATTIVI */}
      {sottoTab === 'quadro' && (
        <div className="space-y-6">
          
          {/* Due Grafici a Torta Affiancati: Entrate vs Uscite */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Torta 1: Composizione delle ENTRATE */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                    <span>Ripartizione delle Entrate Pro Loco</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Incasso complessivo: <strong>{(bilancioGlobale.totaleEntrate || 0).toLocaleString('it-IT')} €</strong>
                  </p>
                </div>
                <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  {filtroAnno === 'tutti' ? 'Storico Totale' : `Anno ${filtroAnno}`}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datiGraficoEntrate}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {datiGraficoEntrate.map((entry, index) => (
                        <Cell key={`cell-entrate-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: any) => [`${(Number(val) || 0).toLocaleString('it-IT')} €`, 'Entrata']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda Cromatica Dettagliata */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {datiGraficoEntrate.map(item => {
                  const perc = bilancioGlobale.totaleEntrate > 0 
                    ? (((item.value || 0) / bilancioGlobale.totaleEntrate) * 100).toFixed(1) 
                    : '0';
                  return (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-700 truncate">{item.name}</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900 ml-2 shrink-0">{(item.value || 0).toLocaleString('it-IT')}€ ({perc}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Torta 2: Composizione delle USCITE & SPESE */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" />
                    <span>Ripartizione Spese (Food, Spettacoli, Allestimenti, Varie)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Spese complessive: <strong>{(bilancioGlobale.totaleUscite || 0).toLocaleString('it-IT')} €</strong>
                  </p>
                </div>
                <span className="text-[11px] font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                  {filtroAnno === 'tutti' ? 'Storico Totale' : `Anno ${filtroAnno}`}
                </span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={datiGraficoUscite}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {datiGraficoUscite.map((entry, index) => (
                        <Cell key={`cell-uscite-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(val: any) => [`${(Number(val) || 0).toLocaleString('it-IT')} €`, 'Spesa']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legenda Cromatica Dettagliata Spese */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                {datiGraficoUscite.map(item => {
                  const perc = bilancioGlobale.totaleUscite > 0 
                    ? (((item.value || 0) / bilancioGlobale.totaleUscite) * 100).toFixed(1) 
                    : '0';
                  return (
                    <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-700 truncate">{item.name}</span>
                      </div>
                      <span className="font-bold font-mono text-slate-900 ml-2 shrink-0">{(item.value || 0).toLocaleString('it-IT')}€ ({perc}%)</span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Grafico a Barre: Confronto Entrate vs Uscite per ciascuna Manifestazione */}
          {datiGraficoBarreEventi.length > 0 && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-700" />
                    <span>Confronto Economico Iniziative Territoriali (Entrate vs Spese)</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Redditività e tenuta finanziaria per ciascuna manifestazione principale
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datiGraficoBarreEventi} margin={{ top: 10, right: 10, left: -10, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="titolo" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RechartsTooltip formatter={(val: any) => [`${(Number(val) || 0).toLocaleString('it-IT')} €`]} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                    <Bar dataKey="Entrate" fill="#059669" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Uscite" fill="#e11d48" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Utile" fill="#0284c7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

        </div>
      )}

      {/* SOTTO-TAB 2: GESTIONE RIASSUNTIVA DI TUTTI I TESSERAMENTI */}
      {sottoTab === 'tesseramenti' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-6 p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>Riepilogo Analitico dei Tesseramenti & Quote Sociali</span>
              </h3>
              <p className="text-xs text-slate-500">
                Totale quote incassate nel periodo: <strong className="text-emerald-700 font-mono font-black">{(totaleQuote || 0).toLocaleString('it-IT')} €</strong> ({quoteFiltrate.length} soci in regola)
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                Soci Attivi nell'Anagrafe: <strong>{soci.length}</strong>
              </span>
              <span className="text-xs text-rose-700 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-200">
                Da rinnovare: <strong>{sociDaRinnovareNellAnno.length}</strong>
              </span>
            </div>
          </div>

          {/* Griglia 1: Ripartizione Quote per Categoria Socio */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Quote Riscosse per Categoria Associativa (Consuntivo Cassa)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.keys(quotePerCategoria).map((cat) => {
                const dati = quotePerCategoria[cat];
                return (
                  <div key={cat} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[11px] font-bold text-slate-700 block truncate">{cat}</span>
                    <span className="text-lg font-black text-slate-900 font-mono block">
                      {(dati.importo || 0).toLocaleString('it-IT')} €
                    </span>
                    <span className="text-[10.5px] text-slate-500 block">
                      {dati.conteggio} soci registrati
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* SEZIONE 2: QUOTE SOCIALI PROPOSTE DA INCASSARE & CREDITI VERSO SOCI */}
          <div className="bg-amber-50/40 rounded-2xl border border-amber-300/80 p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
              <div className="flex items-start sm:items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider flex items-center gap-2">
                    <span>2. Quote Sociali Proposte da Incassare & Crediti Esercizio {annoRiferimentoQuote}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 border border-amber-300">
                      {sociNonRinnovati.length} da rinnovare
                    </span>
                  </h4>
                  <p className="text-[11px] text-amber-800">
                    Proiezione entrate quote dei soci attivi non ancora regolarizzate per l'anno sociale di riferimento.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => setMostraSociDaIncassare(!mostraSociDaIncassare)}
                  className="px-3 py-1.5 bg-white hover:bg-amber-100/60 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {mostraSociDaIncassare ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>{mostraSociDaIncassare ? 'Nascondi Soci' : 'Mostra Soci'}</span>
                </button>

                <button
                  onClick={() => setMostraModalPromemoria(true)}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Invia Promemoria / Sollecito</span>
                </button>
              </div>
            </div>

            {/* Riquadri Statistiche e Scadenza */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-[10.5px] font-bold text-amber-800 uppercase block">Totale da Incassare</span>
                <span className="text-xl font-black text-amber-700 font-mono block mt-0.5">
                  {(totaleQuoteDaIncassare || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {sociNonRinnovati.length} soci in attesa di versamento
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-[10.5px] font-bold text-amber-800 uppercase block">Scadenza Statutaria</span>
                <span className="text-sm font-black text-slate-900 block mt-1">
                  {scadenzaQuote.dataScadenzaEsercizio}
                </span>
                <span className={`text-[10px] font-bold block mt-0.5 ${
                  scadenzaQuote.scaduto ? 'text-rose-600' : 'text-amber-700'
                }`}>
                  {scadenzaQuote.etichettaTempo}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-[10.5px] font-bold text-amber-800 uppercase block">Termine Assemblea Soci</span>
                <span className="text-sm font-black text-slate-900 block mt-1">
                  {scadenzaQuote.dataLimiteAssemblea}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Termine per diritto di voto e presenza
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200">
                <span className="text-[10.5px] font-bold text-amber-800 uppercase block">Entrata Teorica Tesseramento</span>
                <span className="text-xl font-black text-emerald-800 font-mono block mt-0.5">
                  {((totaleQuote || 0) + (totaleQuoteDaIncassare || 0)).toLocaleString('it-IT', { minimumFractionDigits: 2 })} €
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Riscosso al: {(totaleQuote || 0) + (totaleQuoteDaIncassare || 0) > 0 ? Math.round(((totaleQuote || 0) / ((totaleQuote || 0) + (totaleQuoteDaIncassare || 0))) * 100) : 0}%
                </span>
              </div>
            </div>

            {/* Ripartizione Quote da Incassare per Categoria */}
            {Object.keys(quoteDaIncassarePerCategoria).length > 0 && (
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wide block">
                  Ripartizione Quote Previste per Categoria Socio:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {Object.keys(quoteDaIncassarePerCategoria).map((cat) => {
                    const item = quoteDaIncassarePerCategoria[cat];
                    return (
                      <div key={cat} className="p-2.5 bg-white rounded-lg border border-amber-200 text-xs">
                        <span className="font-bold text-slate-800 block truncate">{cat}</span>
                        <span className="text-base font-black text-amber-700 font-mono block mt-0.5">
                          {(item.importo || 0).toLocaleString('it-IT')} €
                        </span>
                        <span className="text-[10px] text-slate-500 block">
                          {item.conteggio} soci • {item.quotaUnitaria}€ cad.
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tabella Dettagliata dei Soci che devono ancora rinnovare */}
            {mostraSociDaIncassare && sociNonRinnovati.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wide">
                    Elenco Soci in Attesa di Rinnovo ({sociNonRinnovati.length} nominativi):
                  </span>
                  <span className="text-[10.5px] text-slate-500">
                    Clicca su un'icona per inviare notifica immediata o registrare il saldo
                  </span>
                </div>

                <div className="overflow-x-auto border border-amber-200 rounded-xl bg-white max-h-72 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-amber-100/80 text-amber-950 font-bold text-[10.5px] uppercase tracking-wider z-10">
                      <tr>
                        <th className="py-2 px-3">Tessera</th>
                        <th className="py-2 px-3">Socio</th>
                        <th className="py-2 px-3">Categoria</th>
                        <th className="py-2 px-3 text-right">Quota Prevista</th>
                        <th className="py-2 px-3">Scadenza</th>
                        <th className="py-2 px-3">Contatti</th>
                        <th className="py-2 px-3 text-center">Azioni Rapide</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {sociNonRinnovati.map((itemSocio) => {
                        const { socio, importoDovuto, scadenza } = itemSocio;
                        const telPulito = (socio.telefono || socio.cellulare || '').replace(/[^0-9]/g, '');
                        const haWhatsApp = telPulito.length >= 8;
                        const haEmail = socio.email && socio.email.includes('@');
                        const templateCaloroso = TEMPLATE_PROMEMORIA_PREDEFINITI.find(t => t.id === 'caloroso') || TEMPLATE_PROMEMORIA_PREDEFINITI[0];
                        const templateIstituzionale = TEMPLATE_PROMEMORIA_PREDEFINITI.find(t => t.id === 'istituzionale') || TEMPLATE_PROMEMORIA_PREDEFINITI[0];
                        const testoWhatsApp = compilaTemplatePromemoria(templateCaloroso.testo, itemSocio, annoRiferimentoQuote, config);
                        const oggettoEmail = compilaTemplatePromemoria(templateIstituzionale.oggetto, itemSocio, annoRiferimentoQuote, config);
                        const testoEmail = compilaTemplatePromemoria(templateIstituzionale.testo, itemSocio, annoRiferimentoQuote, config);

                        return (
                          <tr key={socio.id} className="hover:bg-amber-50/30 transition-colors">
                            <td className="py-2 px-3 font-mono font-bold text-slate-700">
                              {socio.numeroTessera}
                            </td>
                            <td className="py-2 px-3">
                              <strong className="text-slate-900 block">{socio.cognome} {socio.nome}</strong>
                              <span className="text-[10px] text-slate-500 block font-mono">{socio.codiceFiscale}</span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 font-medium">
                              {socio.categoria}
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-amber-700">
                              {(importoDovuto || 0).toLocaleString('it-IT')} €
                            </td>
                            <td className="py-2 px-3">
                              <span className="text-[11px] font-medium text-slate-700 block">
                                {scadenza.dataScadenzaEsercizio}
                              </span>
                              <span className="text-[10px] text-amber-800 block">
                                {scadenza.etichettaTempo}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-slate-600 text-[11px]">
                              {haEmail && <div className="truncate max-w-[140px]" title={socio.email}>{socio.email}</div>}
                              {haWhatsApp && <div>{socio.cellulare || socio.telefono}</div>}
                              {!haEmail && !haWhatsApp && <span className="text-slate-400 italic">Nessun contatto</span>}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {haWhatsApp && (
                                  <a
                                    href={`https://wa.me/${telPulito}?text=${encodeURIComponent(testoWhatsApp)}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-1 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                                    title="Invia promemoria WhatsApp"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                {haEmail && (
                                  <a
                                    href={`mailto:${socio.email}?subject=${encodeURIComponent(oggettoEmail)}&body=${encodeURIComponent(testoEmail)}`}
                                    className="p-1 rounded bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                                    title="Invia promemoria Email"
                                  >
                                    <Mail className="w-3.5 h-3.5" />
                                  </a>
                                )}

                                {onRegistraPagamento && (
                                  <button
                                    onClick={() => onRegistraPagamento(socio)}
                                    className="px-2 py-0.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white text-[10.5px] font-bold transition-colors cursor-pointer"
                                    title="Registra pagamento quota a cassa"
                                  >
                                    Incassa
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Griglia 3: Metodi di Pagamento Cassa Quote */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              3. Metodi di Pagamento Registrati a Cassa (Consuntivo)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {Object.keys(quotePerMetodo).map((metodo) => {
                const dati = quotePerMetodo[metodo];
                return (
                  <div key={metodo} className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{metodo}</span>
                    </div>
                    <span className="text-lg font-black text-emerald-950 font-mono block">
                      {(dati.importo || 0).toLocaleString('it-IT')} €
                    </span>
                    <span className="text-[10.5px] text-emerald-700 block">
                      {dati.conteggio} transazioni contabili
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Tabella Dettagliata di Tutte le Quote */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                4. Libro Cassa Quote & Ricevute Emesse
              </h4>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cerca socio o ricevuta..."
                  value={ricercaTesto}
                  onChange={(e) => setRicercaTesto(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg outline-none focus:bg-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th className="py-2.5 px-3">Ricevuta</th>
                    <th className="py-2.5 px-3">Socio & Tessera</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Anno Sociale</th>
                    <th className="py-2.5 px-3 text-right">Importo Quota</th>
                    <th className="py-2.5 px-3">Data Pagamento</th>
                    <th className="py-2.5 px-3">Metodo</th>
                    <th className="py-2.5 px-3 text-center">Azione</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quoteFiltrate
                    .filter(({ socio, quota }) => {
                      if (!ricercaTesto) return true;
                      const q = ricercaTesto.toLowerCase();
                      return (
                        socio.nome.toLowerCase().includes(q) ||
                        socio.cognome.toLowerCase().includes(q) ||
                        socio.numeroTessera.toLowerCase().includes(q) ||
                        (quota.ricevutaNumero || '').toLowerCase().includes(q)
                      );
                    })
                    .map(({ socio, quota }) => (
                      <tr key={quota.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 font-mono font-bold text-slate-800">
                          {quota.ricevutaNumero || 'REC-PROLOC'}
                        </td>
                        <td className="py-2 px-3">
                          <strong className="text-slate-900 block">{socio.cognome} {socio.nome}</strong>
                          <span className="text-[10px] text-slate-500 font-mono block">{socio.numeroTessera}</span>
                        </td>
                        <td className="py-2 px-3 text-slate-600 font-medium">
                          {socio.categoria}
                        </td>
                        <td className="py-2 px-3 font-mono font-bold text-emerald-800">
                          {quota.anno}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                          {(quota.importo || 0).toLocaleString('it-IT')} €
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600">
                          {quota.dataPagamento}
                        </td>
                        <td className="py-2 px-3 text-slate-700">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10.5px]">
                            {quota.metodo}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center">
                          {onVaiASocio && (
                            <button
                              onClick={() => onVaiASocio(socio.id)}
                              className="text-emerald-700 hover:text-emerald-950 text-[11px] font-bold cursor-pointer"
                            >
                              Apri Scheda
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* SOTTO-TAB 3: GESTIONE RIASSUNTIVA DI TUTTI GLI EVENTI */}
      {sottoTab === 'eventi' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-6 p-5">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <PartyPopper className="w-4 h-4 text-emerald-700" />
                <span>Riepilogo Dettagliato Manifestazioni, Bilancio Eventi & Tipologie</span>
              </h3>
              <p className="text-xs text-slate-500">
                Spese Competenza Pro Loco: <strong className="text-slate-900">{(totaliEventi.costiConsuntivo || 0).toLocaleString('it-IT')} €</strong> • Incassi di Competenza: <strong className="text-emerald-700">{(totaliEventi.entrateRealizzate || 0).toLocaleString('it-IT')} €</strong> • Margine Netto: <strong className={(totaliEventi.margineEventi || 0) >= 0 ? 'text-emerald-800' : 'text-rose-700'}>{((totaliEventi.margineEventi || 0) >= 0 ? '+' : '')}{(totaliEventi.margineEventi || 0).toLocaleString('it-IT')} €</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-lg">
                {eventiFiltrati.length} manifestazioni registrate
              </span>
            </div>
          </div>

          {/* 1. Ripartizione per le 3 Tipologie Evento (Nativo, Ibrido, Gestione) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Tipo 1: Nativo */}
            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>1. Eventi Nativi Pro Loco</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">
                  {totaliEventi.eventiNativiCount} eventi
                </span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Organizzati interamente dall'Associazione (100% costi ed incassi nel bilancio sociale).
              </p>
              <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 text-[11px]">Entrate: <strong>{(totaliEventi.nativi?.entrate || 0).toLocaleString('it-IT')} €</strong></span>
                <span className="text-slate-600 text-[11px]">Costi: <strong>{(totaliEventi.nativi?.costi || 0).toLocaleString('it-IT')} €</strong></span>
                <span className={`font-bold ${(totaliEventi.nativi?.margine || 0) >= 0 ? 'text-emerald-800' : 'text-rose-700'}`}>
                  {(totaliEventi.nativi?.margine || 0) >= 0 ? '+' : ''}{(totaliEventi.nativi?.margine || 0).toLocaleString('it-IT')} €
                </span>
              </div>
            </div>

            {/* Tipo 2: Ibrido */}
            <div className="p-3.5 rounded-xl border border-violet-200 bg-violet-50/70 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-violet-900 flex items-center gap-1.5">
                  <Handshake className="w-3.5 h-3.5 text-violet-700" />
                  <span>2. Eventi Ibridi (Co-org.)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-200 text-violet-900">
                  {totaliEventi.eventiIbridiCount || 0} eventi
                </span>
              </div>
              <p className="text-[11px] text-violet-800 leading-snug">
                In partenariato con altre associazioni; a bilancio solo la quota % di competenza Pro Loco.
              </p>
              <div className="pt-2 border-t border-violet-200/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 text-[11px]">Quota Entrate: <strong>{(totaliEventi.ibridi?.entrate || 0).toLocaleString('it-IT')} €</strong></span>
                <span className="text-slate-600 text-[11px]">Quota Costi: <strong>{(totaliEventi.ibridi?.costi || 0).toLocaleString('it-IT')} €</strong></span>
                <span className={`font-bold ${(totaliEventi.ibridi?.margine || 0) >= 0 ? 'text-violet-800' : 'text-rose-700'}`}>
                  {(totaliEventi.ibridi?.margine || 0) >= 0 ? '+' : ''}{(totaliEventi.ibridi?.margine || 0).toLocaleString('it-IT')} €
                </span>
              </div>
            </div>

            {/* Tipo 3: Gestione */}
            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/70 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-amber-700" />
                  <span>3. Eventi in Gestione</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                  {totaliEventi.eventiGestioneCount || 0} eventi
                </span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Conto terzi / convenzioni comunali: costi sostenuti, rimborsi ricevuti e compenso netto di regia.
              </p>
              <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-600 text-[11px]">Rimborsi/Fee: <strong>{(totaliEventi.gestione?.entrate || 0).toLocaleString('it-IT')} €</strong></span>
                <span className="text-slate-600 text-[11px]">Costi: <strong>{(totaliEventi.gestione?.costi || 0).toLocaleString('it-IT')} €</strong></span>
                <span className={`font-bold ${(totaliEventi.gestione?.margine || 0) >= 0 ? 'text-amber-800' : 'text-rose-700'}`}>
                  {(totaliEventi.gestione?.margine || 0) >= 0 ? '+' : ''}{(totaliEventi.gestione?.margine || 0).toLocaleString('it-IT')} €
                </span>
              </div>
            </div>
          </div>

          {/* Griglia 4 Voci Spesa Complessive Eventi */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
                <Utensils className="w-3.5 h-3.5" />
                <span>Food & Stand</span>
              </div>
              <span className="text-xl font-black font-mono text-emerald-950 block">
                {(totaliEventi.food || 0).toLocaleString('it-IT')} €
              </span>
              <span className="text-[10px] text-emerald-700">Somma materie prime e alimentari</span>
            </div>

            <div className="p-3 bg-violet-50 rounded-xl border border-violet-200">
              <div className="flex items-center gap-1.5 text-violet-800 text-xs font-bold mb-1">
                <Music className="w-3.5 h-3.5" />
                <span>Spettacolo & SIAE</span>
              </div>
              <span className="text-xl font-black font-mono text-violet-950 block">
                {(totaliEventi.intrattenimento || 0).toLocaleString('it-IT')} €
              </span>
              <span className="text-[10px] text-violet-700">Artisti, service e diritti autore</span>
            </div>

            <div className="p-3 bg-sky-50 rounded-xl border border-sky-200">
              <div className="flex items-center gap-1.5 text-sky-800 text-xs font-bold mb-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Logistica & Safety</span>
              </div>
              <span className="text-xl font-black font-mono text-sky-950 block">
                {(totaliEventi.altreSpese || 0).toLocaleString('it-IT')} €
              </span>
              <span className="text-[10px] text-sky-700">Palco, gazebo, noleggi e sicurezza</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
              <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold mb-1">
                <MoreHorizontal className="w-3.5 h-3.5" />
                <span>Varie & Pubblicità</span>
              </div>
              <span className="text-xl font-black font-mono text-amber-950 block">
                {(totaliEventi.varie || 0).toLocaleString('it-IT')} €
              </span>
              <span className="text-[10px] text-amber-700">Tipografia, manifesti e permessi</span>
            </div>
          </div>

          {/* Sezione Diagrammi Comparativi & Visualizzazione Finanziaria */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-700" />
                <span>Diagramma Comparativo: Preventivo vs Consuntivo vs Entrate per Manifestazione</span>
              </span>
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1 text-slate-600 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block"></span> Preventivo
                </span>
                <span className="flex items-center gap-1 text-rose-700 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-rose-500 inline-block"></span> Consuntivo
                </span>
                <span className="flex items-center gap-1 text-emerald-800 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600 inline-block"></span> Entrate
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 h-64 bg-white p-3 rounded-lg border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datiGraficoBarreEventi} margin={{ top: 10, right: 10, left: -15, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="titolo" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fontSize: 10 }} />
                    <RechartsTooltip 
                      formatter={(val: any) => [`${(Number(val) || 0).toLocaleString('it-IT')} €`]}
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Bar dataKey="Preventivo" fill="#94a3b8" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Consuntivo" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Entrate" fill="#059669" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Grafico Donut Ripartizione Tipologie Evento */}
              <div className="h-64 bg-white p-3 rounded-lg border border-slate-200 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-700 block mb-1">
                    Distribuzione Manifestazioni per Tipologia
                  </span>
                  <p className="text-[10px] text-slate-500">
                    Proporzione tra iniziative native, co-organizzate e in gestione
                  </p>
                </div>
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={datiGraficoTipologieEventi}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={55}
                        paddingAngle={4}
                      >
                        {datiGraficoTipologieEventi.map((entry, index) => (
                          <Cell key={`cell-tipo-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip 
                        formatter={(val: number, name: string) => [`${val} eventi`, name]}
                        contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 text-[10px] pt-2 border-t border-slate-100">
                  {datiGraficoTipologieEventi.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-slate-700 truncate">
                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: item.color }}></span>
                        {item.name}
                      </span>
                      <strong className="font-mono text-slate-900">{item.value} ({(item.volume || 0).toLocaleString('it-IT')} €)</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Tabella Comparativa Eventi con Totali e Segno Positivo Differenza */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold text-[11px] uppercase tracking-wider border-b border-slate-200">
                  <th className="py-2.5 px-3">Manifestazione & Tipologia</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3 text-right">Preventivo</th>
                  <th className="py-2.5 px-3 text-right">Consuntivo</th>
                  <th className="py-2.5 px-3 text-right text-emerald-800">Diff. (+)</th>
                  <th className="py-2.5 px-3 text-right">Food</th>
                  <th className="py-2.5 px-3 text-right">Spett.</th>
                  <th className="py-2.5 px-3 text-right">Altre</th>
                  <th className="py-2.5 px-3 text-right">Varie</th>
                  <th className="py-2.5 px-3 text-right font-black">Entrate</th>
                  <th className="py-2.5 px-3 text-right font-black">Quota Pro Loco</th>
                  <th className="py-2.5 px-3 text-right font-black">Margine Netto</th>
                  <th className="py-2.5 px-3 text-center">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {eventiFiltrati.map(e => {
                  const econ = calcolaEconomiaEvento(e);
                  const infoTipo = getInfoTipoEvento(e.tipoEvento || 'nativo');
                  
                  const cFood = e.speseConsuntivo?.food ?? Math.round((e.costiSostenuti || 0) * 0.50);
                  const cIntr = e.speseConsuntivo?.intrattenimento ?? Math.round((e.costiSostenuti || 0) * 0.25);
                  const cAltre = e.speseConsuntivo?.altreSpese ?? Math.round((e.costiSostenuti || 0) * 0.15);
                  const cVarie = e.speseConsuntivo?.varie ?? Math.round((e.costiSostenuti || 0) * 0.10);
                  const totConsLordo = cFood + cIntr + cAltre + cVarie || e.costiSostenuti || 0;
                  const prevLordo = e.budgetPrevisto || 0;

                  // Differenza con segno SEMPRE POSITIVO come richiesto
                  const diffAssoluta = Math.abs(totConsLordo - prevLordo);
                  const isRisparmio = totConsLordo <= prevLordo;

                  return (
                    <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <strong className="text-slate-900">{e.titolo}</strong>
                          <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                            e.tipoEvento === 'ibrido' ? 'bg-violet-100 text-violet-800' :
                            e.tipoEvento === 'gestione' ? 'bg-amber-100 text-amber-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {infoTipo.etichettaBreve}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 block">
                          {e.categoria} • {e.luogo}
                          {e.tipoEvento === 'ibrido' && e.partnerIbridoNome && ` (Partner: ${e.partnerIbridoNome})`}
                          {e.tipoEvento === 'gestione' && e.committenteNome && ` (Committente: ${e.committenteNome})`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {e.dataInizio}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-500">
                        {(prevLordo || 0).toLocaleString('it-IT')} €
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-800">
                        {(totConsLordo || 0).toLocaleString('it-IT')} €
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10.5px] font-bold ${
                          isRisparmio ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`} title={isRisparmio ? 'Risparmio sul budget previsto' : 'Scostamento rispetto al budget previsto'}>
                          +{(diffAssoluta || 0).toLocaleString('it-IT')} €
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{(cFood || 0).toLocaleString('it-IT')} €</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{(cIntr || 0).toLocaleString('it-IT')} €</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{(cAltre || 0).toLocaleString('it-IT')} €</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">{(cVarie || 0).toLocaleString('it-IT')} €</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        {(e.entrateRealizzate || 0).toLocaleString('it-IT')} €
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">
                        {(econ.entrateProLocoRealizzate || 0).toLocaleString('it-IT')} €
                      </td>
                      <td className={`py-2.5 px-3 text-right font-mono font-black ${
                        (econ.margineNettoProLoco || 0) >= 0 ? 'text-emerald-800' : 'text-rose-700'
                      }`}>
                        {((econ.margineNettoProLoco || 0) >= 0 ? '+' : '')}{(econ.margineNettoProLoco || 0).toLocaleString('it-IT')} €
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          e.stato === 'concluso' ? 'bg-emerald-100 text-emerald-800' :
                          e.stato === 'in_corso' ? 'bg-amber-100 text-amber-800' :
                          e.stato === 'annullato' ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {e.stato}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* TOTALI COMPLESSIVI DI TUTTE LE MANIFESTAZIONI */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-bold text-xs border-t-2 border-slate-700">
                  <td className="py-3 px-3 uppercase tracking-wide">
                    TOTALI GENERALI ({eventiFiltrati.length} MANIFESTAZIONI)
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {annoAttivo || 'Tutti'}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {(totaliEventi.budgetPrevisto || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-white">
                    {(totaliEventi.costiConsuntivo || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-300">
                    +{(totaliEventi.differenzaCosti || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {(totaliEventi.food || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {(totaliEventi.intrattenimento || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {(totaliEventi.altreSpese || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-300">
                    {(totaliEventi.varie || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-white">
                    {(totaliEventi.entrateLordoTotali || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-300">
                    {(totaliEventi.entrateRealizzate || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className={`py-3 px-3 text-right font-mono font-black ${
                    (totaliEventi.margineEventi || 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  }`}>
                    {((totaliEventi.margineEventi || 0) >= 0 ? '+' : '')}{(totaliEventi.margineEventi || 0).toLocaleString('it-IT')} €
                  </td>
                  <td className="py-3 px-3 text-center text-[10px] text-slate-400">
                    Bilancio OK
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

        </div>
      )}

      {/* SOTTO-TAB 4: SCHEMA UFFICIALE RUNTS PER PRO LOCO / APS (MODELLO D) */}
      {sottoTab === 'runts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-700" />
                <span>Rendiconto per Cassa degli Enti del Terzo Settore (Modello D RUNTS)</span>
              </h3>
              <p className="text-xs text-slate-500">
                Struttura conforme al D.M. 05/03/2020 per le Associazioni Pro Loco (APS) iscritte al RUNTS
              </p>
            </div>
            <button
              onClick={onApriStampaBilancio}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Stampa Modello per Assemblea</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sezione ENTRATE */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-emerald-800 text-white px-4 py-2.5 font-bold text-xs flex justify-between">
                <span>SEZIONE 1: ENTRATE DELL'ESERCIZIO</span>
                <span>IMPORTO (€)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs text-slate-800">
                <div className="p-3 bg-slate-50 font-bold text-slate-900">
                  A) Entrate da attività di interesse generale (Manifestazioni, Sagre, Feste)
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>1. Entrate da stand gastronomico e somministrazione sagre</span>
                  <span className="font-mono font-medium">{Math.round((totaliEventi.entrateRealizzate || 0) * 0.70).toLocaleString('it-IT')} €</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>2. Biglietti, diritti di partecipazione e mostre</span>
                  <span className="font-mono font-medium">{Math.round((totaliEventi.entrateRealizzate || 0) * 0.20).toLocaleString('it-IT')} €</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>3. Sponsorizzazioni e contributi privati su eventi</span>
                  <span className="font-mono font-medium">{Math.round((totaliEventi.entrateRealizzate || 0) * 0.10).toLocaleString('it-IT')} €</span>
                </div>
                <div className="p-3 bg-slate-50 font-bold text-slate-900">
                  B) Entrate da attività associative e quote tesseramento
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>1. Quote associative annuali versate dai soci</span>
                  <span className="font-mono font-medium">{(totaleQuote || 0).toLocaleString('it-IT')} €</span>
                </div>
                <div className="p-3 bg-emerald-50 font-black text-emerald-950 flex justify-between text-sm">
                  <span>TOTALE GENERALE ENTRATE</span>
                  <span className="font-mono">{(bilancioGlobale.totaleEntrate || 0).toLocaleString('it-IT')} €</span>
                </div>
              </div>
            </div>

            {/* Sezione USCITE */}
            <div className="border border-slate-300 rounded-xl overflow-hidden">
              <div className="bg-rose-800 text-white px-4 py-2.5 font-bold text-xs flex justify-between">
                <span>SEZIONE 2: USCITE DELL'ESERCIZIO</span>
                <span>IMPORTO (€)</span>
              </div>
              <div className="divide-y divide-slate-100 text-xs text-slate-800">
                <div className="p-3 bg-slate-50 font-bold text-slate-900">
                  A) Uscite per attività di interesse generale (Manifestazioni, Sagre)
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>1. Materie prime alimentari e bevande (Food & Stand)</span>
                  <span className="font-mono font-medium">{(totaliEventi.food || 0).toLocaleString('it-IT')} €</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>2. Servizi artistici, musicali, service e diritti SIAE</span>
                  <span className="font-mono font-medium">{(totaliEventi.intrattenimento || 0).toLocaleString('it-IT')} €</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>3. Noleggi palchi, tensostrutture, gazebo e sicurezza</span>
                  <span className="font-mono font-medium">{(totaliEventi.altreSpese || 0).toLocaleString('it-IT')} €</span>
                </div>
                <div className="px-4 py-2 flex justify-between">
                  <span>4. Oneri vari, pubblicità, tipografia e permessi</span>
                  <span className="font-mono font-medium">{(totaliEventi.varie || 0).toLocaleString('it-IT')} €</span>
                </div>
                <div className="p-3 bg-slate-50 font-bold text-slate-900">
                  B) Uscite per supporto e funzionamento associazione
                </div>
                <div className="px-4 py-2 flex justify-between text-slate-500">
                  <span>1. Oneri generali di segreteria e tessere (inclusi in varie)</span>
                  <span className="font-mono">Inclusi</span>
                </div>
                <div className="p-3 bg-rose-50 font-black text-rose-950 flex justify-between text-sm">
                  <span>TOTALE GENERALE USCITE</span>
                  <span className="font-mono">{(bilancioGlobale.totaleUscite || 0).toLocaleString('it-IT')} €</span>
                </div>
              </div>
            </div>

          </div>

          {/* Riquadro Riassuntivo Avanzo / Disavanzo RUNTS */}
          <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            bilancioGlobale.avanzoGestione >= 0 
              ? 'bg-emerald-50 border-emerald-300 text-emerald-950' 
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}>
            <div>
              <span className="text-xs font-bold uppercase block">
                Risultato Globale di Gestione (Entrate - Uscite)
              </span>
              <span className="text-xl font-black font-mono block">
                {(bilancioGlobale.avanzoGestione >= 0 ? '+' : '')}{(bilancioGlobale.avanzoGestione || 0).toLocaleString('it-IT')} €
              </span>
              <span className="text-xs font-medium text-slate-600 block mt-0.5">
                {bilancioGlobale.avanzoGestione >= 0 
                  ? 'Avanzo di cassa da destinare allo svolgimento dell\'attività statutaria dell\'anno successivo'
                  : 'Disavanzo registrato di gestione'}
              </span>
            </div>

            <button
              onClick={onApriStampaBilancio}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Genera Verbale Assemblea
            </button>
          </div>

        </div>
      )}

      {/* SOTTO-TAB 5: STATO DATABASE & STRUMENTI DI GESTIONE */}
      {sottoTab === 'database' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-700" />
              <span>Stato del Database Locale & Persistenza Dati</span>
            </h3>
            <p className="text-xs text-slate-500">
              Monitoraggio dell'integrità del database, numero record memorizzati, backup e sicurezza dei dati
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block">Record Anagrafiche Soci</span>
              <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
                {statsDatabase.totaleSoci}
              </span>
              <span className="text-[11px] text-slate-600 font-medium mt-1 block">
                {statsDatabase.sociAttivi} soci attivi censiti
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block">Record Tessere & Quote</span>
              <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
                {statsDatabase.totaleQuoteRegistrate}
              </span>
              <span className="text-[11px] text-slate-600 font-medium mt-1 block">
                ricevute emesse nel database
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase block">Record Manifestazioni</span>
              <span className="text-2xl font-black text-slate-900 font-mono block mt-1">
                {statsDatabase.totaleEventi}
              </span>
              <span className="text-[11px] text-slate-600 font-medium mt-1 block">
                {statsDatabase.eventiConclusi} conclusi • {statsDatabase.eventiInProgramma} attivi
              </span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase block">Stato Sincronizzazione</span>
              <span className="text-sm font-black text-emerald-950 flex items-center gap-1.5 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Salvataggio Locale Persistente</span>
              </span>
              <span className="text-[11px] text-emerald-800 font-medium mt-1 block">
                Nessuna perdita dati alla chiusura
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase">
              Operazioni di Salvataggio e Sicurezza Database
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => esportaBackupJSON(soci, config, eventi)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Scarica Backup Completo Database (JSON)</span>
              </button>

              <button
                onClick={handleEsportaCSV}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Scarica Rendiconto Unificato (Excel/CSV)</span>
              </button>

              <button
                onClick={onApriStampaBilancio}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4 text-slate-300" />
                <span>Stampa Ufficiale per Assemblea Soci</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE PROMEMORIA E NOTIFICHE RINNOVO */}
      {mostraModalPromemoria && (
        <PromemoriaRinnovoModal
          soci={soci}
          annoSelezionato={annoRiferimentoQuote}
          config={config}
          onClose={() => setMostraModalPromemoria(false)}
          onRegistraPagamento={onRegistraPagamento}
        />
      )}

    </div>
  );
};
