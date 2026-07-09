import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { OfflineProvider } from '@/contexts/OfflineContext';
import { EditionProvider } from '@/contexts/EditionContext';
import { ToastProvider } from '@/components/ui/Toast';
import Layout from '@/components/Layout';
import ProtectedRoute from '@/components/ProtectedRoute';
import Login from '@/pages/Login';
import Home from '@/pages/Home';
import Elenco from '@/pages/Elenco';
import NuovaPrevendita from '@/pages/NuovaPrevendita';
import Scan from '@/pages/Scan';
import Trasferisci from '@/pages/Trasferisci';
import Impostazioni from '@/pages/Impostazioni';

export default function App() {
  return (
    <BrowserRouter>
      <OfflineProvider>
        <AuthProvider>
          <EditionProvider>
            <ToastProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/elenco" element={<Elenco />} />
                  <Route path="/nuova" element={<NuovaPrevendita />} />
                  <Route path="/scan" element={<Scan />} />
                  <Route path="/trasferisci" element={<Trasferisci />} />
                  <Route path="/impostazioni" element={<Impostazioni />} />
                </Route>
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </ToastProvider>
          </EditionProvider>
        </AuthProvider>
      </OfflineProvider>
    </BrowserRouter>
  );
}
