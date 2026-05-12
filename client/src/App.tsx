import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';

import PublicMapPage   from './pages/PublicMapPage';
import LoginPage       from './pages/admin/LoginPage';
import AdminLayout     from './pages/admin/AdminLayout';
import EntriesPage     from './pages/admin/EntriesPage';
import EntryFormPage   from './pages/admin/EntryFormPage';
import CategoriesPage  from './pages/admin/CategoriesPage';
import SettingsPage    from './pages/admin/SettingsPage';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen text-gray-500">Loading…</div>;
  return token ? <>{children}</> : <Navigate to="/admin/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicMapPage />} />
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
        <Route index element={<Navigate to="entries" replace />} />
        <Route path="entries"          element={<EntriesPage />} />
        <Route path="entries/new"      element={<EntryFormPage />} />
        <Route path="entries/:id/edit" element={<EntryFormPage />} />
        <Route path="categories"       element={<CategoriesPage />} />
        <Route path="settings"         element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
