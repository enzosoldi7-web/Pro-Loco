import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { 
  Smartphone, 
  Download, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  QrCode, 
  Copy, 
  Check, 
  Layers, 
  Info,
  Sparkles
} from 'lucide-react';

interface ApkModalProps {
  onClose: () => void;
}

export const ApkModal: React.FC<ApkModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copiato, setCopiato] = useState(false);

  // URL pubblico dell'applicazione
  const appUrl = window.location.origin;
  // PWABuilder URL precompilato
  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(appUrl)}`;

  useEffect(() => {
    QRCode.toDataURL(appUrl, {
      width: 200,
      margin: 1,
      color: {
        dark: '#064e3b',
        light: '#ffffff'
      }
    }).then(url => setQrCodeUrl(url)).catch(console.error);
  }, [appUrl]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiato(true);
    setTimeout(() => setCopiato(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 no-print">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-7 relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Intestazione */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Smartphone className="w-6 h-6 text-emerald-100" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  App Android & File APK
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Android Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Installa direttamente sul telefono o genera il pacchetto APK
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenuto */}
        <div className="mt-5 space-y-5 text-xs text-slate-700">

          {/* Opzione 1: Installazione Diretta (Consigliata) */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <h4 className="font-bold text-slate-900 text-xs">
                  Metodo 1: Installazione Istantanea su Android (Consigliato)
                </h4>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Nessun file esterno
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Su Android, l'applicazione si installa come una vera app nativa attraverso la tecnologia <strong>PWA / WebAPK</strong>: compare nella schermata Home e nel cassetto delle app con la sua icona ufficiale, a schermo intero e con salvataggio offline dei dati.
            </p>

            {isInstalled ? (
              <div className="mt-3 py-2 px-3 bg-emerald-100/80 text-emerald-900 rounded-lg flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                <span>L'applicazione risulta già installata come app autonoma su questo dispositivo!</span>
              </div>
            ) : isInstallable ? (
              <div className="mt-3">
                <button
                  id="btn-install-pwa-direct"
                  onClick={install}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Installa Subito sul Telefono</span>
                </button>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-emerald-200/60 flex flex-col sm:flex-row items-center gap-3">
                {qrCodeUrl && (
                  <div className="bg-white p-1.5 rounded-lg border border-emerald-200 shadow-2xs shrink-0">
                    <img src={qrCodeUrl} alt="QR Code App" className="w-20 h-20" />
                  </div>
                )}
                <div className="space-y-1 text-center sm:text-left">
                  <span className="font-bold text-slate-900 block text-[11px]">
                    Come installarla su smartphone:
                  </span>
                  <p className="text-slate-600 text-[11px]">
                    1. Inquadra il QR Code con la fotocamera o apri il link dal telefono.<br />
                    2. In Chrome o Samsung Internet premi i <strong>tre puntini (⋮)</strong> in alto.<br />
                    3. Tocca <strong>"Installa app"</strong> o <strong>"Aggiungi a schermata Home"</strong>.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Opzione 2: Download Pacchetto APK Standalone */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-700 shrink-0" />
                <h4 className="font-bold text-slate-900 text-xs">
                  Metodo 2: Generazione File .APK per Android
                </h4>
              </div>
              <span className="text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                File .apk / .aab
              </span>
            </div>

            <p className="text-slate-600 leading-relaxed mb-3">
              Poiché questa è un'applicazione web moderna ad alte prestazioni, puoi compilare e scaricare il pacchetto binario <strong>.APK</strong> o <strong>.AAB</strong> (pronto per l'installazione manuale o per Google Play Store) con 1 clic tramite lo strumento ufficiale gratuito <strong>PWABuilder</strong>:
            </p>

            <div className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 mb-3">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>URL Ufficiale dell'App:</span>
                <button
                  onClick={handleCopyUrl}
                  className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                >
                  {copiato ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiato ? 'Copiato!' : 'Copia link'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-slate-800 bg-slate-50 p-2 rounded border border-slate-100 truncate">
                {appUrl}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2">
              <a
                id="btn-open-pwabuilder"
                href={pwaBuilderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs shadow-sm transition-colors cursor-pointer"
              >
                <span>Genera & Scarica File APK (PWABuilder)</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>

            {/* Istruzioni pratiche per PWABuilder */}
            <div className="mt-3 pt-3 border-t border-slate-200/80 text-[11px] text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Passaggi su PWABuilder:</p>
              <ol className="list-decimal list-inside space-y-0.5 text-slate-500">
                <li>Clicca sul pulsante sopra (l'URL dell'app è già inserito).</li>
                <li>Verifica il punteggio (il manifesto e le icone sono già configurati al 100%).</li>
                <li>Clicca su <strong>"Package for Android"</strong>.</li>
                <li>Premi <strong>"Download Package"</strong> per scaricare il file APK sul tuo dispositivo!</li>
              </ol>
            </div>
          </div>

          {/* Nota Informativa Installazione APK */}
          <div className="flex items-start gap-2 text-[11px] text-slate-500 bg-amber-50/50 p-3 rounded-lg border border-amber-200/60">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <p>
              <strong>Consiglio:</strong> Se vuoi usare l'app sul tuo telefono senza passaggi complessi, ti raccomandiamo il <strong>Metodo 1</strong>: aprendo questa pagina dal browser del tuo smartphone e selezionando <em>"Aggiungi a schermata Home"</em>, l'app funzionerà subito come una vera applicazione Android con icona e apertura a schermo intero.
            </p>
          </div>

        </div>

        {/* Chiusura */}
        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Chiudi
          </button>
        </div>

      </div>
    </div>
  );
};
