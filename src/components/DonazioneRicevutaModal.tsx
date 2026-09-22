import React, { useRef } from 'react';
import { DonazioneTerzi, ProLocoInfo } from '../types';
import { Printer, X, HeartHandshake, ShieldCheck, Download, Award } from 'lucide-react';

interface DonazioneRicevutaModalProps {
  donazione: DonazioneTerzi;
  config: ProLocoInfo;
  onClose: () => void;
}

export const DonazioneRicevutaModal: React.FC<DonazioneRicevutaModalProps> = ({
  donazione,
  config,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-6 flex flex-col max-h-[92vh]">
        
        {/* Barra di controllo non stampabile */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between no-print shrink-0">
          <div className="flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-sm font-bold">Ricevuta Ufficiale Erogazione Liberale</h3>
              <p className="text-[11px] text-slate-400">Quietanza valida per detrazione/deduzione fiscale Art. 83 CTS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Stampa / Salva PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FOGLIO A4 RICEVUTA STAMPABILE */}
        <div 
          ref={printRef}
          className="p-8 sm:p-10 overflow-y-auto print:overflow-visible print:p-0 space-y-6 text-slate-800 font-sans bg-white"
        >
          {/* Intestazione Ente */}
          <div className="border-b-2 border-emerald-800 pb-4 flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-800">
                  Associazione Turistica Pro Loco
                </span>
                {config.numeroRunts && (
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-300">
                    Iscritta RUNTS: {config.numeroRunts}
                  </span>
                )}
              </div>
              <h1 className="text-xl font-black text-slate-950 tracking-tight mt-1">
                {config.nome.toUpperCase()}
              </h1>
              <p className="text-xs text-slate-600 mt-0.5">
                {config.indirizzo} - {config.cap} {config.comune} ({config.provincia}) • Cod. Fiscale: <strong>{config.codiceFiscale}</strong>
              </p>
              <p className="text-[11px] text-slate-500">
                Email: {config.email} • Tel: {config.telefono} • Iscritta all'Albo Regionale Pro Loco
              </p>
            </div>

            <div className="border border-emerald-300 bg-emerald-50/60 p-3 rounded-xl text-center shrink-0 min-w-[150px]">
              <span className="text-[10px] uppercase font-bold text-emerald-900 tracking-wider block">
                Ricevuta Erogazione
              </span>
              <span className="text-sm font-black text-emerald-950 font-mono block mt-0.5">
                N° {donazione.ricevutaNumero}
              </span>
              <span className="text-[10px] text-slate-500 block mt-1">
                Data: {donazione.data}
              </span>
            </div>
          </div>

          {/* Titolo Ricevuta */}
          <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Quietanza di Erogazione Liberale in Denaro
            </h2>
            <p className="text-[11px] text-slate-500">
              (Rilasciata ai sensi e per gli effetti dell'Articolo 83 del D.Lgs. 3 luglio 2017, n. 117 - Codice del Terzo Settore)
            </p>
          </div>

          {/* Corpo Ricevuta */}
          <div className="space-y-4 text-xs leading-relaxed text-slate-700">
            <p>
              Si attesta che in data <strong>{donazione.data}</strong> l'Associazione ha ricevuto a titolo di <strong>erogazione liberale</strong> la somma di:
            </p>

            <div className="p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase">Importo Erogato:</span>
              <span className="text-2xl font-black font-mono text-emerald-950">
                € {donazione.importo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-2">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-600">Soggetto Erogatore:</span>
                <span className="col-span-2 font-black text-slate-900">{donazione.donatore}</span>
              </div>
              {donazione.codiceFiscalePartitaIva && (
                <div className="grid grid-cols-3 gap-2">
                  <span className="font-bold text-slate-600">C.F. / Partita IVA:</span>
                  <span className="col-span-2 font-mono font-semibold text-slate-800">{donazione.codiceFiscalePartitaIva}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-600">Causale:</span>
                <span className="col-span-2 text-slate-800">{donazione.causale}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-600">Destinazione Vincolata:</span>
                <span className="col-span-2 text-slate-800">{donazione.destinazione || 'Attività Generali'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-bold text-slate-600">Modalità di Pagamento:</span>
                <span className="col-span-2 font-semibold text-slate-900">{donazione.metodo}</span>
              </div>
            </div>

            {/* Clausola Fiscale Art. 83 CTS */}
            <div className="p-3.5 rounded-xl border border-slate-300 bg-slate-50 text-[11px] space-y-1.5 text-slate-600">
              <div className="flex items-center gap-1.5 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span>Attestazione Fiscale e Beneficio per il Donatore:</span>
              </div>
              <p>
                L'Associazione dichiara che la somma è stata versata mediante strumento di pagamento tracciabile (bancario/postale/elettronico) nel rispetto dell'art. 83, comma 1 e 2 del D.Lgs. 117/2017. L'erogazione costituisce onere detraibile dall'IRPEF nella misura del 30% ovvero deducibile dal reddito complessivo netto del soggetto erogatore nel limite del 10% del reddito complessivo dichiarato.
              </p>
            </div>
          </div>

          {/* Firme e Luogo */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Luogo e Data</span>
              <span className="font-medium text-slate-800 block mt-3">
                {config.comune}, {donazione.data}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 uppercase block font-bold">Il Presidente / Il Tesoriere</span>
              <span className="font-bold text-slate-900 block mt-1">{config.nomePresidente}</span>
              <span className="text-[10px] text-slate-400 block mt-3">(Firma per quietanza e timbro)</span>
            </div>
          </div>

        </div>

        {/* Footer non stampabile */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between no-print shrink-0">
          <span className="text-xs text-slate-500">
            Documento generato dal gestionale della Pro Loco {config.nome}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
