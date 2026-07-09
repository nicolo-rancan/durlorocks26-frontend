import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usersApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  RiAddLine, RiKeyLine, RiDeleteBinLine, RiUserLine,
  RiShieldLine, RiLockLine,
} from 'react-icons/ri';

function UserRow({ user, onChangePassword, onDelete }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-surface-4 last:border-0">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-surface-3 flex items-center justify-center">
          {user.is_admin ? <RiShieldLine className="text-brand" size={18} /> : <RiUserLine className="text-gray-400" size={18} />}
        </div>
        <div>
          <p className="font-medium">{user.username}</p>
          <p className="text-xs text-gray-500">{user.is_admin ? 'Admin' : 'Utente'} · {formatDate(user.created_at)}</p>
        </div>
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onChangePassword(user)}
          className="p-2 text-gray-400 hover:text-brand transition-colors"
          title="Cambia password"
        >
          <RiKeyLine size={18} />
        </button>
        {!user.is_admin && (
          <button
            onClick={() => onDelete(user)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
            title="Elimina"
          >
            <RiDeleteBinLine size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-surface-2 border border-surface-4 rounded-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        {children}
        <Button variant="ghost" onClick={onClose} className="mt-3 w-full">Annulla</Button>
      </div>
    </div>
  );
}

export default function Impostazioni() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ username: '', password: '' });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (!isAdmin) { navigate('/'); return; }
    loadUsers();
  }, [isAdmin]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const { data } = await usersApi.list();
      setUsers(data);
    } catch { toast('Errore caricamento utenti', 'error'); }
    finally { setLoading(false); }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) return;
    setFormLoading(true);
    try {
      await usersApi.create(form.username.trim(), form.password);
      toast('Utente creato', 'success');
      setModal(null);
      setForm({ username: '', password: '' });
      loadUsers();
    } catch (err) {
      toast(err.response?.data?.error || 'Errore creazione utente', 'error');
    } finally { setFormLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!form.password) return;
    setFormLoading(true);
    try {
      await usersApi.changePassword(modal.user.id, form.password);
      toast('Password aggiornata', 'success');
      setModal(null);
      setForm({ username: '', password: '' });
    } catch (err) {
      toast(err.response?.data?.error || 'Errore aggiornamento password', 'error');
    } finally { setFormLoading(false); }
  };

  const handleDelete = async () => {
    setFormLoading(true);
    try {
      await usersApi.delete(modal.user.id);
      toast('Utente eliminato', 'success');
      setModal(null);
      loadUsers();
    } catch (err) {
      toast(err.response?.data?.error || 'Errore eliminazione', 'error');
    } finally { setFormLoading(false); }
  };

  if (!isAdmin) return null;

  return (
    <div className="p-4 max-w-lg mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Impostazioni</h2>
          <p className="text-gray-500 text-sm mt-1">Gestione account</p>
        </div>
        <Button
          size="sm"
          onClick={() => { setForm({ username: '', password: '' }); setModal({ type: 'create' }); }}
        >
          <RiAddLine size={16} /> Nuovo utente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center gap-2">
            <RiUserLine className="text-brand" /> Utenti ({users.length})
          </h3>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[1,2].map((i) => <div key={i} className="h-14 bg-surface-3 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <div>
              {users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  onChangePassword={(user) => { setForm({ username: '', password: '' }); setModal({ type: 'password', user }); }}
                  onDelete={(user) => setModal({ type: 'delete', user })}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {modal?.type === 'create' && (
        <Modal title="Nuovo utente" onClose={() => setModal(null)}>
          <form onSubmit={handleCreateUser} className="flex flex-col gap-3">
            <Input
              label="Username"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              placeholder="nomeutente"
              required
            />
            <Input
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="min. 6 caratteri"
              required
              minLength={6}
            />
            <Button type="submit" disabled={formLoading}>
              {formLoading ? 'Creazione...' : 'Crea utente'}
            </Button>
          </form>
        </Modal>
      )}

      {modal?.type === 'password' && (
        <Modal title={`Password: ${modal.user.username}`} onClose={() => setModal(null)}>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-3">
            <Input
              label="Nuova password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              placeholder="min. 6 caratteri"
              required
              minLength={6}
            />
            <Button type="submit" disabled={formLoading}>
              <RiLockLine size={16} /> {formLoading ? 'Aggiornamento...' : 'Aggiorna password'}
            </Button>
          </form>
        </Modal>
      )}

      {modal?.type === 'delete' && (
        <Modal title={`Elimina ${modal.user.username}?`} onClose={() => setModal(null)}>
          <p className="text-gray-400 text-sm mb-4">Questa azione non può essere annullata.</p>
          <Button variant="danger" disabled={formLoading} onClick={handleDelete} className="w-full">
            <RiDeleteBinLine size={16} /> {formLoading ? 'Eliminazione...' : 'Elimina utente'}
          </Button>
        </Modal>
      )}
    </div>
  );
}
