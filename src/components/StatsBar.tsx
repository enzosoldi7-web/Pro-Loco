import React, { useState, useMemo } from 'react';
import { Socio, ProLocoInfo } from '../types';
import { getStatoQuotaSocio } from '../storage';
import { calcolaScadenzaQuota, getSociNonRinnovati } from '../utils/quoteHelpers';
import { PromemoriaRinnovoModal } from './PromemoriaRinnovoModal';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Euro, 
  TrendingUp, 
  Bell, 
  Calendar, 
  AlertCircle,
  ChevronRight,
  Send
} from 'lucide-react';

interface StatsBarProps {
  soci: Socio[];
  annoSelezionato: number;
  config: ProLocoInfo;
  onRegistraPagamento?: (socio: Socio) => void;
  onFiltraDaRinnovare?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ 
  soci, 
  annoSelezionato, 
  config,
  onRegistraPagamento,
  onFiltraDaRinnovare
}) => {
  const [mostraModalPromemoria, setMostraModalPromemoria] = useState<boolean>(false);
  const totaleSoci = soci.length;
  
  let inRegola = 0;
  let daRinnovare = 0;
  let scadute = 0;
  let incassoAnno = 0;
  let numeroQuoteIncassate = 0;

  soci.forEach(socio => {
    const stato = getStatoQuotaSocio(socio, annoSelezionato);
    if (stato === 'in_regola') inRegola++;
    else if (stato === 'da_rinnovare') daRinnovare++;
    else scadute++;

    const quoteAnno = socio.quote?.filter(q => q.anno === annoSelezionato) || [];
    quoteAnno.forEach(q => {
      incassoAnno += Number(q.importo) || 0;
      numeroQuoteIncassate++;
    });
  });

  const percentualeInRegola = totaleSoci > 0 ? Math.round((inRegola / totaleSoci) * 100) : 0;

  // Calcolo avanzato soci non rinnovati, quote da incassare e scadenza
  const sociNonRinnovati = useMemo(() => {
    return getSociNonRinnovati(soci, annoSelezionato, config);
  }, [soci, annoSelezionato, config]);

  const totaleNonRinnovati = sociNonRinnovati.length;

  const totaleQuoteDaIncassare = useMemo(() => {
    return sociNonRinnovati.reduce((acc, curr) => acc + curr.importoDovuto, 0);
  }, [sociNonRinnovati]);

  const scadenza = useMemo(() => {
    return calcolaScadenzaQuota(annoSelezionato);
  }, [annoSelezionato]);

  return (
    <div className="space-y-3 no-print mb-6">
      
      {/* 1. LE 4 SCHEDE KPI PRINCIPALI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        
        {/* Scheda Totale Soci */}
        <div className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Totale Soci
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-slate-900">{totaleSoci}</span>
              <span className="text-xs text-slate-500 font-medium">iscritti all'albo</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {soci.filter(s => s.categoria === 'Volontario Attivo' || s.categoria === 'Membro Direttivo').length} attivi/direttivo
            </p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Scheda In Regola Quota */}
        <div className="bg-white rounded-xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
                In Regola {annoSelezionato}
              </p>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700">{inRegola}</span>
              <span className="text-xs font-bold text-emerald-600">
                {percentualeInRegola}%
              </span>
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${percentualeInRegola}%` }}
              />
            </div>
          </div>
          <div className="w-11 h-11 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Scheda Da Rinnovare (Evidenziata con badge e pulsante promemoria) */}
        <div className={`bg-white rounded-xl p-4 border shadow-xs flex flex-col justify-between transition-all ${
          totaleNonRinnovati > 0 
            ? 'border-amber-300 ring-1 ring-amber-200/60' 
            : 'border-slate-200'
        }`}>
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
                  Da Rinnovare {annoSelezionato}
                </p>
                {totaleNonRinnovati > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300/60 animate-pulse">
                    Attesa
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-amber-600">{totaleNonRinnovati}</span>
                <span className="text-xs text-amber-700 font-medium">non regolarizzati</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 border border-amber-200/80">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-mono font-bold text-amber-800">
              € {(totaleQuoteDaIncassare || 0).toLocaleString('it-IT')} da incassare
            </span>

            {totaleNonRinnovati > 0 && (
              <button
                onClick={() => setMostraModalPromemoria(true)}
                className="text-amber-800 hover:text-amber-950 font-bold flex items-center gap-0.5 underline transition-colors cursor-pointer"
                title="Apri pannello promemoria e notifiche soci"
              >
                <Bell className="w-3 h-3 text-amber-600" />
                <span>Sollecita</span>
              </button>
            )}
          </div>
        </div>

        {/* Scheda Incasso Quote Anno */}
        <div className="bg-white rounded-xl p-4 border border-teal-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1">
              <p className="text-xs font-semibold text-teal-800 uppercase tracking-wider">
                Incasso Quote {annoSelezionato}
              </p>
            </div>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-black text-teal-800">
                {(incassoAnno || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-teal-600" />
              <span>{numeroQuoteIncassate} ricevute emesse</span>
            </p>
          </div>
          <div className="w-11 h-11 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0 border border-teal-100">
            <Euro className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* 2. BANNER INTERATTIVO DI AVVISO SCADENZA E SOLLECITO QUOTE */}
      {totaleNonRinnovati > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-amber-50/90 to-amber-100/70 border border-amber-300/80 rounded-xl p-3.5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Bell className="w-4 h-4" />
            </div>

            <div className="text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-amber-950">
                  {totaleNonRinnovati} soci devono ancora rinnovare la quota associativa {annoSelezionato}
                </span>
                <span className="font-black text-emerald-800 bg-white/80 border border-amber-300/70 px-2 py-0.5 rounded font-mono">
                  Totale da incassare: € {(totaleQuoteDaIncassare || 0).toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="text-amber-800/90 mt-0.5 flex flex-wrap items-center gap-2 text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-amber-700" />
                  <strong>Data di Scadenza Statutaria:</strong> {scadenza.dataScadenzaEsercizio} ({scadenza.etichettaTempo})
                </span>
                <span className="hidden md:inline">•</span>
                <span className="text-amber-900/80">
                  Termine tolleranza assembleare: <strong>{scadenza.dataLimiteAssemblea}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            {onFiltraDaRinnovare && (
              <button
                onClick={onFiltraDaRinnovare}
                className="px-3 py-1.5 bg-white hover:bg-amber-50 text-amber-900 border border-amber-300 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              >
                Vedi Elenco
              </button>
            )}

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

      {/* MODALE PROMEMORIA E NOTIFICHE RINNOVO */}
      {mostraModalPromemoria && (
        <PromemoriaRinnovoModal
          soci={soci}
          annoSelezionato={annoSelezionato}
          config={config}
          onClose={() => setMostraModalPromemoria(false)}
          onRegistraPagamento={onRegistraPagamento}
        />
      )}

    </div>
  );
};
