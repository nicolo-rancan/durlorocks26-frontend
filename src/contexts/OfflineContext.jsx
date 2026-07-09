import { createContext, useContext, useState, useEffect } from 'react';

const OfflineContext = createContext(false);

export function OfflineProvider({ children }) {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const on = () => setOffline(false);
    const off = () => setOffline(true);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return <OfflineContext.Provider value={offline}>{children}</OfflineContext.Provider>;
}

export const useOffline = () => useContext(OfflineContext);
