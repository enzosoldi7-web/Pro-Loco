import React, { useState, useMemo } from 'react';
import { ProLocoEvento, CategoriaEvento, StatoEvento, Socio, DettaglioSpeseEvento, TipoEvento, StandEvento } from '../types';
import { 
  X, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Euro, 
  ShieldCheck, 
  FileText, 
  Image as ImageIcon,
  CheckSquare,
  Square,
  AlertTriangle,
  Utensils,
  Music,
  Truck,
  MoreHorizontal,
  PieChart as PieChartIcon,
  Handshake,
  Briefcase,
  Sparkles,
  Info,
  CheckCircle2,
  Store
} from 'lucide-react';
import { EventBudgetChart } from './EventBudgetChart';
import { calcolaEconomiaEvento, getInfoTipoEvento } from '../utils/eventoHelpers';
import { STAND_SIMULATI_DEFAULT } from '../storage';

interface EventModalProps {
  evento: ProLocoEvento | null; // null se è nuovo
  soci: Socio[];
  annoPredefinito: number;
  onSalva: (evento: ProLocoEvento) => void;
  onClose: () => void;
}

const CATEGORIE: CategoriaEvento[] = [
  'Enogastronomia & Sagra',
  'Festa Tradizionale & Patronale',
  'Musica, Spettacolo & Teatro',
  'Cultura, Arte & Mostre',
  'Visita Guidata & Escursione',
  'Mercatino & Fiera Tipica',
  'Sport & Tempo Libero',
  'Assemblea & Riunione Soci'
];

