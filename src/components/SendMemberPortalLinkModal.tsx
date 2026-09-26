import React, { useState, useEffect } from 'react';
import { Socio, ProLocoInfo } from '../types';
import { getStatoQuotaSocio, saveSessioneSocioId } from '../storage';
import QRCode from 'qrcode';
import { 
  X, 
  Copy, 
  Check, 
  Send, 
  Globe, 
  Smartphone, 
  Mail, 
  MessageSquare, 
  ExternalLink, 
  ShieldCheck, 
  CreditCard, 
  Bell, 
  Sparkles, 
  CheckCircle2,
  Calendar,
  Phone,
  QrCode
} from 'lucide-react';

interface SendMemberPortalLinkModalProps {
  socio: Socio | null;
  config: ProLocoInfo;
  annoSelezionato: number;
  onClose: () => void;
  onApriPortaleComeSocio?: (socio: Socio) => void;
}

export const SendMemberPortalLinkModal: React.FC<SendMemberPortalLinkModalProps> = ({
  socio,
  config,
  annoSelezionato,
  onClose,
  onApriPortaleComeSocio
}) => {
  const [copiato, setCopiato] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [mostraQrIngrandito, setMostraQrIngrandito] = useState(false);

  if (!socio) return null;

  // Costruzione del Link univoco per l'accesso diretto del socio al Portale Web
  const baseUrl = window.location.origin + window.location.pathname;
  const linkPortaleSocio = `${baseUrl}?area_soci=1&tessera=${encodeURIComponent(socio.numeroTessera)}`;

  // Testo precompilato cordiale per comunicazioni (WhatsApp, Email, SMS)
  const messaggioCondivisione = `Gentile ${socio.nome}, ecco il tuo link personale per accedere al Portale Web dei Soci della ${config.nome}:
${linkPortaleSocio}

Nel portale potrai consultare in qualsiasi momento:
• La tua Tessera Digitale (N° ${socio.numeroTessera}) con QR Code
• Lo stato del tesseramento e le scadenze delle quote
• Lo storico dei pagamenti e le ricevute ufficiali
• Le comunicazioni e gli avvisi riservati del Direttivo
• Il calendario degli eventi con eventuali sconti o agevolazioni riservate ai soci.

Buona navigazione!`;

  // Pulizia numero per link WhatsApp
  const telefonoNumerico = socio.telefono ? socio.telefono.replace(/[^0-9]/g, '') : '';
  const prefissoItalia = telefonoNumerico.startsWith('39') ? telefonoNumerico : `39${telefonoNumerico}`;
  const whatsappUrl = socio.telefono
    ? `https://wa.me/${prefissoItalia}?text=${encodeURIComponent(messaggioCondivisione)}`
    : `https://api.whatsapp.com/send?text=${encodeURIComponent(messaggioCondivisione)}`;

  // Mailto link
  const oggettoEmail = `Accesso Portale Web dei Soci - ${config.nome} (Tessera N° ${socio.numeroTessera})`;
  const mailtoUrl = `mailto:${encodeURIComponent(socio.email || '')}?subject=${encodeURIComponent(oggettoEmail)}&body=${encodeURIComponent(messaggioCondivisione)}`;

  // SMS link
  const smsUrl = `sms:${socio.telefono || ''}?body=${encodeURIComponent(messaggioCondivisione)}`;

  // Generazione del QR Code per scansione fisica con smartphone
  useEffect(() => {
    if (!linkPortaleSocio) return;
    QRCode.toDataURL(linkPortaleSocio, {
      width: 260,
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff'
      }
    })
      .then(url => setQrCodeUrl(url))
      .catch(err => console.error('Errore generazione QR Code Portale Socio:', err));
  }, [linkPortaleSocio]);

  const handleCopiaLink = () => {
    navigator.clipboard.writeText(linkPortaleSocio).then(() => {
      setCopiato(true);
      setTimeout(() => setCopiato(false), 2500);
    });
  };

  const handleTestAccesso = () => {
    saveSessioneSocioId(socio.id);
    if (onApriPortaleComeSocio) {
      onApriPortaleComeSocio(socio);
    }
  };

  const statoQuota = getStatoQuotaSocio(socio, annoSelezionato);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto no-print">
      
      {/* Contenitore Modale */}
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-5 sm:p-6 my-6 relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]">
        
        {/* Header Modale */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center shadow-xs ring-1 ring-emerald-500/20 shrink-0">
              <Send className="w-5 h-5 text-emerald-50" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                  Invio Link Portale Web dei Soci
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-teal-50 text-teal-800 border border-teal-200">
                  Area Riservata
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Genera e invia al socio il link esclusivo per consultare tessera, quote e avvisi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            title="Chiudi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo Modale Scrollabile */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1">
          
          {/* Card Riepilogo Socio Destinatario */}
          <div className="bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50 border border-emerald-100 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {socio.foto ? (
                <img 
                  src={socio.foto} 
                  alt={`${socio.nome} ${socio.cognome}`} 
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-600/30 shadow-2xs shrink-0" 
                />
              ) : (
                <div className="w-12 h-12 rounded-xl bg-emerald-800 text-white font-black text-sm flex items-center justify-center shadow-2xs shrink-0">
                  {socio.nome[0]}{socio.cognome[0]}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base leading-tight truncate">
                    {socio.cognome} {socio.nome}
                  </h3>
                  <span className="font-mono font-bold text-xs bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md border border-emerald-200">
                    Tessera N° {socio.numeroTessera}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600 mt-1">
                  <span className="font-mono text-[11px] text-slate-500">C.F. {socio.codiceFiscale}</span>
                  {socio.telefono && (
                    <span className="flex items-center gap-1 text-slate-700">
                      <Phone className="w-3 h-3 text-emerald-600" />
                      {socio.telefono}
                    </span>
                  )}
                  {socio.email && (
                    <span className="flex items-center gap-1 text-slate-600 truncate max-w-[200px]">
                      <Mail className="w-3 h-3 text-emerald-600" />
                      {socio.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="self-end sm:self-center shrink-0">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                statoQuota === 'in_regola' 
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {statoQuota === 'in_regola' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    In Regola {annoSelezionato}
                  </>
                ) : (
                  <>
                    <Calendar className="w-3.5 h-3.5 text-amber-700" />
                    Da Rinnovare
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Griglia Cosa Trova il Socio nel Portale */}
          <div className="bg-white border border-slate-200 rounded-xl p-3.5">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              Cosa troverà il socio accedendo con questo link:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <CreditCard className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Tessera Digitale Ufficiale</div>
                  <div className="text-[11px] text-slate-500">Con QR Code per verifica e salvataggio su smartphone</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Calendar className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Stato Quota & Scadenza</div>
                  <div className="text-[11px] text-slate-500">Validità del tesseramento e modalità di rinnovo</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Ricevute di Pagamento PDF</div>
                  <div className="text-[11px] text-slate-500">Cronologia e download ricevute per fini fiscali</div>
                </div>
              </div>

              <div className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
                <Bell className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">Comunicazioni & Eventi</div>
                  <div className="text-[11px] text-slate-500">Avvisi riservati dal Direttivo e iscrizione manifestazioni</div>
                </div>
              </div>
            </div>
          </div>

          {/* Box Link Diretto con Pulsante Copia Rapida */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>Link Univoco di Accesso Diretto al Portale:</span>
              <span className="text-[11px] text-slate-400 font-normal">Include preautenticazione tramite numero tessera</span>
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 truncate shadow-inner select-all">
                {linkPortaleSocio}
              </div>
              <button
                id="btn-copia-link-portale"
                onClick={handleCopiaLink}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer shrink-0 ${
                  copiato 
                    ? 'bg-emerald-600 text-white' 
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {copiato ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-100" />
                    <span>Copiato!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copia Link</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Sezione Canali di Invio Diretto */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Canali Rapidi di Invio al Socio:
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              
              {/* WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors"
                title={socio.telefono ? `Invia messaggio WhatsApp a ${socio.telefono}` : 'Condividi su WhatsApp'}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Invia su WhatsApp</span>
              </a>

              {/* Email */}
              <a
                href={mailtoUrl}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold shadow-xs transition-colors"
                title={socio.email ? `Invia email a ${socio.email}` : 'Invia tramite client email'}
              >
                <Mail className="w-4 h-4" />
                <span>Invia via Email</span>
              </a>

              {/* SMS per dispositivi mobili */}
              <a
                href={smsUrl}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-xs transition-colors"
                title="Invia SMS"
              >
                <Smartphone className="w-4 h-4" />
                <span>Invia via SMS</span>
              </a>

            </div>
          </div>

          {/* Box QR Code per Inquadratura Immediata in Sede */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 shrink-0">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt={`QR Code Accesso Portale ${socio.nome} ${socio.cognome}`} 
                  className="w-24 h-24 object-contain cursor-pointer"
                  onClick={() => setMostraQrIngrandito(!mostraQrIngrandito)}
                  title="Clicca per ingrandire il QR Code"
                />
              ) : (
                <div className="w-24 h-24 bg-slate-100 flex items-center justify-center text-slate-400 text-xs font-mono">
                  QR Code...
                </div>
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-bold text-slate-900 text-xs">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Il socio è presente fisicamente in sede?</span>
              </div>
              <p className="text-[11.5px] text-slate-600 leading-relaxed">
                Fagli inquadrare questo QR Code direttamente dallo schermo con la fotocamera del suo smartphone: si aprirà immediatamente il suo Portale Web personale senza dover digitare credenziali!
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setMostraQrIngrandito(!mostraQrIngrandito)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  {mostraQrIngrandito ? 'Riduci QR' : 'Ingrandisci QR a Schermo'}
                </button>
              </div>
            </div>
          </div>

          {/* Vista QR Code Ingrandito */}
          {mostraQrIngrandito && qrCodeUrl && (
            <div className="p-4 bg-white border-2 border-emerald-500 rounded-xl shadow-md text-center space-y-2 animate-in fade-in zoom-in-95">
              <div className="text-xs font-bold text-slate-800">
                Inquadra con lo smartphone per accedere al Portale Web dei Soci:
              </div>
              <div className="flex justify-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code Ingrandito" 
                  className="w-56 h-56 object-contain"
                />
              </div>
              <p className="text-[11px] text-slate-500">
                Socio: <strong>{socio.nome} {socio.cognome}</strong> • Tessera N° <strong>{socio.numeroTessera}</strong>
              </p>
            </div>
          )}

        </div>

        {/* Footer Azioni Modale */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-3 mt-2 border-t border-slate-100 shrink-0">
          
          <button
            type="button"
            id="btn-apri-portale-come-socio"
            onClick={handleTestAccesso}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-colors cursor-pointer"
            title="Accedi direttamente al Portale per vedere cosa visualizza questo socio"
          >
            <ExternalLink className="w-3.5 h-3.5 text-teal-700" />
            <span>Apri Portale Web come questo Socio</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Chiudi
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
