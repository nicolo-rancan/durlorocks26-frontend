import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useOffline } from '@/contexts/OfflineContext';
import { useEdition } from '@/contexts/EditionContext';
import {
  RiHome5Line, RiHome5Fill,
  RiListUnordered,
  RiQrScanLine,
  RiExchangeLine,
  RiSettings3Line,
  RiWifiOffLine,
  RiAddLine,
  RiLogoutBoxLine,
} from 'react-icons/ri';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: RiHome5Line, activeIcon: RiHome5Fill, label: 'Home' },
  { to: '/elenco', icon: RiListUnordered, label: 'Elenco' },
  { to: '/nuova', icon: RiAddLine, label: 'Nuova' },
  { to: '/scan', icon: RiQrScanLine, label: 'Scan' },
  { to: '/trasferisci', icon: RiExchangeLine, label: 'Trasferisci' },
];

function LogoutModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface-2 border border-surface-4 rounded-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-bold mb-2">Esci dall'app?</h3>
        <p className="text-gray-400 text-sm mb-6">Verrai reindirizzato alla pagina di login.</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-surface-4 bg-surface-3 text-gray-300 text-sm font-medium hover:bg-surface-4 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-medium transition-colors"
          >
            Esci
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const offline = useOffline();
  const { edizione, changeEdizione, years } = useEdition();
  const navigate = useNavigate();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex flex-col min-h-dvh bg-surface">
      {/* Header */}
      <header className="bg-surface-2 border-b border-surface-4 px-4 py-5 safe-top flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Durlo Rocks" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <h1 className="font-bold text-brand leading-none">Durlo Rocks</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <select
                value={edizione}
                onChange={(e) => changeEdizione(parseInt(e.target.value))}
                className="bg-transparent text-xs text-gray-400 border-none outline-none cursor-pointer"
              >
                {years.map((y) => <option key={y} value={y} className="bg-surface-2">{y}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {offline && (
            <span className="flex items-center gap-1 text-xs text-brand/80 bg-brand/10 px-2 py-1 rounded-full">
              <RiWifiOffLine size={14} /> Offline
            </span>
          )}
          <span className="text-xs text-gray-500">{user?.username}</span>
          {isAdmin && (
            <button
              onClick={() => navigate('/impostazioni')}
              className="p-2 text-gray-400 hover:text-brand transition-colors"
            >
              <RiSettings3Line size={18} />
            </button>
          )}
          <button
            onClick={() => setShowLogout(true)}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors"
          >
            <RiLogoutBoxLine size={18} />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="bg-surface-2 border-t border-surface-4 safe-bottom sticky bottom-0 z-40">
        <div className="flex">
          {navItems.map(({ to, icon: Icon, activeIcon: ActiveIcon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex-1 flex flex-col items-center gap-1 py-4 text-xs transition-colors',
                  isActive ? 'text-brand' : 'text-gray-500 hover:text-gray-300'
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && ActiveIcon ? <ActiveIcon size={22} /> : <Icon size={22} />}
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {showLogout && (
        <LogoutModal
          onConfirm={handleLogout}
          onCancel={() => setShowLogout(false)}
        />
      )}
    </div>
  );
}
