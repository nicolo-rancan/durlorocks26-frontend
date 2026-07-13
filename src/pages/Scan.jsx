import { useState, useEffect, useRef } from 'react';
import { prevenditeApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  RiQrScanLine, RiKeyboardLine, RiCheckLine,
  RiErrorWarningLine, RiRefreshLine, RiUserLine, RiCloseCircleLine,
} from 'react-icons/ri';

function SvalidaModal({ onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-2 border border-surface-4 rounded-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold mb-2">Svalidare la prevendita?</h3>
        <p className="text-gray-400 text-sm mb-5">
          La prevendita tornerà allo stato "non validata" e potrà essere eliminata.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-surface-4 bg-surface-3 text-gray-300 text-sm font-medium hover:bg-surface-4 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? 'Svalidando...' : 'Svalida'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ResultCard({ result, onReset, onSvalida }) {
  const isAlreadyValidated = result.already_validated;
  const isValid = result.ok;
  const isNotFound = result.not_found;

  if (isNotFound) {
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
          <RiErrorWarningLine size={40} className="text-red-400" />
        </div>
        <h3 className="text-xl font-bold text-red-400 mb-2">Prevendita non trovata</h3>
        <p className="text-gray-500 text-sm mb-6">Codice: <span className="font-mono">{result.codice}</span></p>
        <Button onClick={onReset} variant="secondary">Riprova</Button>
      </div>
    );
  }

  if (isAlreadyValidated) {
    const p = result.prevendita || {};
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mb-4">
          <RiErrorWarningLine size={40} className="text-amber-400" />
        </div>
        <h3 className="text-xl font-bold text-amber-400 mb-1">Già convalidata</h3>
        <p className="text-gray-400 text-sm mb-4">
          Convalidata il {formatDate(result.validata_at || p.validata_at)}
        </p>
        {p.nome && (
          <div className="bg-surface-2 border border-surface-4 rounded-xl px-6 py-4 mb-6 w-full max-w-xs">
            <p className="font-semibold">{p.nome} {p.cognome}</p>
            <p className="text-gray-500 text-sm">{p.email}</p>
            <p className="font-mono text-xs text-gray-600 mt-1 tracking-widest">{p.codice}</p>
          </div>
        )}
        <Button onClick={onReset} variant="secondary">Scansiona altro</Button>
      </div>
    );
  }

  if (isValid) {
    const p = result.prevendita;
    return (
      <div className="flex flex-col items-center text-center py-8">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
          <RiCheckLine size={40} className="text-green-400" />
        </div>
        <h3 className="text-xl font-bold text-green-400 mb-4">Prevendita valida!</h3>
        <div className="bg-surface-2 border border-surface-4 rounded-xl px-6 py-5 mb-6 w-full max-w-xs">
          <div className="flex items-center gap-2 justify-center mb-3">
            <RiUserLine className="text-gray-400" />
            <span className="font-semibold text-lg">{p.nome} {p.cognome}</span>
          </div>
          <p className="text-gray-500 text-sm mb-2">{p.email}</p>
          <div className="flex justify-center gap-2">
            {p.maggiorenne ? <Badge variant="brand">+18</Badge> : <Badge variant="warning">-18</Badge>}
            <Badge variant="success">✓ Convalidata ora</Badge>
          </div>
          <p className="font-mono text-xs text-gray-600 mt-3 tracking-widest">{p.codice}</p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <Button onClick={onReset} className="flex-1">Scansiona altro</Button>
          <button
            onClick={() => onSvalida(p.codice)}
            className="flex-1 py-2.5 rounded-xl border border-red-800 bg-red-950/40 text-red-400 text-sm font-medium hover:bg-red-900/40 transition-colors flex items-center justify-center gap-1.5"
          >
            <RiCloseCircleLine size={16} /> Svalida
          </button>
        </div>
      </div>
    );
  }

  return null;
}

