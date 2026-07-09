import { useEffect, useState, useCallback } from 'react';
import { useEdition } from '@/contexts/EditionContext';
import { useOffline } from '@/contexts/OfflineContext';
import { prevenditeApi } from '@/lib/api';
import { cachePrevendite, getCachedPrevendite, getLastSyncTime } from '@/lib/offline';
import { formatDate } from '@/lib/utils';
import Badge from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';
import { RiSearchLine, RiRefreshLine, RiWifiOffLine, RiTicket2Line, RiDeleteBinLine } from 'react-icons/ri';

function DeleteModal({ prevendita, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-2 border border-surface-4 rounded-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold mb-1">Elimina prevendita?</h3>
        <p className="text-gray-400 text-sm mb-1">
          <span className="text-white font-medium">{prevendita.nome} {prevendita.cognome}</span>
        </p>
        <p className="font-mono text-xs text-gray-500 mb-5 tracking-widest">{prevendita.codice}</p>
        <p className="text-red-400 text-xs mb-5">Questa azione non può essere annullata.</p>
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
            {loading ? 'Eliminazione...' : 'Elimina'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PrevenditaRow({ p, onDelete }) {
  return (
    <div className="bg-surface-2 border border-surface-4 rounded-xl p-4 flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-white truncate">{p.nome} {p.cognome}</span>
          {p.maggiorenne
            ? <Badge variant="brand">+18</Badge>
            : <Badge variant="warning">-18</Badge>
          }
          {p.validata
            ? <Badge variant="success">✓ Validata</Badge>
            : <Badge variant="neutral">Attesa</Badge>
          }
        </div>
        <p className="text-gray-500 text-sm truncate mt-0.5">{p.email}</p>
        <p className="font-mono text-xs text-gray-600 mt-1 tracking-widest">{p.codice}</p>
        {p.validata_at && (
          <p className="text-xs text-green-600 mt-0.5">Val. {formatDate(p.validata_at)}</p>
        )}
      </div>
      <button
        onClick={() => onDelete(p)}
        className="p-2 text-gray-600 hover:text-red-400 transition-colors shrink-0 mt-0.5"
      >
        <RiDeleteBinLine size={18} />
      </button>
    </div>
  );
}

export default function Elenco() {
  const { edizione } = useEdition();
  const offline = useOffline();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async (query = '') => {
    setLoading(true);
    if (offline) {
      const cached = await getCachedPrevendite(edizione, query);
      setItems(cached);
      setFromCache(true);
      const sync = await getLastSyncTime(edizione);
      if (sync) setLastSync(new Date(sync).toLocaleTimeString('it-IT'));
    } else {
      try {
        const { data } = await prevenditeApi.list(edizione, query);
        setItems(data);
        setFromCache(false);
        if (!query) await cachePrevendite(edizione, data);
        setLastSync(new Date().toLocaleTimeString('it-IT'));
      } catch {
        const cached = await getCachedPrevendite(edizione, query);
        setItems(cached);
        setFromCache(true);
      }
    }
    setLoading(false);
  }, [edizione, offline]);

  useEffect(() => { load(''); setSearch(''); }, [edizione]);

  useEffect(() => {
    const t = setTimeout(() => load(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await prevenditeApi.delete(toDelete.id);
      toast('Prevendita eliminata', 'success');
      setToDelete(null);
      load(search);
    } catch (err) {
      toast(err.response?.data?.error || 'Errore eliminazione', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">Elenco {edizione}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-gray-500 text-xs">{items.length} prevendite</span>
            {fromCache && (
              <span className="flex items-center gap-1 text-xs text-brand/70">
                <RiWifiOffLine size={12} /> Cache {lastSync && `· ${lastSync}`}
              </span>
            )}
            {!fromCache && lastSync && (
              <span className="text-xs text-gray-600">Aggiornato {lastSync}</span>
            )}
          </div>
        </div>
        {!offline && (
          <button
            onClick={() => load(search)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <RiRefreshLine size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        )}
      </div>

      <div className="relative mb-4">
        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
        <input
          type="search"
          placeholder="Cerca nome, cognome, email, codice..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface-3 border border-surface-4 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
        />
      </div>

      {loading ? (
        <div className="flex flex-col gap-3">
          {[1,2,3].map((i) => <div key={i} className="h-24 bg-surface-2 rounded-xl animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <RiTicket2Line size={48} className="mx-auto mb-3 opacity-30" />
          <p>{search ? 'Nessun risultato' : 'Nessuna prevendita'}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((p) => <PrevenditaRow key={p.id} p={p} onDelete={setToDelete} />)}
        </div>
      )}

      {toDelete && (
        <DeleteModal
          prevendita={toDelete}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
