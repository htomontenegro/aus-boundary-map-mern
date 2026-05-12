import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const NAV = [
  { to: '/admin/entries',    icon: '📍', label: 'Entries' },
  { to: '/admin/categories', icon: '🏷️', label: 'Categories' },
  { to: '/admin/settings',   icon: '⚙️', label: 'Settings' },
];

export default function AdminLayout() {
  const { setToken, user } = useAuth();
  const navigate           = useNavigate();

  const handleSignOut = () => {
    setToken(null);
    navigate('/admin/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-white flex flex-col flex-shrink-0">
        <Link to="/" className="flex items-center gap-2 px-5 py-4 border-b border-gray-700 hover:bg-gray-800 transition-colors">
          <span className="text-xl">🗺️</span>
          <span className="font-bold text-sm">Boundary Map</span>
        </Link>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
                }`
              }
            >
              <span>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-700">
          {user && (
            <p className="text-xs text-gray-400 px-3 mb-2 truncate">{user.email}</p>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-800 rounded transition-colors"
          >
            <span>🚪</span>
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
