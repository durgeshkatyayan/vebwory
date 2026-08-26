import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
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


export function App() {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('auth_user') || 'null'));
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  useEffect(() => { document.documentElement.classList.toggle('dark', dark); localStorage.setItem('theme', dark ? 'dark' : 'light'); }, [dark]);
  return (
    <BrowserRouter>
      {!user ? <Routes><Route path="*" element={<Auth onAuthenticated={setUser} />} /></Routes> : <AuthenticatedApp user={user} setUser={setUser} dark={dark} setDark={setDark} />}
    </BrowserRouter>
  );
}

function AuthenticatedApp({ user, setUser, dark, setDark }) {
  const navItems = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/tasks', label: 'Tasks', icon: CheckSquare },
    { to: '/external', label: 'External Directory', icon: Users2 },
  ];
  const logout = () => { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); setUser(null); };
  return (
    <div className="min-h-screen bg-white dark:bg-black flex flex-col md:flex-row text-black dark:text-white">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-black border-r border-black dark:border-white flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-black dark:border-white space-x-3">
            <div className="p-2 rounded-lg bg-black dark:bg-white text-white dark:text-black shadow-md">
              <Layers className="w-5 h-5" />
            </div>
            <span className="font-bold text-base tracking-wide">TaskMatrix</span>
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
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-xs">
              <p className="font-medium">{user.name} ({user.role})</p>
              <button onClick={() => setDark(!dark)} className="underline mr-3">{dark ? 'Light mode' : 'Dark mode'}</button>
              <button onClick={logout} className="underline">Sign out</button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Application Content */}
      <main className="flex-1 overflow-y-auto min-h-screen bg-white dark:bg-black p-6 md:p-10">
        <Routes>
          <Route path="/auth" element={<Auth />} />
          {/* Protected App Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/*" element={<MainLayout />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

export default App;