const IMMAGINI_SUGGERITE: { label: string; url: string }[] = [
  { label: 'Sagra / Gastronomia', url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=700&auto=format&fit=crop&q=80' },
  { label: 'Festa Storica / Borgo', url: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=700&auto=format&fit=crop&q=80' },
  { label: 'Musica / Spettacolo', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=700&auto=format&fit=crop&q=80' },
  { label: 'Natura / Escursione', url: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=700&auto=format&fit=crop&q=80' },
  { label: 'Mercato / Fiera', url: 'https://images.unsplash.com/photo-1506157786151-b8491531f063?w=700&auto=format&fit=crop&q=80' },
  { label: 'Mostra / Arte', url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=700&auto=format&fit=crop&q=80' }
];

export const EventModal: React.FC<EventModalProps> = ({
  evento,
  soci,
  annoPredefinito,
  onSalva,
  onClose,
}) => {
  const isModifica = !!evento;

  const oggiIso = new Date().toISOString().slice(0, 10);
  const dataDefault = `${annoPredefinito}-06-15`;

  const [titolo, setTitolo] = useState(evento?.titolo || '');
  const [categoria, setCategoria] = useState<CategoriaEvento>(evento?.categoria || 'Enogastronomia & Sagra');
  const [dataInizio, setDataInizio] = useState(evento?.dataInizio || dataDefault);
  const [oraInizio, setOraInizio] = useState(evento?.oraInizio || '19:00');
  const [dataFine, setDataFine] = useState(evento?.dataFine || dataDefault);
  const [oraFine, setOraFine] = useState(evento?.oraFine || '23:30');
  const [luogo, setLuogo] = useState(evento?.luogo || 'Piazza del Popolo');
  const [stato, setStato] = useState<StatoEvento>(evento?.stato || 'in_programma');
  const [descrizione, setDescrizione] = useState(evento?.descrizione || '');
  const [locandina, setLocandina] = useState(evento?.locandina || IMMAGINI_SUGGERITE[0].url);

  // Economia Evento - Voci Analitiche (Food, Intrattenimento, Altre Spese, Varie)
  const [spesePrev, setSpesePrev] = useState<DettaglioSpeseEvento>(
    evento?.spesePreventivo || {
      food: evento ? Math.round((evento.budgetPrevisto || 0) * 0.45) : 500,
      intrattenimento: evento ? Math.round((evento.budgetPrevisto || 0) * 0.25) : 250,
      altreSpese: evento ? Math.round((evento.budgetPrevisto || 0) * 0.20) : 150,
      varie: evento ? Math.round((evento.budgetPrevisto || 0) * 0.10) : 100,
    }
  );

  const [speseCons, setSpeseCons] = useState<DettaglioSpeseEvento>(
    evento?.speseConsuntivo || {
      food: evento ? Math.round((evento.costiSostenuti || 0) * 0.50) : 0,
      intrattenimento: evento ? Math.round((evento.costiSostenuti || 0) * 0.25) : 0,
      altreSpese: evento ? Math.round((evento.costiSostenuti || 0) * 0.15) : 0,
      varie: evento ? Math.round((evento.costiSostenuti || 0) * 0.10) : 0,
    }
  );

  const [entratePreviste, setEntratePreviste] = useState<number>(
    evento?.entratePreviste ?? (evento?.budgetPrevisto || 1200)
  );
  const [entrateRealizzate, setEntrateRealizzate] = useState<number>(
    evento?.entrateRealizzate || 0
  );
  const [mostraGraficoTorta, setMostraGraficoTorta] = useState<boolean>(true);

  // Calcolo somme automatiche
  const totalePreventivo = useMemo(() => {
    return (
      (Number(spesePrev.food) || 0) +
      (Number(spesePrev.intrattenimento) || 0) +
      (Number(spesePrev.altreSpese) || 0) +
      (Number(spesePrev.varie) || 0)
    );
  }, [spesePrev]);

  const totaleConsuntivo = useMemo(() => {
    return (
      (Number(speseCons.food) || 0) +
      (Number(speseCons.intrattenimento) || 0) +
      (Number(speseCons.altreSpese) || 0) +
      (Number(speseCons.varie) || 0)
    );
  }, [speseCons]);

  // Differenza tra i costi
  const differenzaCosti = totaleConsuntivo - totalePreventivo;

  // Differenza tra entrate e costi
  const margineConsuntivo = (Number(entrateRealizzate) || 0) - totaleConsuntivo;
  const marginePreventivo = (Number(entratePreviste) || 0) - totalePreventivo;

  // Tipologia Evento: 1. Nativo, 2. Ibrido, 3. Gestione
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>(evento?.tipoEvento || 'nativo');

  // Gestione Economica Ibrido (Co-organizzazione)
  const [partnerIbridoNome, setPartnerIbridoNome] = useState<string>(evento?.partnerIbridoNome || '');
  const [percentualeSpeseProLoco, setPercentualeSpeseProLoco] = useState<number>(
    evento?.percentualeSpeseProLoco !== undefined ? evento.percentualeSpeseProLoco : 50
  );
  const [percentualeEntrateProLoco, setPercentualeEntrateProLoco] = useState<number>(
    evento?.percentualeEntrateProLoco !== undefined ? evento.percentualeEntrateProLoco : 50
  );
  const [contributoPartner, setContributoPartner] = useState<number>(evento?.contributoPartner || 0);

  // Gestione Economica Gestione (Conto Terzi per Committente)
  const [committenteNome, setCommittenteNome] = useState<string>(evento?.committenteNome || '');
  const [tipoAccordoGestione, setTipoAccordoGestione] = useState<'compenso_forfettario' | 'rimborso_piu_fee' | 'incassi_delegati'>(
    evento?.tipoAccordoGestione || 'compenso_forfettario'
  );
  const [compensoGestione, setCompensoGestione] = useState<number>(evento?.compensoGestione || 0);
  const [rimborsoSpeseCommittente, setRimborsoSpeseCommittente] = useState<number>(evento?.rimborsoSpeseCommittente || 0);

  // Volontari e Responsabile
  const [volontariIds, setVolontariIds] = useState<string[]>(evento?.volontariIds || []);
  const [responsabileId, setResponsabileId] = useState<string>(evento?.responsabileId || (soci[0]?.id || ''));

  // Stand Numerati con Tipologia e Riferimento Food
  const [standNumerati, setStandNumerati] = useState<StandEvento[]>(
    evento?.standNumerati && evento.standNumerati.length > 0
      ? evento.standNumerati
      : STAND_SIMULATI_DEFAULT
  );

  // Calcolo dinamico dell'economia specifica per tipologia evento
  const economiaCalcolata = useMemo(() => {
    const mockEvento: ProLocoEvento = {
      id: evento?.id || 'temp',
      titolo,
      categoria,
      dataInizio,
      dataFine,
      luogo,
      stato,
      descrizione: '',
      volontariIds: [],
      permessoComunale: true,
      licenzaSIAE: false,
      pianoSicurezzaSafety: true,
      aslHaccp: false,
      partecipantiStimati: 0,
      tipoEvento,
      partnerIbridoNome,
      percentualeSpeseProLoco,
      percentualeEntrateProLoco,
      contributoPartner,
      committenteNome,
      tipoAccordoGestione,
      compensoGestione,
      rimborsoSpeseCommittente,
      spesePreventivo: spesePrev,
      speseConsuntivo: speseCons,
      budgetPrevisto: totalePreventivo,
      costiSostenuti: totaleConsuntivo,
      entratePreviste: Number(entratePreviste) || 0,
      entrateRealizzate: Number(entrateRealizzate) || 0,
    };
    return calcolaEconomiaEvento(mockEvento);
  }, [
    evento?.id, titolo, categoria, dataInizio, dataFine, luogo, stato,
    tipoEvento, partnerIbridoNome, percentualeSpeseProLoco, percentualeEntrateProLoco,
    contributoPartner, committenteNome, tipoAccordoGestione, compensoGestione,
    rimborsoSpeseCommittente, spesePrev, speseCons, totalePreventivo,
    totaleConsuntivo, entratePreviste, entrateRealizzate
  ]);

  // Permessi & Burocrazia
  const [permessoComunale, setPermessoComunale] = useState<boolean>(evento ? evento.permessoComunale : true);
  const [licenzaSIAE, setLicenzaSIAE] = useState<boolean>(evento ? evento.licenzaSIAE : false);
  const [pianoSicurezzaSafety, setPianoSicurezzaSafety] = useState<boolean>(evento ? evento.pianoSicurezzaSafety : true);
  const [aslHaccp, setAslHaccp] = useState<boolean>(evento ? evento.aslHaccp : false);

  const [partecipantiStimati, setPartecipantiStimati] = useState<number>(evento?.partecipantiStimati || 300);
  const [noteOrganizzative, setNoteOrganizzative] = useState(evento?.noteOrganizzative || '');

  const [errore, setErrore] = useState<string | null>(null);

  const handleToggleVolontario = (socioId: string) => {
    if (volontariIds.includes(socioId)) {
      setVolontariIds(volontariIds.filter(id => id !== socioId));
    } else {
      setVolontariIds([...volontariIds, socioId]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('L\'immagine è troppo pesante. Scegli un\'immagine inferiore a 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLocandina(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titolo.trim()) {
      setErrore('Il titolo dell\'evento è obbligatorio.');
      return;
    }
    if (!dataInizio) {
      setErrore('La data di inizio è obbligatoria.');
      return;
    }
    if (!luogo.trim()) {
      setErrore('Il luogo dell\'evento è obbligatorio.');
      return;
    }

    const nuovoEvento: ProLocoEvento = {
      id: evento?.id || `evento-${Date.now()}`,
      titolo: titolo.trim(),
      categoria,
      dataInizio,
      oraInizio,
      dataFine: dataFine || dataInizio,
      oraFine,
      luogo: luogo.trim(),
      stato,
      tipoEvento,
      standNumerati,
      partnerIbridoNome: tipoEvento === 'ibrido' ? partnerIbridoNome.trim() : undefined,
      percentualeSpeseProLoco: tipoEvento === 'ibrido' ? Number(percentualeSpeseProLoco) || 0 : undefined,
      percentualeEntrateProLoco: tipoEvento === 'ibrido' ? Number(percentualeEntrateProLoco) || 0 : undefined,
      contributoPartner: tipoEvento === 'ibrido' ? Number(contributoPartner) || 0 : undefined,
      committenteNome: tipoEvento === 'gestione' ? committenteNome.trim() : undefined,
      tipoAccordoGestione: tipoEvento === 'gestione' ? tipoAccordoGestione : undefined,
      compensoGestione: tipoEvento === 'gestione' ? Number(compensoGestione) || 0 : undefined,
      rimborsoSpeseCommittente: tipoEvento === 'gestione' ? Number(rimborsoSpeseCommittente) || 0 : undefined,
      descrizione: descrizione.trim(),
      locandina,
      budgetPrevisto: totalePreventivo,
      costiSostenuti: totaleConsuntivo,
      entratePreviste: Number(entratePreviste) || 0,
      entrateRealizzate: Number(entrateRealizzate) || 0,
      spesePreventivo: spesePrev,
      speseConsuntivo: speseCons,
      volontariIds,
      responsabileId,
      permessoComunale,
      licenzaSIAE,
      pianoSicurezzaSafety,
      aslHaccp,
      partecipantiStimati: Number(partecipantiStimati) || 0,
      noteOrganizzative: noteOrganizzative.trim()
    };

    onSalva(nuovoEvento);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[94vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Intestazione modale - Fissa in alto */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs shrink-0">
              <Calendar className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                {isModifica ? 'Modifica Evento Pro Loco' : 'Pianifica Nuovo Evento in Programma'}
              </h3>
              <p className="text-xs text-slate-500">
                Programmazione sagra/evento, 4 voci di spesa, volontari e sicurezza
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra di Navigazione Rapida Capitoli (sempre accessibile su ogni monitor) */}
        <div className="px-5 sm:px-6 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          <button
            type="button"
            onClick={() => document.getElementById('sezione-dati-evento')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors shrink-0 cursor-pointer"
          >
            1. Dati & Programma
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('sezione-economia-evento')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors shrink-0 cursor-pointer"
          >
            2. Economia (4 Voci di Spesa)
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('sezione-staff-evento')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors shrink-0 cursor-pointer"
          >
            3. Squadra Volontari
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('sezione-permessi-evento')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-colors shrink-0 cursor-pointer"
          >
            4. Permessi & Normative
          </button>
        </div>

        {errore && (
          <div className="mx-5 sm:mx-6 mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errore}</span>
          </div>
        )}

        {/* Form dati evento con scorrimento interno e footer fisso */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0 text-xs text-slate-700">
          
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-6">
          
            {/* Sezione 1: Dati Essenziali */}
            <div id="sezione-dati-evento" className="space-y-4 scroll-mt-2">

              {/* Specificazione Tipologia Evento: 1. Nativo, 2. Ibrido, 3. Gestione */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-700" />
                    <span>Tipologia Evento & Natura Organizzativa *</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Tutte le stesse voci con calcolo economico dedicato
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 1. Evento Nativo */}
                  <button
                    type="button"
                    onClick={() => setTipoEvento('nativo')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      tipoEvento === 'nativo'
                        ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          tipoEvento === 'nativo' ? 'bg-emerald-700 text-white' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          <Sparkles className="w-3 h-3" />
                          <span>1. Evento Nativo</span>
                        </span>
                        {tipoEvento === 'nativo' && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                        )}
                      </div>
                      <span className="font-bold text-slate-900 block text-xs">100% Pro Loco</span>
                      <p className="text-[10.5px] text-slate-500 leading-snug mt-1">
                        Ideato, organizzato e gestito interamente dalla Pro Loco. Spese e incassi al 100% a bilancio.
                      </p>
                    </div>
                  </button>

                  {/* 2. Evento Ibrido */}
                  <button
                    type="button"
                    onClick={() => setTipoEvento('ibrido')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      tipoEvento === 'ibrido'
                        ? 'bg-violet-50 border-violet-500 ring-2 ring-violet-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          tipoEvento === 'ibrido' ? 'bg-violet-700 text-white' : 'bg-violet-100 text-violet-800'
                        }`}>
                          <Handshake className="w-3 h-3" />
                          <span>2. Evento Ibrido</span>
                        </span>
                        {tipoEvento === 'ibrido' && (
                          <CheckCircle2 className="w-4 h-4 text-violet-700 shrink-0" />
                        )}
                      </div>
                      <span className="font-bold text-slate-900 block text-xs">Co-organizzato</span>
                      <p className="text-[10.5px] text-slate-500 leading-snug mt-1">
                        In collaborazione con Comune o altro ente/associazione. Ripartizione % concordata di costi e ricavi.
                      </p>
                    </div>
                  </button>

                  {/* 3. Evento Gestione */}
                  <button
                    type="button"
                    onClick={() => setTipoEvento('gestione')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      tipoEvento === 'gestione'
                        ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          tipoEvento === 'gestione' ? 'bg-amber-600 text-white' : 'bg-amber-100 text-amber-900'
                        }`}>
                          <Briefcase className="w-3 h-3" />
                          <span>3. Evento Gestione</span>
                        </span>
                        {tipoEvento === 'gestione' && (
                          <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                        )}
                      </div>
                      <span className="font-bold text-slate-900 block text-xs">Per Conto Terzi</span>
                      <p className="text-[10.5px] text-slate-500 leading-snug mt-1">
                        Servizio commissionato da committente pubblico/privato a fronte di compenso convenzionato o rimborsi.
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-800 mb-1">
                  Titolo dell'Evento *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Sagra del Fungo Porcino e della Castagna"
                  value={titolo}
                  onChange={(e) => setTitolo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Categoria *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as CategoriaEvento)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                >
                  {CATEGORIE.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Date e Orari */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Data Inizio *
                </label>
                <input
                  type="date"
                  required
                  value={dataInizio}
                  onChange={(e) => {
                    setDataInizio(e.target.value);
                    if (!dataFine || dataFine < e.target.value) setDataFine(e.target.value);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ora Inizio
                </label>
                <input
                  type="time"
                  value={oraInizio}
                  onChange={(e) => setOraInizio(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Data Fine
                </label>
                <input
                  type="date"
                  value={dataFine}
                  onChange={(e) => setDataFine(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ora Fine
                </label>
                <input
                  type="time"
                  value={oraFine}
                  onChange={(e) => setOraFine(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                />
              </div>
            </div>

            {/* Luogo, Stato e Partecipanti */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Luogo / Piazza *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Piazza del Popolo"
                  value={luogo}
                  onChange={(e) => setLuogo(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Stato Iniziativa
                </label>
                <select
                  value={stato}
                  onChange={(e) => setStato(e.target.value as StatoEvento)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white"
                >
                  <option value="in_programma">🟡 In programma</option>
                  <option value="in_corso">🟢 In corso</option>
                  <option value="concluso">⚪ Concluso</option>
                  <option value="annullato">🔴 Annullato</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Presenze Stimate
                </label>
                <input
                  type="number"
                  min="0"
                  step="10"
                  placeholder="Es. 500"
                  value={partecipantiStimati || ''}
                  onChange={(e) => setPartecipantiStimati(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
            </div>

            {/* Descrizione */}
            <div>
              <label className="block font-semibold text-slate-800 mb-1">
                Descrizione & Programma dell'Evento
              </label>
              <textarea
                rows={3}
                placeholder="Breve testo illustrativo, menù previsto, ospiti, gruppi musicali..."
                value={descrizione}
                onChange={(e) => setDescrizione(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Sezione 2: Immagine / Locandina */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <label className="block font-semibold text-slate-800 mb-2 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-emerald-700" />
              <span>Locandina / Immagine di Copertina</span>
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {locandina ? (
                <img
                  src={locandina}
                  alt="Anteprima locandina"
                  className="w-32 h-20 object-cover rounded-lg border border-slate-300 shadow-2xs shrink-0"
                />
              ) : (
                <div className="w-32 h-20 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-[10px] shrink-0">
                  Nessuna foto
                </div>
              )}

              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] text-slate-500 font-medium block w-full">Temi suggeriti:</span>
                  {IMMAGINI_SUGGERITE.map((img) => (
                    <button
                      key={img.label}
                      type="button"
                      onClick={() => setLocandina(img.url)}
                      className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] hover:bg-slate-100 transition-colors"
                    >
                      {img.label}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="text-[11px] text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sezione 3: Economia Evento (Bilancio Preventivo & Consuntivo Analitico) */}
          <div id="sezione-economia-evento" className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-4 scroll-mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div>
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Euro className="w-4 h-4 text-emerald-700" />
                  <span>Bilancio Economico Preventivo & Consuntivo</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  Gestione analitica delle spese (Food, Intrattenimento, Altre, Varie), somme automatiche e scostamenti
                </p>
              </div>

              <button
                type="button"
                onClick={() => setMostraGraficoTorta(!mostraGraficoTorta)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer self-start sm:self-auto"
              >
                <PieChartIcon className="w-3.5 h-3.5" />
                <span>{mostraGraficoTorta ? 'Nascondi Grafico a Torta' : 'Mostra Grafico a Torta'}</span>
              </button>
            </div>

            {/* Tabella / Griglia Voci di Spesa */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-2 pr-2">Voce di Spesa</th>
                    <th className="py-2 px-2 w-32">Preventivo (€)</th>
                    <th className="py-2 px-2 w-32">Consuntivo (€)</th>
                    <th className="py-2 pl-2 w-28 text-right">Differenza</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  
                  {/* 1. Food & Beverage */}
                  <tr className="hover:bg-slate-100/60 transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                          <Utensils className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">Food & Beverage</span>
                          <span className="text-[10px] text-slate-500 block">Stand gastronomico, alimentari, bevande</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={spesePrev.food}
                        onChange={(e) => setSpesePrev({ ...spesePrev, food: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={speseCons.food}
                        onChange={(e) => setSpeseCons({ ...speseCons, food: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono font-semibold text-[11px]">
                      {(() => {
                        const prev = spesePrev.food || 0;
                        const cons = speseCons.food || 0;
                        const diffAss = Math.abs(cons - prev);
                        const isRisparm = cons <= prev;
                        if (cons === prev) return <span className="text-slate-400">0 €</span>;
                        return (
                          <span className={isRisparm ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                            +{diffAss} € ({isRisparm ? 'risparmio' : 'scostamento'})
                          </span>
                        );
                      })()}
                    </td>
                  </tr>

                  {/* 2. Intrattenimento & Spettacolo */}
                  <tr className="hover:bg-slate-100/60 transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                          <Music className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">Intrattenimento & Spettacolo</span>
                          <span className="text-[10px] text-slate-500 block">Musica, artisti, SIAE, service audio/luci</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={spesePrev.intrattenimento}
                        onChange={(e) => setSpesePrev({ ...spesePrev, intrattenimento: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={speseCons.intrattenimento}
                        onChange={(e) => setSpeseCons({ ...speseCons, intrattenimento: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono font-semibold text-[11px]">
                      {(() => {
                        const prev = spesePrev.intrattenimento || 0;
                        const cons = speseCons.intrattenimento || 0;
                        const diffAss = Math.abs(cons - prev);
                        const isRisparm = cons <= prev;
                        if (cons === prev) return <span className="text-slate-400">0 €</span>;
                        return (
                          <span className={isRisparm ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                            +{diffAss} € ({isRisparm ? 'risparmio' : 'scostamento'})
                          </span>
                        );
                      })()}
                    </td>
                  </tr>

                  {/* 3. Altre Spese & Logistica */}
                  <tr className="hover:bg-slate-100/60 transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
                          <Truck className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">Altre Spese & Logistica</span>
                          <span className="text-[10px] text-slate-500 block">Palco, gazebo, noleggi, sicurezza safety</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={spesePrev.altreSpese}
                        onChange={(e) => setSpesePrev({ ...spesePrev, altreSpese: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={speseCons.altreSpese}
                        onChange={(e) => setSpeseCons({ ...speseCons, altreSpese: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono font-semibold text-[11px]">
                      {(() => {
                        const prev = spesePrev.altreSpese || 0;
                        const cons = speseCons.altreSpese || 0;
                        const diffAss = Math.abs(cons - prev);
                        const isRisparm = cons <= prev;
                        if (cons === prev) return <span className="text-slate-400">0 €</span>;
                        return (
                          <span className={isRisparm ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                            +{diffAss} € ({isRisparm ? 'risparmio' : 'scostamento'})
                          </span>
                        );
                      })()}
                    </td>
                  </tr>

                  {/* 4. Varie & Oneri */}
                  <tr className="hover:bg-slate-100/60 transition-colors">
                    <td className="py-2.5 pr-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">Varie & Oneri Amministrativi</span>
                          <span className="text-[10px] text-slate-500 block">Tipografia, manifesti, permessi, imprevisti</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={spesePrev.varie}
                        onChange={(e) => setSpesePrev({ ...spesePrev, varie: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-2.5 px-2">
                      <input
                        type="number"
                        min="0"
                        step="10"
                        value={speseCons.varie}
                        onChange={(e) => setSpeseCons({ ...speseCons, varie: Math.max(0, Number(e.target.value)) })}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium focus:ring-1 focus:ring-emerald-500 outline-none"
                      />
                    </td>
                    <td className="py-2.5 pl-2 text-right font-mono font-semibold text-[11px]">
                      {(() => {
                        const prev = spesePrev.varie || 0;
                        const cons = speseCons.varie || 0;
                        const diffAss = Math.abs(cons - prev);
                        const isRisparm = cons <= prev;
                        if (cons === prev) return <span className="text-slate-400">0 €</span>;
                        return (
                          <span className={isRisparm ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                            +{diffAss} € ({isRisparm ? 'risparmio' : 'scostamento'})
                          </span>
                        );
                      })()}
                    </td>
                  </tr>

                </tbody>

                {/* Riga Somma Automatica dei Costi */}
                <tfoot>
                  <tr className="border-t-2 border-slate-300 bg-white font-bold">
                    <td className="py-3 pr-2 text-slate-900 font-extrabold">
                      Totale Costi (Somma delle spese):
                    </td>
                    <td className="py-3 px-2 font-mono text-sm text-slate-900 font-black">
                      {(totalePreventivo || 0).toLocaleString('it-IT')} €
                    </td>
                    <td className="py-3 px-2 font-mono text-sm text-slate-900 font-black">
                      {(totaleConsuntivo || 0).toLocaleString('it-IT')} €
                    </td>
                    <td className="py-3 pl-2 text-right font-mono text-xs font-bold">
                      {(() => {
                        const diffTot = Math.abs((totaleConsuntivo || 0) - (totalePreventivo || 0));
                        const isRisparmioTot = (totaleConsuntivo || 0) <= (totalePreventivo || 0);
                        return (
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                            isRisparmioTot ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            +{(diffTot || 0).toLocaleString('it-IT')} € ({isRisparmioTot ? 'Risparmio' : 'Scostamento'})
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Riquadro Entrate & Differenza tra Costi ed Entrate (Risultato Economico) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Entrate Previste (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={entratePreviste}
                  onChange={(e) => setEntratePreviste(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Sponsor, stand, offerte stimate</span>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                  Entrate Realizzate (€)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={entrateRealizzate}
                  onChange={(e) => setEntrateRealizzate(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-medium focus:bg-white"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">Incasso effettivo registrato</span>
              </div>

              <div className="flex flex-col justify-center bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] font-semibold text-slate-500 uppercase">
                  Risultato Netto Manifestazione (Entrate - Costi):
                </span>
                <span className={`text-base font-black font-mono ${
                  margineConsuntivo >= 0 ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                  {margineConsuntivo >= 0 ? `+${(margineConsuntivo || 0).toLocaleString('it-IT')}` : (margineConsuntivo || 0).toLocaleString('it-IT')} €
                </span>
                <span className="text-[10px] font-medium text-slate-500">
                  {margineConsuntivo >= 0 ? 'Utile dell\'evento' : 'Disavanzo dell\'evento'} (previsto: {marginePreventivo >= 0 ? `+${marginePreventivo}` : marginePreventivo}€)
                </span>
              </div>
            </div>

            {/* Gestione Economica Specifica per Tipologia Evento: 1. Nativo, 2. Ibrido, 3. Gestione */}
            {tipoEvento === 'nativo' && (
              <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      1
                    </div>
                    <div>
                      <h5 className="font-bold text-emerald-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>Gestione Economica: 100% Titolarità Diretta Pro Loco</span>
                      </h5>
                      <p className="text-[11px] text-emerald-800">
                        Tutti i costi operativi e gli incassi confluiscono integralmente nel bilancio d'esercizio dell'associazione
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-200/80 text-emerald-900 border border-emerald-300 self-start sm:self-auto">
                    Bilancio Integrale Pro Loco
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border border-emerald-200 text-xs">
                  <div>
                    <span className="text-[10.5px] text-slate-500 font-medium block">Costi Sostenuti Pro Loco</span>
                    <span className="text-base font-black text-slate-900 font-mono block mt-0.5">
                      {(totaleConsuntivo || 0).toLocaleString('it-IT')} €
                    </span>
                    <span className="text-[10px] text-slate-400">100% uscite evento</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-slate-500 font-medium block">Entrate Realizzate Pro Loco</span>
                    <span className="text-base font-black text-emerald-800 font-mono block mt-0.5">
                      {(entrateRealizzate || 0).toLocaleString('it-IT')} €
                    </span>
                    <span className="text-[10px] text-slate-400">100% incassi evento</span>
                  </div>
                  <div>
                    <span className="text-[10.5px] text-slate-500 font-medium block">Utile / Risultato a Bilancio</span>
                    <span className={`text-base font-black font-mono block mt-0.5 ${
                      margineConsuntivo >= 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}>
                      {margineConsuntivo >= 0 ? `+${(margineConsuntivo || 0).toLocaleString('it-IT')}` : (margineConsuntivo || 0).toLocaleString('it-IT')} €
                    </span>
                    <span className="text-[10px] text-slate-400">Quota cassa finale</span>
                  </div>
                </div>
              </div>
            )}

            {tipoEvento === 'ibrido' && (
              <div className="bg-violet-50/70 border border-violet-300 rounded-xl p-4 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      2
                    </div>
                    <div>
                      <h5 className="font-bold text-violet-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>Gestione Economica: Evento Ibrido (Ripartizione con Partner)</span>
                      </h5>
                      <p className="text-[11px] text-violet-800">
                        Configura la divisione percentuale di spese ed entrate con l'ente co-organizzatore
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-violet-200/80 text-violet-900 border border-violet-300 self-start sm:self-auto">
                    Co-organizzazione
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-violet-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Ente Partner Co-organizzatore *
                    </label>
                    <input
                      type="text"
                      placeholder="Es. Comune, Parrocchia..."
                      value={partnerIbridoNome}
                      onChange={(e) => setPartnerIbridoNome(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      % Spese a carico Pro Loco
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentualeSpeseProLoco}
                        onChange={(e) => setPercentualeSpeseProLoco(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:bg-white"
                      />
                      <span className="text-[10.5px] text-violet-800 font-medium">
                        (Partner: {100 - (Number(percentualeSpeseProLoco) || 0)}%)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      % Entrate di competenza Pro Loco
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={percentualeEntrateProLoco}
                        onChange={(e) => setPercentualeEntrateProLoco(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-20 px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:bg-white"
                      />
                      <span className="text-[10.5px] text-violet-800 font-medium">
                        (Partner: {100 - (Number(percentualeEntrateProLoco) || 0)}%)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Contributo Versato dal Partner (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={contributoPartner}
                      onChange={(e) => setContributoPartner(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white"
                    />
                  </div>
                </div>

                {/* Tabella di Ripartizione Comparativa */}
                <div className="bg-white p-3 rounded-lg border border-violet-200">
                  <span className="text-[11px] font-bold text-violet-950 uppercase tracking-wide block mb-2">
                    Ripartizione Economica per il Bilancio Pro Loco:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10.5px] text-slate-500 font-bold block uppercase">Manifestazione Totale</span>
                      <div className="mt-1 space-y-0.5 font-mono">
                        <div className="flex justify-between"><span>Costi Complessivi:</span><strong>{(totaleConsuntivo || 0).toLocaleString('it-IT')} €</strong></div>
                        <div className="flex justify-between"><span>Entrate Complessive:</span><strong>{(entrateRealizzate || 0).toLocaleString('it-IT')} €</strong></div>
                        <div className="flex justify-between border-t border-slate-200 pt-0.5"><span>Risultato Totale:</span><strong>{margineConsuntivo >= 0 ? `+${(margineConsuntivo || 0)}` : (margineConsuntivo || 0)} €</strong></div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-300">
                      <span className="text-[10.5px] text-emerald-900 font-bold block uppercase">Competenza PRO LOCO (Bilancio)</span>
                      <div className="mt-1 space-y-0.5 font-mono">
                        <div className="flex justify-between text-slate-700"><span>Costi a carico Pro Loco:</span><strong className="text-slate-900">{(economiaCalcolata.costiCompetenzaProLoco || 0).toLocaleString('it-IT')} €</strong></div>
                        <div className="flex justify-between text-slate-700"><span>Entrate spettanti Pro Loco:</span><strong className="text-emerald-800">{(economiaCalcolata.entrateCompetenzaProLoco || 0).toLocaleString('it-IT')} €</strong></div>
                        <div className="flex justify-between border-t border-emerald-200 pt-0.5">
                          <span className="font-bold text-emerald-950">Margine Bilancio Pro Loco:</span>
                          <strong className={(economiaCalcolata.margineCompetenzaProLoco || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                            {(economiaCalcolata.margineCompetenzaProLoco || 0) >= 0 ? `+${(economiaCalcolata.margineCompetenzaProLoco || 0).toLocaleString('it-IT')}` : (economiaCalcolata.margineCompetenzaProLoco || 0).toLocaleString('it-IT')} €
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 bg-violet-50/70 rounded-lg border border-violet-200">
                      <span className="text-[10.5px] text-violet-900 font-bold block uppercase">Quota Ente Partner ({partnerIbridoNome || 'Partner'})</span>
                      <div className="mt-1 space-y-0.5 font-mono text-slate-700">
                        <div className="flex justify-between"><span>Costi a carico Partner:</span><strong>{(economiaCalcolata.costiCompetenzaPartner || 0).toLocaleString('it-IT')} €</strong></div>
                        <div className="flex justify-between"><span>Entrate spettanti Partner:</span><strong>{(economiaCalcolata.entrateCompetenzaPartner || 0).toLocaleString('it-IT')} €</strong></div>
                        <div className="flex justify-between border-t border-violet-200 pt-0.5"><span>Margine Partner:</span><strong>{(economiaCalcolata.margineCompetenzaPartner || 0) >= 0 ? `+${economiaCalcolata.margineCompetenzaPartner}` : economiaCalcolata.margineCompetenzaPartner} €</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {tipoEvento === 'gestione' && (
              <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      3
                    </div>
                    <div>
                      <h5 className="font-bold text-amber-950 text-xs sm:text-sm flex items-center gap-1.5">
                        <span>Gestione Economica: Evento in Gestione per Conto Terzi</span>
                      </h5>
                      <p className="text-[11px] text-amber-800">
                        Convenzione di servizio: la Pro Loco gestisce l'evento per conto del committente a fronte di compenso o rimborsi
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300 self-start sm:self-auto">
                    Convenzione Terzi
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-amber-200">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Ente Committente / Affidatario *
                    </label>
                    <input
                      type="text"
                      placeholder="Es. Comune, Parrocchia..."
                      value={committenteNome}
                      onChange={(e) => setCommittenteNome(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Tipologia Accordo Economico
                    </label>
                    <select
                      value={tipoAccordoGestione}
                      onChange={(e) => setTipoAccordoGestione(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:bg-white"
                    >
                      <option value="compenso_forfettario">Compenso forfettario pattuito</option>
                      <option value="rimborso_piu_fee">Rimborso spese a piè di lista + Fee</option>
                      <option value="incassi_delegati">Incassi cassa delegati / somministrazione</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Compenso di Gestione Concordato (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={compensoGestione}
                      onChange={(e) => setCompensoGestione(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold text-amber-900 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Rimborso Spese dal Committente (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={rimborsoSpeseCommittente}
                      onChange={(e) => setRimborsoSpeseCommittente(Math.max(0, Number(e.target.value)))}
                      className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:bg-white"
                    />
                  </div>
                </div>

                {/* Tabella di Gestione Comparativa */}
                <div className="bg-white p-3 rounded-lg border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wide block mb-2">
                    Riepilogo Economico di Gestione per il Bilancio Pro Loco:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span className="text-[10.5px] text-slate-500 font-bold block uppercase">Spese Operative Gestite</span>
                      <span className="text-base font-black text-slate-900 font-mono block mt-1">
                        {(totaleConsuntivo || 0).toLocaleString('it-IT')} €
                      </span>
                      <span className="text-[10px] text-slate-400">Anticipate per food, spettacolo, logistica</span>
                    </div>

                    <div className="p-2.5 bg-amber-50/70 rounded-lg border border-amber-200">
                      <span className="text-[10.5px] text-amber-900 font-bold block uppercase">Entrate da Committente ({committenteNome || 'Committente'})</span>
                      <span className="text-base font-black text-amber-900 font-mono block mt-1">
                        {(economiaCalcolata.entrateCompetenzaProLoco || 0).toLocaleString('it-IT')} €
                      </span>
                      <span className="text-[10px] text-amber-700">
                        Compenso ({compensoGestione} €) + Rimborsi ({rimborsoSpeseCommittente} €)
                      </span>
                    </div>

                    <div className="p-2.5 bg-emerald-50/70 rounded-lg border border-emerald-300">
                      <span className="text-[10.5px] text-emerald-900 font-bold block uppercase">Utile Netto Gestione Pro Loco (Bilancio)</span>
                      <span className={`text-base font-black font-mono block mt-1 ${
                        (economiaCalcolata.margineCompetenzaProLoco || 0) >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}>
                        {(economiaCalcolata.margineCompetenzaProLoco || 0) >= 0 ? `+${(economiaCalcolata.margineCompetenzaProLoco || 0).toLocaleString('it-IT')}` : (economiaCalcolata.margineCompetenzaProLoco || 0).toLocaleString('it-IT')} €
                      </span>
                      <span className="text-[10px] text-emerald-700">Margine utile per la cassa associativa</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Grafico a Torta Interattivo Integrato */}
            {mostraGraficoTorta && (
              <div className="pt-2">
                <EventBudgetChart
                  spesePreventivo={spesePrev}
                  speseConsuntivo={speseCons}
                  entratePreviste={entratePreviste}
                  entrateRealizzate={entrateRealizzate}
                />
              </div>
            )}

          </div>

          {/* Sezione 4: Volontari & Responsabile (Collegamento con Anagrafica Soci) */}
          <div id="sezione-staff-evento" className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/50 scroll-mt-2">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-700" />
                <span>Squadra Volontari & Referente (dal Database Soci)</span>
              </span>
              <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                {volontariIds.length} volontari assegnati
              </span>
            </h4>

            {/* Responsabile */}
            <div className="mb-3">
              <label className="block text-slate-700 font-semibold mb-1 text-[11px]">
                Socio Responsabile / Coordinatore dell'Evento:
              </label>
              <select
                value={responsabileId}
                onChange={(e) => setResponsabileId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              >
                <option value="">-- Seleziona coordinatore --</option>
                {soci.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.cognome} {s.nome} ({s.numeroTessera} - {s.ruoloDirettivo !== 'Nessuno' ? s.ruoloDirettivo : s.categoria})
                  </option>
                ))}
              </select>
            </div>

            {/* Selezione Rapida Volontari */}
            <div>
              <span className="block text-slate-700 font-semibold mb-1 text-[11px]">
                Soci Volontari Convocati per Turni e Allestimento:
              </span>
              <div className="max-h-36 overflow-y-auto bg-white p-2 rounded-lg border border-slate-200 divide-y divide-slate-100">
                {soci.map(socio => {
                  const isChecked = volontariIds.includes(socio.id);
                  return (
                    <label
                      key={socio.id}
                      onClick={() => handleToggleVolontario(socio.id)}
                      className="flex items-center justify-between py-1.5 px-2 hover:bg-slate-50 rounded cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-300" />
                        )}
                        <span className="font-medium text-slate-800">
                          {socio.cognome} {socio.nome}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {socio.numeroTessera}
                        </span>
                      </div>
                      {socio.competenzeVolontariato && socio.competenzeVolontariato.length > 0 && (
                        <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                          {socio.competenzeVolontariato[0]}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sezione 5: Stand Numerati & Riferimento Food (Specifiche di Allestimento) */}
          <div id="sezione-stand-evento" className="border border-slate-200 p-3.5 rounded-xl bg-slate-50/70 space-y-3 scroll-mt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-200">
              <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <Store className="w-4 h-4 text-amber-600" />
                <span>Stand Numerati, Tipologia & Riferimento Food ({standNumerati.length} Stand)</span>
              </h4>
              <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                {standNumerati.filter(s => s.riferimentoFood).length} Stand con Somministrazione Food & Beverage
              </span>
            </div>

            <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-2.5 text-[11px] text-amber-900 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong>Dotazione Operativa Condivisa:</strong> Tutti e tre i modelli (1. Nativo, 2. Ibrido, 3. Gestione) sono allestiti con la stessa identica struttura di stand numerati, tipologie merceologiche e voci di costo. L'unica variazione risiede nell'architettura della gestione economica.
              </div>
            </div>

            {/* Griglia Stand Numerati */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {standNumerati.map((stand, idx) => (
                <div
                  key={stand.id || stand.numero}
                  className="bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-md font-mono font-bold text-[11px] flex items-center justify-center text-white shrink-0 ${
                        stand.riferimentoFood ? 'bg-emerald-700' : 'bg-slate-700'
                      }`}>
                        #{stand.numero}
                      </span>
                      <strong className="text-slate-900 text-xs truncate max-w-[180px]">
                        {stand.nome}
                      </strong>
                    </div>
                    <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                      stand.riferimentoFood
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {stand.riferimentoFood ? 'Rif. Food & Beverage' : 'Servizi / No-Food'}
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="font-semibold text-slate-700">Tipologia:</span>
                    <span className="text-slate-900 font-medium">{stand.tipologia}</span>
                  </div>

                  {stand.descrizione && (
                    <p className="text-[10px] text-slate-500 italic leading-snug">
                      {stand.descrizione}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Ref: <strong className="text-slate-700 font-normal">{stand.responsabile || 'In assegnazione'}</strong></span>
                    {stand.incassoStimato ? (
                      <span className="font-mono text-emerald-800 font-bold">
                        Stima: {(stand.incassoStimato || 0).toLocaleString('it-IT')} €
                      </span>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sezione 6: Conformità e Burocrazia Pro Loco */}
          <div id="sezione-permessi-evento" className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 scroll-mt-2">
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>Pratiche Autorizzative & Burocrazia Obbligatoria</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={permessoComunale}
                  onChange={(e) => setPermessoComunale(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Patrocinio & Suolo Pubblico</span>
                  <span className="text-[10px] text-slate-500">Delibera o richiesta Comune</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={licenzaSIAE}
                  onChange={(e) => setLicenzaSIAE(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Permesso SIAE / Diritto d'Autore</span>
                  <span className="text-[10px] text-slate-500">Musica dal vivo, DJ o filodiffusione</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pianoSicurezzaSafety}
                  onChange={(e) => setPianoSicurezzaSafety(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Piano Safety & Sicurezza</span>
                  <span className="text-[10px] text-slate-500">Vie di fuga, estintori, pronto soccorso</span>
                </div>
              </label>

              <label className="flex items-center gap-2 p-2 bg-white rounded-lg border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aslHaccp}
                  onChange={(e) => setAslHaccp(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">Notifica Sanitaria ASL / HACCP</span>
                  <span className="text-[10px] text-slate-500">Cucina sagra o somministrazione alimenti</span>
                </div>
              </label>
            </div>
          </div>

          {/* Note Organizzative */}
          <div>
            <label className="block font-semibold text-slate-800 mb-1">
              Note Operative Interne & Logistica
            </label>
            <input
              type="text"
              placeholder="Orari montaggio cucine, noleggio furgone, allaccio luce..."
              value={noteOrganizzative}
              onChange={(e) => setNoteOrganizzative(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          </div>

          {/* Barra Pulsanti - Fissa in basso sempre visibile su qualunque monitor */}
          <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50/95 flex items-center justify-between shrink-0">
            <div className="hidden sm:flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 text-[11px] font-semibold">
                Costi Previsti: €{(totalePreventivo || 0).toLocaleString('it-IT')}
              </span>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold ${
                (marginePreventivo || 0) >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {(marginePreventivo || 0) >= 0 ? 'Margine Prev: +' : 'Disavanzo: '}€{(marginePreventivo || 0).toLocaleString('it-IT')}
              </span>
            </div>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <CheckSquare className="w-4 h-4" />
                <span>{isModifica ? 'Salva Modifiche Evento' : 'Pianifica e Salva Evento'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