export default function Scan() {
  const toast = useToast();
  const [mode, setMode] = useState('camera');
  const [manualCode, setManualCode] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [svalidaCode, setSvalidaCode] = useState(null);
  const [svalidaLoading, setSvalidaLoading] = useState(false);
  const scannerRef = useRef(null);
  const scannerInstance = useRef(null);
  const scanning = useRef(false);

  const handleCode = async (code) => {
    const clean = code.trim().replace(/\D/g, '');
    if (clean.length !== 9) {
      toast('Codice non valido: deve essere 9 cifre', 'error');
      return;
    }
    if (scanning.current) return;
    scanning.current = true;
    setLoading(true);

    try {
      const { data } = await prevenditeApi.valida(clean);
      setResult({ ...data, codice: clean });
    } catch (err) {
      const errData = err.response?.data;
      if (err.response?.status === 404) {
        setResult({ not_found: true, codice: clean });
      } else if (errData?.already_validated) {
        setResult({ ...errData, prevendita: errData.prevendita });
      } else {
        toast(errData?.error || 'Errore di rete', 'error');
        scanning.current = false;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setManualCode('');
    scanning.current = false;
  };

  const handleSvalida = async () => {
    setSvalidaLoading(true);
    try {
      await prevenditeApi.svalida(svalidaCode);
      toast('Prevendita svalidata', 'success');
      setSvalidaCode(null);
      handleReset();
    } catch (err) {
      toast(err.response?.data?.error || 'Errore svalidazione', 'error');
      setSvalidaCode(null);
    } finally {
      setSvalidaLoading(false);
    }
  };

  useEffect(() => {
    if (mode !== 'camera' || result) return;

    let html5QrCode;
    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        html5QrCode = new Html5Qrcode('qr-reader');
        scannerInstance.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            if (!scanning.current) handleCode(decodedText);
          },
          () => {}
        );
      } catch (err) {
        console.error('Scanner error:', err);
        toast('Impossibile accedere alla fotocamera', 'error');
        setMode('manual');
      }
    };

    startScanner();

    return () => {
      if (scannerInstance.current) {
        scannerInstance.current.stop().catch(() => {});
        scannerInstance.current = null;
      }
    };
  }, [mode, result]);

  if (result) {
    return (
      <div className="p-4 max-w-lg mx-auto">
        <ResultCard result={result} onReset={handleReset} onSvalida={setSvalidaCode} />
        {svalidaCode && (
          <SvalidaModal
            onConfirm={handleSvalida}
            onCancel={() => setSvalidaCode(null)}
            loading={svalidaLoading}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Scan QR</h2>
        <p className="text-gray-500 text-sm mt-1">Scansiona o inserisci il codice prevendita</p>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: 'camera', icon: RiQrScanLine, label: 'Fotocamera' },
          { key: 'manual', icon: RiKeyboardLine, label: 'Manuale' },
        ].map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border transition-all text-sm font-medium ${
              mode === key
                ? 'border-brand bg-brand/15 text-brand'
                : 'border-surface-4 bg-surface-3 text-gray-400'
            }`}
          >
            <Icon size={18} /> {label}
          </button>
        ))}
      </div>

      {mode === 'camera' ? (
        <div className="relative">
          <div
            id="qr-reader"
            ref={scannerRef}
            className="w-full rounded-2xl overflow-hidden bg-surface-3"
            style={{ minHeight: 300 }}
          />
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-2xl">
              <div className="text-center">
                <RiRefreshLine size={40} className="animate-spin text-brand mx-auto mb-2" />
                <p className="text-sm text-gray-300">Validazione...</p>
              </div>
            </div>
          )}
          <p className="text-center text-gray-500 text-xs mt-3">
            Inquadra il QR code con la fotocamera
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Codice prevendita (9 cifre)</label>
            <input
              type="number"
              placeholder="000000000"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value.slice(0, 9))}
              className="w-full bg-surface-3 border border-surface-4 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand font-mono text-xl tracking-widest text-center"
              inputMode="numeric"
            />
          </div>
          <Button
            size="lg"
            disabled={manualCode.length !== 9 || loading}
            onClick={() => handleCode(manualCode)}
          >
            {loading ? 'Validazione...' : 'Valida'}
          </Button>
        </div>
      )}
    </div>
  );
}
