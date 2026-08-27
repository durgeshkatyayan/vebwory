import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CheckSquare,
  Users2,
  Layers
} from 'lucide-react';
import { Dashboard } from './components/pages/Dashboard';
import { TaskList } from './components/pages/TaskList';
import { TaskDetail } from './components/pages/TaskDetail';
import ExternalUsers from './components/pages/ExternalUsers';
import Auth from './components/pages/Auth';
import { useAuth } from './context/AuthContext';

export function App() {
  const { user } = useAuth();
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/auth"
          element={!user ? <Auth /> : <Navigate to="/" replace />}
        />
        <Route
          path="/*"
          element={
            user ? (
              <AuthenticatedApp user={user} dark={dark} setDark={setDark} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function AuthenticatedApp({ user, dark, setDark }) {
  const { logout } = useAuth();
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/external', label: 'External Directory', icon: Users2 },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col md:flex-row text-black dark:text-white">
      <aside className="w-full md:w-64 bg-white dark:bg-black border-r border-black dark:border-white flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-black dark:border-white space-x-3">
            <div className="p-2 rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-wide">Task Webvory</span>
          </div>

          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white'
                      : 'text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-black dark:border-white">
          <div className="flex items-center space-x-3 px-2 py-1.5">
            <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black border border-black dark:border-white flex items-center justify-center text-xs font-semibold">
              {user.name?.slice(0, 2).toUpperCase() ?? 'U'}
            </div>
            <div className="text-xs">
              <p className="font-medium">{user.name} ({user.role})</p>
              <button onClick={() => setDark(!dark)} className="underline mr-3">{dark ? 'Light mode' : 'Dark mode'}</button>
              <button onClick={logout} className="underline">Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto min-h-screen bg-white dark:bg-black p-6 md:p-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<TaskList />} />
          <Route path="/tasks/:id" element={<TaskDetail />} />
          <Route path="/external" element={<ExternalUsers />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;