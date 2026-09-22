import React, { useState, useMemo } from 'react';
import { StandEvento, ProLocoEvento, TipologiaStand, Socio } from '../types';
import { 
  X, 
  Store, 
  Plus, 
  Trash2, 
  ArrowUpDown, 
  RotateCcw, 
  Check, 
  Utensils, 
  Info,
  Euro,
  TrendingUp,
  TrendingDown,
  Shield,
  Sparkles
} from 'lucide-react';
import { STAND_SIMULATI_DEFAULT } from '../storage';

interface EventStandsModalProps {
  evento: ProLocoEvento;
  soci: Socio[];
  onSalva: (eventoAggiornato: ProLocoEvento) => void;
  onClose: () => void;
}

const TIPOLOGIE_STAND_PREDEFINITE: TipologiaStand[] = [
  'Food / Gastronomia',
  'Food / Griglia & Brace',
  'Food / Friggitoria & Dolci',
  'Beverage / Bar & Vini',
  'Cassa & Ticket',
  'Mercatino & Artigianato',
  'Info Point & Servizi'
];

export const EventStandsModal: React.FC<EventStandsModalProps> = ({
  evento,
  soci,
  onSalva,
  onClose
}) => {
  // Inizializza gli stand dell'evento
  const [stands, setStands] = useState<StandEvento[]>(() => {
    const esistenti = evento.standNumerati && evento.standNumerati.length > 0
      ? evento.standNumerati
      : STAND_SIMULATI_DEFAULT;

    return esistenti.map((s, idx) => {
      const def = STAND_SIMULATI_DEFAULT[idx] || STAND_SIMULATI_DEFAULT.find(d => d.numero === s.numero);
      return {
        ...s,
        spesaPreventivo: s.spesaPreventivo ?? def?.spesaPreventivo ?? 0,
        spesaConsuntivo: s.spesaConsuntivo ?? def?.spesaConsuntivo ?? 0,
        incassoPrevisto: s.incassoPrevisto ?? def?.incassoPrevisto ?? (s.incassoStimato || 0),
        incassoConsuntivo: s.incassoConsuntivo ?? def?.incassoConsuntivo ?? (s.incassoStimato || 0)
      };
    });
  });

  const [sincronizzaConEvento, setSincronizzaConEvento] = useState<boolean>(true);
  const [confermaRipristino, setConfermaRipristino] = useState<boolean>(false);
  const [avvisoMinimo, setAvvisoMinimo] = useState<boolean>(false);

  // Calcoli aggregati
  const totali = useMemo(() => {
    let totSpesePrev = 0;
    let totSpeseCons = 0;
    let totIncassiPrev = 0;
    let totIncassiCons = 0;
    let totFoodSpesePrev = 0;
    let totFoodSpeseCons = 0;
    let totFoodIncassiCons = 0;

    stands.forEach(s => {
      const spPrev = Number(s.spesaPreventivo) || 0;
      const spCons = Number(s.spesaConsuntivo) || 0;
      const incPrev = Number(s.incassoPrevisto) || 0;
      const incCons = Number(s.incassoConsuntivo) || 0;

      totSpesePrev += spPrev;
      totSpeseCons += spCons;
      totIncassiPrev += incPrev;
      totIncassiCons += incCons;

      if (s.riferimentoFood) {
        totFoodSpesePrev += spPrev;
        totFoodSpeseCons += spCons;
        totFoodIncassiCons += incCons;
      }
    });

    const diffSpese = totSpeseCons - totSpesePrev;
    const diffIncassi = totIncassiCons - totIncassiPrev;
    const margineCons = totIncassiCons - totSpeseCons;
    const marginePrev = totIncassiPrev - totSpesePrev;

    return {
      totSpesePrev,
      totSpeseCons,
      diffSpese,
      totIncassiPrev,
      totIncassiCons,
      diffIncassi,
      margineCons,
      marginePrev,
      totFoodSpesePrev,
      totFoodSpeseCons,
      totFoodIncassiCons,
      conteggioFood: stands.filter(s => s.riferimentoFood).length
    };
  }, [stands]);

  // Aggiorna singolo stand
  const handleAggiornaStand = (index: number, campo: keyof StandEvento, valore: any) => {
    setStands(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [campo]: valore
      };
      return copy;
    });
  };

  // Aggiungi nuovo stand
  const handleAggiungiStand = () => {
    const maxNum = stands.reduce((max, s) => Math.max(max, Number(s.numero) || 0), 0);
    const nuovoNum = maxNum + 1;
    const nuovoStand: StandEvento = {
      id: `std-custom-${Date.now()}`,
      numero: nuovoNum,
      nome: `Stand #${nuovoNum}`,
      tipologia: 'Food / Gastronomia',
      riferimentoFood: true,
      responsabile: '',
      spesaPreventivo: 0,
      spesaConsuntivo: 0,
      incassoPrevisto: 0,
      incassoConsuntivo: 0,
      descrizione: ''
    };
    setStands(prev => [...prev, nuovoStand]);
  };

  // Rimuovi stand
  const handleRimuoviStand = (index: number) => {
    if (stands.length <= 1) {
      setAvvisoMinimo(true);
      setTimeout(() => setAvvisoMinimo(false), 3000);
      return;
    }
    setStands(prev => prev.filter((_, i) => i !== index));
  };

  // Ordina stand per numero
  const handleOrdinaPerNumero = () => {
    setStands(prev => [...prev].sort((a, b) => (Number(a.numero) || 0) - (Number(b.numero) || 0)));
  };

  // Ripristina stand predefiniti
  const handleRipristinaPredefiniti = () => {
    setStands(STAND_SIMULATI_DEFAULT);
    setConfermaRipristino(false);
  };

  // Salva
  const handleSalva = () => {
    let eventoAggiornato: ProLocoEvento = {
      ...evento,
      standNumerati: stands
    };

    if (sincronizzaConEvento) {
      // Sincronizza i totali food e incassi dell'evento con le cifre inserite negli stand
      const spPrevCurrent = evento.spesePreventivo || { food: 0, intrattenimento: 0, altreSpese: 0, varie: 0 };
      const spConsCurrent = evento.speseConsuntivo || { food: 0, intrattenimento: 0, altreSpese: 0, varie: 0 };

      // Se ci sono spese stand food, aggiorna la voce food
      const newSpesePrev = {
        ...spPrevCurrent,
        food: totali.totFoodSpesePrev > 0 ? totali.totFoodSpesePrev : spPrevCurrent.food
      };
      const newSpeseCons = {
        ...spConsCurrent,
        food: totali.totFoodSpeseCons > 0 ? totali.totFoodSpeseCons : spConsCurrent.food
      };

      const totCostPrev = (newSpesePrev.food || 0) + (newSpesePrev.intrattenimento || 0) + (newSpesePrev.altreSpese || 0) + (newSpesePrev.varie || 0);
      const totCostCons = (newSpeseCons.food || 0) + (newSpeseCons.intrattenimento || 0) + (newSpeseCons.altreSpese || 0) + (newSpeseCons.varie || 0);

      eventoAggiornato = {
        ...eventoAggiornato,
        spesePreventivo: newSpesePrev,
        speseConsuntivo: newSpeseCons,
        budgetPrevisto: totCostPrev > 0 ? totCostPrev : evento.budgetPrevisto,
        costiSostenuti: totCostCons > 0 ? totCostCons : evento.costiSostenuti,
        entratePreviste: totali.totIncassiPrev > 0 ? totali.totIncassiPrev : evento.entratePreviste,
        entrateRealizzate: totali.totIncassiCons > 0 ? totali.totIncassiCons : evento.entrateRealizzate
      };
    }

    onSalva(eventoAggiornato);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 no-print overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-5xl w-full max-h-[95vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Intestazione */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Store className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Inserimento Dati Stand Numerati
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                  {evento.tipoEvento.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-xl">
                {evento.titolo} • Preventivo, Consuntivo e Differenza per singolo stand
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra KPI Totali Stand */}
        <div className="bg-slate-900 text-white px-5 sm:px-6 py-3 shrink-0 border-b border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            
            {/* Totale Stand */}
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Stand Configurati
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black font-mono text-white">
                  {stands.length}
                </span>
                <span className="text-[11px] text-amber-400 font-medium">
                  ({totali.conteggioFood} Food & Bev)
                </span>
              </div>
            </div>

            {/* Totale Spese Stand */}
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Spese Stand (Cons. vs Prev.)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black font-mono text-white">
                  {totali.totSpeseCons.toLocaleString('it-IT')} €
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  (prev. {totali.totSpesePrev.toLocaleString('it-IT')} €)
                </span>
              </div>
              <div className="text-[10px] font-mono">
                {totali.diffSpese <= 0 ? (
                  <span className="text-emerald-400 font-bold">
                    Diff: {totali.diffSpese.toLocaleString('it-IT')} € (Risparmio)
                  </span>
                ) : (
                  <span className="text-rose-400 font-bold">
                    Diff: +{totali.diffSpese.toLocaleString('it-IT')} € (Scostamento)
                  </span>
                )}
              </div>
            </div>

            {/* Totale Incassi Stand */}
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Incassi Stand (Cons. vs Prev.)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black font-mono text-emerald-400">
                  {totali.totIncassiCons.toLocaleString('it-IT')} €
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  (prev. {totali.totIncassiPrev.toLocaleString('it-IT')} €)
                </span>
              </div>
              <div className="text-[10px] font-mono">
                {totali.diffIncassi >= 0 ? (
                  <span className="text-emerald-400 font-bold">
                    Diff: +{totali.diffIncassi.toLocaleString('it-IT')} € (Extra ricavi)
                  </span>
                ) : (
                  <span className="text-amber-400 font-bold">
                    Diff: {totali.diffIncassi.toLocaleString('it-IT')} € (Minori ricavi)
                  </span>
                )}
              </div>
            </div>

            {/* Margine Netto Stand */}
            <div className="space-y-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                Margine Netto Stand (Inc. - Spese)
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className={`text-lg font-black font-mono ${
                  totali.margineCons >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {totali.margineCons >= 0 ? `+${totali.margineCons.toLocaleString('it-IT')}` : totali.margineCons.toLocaleString('it-IT')} €
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                Previsto: {totali.marginePrev >= 0 ? `+${totali.marginePrev.toLocaleString('it-IT')}` : totali.marginePrev.toLocaleString('it-IT')} €
              </div>
            </div>

          </div>
        </div>

        {/* Toolbar Azioni Stand */}
        <div className="px-5 sm:px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAggiungiStand}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Aggiungi Stand</span>
            </button>
            <button
              type="button"
              onClick={handleOrdinaPerNumero}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium text-xs transition-colors cursor-pointer"
              title="Ordina la lista per numero progressivo stand"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              <span>Ordina per Numero</span>
            </button>
            {confermaRipristino ? (
              <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-300 p-1 rounded-lg text-xs">
                <span className="text-amber-800 font-medium px-1">Confermi ripristino 6 stand?</span>
                <button
                  type="button"
                  onClick={handleRipristinaPredefiniti}
                  className="px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-[11px] cursor-pointer"
                >
                  Sì, ripristina
                </button>
                <button
                  type="button"
                  onClick={() => setConfermaRipristino(false)}
                  className="px-2 py-0.5 bg-white text-slate-600 hover:bg-slate-100 rounded text-[11px] cursor-pointer border border-slate-300"
                >
                  Annulla
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfermaRipristino(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 font-medium text-xs transition-colors cursor-pointer"
                title="Ripristina la configurazione tipica con 6 stand"
              >
                <RotateCcw className="w-3 h-3 text-slate-400" />
                <span>Predefiniti (6 Stand)</span>
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={sincronizzaConEvento}
              onChange={(e) => setSincronizzaConEvento(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
            />
            <span className="font-medium">
              Sincronizza automaticamente le voci Food e Incassi dell'evento
            </span>
          </label>
        </div>

        {avvisoMinimo && (
          <div className="mx-5 sm:mx-6 mt-3 px-3 py-2 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium flex items-center justify-between">
            <span>È necessario mantenere configurato almeno uno stand per l'evento.</span>
            <button type="button" onClick={() => setAvvisoMinimo(false)} className="text-amber-700 hover:text-amber-900 font-bold">×</button>
          </div>
        )}

        {/* Lista / Schede Stand Editabili */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="space-y-3">
            {stands.map((stand, index) => {
              const spPrev = Number(stand.spesaPreventivo) || 0;
              const spCons = Number(stand.spesaConsuntivo) || 0;
              const diffSp = spCons - spPrev;
              const isRisparmioSpesa = diffSp <= 0;

              const incPrev = Number(stand.incassoPrevisto) || 0;
              const incCons = Number(stand.incassoConsuntivo) || 0;
              const diffInc = incCons - incPrev;
              const isExtraIncasso = diffInc >= 0;

              const margineStand = incCons - spCons;

              return (
                <div
                  key={stand.id || index}
                  className="bg-white rounded-xl border border-slate-300 shadow-xs hover:border-slate-400 transition-all p-3.5 space-y-3"
                >
                  {/* Riga Superiore: Numero, Nome, Tipologia, Riferimento Food e Azioni */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2.5 flex-1">
                      
                      {/* Numero Stand Editabile */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                        <span className="text-[10px] font-bold text-slate-500 uppercase px-1">
                          N°
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="999"
                          value={stand.numero}
                          onChange={(e) => handleAggiornaStand(index, 'numero', Math.max(1, Number(e.target.value)))}
                          className="w-14 px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono font-black text-xs text-center text-slate-900 focus:ring-1 focus:ring-emerald-500 outline-none"
                          title="Numero dello stand (in base all'esigenza organizzativa)"
                        />
                      </div>

                      {/* Nome Stand Editabile */}
                      <div className="flex-1 min-w-[200px]">
                        <input
                          type="text"
                          value={stand.nome}
                          onChange={(e) => handleAggiornaStand(index, 'nome', e.target.value)}
                          placeholder="Denominazione stand (es. Cucina, Griglia...)"
                          className="w-full px-2.5 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                        />
                      </div>

                      {/* Tipologia Stand */}
                      <div className="min-w-[170px]">
                        <select
                          value={stand.tipologia}
                          onChange={(e) => handleAggiornaStand(index, 'tipologia', e.target.value)}
                          className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                        >
                          {TIPOLOGIE_STAND_PREDEFINITE.map(tip => (
                            <option key={tip} value={tip}>{tip}</option>
                          ))}
                        </select>
                      </div>

                      {/* Toggle Riferimento Food */}
                      <button
                        type="button"
                        onClick={() => handleAggiornaStand(index, 'riferimentoFood', !stand.riferimentoFood)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          stand.riferimentoFood
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                        }`}
                        title="Indica se lo stand è parte del circuito gastronomico / somministrazione Food & Beverage"
                      >
                        <Utensils className={`w-3 h-3 ${stand.riferimentoFood ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span>{stand.riferimentoFood ? 'Rif. Food & Beverage' : 'Servizi / No-Food'}</span>
                      </button>

                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                      {/* Responsabile Stand */}
                      <input
                        type="text"
                        value={stand.responsabile || ''}
                        onChange={(e) => handleAggiornaStand(index, 'responsabile', e.target.value)}
                        placeholder="Referente stand..."
                        className="w-36 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-700 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                      />

                      {/* Elimina Stand */}
                      <button
                        type="button"
                        onClick={() => handleRimuoviStand(index)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Elimina questo stand"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Griglia Cifre Economiche: Spese (Prev, Cons, Diff) | Incassi (Prev, Cons, Diff) | Margine */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200">
                    
                    {/* Blocco 1: SPESE STAND (Preventivo, Consuntivo e Differenza) */}
                    <div className="space-y-1 bg-white p-2 rounded-md border border-slate-200">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Spese Stand</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isRisparmioSpesa ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {diffSp <= 0 ? `Diff: ${diffSp} € (Risparmio)` : `Diff: +${diffSp} € (Extra)`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-500">Preventivo (€)</label>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={stand.spesaPreventivo ?? ''}
                            onChange={(e) => handleAggiornaStand(index, 'spesaPreventivo', Math.max(0, Number(e.target.value)))}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500">Consuntivo (€)</label>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={stand.spesaConsuntivo ?? ''}
                            onChange={(e) => handleAggiornaStand(index, 'spesaConsuntivo', Math.max(0, Number(e.target.value)))}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Blocco 2: INCASSI STAND (Preventivo, Consuntivo e Differenza) */}
                    <div className="space-y-1 bg-white p-2 rounded-md border border-slate-200">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Incassi Stand</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          isExtraIncasso ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {diffInc >= 0 ? `Diff: +${diffInc} €` : `Diff: ${diffInc} €`}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <label className="block text-[10px] text-slate-500">Preventivo (€)</label>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={stand.incassoPrevisto ?? ''}
                            onChange={(e) => handleAggiornaStand(index, 'incassoPrevisto', Math.max(0, Number(e.target.value)))}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] text-slate-500">Consuntivo (€)</label>
                          <input
                            type="number"
                            min="0"
                            step="10"
                            value={stand.incassoConsuntivo ?? ''}
                            onChange={(e) => handleAggiornaStand(index, 'incassoConsuntivo', Math.max(0, Number(e.target.value)))}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-emerald-800 focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Blocco 3: MARGINE NETTO STAND */}
                    <div className="space-y-1 bg-white p-2 rounded-md border border-slate-200 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Margine Netto Stand</span>
                        <span className="text-[10px] text-slate-400">Consuntivo</span>
                      </div>
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xs text-slate-500">Incassi - Spese:</span>
                        <span className={`text-base font-black font-mono ${
                          margineStand >= 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}>
                          {margineStand >= 0 ? `+${margineStand.toLocaleString('it-IT')}` : margineStand.toLocaleString('it-IT')} €
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono text-right">
                        Previsto: {(incPrev - spPrev) >= 0 ? `+${incPrev - spPrev}` : incPrev - spPrev} €
                      </div>
                    </div>

                  </div>

                  {/* Descrizione / Note dello Stand opzionale */}
                  <div>
                    <input
                      type="text"
                      value={stand.descrizione || ''}
                      onChange={(e) => handleAggiornaStand(index, 'descrizione', e.target.value)}
                      placeholder="Note allestimento, attrezzature, menù o prescrizioni HACCP per questo stand..."
                      className="w-full px-2.5 py-1 bg-slate-50/60 border border-slate-200 rounded text-[11px] text-slate-600 italic focus:bg-white focus:ring-1 focus:ring-emerald-500 outline-none"
                    />
                  </div>

                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Barra Pulsanti */}
        <div className="px-5 sm:px-6 py-3 border-t border-slate-200 bg-slate-50/95 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            {stands.length} stand configurati con bilancio analitico e numerazione personalizzabile
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
              type="button"
              onClick={handleSalva}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salva Dati Stand & Bilancio</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
