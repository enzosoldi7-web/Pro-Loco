import React, { useState } from 'react';
import { Socio, FiltriSoci, ProLocoInfo, StatoQuota, QuotaAssociativa } from '../types';
import { getStatoQuotaSocio } from '../storage';
import { 
  Search, 
  Filter, 
  CreditCard, 
  Euro, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  List,
  UserCheck,
  ShieldCheck,
  FileText,
  Printer,
  Receipt
} from 'lucide-react';

interface MemberListProps {
  soci: Socio[];
  annoSelezionato: number;
  config: ProLocoInfo;
  onVisualizzaTessera: (socio: Socio) => void;
  onGestisciQuote: (socio: Socio) => void;
  onModificaSocio: (socio: Socio) => void;
  onEliminaSocio: (socioId: string) => void;
  onNuovoSocio: () => void;
  onStampaPrivacy: (socio: Socio) => void;
  onStampaLibroSoci?: () => void;
  onVisualizzaRicevuta?: (socio: Socio, quota: QuotaAssociativa) => void;
  onStampaSchedaSocio?: (socio: Socio) => void;
}

export const MemberList: React.FC<MemberListProps> = ({
  soci,
  annoSelezionato,
  config,
  onVisualizzaTessera,
  onGestisciQuote,
  onModificaSocio,
  onEliminaSocio,
  onNuovoSocio,
  onStampaPrivacy,
  onStampaLibroSoci,
  onVisualizzaRicevuta,
  onStampaSchedaSocio
}) => {
  const [filtri, setFiltri] = useState<FiltriSoci>({
    ricerca: '',
    categoria: 'tutte',
    statoQuota: 'tutti',
    ruoloDirettivo: 'tutti',
    ordinamento: 'cognome_asc'
  });

  const [visualizzazione, setVisualizzazione] = useState<'tabella' | 'schede'>('tabella');

  // Calcolo conteggi stati quota
  const conteggi = {
    tutti: soci.length,
    in_regola: soci.filter(s => getStatoQuotaSocio(s, annoSelezionato) === 'in_regola').length,
    da_rinnovare: soci.filter(s => getStatoQuotaSocio(s, annoSelezionato) === 'da_rinnovare').length,
    scaduta: soci.filter(s => getStatoQuotaSocio(s, annoSelezionato) === 'scaduta').length
  };

  // Filtraggio soci
  const sociFiltrati = soci.filter(socio => {
    // Ricerca testuale
    if (filtri.ricerca.trim()) {
      const q = filtri.ricerca.toLowerCase().trim();
      const matchNome = socio.nome.toLowerCase().includes(q);
      const matchCognome = socio.cognome.toLowerCase().includes(q);
      const matchCF = socio.codiceFiscale.toLowerCase().includes(q);
      const matchTessera = socio.numeroTessera.toLowerCase().includes(q);
      const matchEmail = socio.email.toLowerCase().includes(q);
      const matchTel = socio.telefono.toLowerCase().includes(q);
      if (!matchNome && !matchCognome && !matchCF && !matchTessera && !matchEmail && !matchTel) {
        return false;
      }
    }

    // Filtro per stato quota nell'anno selezionato
    if (filtri.statoQuota !== 'tutti') {
      const stato = getStatoQuotaSocio(socio, annoSelezionato);
      if (stato !== filtri.statoQuota) return false;
    }

    // Filtro per categoria
    if (filtri.categoria !== 'tutte') {
      if (socio.categoria !== filtri.categoria) return false;
    }

    // Filtro per ruolo direttivo
    if (filtri.ruoloDirettivo === 'direttivo') {
      if (socio.ruoloDirettivo === 'Nessuno') return false;
    }

    return true;
  });

  // Ordinamento soci
  const sociOrdinati = [...sociFiltrati].sort((a, b) => {
    switch (filtri.ordinamento) {
      case 'cognome_asc':
        return a.cognome.localeCompare(b.cognome);
      case 'cognome_desc':
        return b.cognome.localeCompare(a.cognome);
      case 'tessera_asc':
        return a.numeroTessera.localeCompare(b.numeroTessera);
      case 'tessera_desc':
        return b.numeroTessera.localeCompare(a.numeroTessera);
      case 'data_desc':
        return b.dataIscrizione.localeCompare(a.dataIscrizione);
      case 'data_asc':
        return a.dataIscrizione.localeCompare(b.dataIscrizione);
      default:
        return 0;
    }
  });

  const getColoreCategoria = (categoria: string) => {
    switch (categoria) {
      case 'Membro Direttivo':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Sostenitore':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Onorario':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'Giovane':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Volontario Attivo':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-4 no-print">
      
      {/* BARRA FILTRI E RICERCA */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs space-y-3">
        
        {/* Riga Superiore: Ricerca e Selettori Rapidi */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          
          {/* Input Ricerca */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca socio per nome, cognome, C.F., numero tessera..."
              value={filtri.ricerca}
              onChange={(e) => setFiltri({ ...filtri, ricerca: e.target.value })}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
            {filtri.ricerca && (
              <button
                onClick={() => setFiltri({ ...filtri, ricerca: '' })}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtro Categoria */}
          <div className="w-full sm:w-auto flex items-center gap-2">
            <select
              value={filtri.categoria}
              onChange={(e) => setFiltri({ ...filtri, categoria: e.target.value })}
              aria-label="Filtra per categoria socio"
              className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="tutte">Tutte le Categorie</option>
              <option value="Ordinario">Ordinario</option>
              <option value="Sostenitore">Sostenitore</option>
              <option value="Onorario">Onorario</option>
              <option value="Giovane">Giovane</option>
              <option value="Volontario Attivo">Volontario Attivo</option>
              <option value="Membro Direttivo">Membro Direttivo</option>
            </select>

            {/* Ordinamento */}
            <select
              value={filtri.ordinamento}
              onChange={(e) => setFiltri({ ...filtri, ordinamento: e.target.value as any })}
              aria-label="Ordina soci"
              className="w-full sm:w-auto bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-700 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="cognome_asc">Cognome (A-Z)</option>
              <option value="cognome_desc">Cognome (Z-A)</option>
              <option value="tessera_asc">N° Tessera (Crescente)</option>
              <option value="tessera_desc">N° Tessera (Decrescente)</option>
              <option value="data_desc">Iscrizione (Più recenti)</option>
            </select>

            {/* Switch Visualizzazione Tabella / Schede */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setVisualizzazione('tabella')}
                title="Vista a tabella"
                className={`p-1.5 rounded-md transition-colors ${visualizzazione === 'tabella' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setVisualizzazione('schede')}
                title="Vista a schede"
                className={`p-1.5 rounded-md transition-colors ${visualizzazione === 'schede' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-800'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

        {/* Riga Inferiore: Filtri per Stato Quota Anno Corrente */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" />
              Stato Quota {annoSelezionato}:
            </span>

            <button
              onClick={() => setFiltri({ ...filtri, statoQuota: 'tutti' })}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                filtri.statoQuota === 'tutti'
                  ? 'bg-slate-800 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tutti ({conteggi.tutti})
            </button>

            <button
              onClick={() => setFiltri({ ...filtri, statoQuota: 'in_regola' })}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                filtri.statoQuota === 'in_regola'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              In Regola ({conteggi.in_regola})
            </button>

            <button
              onClick={() => setFiltri({ ...filtri, statoQuota: 'da_rinnovare' })}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                filtri.statoQuota === 'da_rinnovare'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              <Clock className="w-3 h-3" />
              Da Rinnovare ({conteggi.da_rinnovare})
            </button>

            <button
              onClick={() => setFiltri({ ...filtri, statoQuota: 'scaduta' })}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors flex items-center gap-1 ${
                filtri.statoQuota === 'scaduta'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200/60'
              }`}
            >
              <AlertCircle className="w-3 h-3" />
              Scadute ({conteggi.scaduta})
            </button>
          </div>

          <div className="flex items-center gap-3">
            {onStampaLibroSoci && (
              <button
                id="btn-stampa-libro-soci-memberlist"
                onClick={onStampaLibroSoci}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg transition-colors cursor-pointer shadow-2xs"
                title="Stampa Ufficiale Libro dei Soci A4"
              >
                <Printer className="w-3.5 h-3.5 text-emerald-700" />
                <span>Stampa Libro Soci A4</span>
              </button>
            )}
            <div className="text-xs text-slate-500 font-medium">
              Visualizzati <strong>{sociFiltrati.length}</strong> di <strong>{soci.length}</strong> soci
            </div>
          </div>

        </div>

      </div>

      {/* ELENCO DEI SOCI */}
      {sociOrdinati.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <UserCheck className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">
            Nessun socio corrisponde ai filtri selezionati
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Prova a modificare i filtri di ricerca, lo stato della quota o aggiungi un nuovo socio alla Pro Loco.
          </p>
          <button
            onClick={onNuovoSocio}
            className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
          >
            Iscrivi Nuovo Socio
          </button>
        </div>
      ) : visualizzazione === 'tabella' ? (
        
        /* VISTA TABELLARE DESKTOP / MOBILE SCROLL */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[10.5px]">
                <tr>
                  <th className="py-3 px-4">Tessera</th>
                  <th className="py-3 px-4">Socio / Anagrafica</th>
                  <th className="py-3 px-4 hidden md:table-cell">Contatti</th>
                  <th className="py-3 px-4">Categoria & Ruolo</th>
                  <th className="py-3 px-4">Quota {annoSelezionato}</th>
                  <th className="py-3 px-4 text-right">Azioni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sociOrdinati.map(socio => {
                  const statoQuota = getStatoQuotaSocio(socio, annoSelezionato);
                  const quotaAnno = socio.quote?.find(q => q.anno === annoSelezionato);
                  const iniziali = `${socio.nome[0] || ''}${socio.cognome[0] || ''}`.toUpperCase();

                  return (
                    <tr key={socio.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Numero Tessera */}
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200/80 text-[11px]">
                          {socio.numeroTessera}
                        </span>
                      </td>

                      {/* Nome, Cognome, CF */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {socio.foto ? (
                            <img
                              src={socio.foto}
                              alt={`${socio.nome} ${socio.cognome}`}
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-300 shadow-2xs"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0">
                              {iniziali}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900 text-sm">
                              {socio.cognome} {socio.nome}
                            </div>
                            <div className="font-mono text-[11px] text-slate-500">
                              {socio.codiceFiscale}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contatti */}
                      <td className="py-3 px-4 hidden md:table-cell text-slate-600">
                        <div className="space-y-0.5 text-[11px]">
                          {socio.telefono && (
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{socio.telefono}</span>
                            </div>
                          )}
                          {socio.email && (
                            <div className="flex items-center gap-1.5 text-slate-500">
                              <Mail className="w-3 h-3 text-slate-400" />
                              <span className="truncate max-w-[170px]">{socio.email}</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Categoria e Ruolo Direttivo */}
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[10.5px] font-semibold border ${getColoreCategoria(socio.categoria)}`}>
                            {socio.categoria}
                          </span>
                          {socio.ruoloDirettivo && socio.ruoloDirettivo !== 'Nessuno' && (
                            <div className="text-[10.5px] font-bold text-purple-700">
                              ★ {socio.ruoloDirettivo}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stato Quota Anno */}
                      <td className="py-3 px-4">
                        {statoQuota === 'in_regola' ? (
                          <div className="space-y-0.5">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              In Regola
                            </span>
                            {quotaAnno && (
                              <div className="text-[10px] text-slate-500 font-mono space-y-0.5">
                                <div>{Number(quotaAnno.importo).toFixed(2)} € ({quotaAnno.metodo})</div>
                                <div className="text-[9.5px] text-emerald-800 font-sans font-semibold">
                                  Scadenza: {quotaAnno.dataScadenza ? new Date(quotaAnno.dataScadenza).toLocaleDateString('it-IT') : `31/12/${quotaAnno.anno}`}
                                </div>
                              </div>
                            )}
                          </div>
                        ) : statoQuota === 'da_rinnovare' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Da Rinnovare
                            </span>
                            <div>
                              <button
                                onClick={() => onGestisciQuote(socio)}
                                className="text-[10.5px] text-amber-800 hover:text-amber-900 font-bold underline cursor-pointer"
                              >
                                + Registra Quota
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              <AlertCircle className="w-3 h-3 text-rose-600" />
                              Scaduta
                            </span>
                            <div>
                              <button
                                onClick={() => onGestisciQuote(socio)}
                                className="text-[10.5px] text-rose-700 hover:text-rose-900 font-bold underline cursor-pointer"
                              >
                                + Registra Quota
                              </button>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Azioni */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          
                          {/* Visualizza Tessera Digitale */}
                          <button
                            onClick={() => onVisualizzaTessera(socio)}
                            title="Tessera Digitale del Socio"
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors border border-emerald-200"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Tessera</span>
                          </button>

                          {/* Stampa Scheda Socio A4 / PDF */}
                          {onStampaSchedaSocio && (
                            <button
                              onClick={() => onStampaSchedaSocio(socio)}
                              title="Stampa Scheda Anagrafica Socio (A4 / PDF)"
                              className="p-1.5 text-emerald-800 hover:text-emerald-950 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <FileText className="w-4 h-4 text-emerald-700" />
                            </button>
                          )}

                          {/* Gestione Quote e Ricevute */}
                          <button
                            onClick={() => onGestisciQuote(socio)}
                            title="Quote e Ricevute"
                            className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-md transition-colors"
                          >
                            <Euro className="w-4 h-4" />
                          </button>

                          {/* Stampa Ricevuta Quota Sociale */}
                          {quotaAnno && onVisualizzaRicevuta && (
                            <button
                              onClick={() => onVisualizzaRicevuta(socio, quotaAnno)}
                              title={`Stampa Ricevuta Quota Anno ${annoSelezionato} (${quotaAnno.ricevutaNumero || ''})`}
                              className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded-md transition-colors"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          )}

                          {/* Stampa Delibera Consenso Trattamento Dati (GDPR) */}
                          <button
                            onClick={() => onStampaPrivacy(socio)}
                            title="Delibera Consenso Privacy (GDPR)"
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {/* Modifica */}
                          <button
                            onClick={() => onModificaSocio(socio)}
                            title="Modifica Anagrafica"
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          {/* Elimina */}
                          <button
                            onClick={() => {
                              if (confirm(`Sei sicuro di voler eliminare il socio ${socio.nome} ${socio.cognome}?`)) {
                                onEliminaSocio(socio.id);
                              }
                            }}
                            title="Elimina Socio"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      ) : (

        /* VISTA A SCHEDE / CARDS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sociOrdinati.map(socio => {
            const statoQuota = getStatoQuotaSocio(socio, annoSelezionato);
            const quotaAnno = socio.quote?.find(q => q.anno === annoSelezionato);
            const iniziali = `${socio.nome[0] || ''}${socio.cognome[0] || ''}`.toUpperCase();

            return (
              <div 
                key={socio.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2.5">
                      {socio.foto ? (
                        <img
                          src={socio.foto}
                          alt={`${socio.nome} ${socio.cognome}`}
                          className="w-10 h-10 rounded-xl object-cover shadow-xs border border-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                          {iniziali}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {socio.cognome} {socio.nome}
                        </h4>
                        <span className="font-mono text-[10.5px] font-bold text-emerald-800">
                          {socio.numeroTessera}
                        </span>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getColoreCategoria(socio.categoria)}`}>
                      {socio.categoria}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 space-y-1 my-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                    <div className="text-[11px]">C.F. {socio.codiceFiscale}</div>
                    <div className="text-slate-500 text-[10.5px] font-sans flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{socio.citta} ({socio.provincia})</span>
                    </div>
                  </div>

                  {/* Stato Quota */}
                  <div className="flex items-center justify-between py-1 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 font-medium">Quota {annoSelezionato}:</span>
                    {statoQuota === 'in_regola' ? (
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                          <CheckCircle2 className="w-3 h-3" />
                          In Regola ({Number(quotaAnno?.importo || 0).toFixed(0)}€)
                        </span>
                        <div className="text-[9.5px] text-slate-500 mt-0.5">
                          Scad: {quotaAnno?.dataScadenza ? new Date(quotaAnno.dataScadenza).toLocaleDateString('it-IT') : `31/12/${annoSelezionato}`}
                        </div>
                      </div>
                    ) : statoQuota === 'da_rinnovare' ? (
                      <button
                        onClick={() => onGestisciQuote(socio)}
                        className="inline-flex items-center gap-1 font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded hover:bg-amber-100 transition-colors"
                      >
                        <Clock className="w-3 h-3" />
                        Da Rinnovare
                      </button>
                    ) : (
                      <button
                        onClick={() => onGestisciQuote(socio)}
                        className="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded hover:bg-rose-100 transition-colors"
                      >
                        <AlertCircle className="w-3 h-3" />
                        Scaduta
                      </button>
                    )}
                  </div>
                </div>

                {/* Azioni Card */}
                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onVisualizzaTessera(socio)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Tessera Digitale</span>
                  </button>

                  {/* Scheda Socio A4 / PDF */}
                  {onStampaSchedaSocio && (
                    <button
                      onClick={() => onStampaSchedaSocio(socio)}
                      title="Stampa Scheda Anagrafica Socio (A4 / PDF)"
                      className="p-1.5 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onGestisciQuote(socio)}
                    title="Quote"
                    className="p-1.5 text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                  >
                    <Euro className="w-4 h-4" />
                  </button>

                  {quotaAnno && onVisualizzaRicevuta && (
                    <button
                      onClick={() => onVisualizzaRicevuta(socio, quotaAnno)}
                      title={`Stampa Ricevuta Quota ${annoSelezionato}`}
                      className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                    >
                      <Receipt className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => onStampaPrivacy(socio)}
                    title="Delibera Consenso Privacy (GDPR)"
                    className="p-1.5 text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onModificaSocio(socio)}
                    title="Modifica"
                    className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      )}

    </div>
  );
};
