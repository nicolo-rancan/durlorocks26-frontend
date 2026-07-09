import { useState, useEffect } from 'react';
import { useEdition } from '@/contexts/EditionContext';
import { prevenditeApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { RiSearchLine, RiExchangeLine, RiCheckLine } from 'react-icons/ri';

function PrevenditaCard({ p, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(p)}
      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
        selected ? 'border-brand bg-brand/10' : 'border-surface-4 bg-surface-2 hover:border-gray-600'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{p.nome} {p.cognome}</p>
          <p className="text-gray-500 text-sm">{p.email}</p>
          <p className="font-mono text-xs text-gray-600 mt-1 tracking-widest">{p.codice}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          {p.maggiorenne ? <Badge variant="brand">+18</Badge> : <Badge variant="warning">-18</Badge>}
          {selected && <RiCheckLine className="text-brand" size={18} />}
        </div>
      </div>
    </button>
  );
}

const INIT_FORM = { nome: '', cognome: '', email: '', maggiorenne: null };

export default function Trasferisci() {
  const { edizione } = useEdition();
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(INIT_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!search.trim()) { setItems([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await prevenditeApi.list(edizione, search);
        setItems(data);
      } catch { toast('Errore ricerca', 'error'); }
      finally { setSearching(false); }
    }, 300);
    return () => clearTimeout(t);
  }, [search, edizione]);

  const validate = () => {
    const e = {};
    if (!form.nome.trim()) e.nome = 'Campo obbligatorio';
    if (!form.cognome.trim()) e.cognome = 'Campo obbligatorio';
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Email non valida';
    if (form.maggiorenne === null) e.maggiorenne = 'Seleziona un\'opzione';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (!selected) { toast('Seleziona una prevendita', 'error'); return; }

    setLoading(true);
    try {
      await prevenditeApi.trasferisci(selected.id, form);
      setSuccess(true);
      toast('Trasferimento completato! Email inviate.', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Errore durante il trasferimento', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearch(''); setItems([]); setSelected(null);
    setForm(INIT_FORM); setErrors({}); setSuccess(false);
  };

  if (success) {
    return (
      <div className="p-4 max-w-lg mx-auto flex flex-col items-center text-center py-12">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-6">
          <RiCheckLine size={40} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Trasferimento completato!</h2>
        <p className="text-gray-400 mb-6">Email inviate al vecchio e nuovo nominativo</p>
        <Button onClick={handleReset}>Nuovo trasferimento</Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Trasferisci prevendita</h2>
        <p className="text-gray-500 text-sm mt-1">Cerca e seleziona la prevendita da trasferire</p>
      </div>

      {/* Step 1: Search & Select */}
      <div className="mb-6">
        <div className="relative mb-3">
          <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="search"
            placeholder="Cerca nome, cognome, email, codice..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setSelected(null); }}
            className="w-full bg-surface-3 border border-surface-4 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-brand/50 focus:border-brand"
          />
        </div>

        {searching && <p className="text-xs text-gray-500 mb-3">Ricerca...</p>}

        {items.length > 0 && (
          <div className="flex flex-col gap-2 mb-4 max-h-64 overflow-auto">
            {items.map((p) => (
              <PrevenditaCard
                key={p.id}
                p={p}
                selected={selected?.id === p.id}
                onSelect={setSelected}
              />
            ))}
          </div>
        )}

        {selected && (
          <div className="bg-brand/10 border border-brand/30 rounded-xl p-3 mb-4">
            <p className="text-xs text-brand mb-1 font-medium">Prevendita selezionata</p>
            <p className="font-semibold">{selected.nome} {selected.cognome}</p>
            <p className="text-gray-400 text-sm">{selected.email}</p>
          </div>
        )}
      </div>

      {/* Step 2: New owner form */}
      {selected && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-1">
            <RiExchangeLine className="text-brand" size={18} />
            <span className="font-semibold text-sm">Nuovo nominativo</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Nome *"
              value={form.nome}
              onChange={(e) => { setForm((f) => ({ ...f, nome: e.target.value })); setErrors((er) => ({ ...er, nome: '' })); }}
              error={errors.nome}
              placeholder="Mario"
            />
            <Input
              label="Cognome *"
              value={form.cognome}
              onChange={(e) => { setForm((f) => ({ ...f, cognome: e.target.value })); setErrors((er) => ({ ...er, cognome: '' })); }}
              error={errors.cognome}
              placeholder="Rossi"
            />
          </div>

          <Input
            label="Email *"
            type="email"
            value={form.email}
            onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: '' })); }}
            error={errors.email}
            placeholder="mario@esempio.it"
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-300">Maggiorenne *</label>
            <div className="grid grid-cols-2 gap-3">
              {[{ val: true, label: 'Sì (+18)' }, { val: false, label: 'No (-18)' }].map(({ val, label }) => (
                <button
                  key={String(val)}
                  type="button"
                  onClick={() => { setForm((f) => ({ ...f, maggiorenne: val })); setErrors((er) => ({ ...er, maggiorenne: '' })); }}
                  className={`py-3 rounded-xl border-2 font-medium transition-all ${
                    form.maggiorenne === val
                      ? 'border-brand bg-brand/15 text-brand'
                      : 'border-surface-4 bg-surface-3 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.maggiorenne && <span className="text-xs text-red-400">{errors.maggiorenne}</span>}
          </div>

          <Button type="submit" size="lg" disabled={loading} className="mt-2">
            {loading ? 'Trasferimento in corso...' : 'Conferma trasferimento'}
          </Button>
        </form>
      )}
    </div>
  );
}
