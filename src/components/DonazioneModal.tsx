import React, { useState } from 'react';
import { DonazioneTerzi, TipoDonatore } from '../types';
import { HeartHandshake, X, Check, FileText, AlertCircle, Building, User, Landmark, ShieldCheck } from 'lucide-react';

interface DonazioneModalProps {
  donazione: DonazioneTerzi | null;
  annoSelezionato: number;
  prossimoNumeroRicevuta: string;
  onSalva: (donazione: DonazioneTerzi) => void;
  onClose: () => void;
}

export const DonazioneModal: React.FC<DonazioneModalProps> = ({
  donazione,
  annoSelezionato,
  prossimoNumeroRicevuta,
  onSalva,
  onClose
}) => {
  const isModifica = Boolean(donazione);

  const [data, setData] = useState<string>(() => {
    if (donazione?.data) return donazione.data;
    const now = new Date();
    return `${annoSelezionato}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  const [donatore, setDonatore] = useState<string>(donazione?.donatore || '');
  const [tipoDonatore, setTipoDonatore] = useState<TipoDonatore>(donazione?.tipoDonatore || 'privato');
  const [codiceFiscalePartitaIva, setCodiceFiscalePartitaIva] = useState<string>(donazione?.codiceFiscalePartitaIva || '');
  const [importo, setImporto] = useState<string>(donazione ? donazione.importo.toString() : '');
  const [causale, setCausale] = useState<string>(donazione?.causale || 'Erogazione liberale per sostegno attività istituzionali');
  const [destinazione, setDestinazione] = useState<string>(donazione?.destinazione || 'Attività Statutarie Generali');
  const [metodo, setMetodo] = useState<string>(donazione?.metodo || 'Bonifico Bancario');
  const [detraibileFiscale, setDetraibileFiscale] = useState<boolean>(donazione ? donazione.detraibileFiscale : true);
  const [ricevutaNumero, setRicevutaNumero] = useState<string>(donazione?.ricevutaNumero || prossimoNumeroRicevuta);
  const [note, setNote] = useState<string>(donazione?.note || '');
  const [errore, setErrore] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrore(null);

    if (!donatore.trim()) {
      setErrore('Inserisci il nome o la ragione sociale del donatore.');
      return;
    }

    const impNum = parseFloat(importo);
    if (isNaN(impNum) || impNum <= 0) {
      setErrore('Inserisci un importo valido maggiore di 0 €.');
      return;
    }

    const annoCalcolato = data ? parseInt(data.substring(0, 4), 10) : annoSelezionato;

    const donazioneDaSalvare: DonazioneTerzi = {
      id: donazione?.id || `don-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      data,
      anno: isNaN(annoCalcolato) ? annoSelezionato : annoCalcolato,
      donatore: donatore.trim(),
      tipoDonatore,
      codiceFiscalePartitaIva: codiceFiscalePartitaIva.trim().toUpperCase() || undefined,
      importo: Math.round(impNum * 100) / 100,
      causale: causale.trim(),
      destinazione: destinazione.trim() || undefined,
      metodo: metodo as any,
      detraibileFiscale,
      ricevutaNumero: ricevutaNumero.trim() || prossimoNumeroRicevuta,
      note: note.trim() || undefined
    };

    onSalva(donazioneDaSalvare);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200 my-8">
        
        {/* Header Modale */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <HeartHandshake className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="font-black text-base text-white">
                {isModifica ? 'Modifica Erogazione Liberale' : 'Registra Donazione da Terzi'}
              </h3>
              <p className="text-xs text-emerald-200">
                Registrazione contabile conforme RUNTS ed ex Art. 83 Codice del Terzo Settore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {errore && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errore}</span>
            </div>
          )}

          {/* Dati Ricevuta e Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Data Ricezione Donazione *
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Numero Ricevuta Ufficiale
              </label>
              <input
                type="text"
                value={ricevutaNumero}
                onChange={(e) => setRicevutaNumero(e.target.value)}
                placeholder="Es. DON-2025-001"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Dati Donatore */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Donatore / Ente Erogante *
              </label>
              <input
                type="text"
                required
                value={donatore}
                onChange={(e) => setDonatore(e.target.value)}
                placeholder="Nome Cognome oppure Ragione Sociale (Es. Banca Locale, Azienda Rossi)"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipologia Soggetto Erogante
                </label>
                <select
                  value={tipoDonatore}
                  onChange={(e) => setTipoDonatore(e.target.value as TipoDonatore)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
                >
                  <option value="privato">Persona Fisica (Cittadino / Sostenitore)</option>
                  <option value="azienda">Impresa / Azienda commerciale</option>
                  <option value="fondazione">Fondazione Bancaria / Erogatrice</option>
                  <option value="ente_benefico">Ente Terzo Settore / Onlus</option>
                  <option value="associazione">Associazione / Pro Loco consorella</option>
                  <option value="anonimo">Anonimo / Offerte spontanee</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Codice Fiscale o P.IVA (consigliato)
                </label>
                <input
                  type="text"
                  value={codiceFiscalePartitaIva}
                  onChange={(e) => setCodiceFiscalePartitaIva(e.target.value)}
                  placeholder="C.F. o Partita IVA"
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 uppercase font-mono bg-white"
                />
              </div>
            </div>
          </div>

          {/* Importo e Metodo di Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Importo Donazione (€) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={importo}
                  onChange={(e) => setImporto(e.target.value)}
                  placeholder="0.00"
                  className="w-full text-sm font-bold font-mono px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pl-7"
                />
                <span className="absolute left-2.5 top-2 text-sm font-bold text-slate-400">€</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Metodo di Pagamento
              </label>
              <select
                value={metodo}
                onChange={(e) => setMetodo(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white"
              >
                <option value="Bonifico Bancario">Bonifico Bancario (Tracciabile)</option>
                <option value="Carta / POS">Carta di Credito / POS (Tracciabile)</option>
                <option value="Assegno Circolare / Bancario">Assegno Circolare / Bancario (Tracciabile)</option>
                <option value="Contanti">Contanti (Non detraibile ai fini fiscali)</option>
              </select>
            </div>
          </div>

          {/* Causale e Destinazione */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Causale Erogazione
              </label>
              <input
                type="text"
                value={causale}
                onChange={(e) => setCausale(e.target.value)}
                placeholder="Es. Erogazione liberale a sostegno attività"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Destinazione / Progetto Vincolato
              </label>
              <input
                type="text"
                value={destinazione}
                onChange={(e) => setDestinazione(e.target.value)}
                placeholder="Es. Attività Generali, Sagra Castagne, Restauro"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Detraibilità Fiscale Art. 83 CTS */}
          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="chk-detraibile"
              checked={detraibileFiscale}
              onChange={(e) => setDetraibileFiscale(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-700 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <label htmlFor="chk-detraibile" className="text-xs text-slate-700 cursor-pointer select-none">
              <span className="font-bold text-slate-900 block">
                Erogazione liberale detraibile/deducibile (Art. 83 D.Lgs. 117/2017)
              </span>
              <span className="text-[11px] text-slate-600 block mt-0.5">
                Spuntare se il pagamento è avvenuto tramite strumenti tracciabili (bonifico, POS, assegno). Consente al donatore la detrazione IRPEF del 30% o la deduzione dal reddito complessivo.
              </span>
            </label>
          </div>

          {/* Note Aggiuntive */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Note o estremi contabili (Opzionale)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Riferimento contabile, CRO bonifico, delibera consiglio o accordo di sostegno..."
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Bottoni Azione */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{isModifica ? 'Salva Modifiche' : 'Registra Donazione'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
