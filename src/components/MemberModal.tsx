import React, { useState, useEffect, useRef } from 'react';
import { Socio, SocioCategoria, SocioRuoloDirettivo, ProLocoInfo, MetodoPagamento, QuotaAssociativa } from '../types';
import { generaNumeroTessera, generaNumeroRicevuta } from '../storage';
import { 
  X, 
  User, 
  CreditCard, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Check, 
  ShieldCheck, 
  HeartHandshake, 
  Euro,
  Camera,
  Upload,
  Trash2
} from 'lucide-react';

interface MemberModalProps {
  socio: Socio | null; // null se nuovo socio
  soci: Socio[];
  config: ProLocoInfo;
  annoSelezionato: number;
  onClose: () => void;
  onSalva: (socio: Socio) => void;
}

const COMPETENZE_DISPONIBILI = [
  'Eventi e Sagre',
  'Accoglienza e Info Point',
  'Visite Guidate e Storia',
  'Logistica e Montaggio',
  'Cucina Tradizionale',
  'Comunicazione e Social',
  'Amministrazione e Segreteria',
  'Allestimenti e Grafica'
];

export const MemberModal: React.FC<MemberModalProps> = ({
  socio,
  soci,
  config,
  annoSelezionato,
  onClose,
  onSalva
}) => {
  const isModifica = !!socio;

  const [nome, setNome] = useState(socio?.nome || '');
  const [cognome, setCognome] = useState(socio?.cognome || '');
  const [codiceFiscale, setCodiceFiscale] = useState(socio?.codiceFiscale || '');
  const [dataNascita, setDataNascita] = useState(socio?.dataNascita || '');
  const [luogoNascita, setLuogoNascita] = useState(socio?.luogoNascita || '');
  const [indirizzo, setIndirizzo] = useState(socio?.indirizzo || '');
  const [cap, setCap] = useState(socio?.cap || config.cap);
  const [citta, setCitta] = useState(socio?.citta || config.comune);
  const [provincia, setProvincia] = useState(socio?.provincia || config.provincia);
  const [telefono, setTelefono] = useState(socio?.telefono || '');
  const [email, setEmail] = useState(socio?.email || '');
  const [categoria, setCategoria] = useState<SocioCategoria>(socio?.categoria || 'Ordinario');
  const [ruoloDirettivo, setRuoloDirettivo] = useState<SocioRuoloDirettivo>(socio?.ruoloDirettivo || 'Nessuno');
  const [dataIscrizione, setDataIscrizione] = useState(socio?.dataIscrizione || new Date().toISOString().slice(0, 10));
  const [numeroTessera, setNumeroTessera] = useState(socio?.numeroTessera || '');
  const [attivo, setAttivo] = useState(socio ? socio.attivo : true);
  const [consensoPrivacy, setConsensoPrivacy] = useState(socio ? socio.consensoPrivacy : true);
  const [foto, setFoto] = useState<string>(socio?.foto || '');
  const [note, setNote] = useState(socio?.note || '');
  const [competenze, setCompetenze] = useState<string[]>(socio?.competenzeVolontariato || []);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Gestione caricamento e compressione fototessera
  const handleFotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Seleziona un file immagine valido (JPG, PNG, WebP)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Ridimensionamento ottimale per fototessera (max 360x360 px)
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFoto(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Per nuovo socio: registrazione opzionale quota immediata
  const [registraQuotaSubito, setRegistraQuotaSubito] = useState(!isModifica);
  const [importoQuota, setImportoQuota] = useState<number>(config.quotaStandardOrdinario);
  const [metodoQuota, setMetodoQuota] = useState<MetodoPagamento>('Contanti');
  const [dataScadenzaQuota, setDataScadenzaQuota] = useState<string>(`${annoSelezionato}-12-31`);

  useEffect(() => {
    if (!isModifica && !numeroTessera) {
      setNumeroTessera(generaNumeroTessera(soci, annoSelezionato));
    }
  }, [isModifica, soci, annoSelezionato, numeroTessera]);

  // Aggiorna importo suggerito quando cambia categoria
  useEffect(() => {
    if (categoria === 'Onorario') setImportoQuota(0);
    else if (categoria === 'Sostenitore') setImportoQuota(config.quotaStandardSostenitore);
    else if (categoria === 'Giovane') setImportoQuota(config.quotaStandardGiovane);
    else setImportoQuota(config.quotaStandardOrdinario);
  }, [categoria, config]);

  const toggleCompetenza = (comp: string) => {
    if (competenze.includes(comp)) {
      setCompetenze(competenze.filter(c => c !== comp));
    } else {
      setCompetenze([...competenze, comp]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const socioId = socio?.id || `socio-${Date.now()}`;
    let quoteEsistenti = socio?.quote || [];

    if (!isModifica && registraQuotaSubito) {
      const ricevutaNum = generaNumeroRicevuta(soci, annoSelezionato);
      const quotaIniziale: QuotaAssociativa = {
        id: `quota-${Date.now()}`,
        socioId: socioId,
        anno: annoSelezionato,
        importo: Number(importoQuota),
        dataPagamento: new Date().toISOString().slice(0, 10),
        dataScadenza: dataScadenzaQuota || `${annoSelezionato}-12-31`,
        metodo: metodoQuota,
        ricevutaNumero: ricevutaNum,
        note: 'Quota prima iscrizione'
      };
      quoteEsistenti = [quotaIniziale];
    }

    const socioAggiornato: Socio = {
      id: socioId,
      numeroTessera: numeroTessera.trim().toUpperCase(),
      nome: nome.trim(),
      cognome: cognome.trim(),
      codiceFiscale: codiceFiscale.trim().toUpperCase(),
      dataNascita,
      luogoNascita: luogoNascita.trim(),
      indirizzo: indirizzo.trim(),
      cap: cap.trim(),
      citta: citta.trim(),
      provincia: provincia.trim().toUpperCase(),
      telefono: telefono.trim(),
      email: email.trim(),
      categoria,
      ruoloDirettivo,
      dataIscrizione,
      attivo,
      consensoPrivacy,
      foto: foto || undefined,
      note: note.trim() || undefined,
      competenzeVolontariato: competenze,
      quote: quoteEsistenti
    };

    onSalva(socioAggiornato);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full max-h-[92vh] flex flex-col relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Intestazione Modale - Fissa in alto */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">
                {isModifica ? 'Modifica Scheda Socio' : 'Iscrizione Nuovo Socio Pro Loco'}
              </h2>
              <p className="text-xs text-slate-500">
                {isModifica ? `Aggiornamento anagrafica socio ${socio.numeroTessera}` : 'Inserimento anagrafica nel libro soci e rilascio tessera'}
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

        {/* Formulario con Body a scorrimento interno e Footer fisso */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5 space-y-5">
            
            {/* Sezione 1: Dati Anagrafici Primari e Fototessera */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Dati Anagrafici & Fototessera
            </h3>

            {/* Fototessera del Socio */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-3.5 flex flex-col sm:flex-row items-center gap-4">
              <div className="relative shrink-0">
                {foto ? (
                  <div className="w-20 h-24 rounded-lg overflow-hidden border-2 border-blue-500 shadow-xs relative group bg-white">
                    <img 
                      src={foto} 
                      alt="Fototessera Socio" 
                      className="w-full h-full object-cover object-center" 
                    />
                    <button
                      type="button"
                      onClick={() => setFoto('')}
                      title="Rimuovi foto"
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity text-xs font-bold gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-24 rounded-lg border-2 border-dashed border-slate-300 bg-white flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                    <Camera className="w-6 h-6 text-slate-300 mb-1" />
                    <span className="text-[9px] font-bold leading-tight">Foto Tessera</span>
                  </div>
                )}
              </div>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold text-slate-800">Fototessera Ufficiale del Socio</span>
                  {foto ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">Caricata</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">Consigliata per la tessera</span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  La foto verrà stampata sulla tessera digitale e cartacea del socio. Formato consigliato: primo piano frontale (JPG, PNG).
                </p>
                
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>{foto ? 'Cambia Fototessera' : 'Carica Fototessera'}</span>
                  </button>

                  {foto && (
                    <button
                      type="button"
                      onClick={() => setFoto('')}
                      className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-md transition-colors font-medium"
                    >
                      Rimuovi
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Nome *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Mario"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Cognome *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. Rossi"
                  value={cognome}
                  onChange={(e) => setCognome(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Codice Fiscale *
                </label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="16 caratteri"
                  value={codiceFiscale}
                  onChange={(e) => setCodiceFiscale(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Data di Nascita
                </label>
                <input
                  type="date"
                  value={dataNascita}
                  onChange={(e) => setDataNascita(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Luogo di Nascita
                </label>
                <input
                  type="text"
                  placeholder="Es. Siena (SI)"
                  value={luogoNascita}
                  onChange={(e) => setLuogoNascita(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Sezione 2: Residenza e Recapiti */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Residenza e Contatti
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Indirizzo e N° Civico
                </label>
                <input
                  type="text"
                  placeholder="Es. Via Roma, 14"
                  value={indirizzo}
                  onChange={(e) => setIndirizzo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Città
                </label>
                <input
                  type="text"
                  value={citta}
                  onChange={(e) => setCitta(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  CAP / Prov.
                </label>
                <div className="flex gap-1">
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="CAP"
                    value={cap}
                    onChange={(e) => setCap(e.target.value)}
                    className="w-2/3 bg-slate-50 border border-slate-300 rounded-lg px-2 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <input
                    type="text"
                    maxLength={2}
                    placeholder="PR"
                    value={provincia}
                    onChange={(e) => setProvincia(e.target.value.toUpperCase())}
                    className="w-1/3 bg-slate-50 border border-slate-300 rounded-lg px-1 text-center py-1.5 text-xs font-mono font-bold text-slate-900 uppercase focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Telefono / Cellulare
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="Es. 338 1234567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    placeholder="Es. nome@email.it"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sezione 3: Categoria, Ruolo e Numero Tessera */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Inquadramento e Tesseramento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Categoria Socio *
                </label>
                <select
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value as SocioCategoria)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Ordinario">Ordinario</option>
                  <option value="Sostenitore">Sostenitore</option>
                  <option value="Onorario">Onorario</option>
                  <option value="Giovane">Giovane (Under 25)</option>
                  <option value="Volontario Attivo">Volontario Attivo</option>
                  <option value="Membro Direttivo">Membro Direttivo</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Ruolo nel Direttivo
                </label>
                <select
                  value={ruoloDirettivo}
                  onChange={(e) => setRuoloDirettivo(e.target.value as SocioRuoloDirettivo)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Nessuno">Nessun incarico</option>
                  <option value="Presidente">Presidente</option>
                  <option value="Vicepresidente">Vicepresidente</option>
                  <option value="Segretario">Segretario</option>
                  <option value="Tesoriere">Tesoriere</option>
                  <option value="Consigliere">Consigliere</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Numero Tessera *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Es. PL-2025-010"
                  value={numeroTessera}
                  onChange={(e) => setNumeroTessera(e.target.value.toUpperCase())}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Data Prima Iscrizione
                </label>
                <input
                  type="date"
                  value={dataIscrizione}
                  onChange={(e) => setDataIscrizione(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={attivo}
                    onChange={(e) => setAttivo(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Socio Attivo</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={consensoPrivacy}
                    onChange={(e) => setConsensoPrivacy(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Consenso Privacy GDPR</span>
                </label>
              </div>
            </div>
          </div>

          {/* Sezione Competenze Volontariato */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
              Disponibilità e Competenze per le Attività Pro Loco:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMPETENZE_DISPONIBILI.map(comp => {
                const selezionato = competenze.includes(comp);
                return (
                  <button
                    key={comp}
                    type="button"
                    onClick={() => toggleCompetenza(comp)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors border ${
                      selezionato 
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {selezionato ? '✓ ' : '+ '}{comp}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Opzione Registrazione Quota Contestuale per Nuovo Socio */}
          {!isModifica && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <label className="flex items-center gap-2 text-xs font-bold text-emerald-950 cursor-pointer mb-2">
                <input
                  type="checkbox"
                  checked={registraQuotaSubito}
                  onChange={(e) => setRegistraQuotaSubito(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>Registra contestualmente il pagamento della quota per l'anno {annoSelezionato}</span>
              </label>

              {registraQuotaSubito && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 pt-2 border-t border-emerald-200/80">
                  <div>
                    <label className="block text-[10px] font-semibold text-emerald-800 mb-1">
                      Importo (€)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={importoQuota}
                      onChange={(e) => setImportoQuota(Number(e.target.value))}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-emerald-800 mb-1">
                      Metodo Pagamento
                    </label>
                    <select
                      value={metodoQuota}
                      onChange={(e) => setMetodoQuota(e.target.value as MetodoPagamento)}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-900"
                    >
                      <option value="Contanti">Contanti</option>
                      <option value="Bonifico Bancario">Bonifico Bancario</option>
                      <option value="POS / Carta">POS / Carta</option>
                      <option value="Satispay">Satispay</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-emerald-800 mb-1">
                      Data Scadenza Quota
                    </label>
                    <input
                      type="date"
                      value={dataScadenzaQuota}
                      onChange={(e) => setDataScadenzaQuota(e.target.value)}
                      className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-900"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Note generali */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Note Interne / Osservazioni
            </label>
            <textarea
              rows={2}
              placeholder="Eventuali note su convenzioni, deleghe o contatti..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          </div>

          {/* Pulsanti Azione - Fissi in basso, sempre visibili su ogni monitor */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-200 bg-slate-50/90 shrink-0">
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              * Campi anagrafici per Libro Soci • Anno {annoSelezionato}
            </span>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>{isModifica ? 'Salva Modifiche' : 'Registra e Tessere Socio'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
