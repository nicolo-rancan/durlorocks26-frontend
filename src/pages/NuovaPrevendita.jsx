import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEdition } from '@/contexts/EditionContext';
import { prevenditeApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { RiCheckLine, RiMailLine } from 'react-icons/ri';

const INIT = { nome: '', cognome: '', email: '', maggiorenne: null };

export default function NuovaPrevendita() {
  const { edizione } = useEdition();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState(INIT);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

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

    setLoading(true);
    try {
      const { data } = await prevenditeApi.create({ ...form, edizione });
      setSuccess(data);
      toast('Prevendita creata! Email inviata.', 'success');
    } catch (err) {
      toast(err.response?.data?.error || 'Errore durante la creazione', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setForm(INIT); setErrors({}); setSuccess(null); };

  if (success) {
    return (
      <div className="p-4 max-w-lg mx-auto flex flex-col items-center text-center py-12">
        <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-6">
          <RiCheckLine size={40} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Prevendita creata!</h2>
        <p className="text-gray-400 mb-1">{success.nome} {success.cognome}</p>
        <p className="text-gray-500 text-sm mb-4 flex items-center gap-1">
          <RiMailLine size={14} /> Email inviata a {success.email}
        </p>
        <div className="bg-surface-2 border border-surface-4 rounded-xl px-6 py-4 mb-8">
          <p className="text-xs text-gray-500 mb-1">Codice prevendita</p>
          <p className="font-mono text-2xl tracking-[0.3em] text-brand">{success.codice}</p>
        </div>
        <div className="flex gap-3 w-full max-w-xs">
          <Button variant="secondary" onClick={() => navigate('/elenco')} className="flex-1">
            Elenco
          </Button>
          <Button onClick={handleReset} className="flex-1">
            Nuova
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold">Nuova prevendita</h2>
        <p className="text-gray-500 text-sm mt-1">Edizione {edizione}</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
          {loading ? 'Creazione in corso...' : 'Crea prevendita'}
        </Button>
      </form>
    </div>
  );
}
