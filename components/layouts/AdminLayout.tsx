import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, Landmark, Trophy, Settings, LogOut, Menu, X, Megaphone, ShieldAlert, UserCheck, CheckCircle, EyeOff, History, Swords } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout, isImpersonating, stopImpersonation } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleStopImpersonation = () => {
      stopImpersonation();
      navigate('/admin/users');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Deposits', path: '/admin/deposits', icon: CreditCard },
    { name: 'Withdrawals', path: '/admin/withdrawals', icon: Landmark },
    { name: 'Tournaments', path: '/admin/tournaments', icon: Trophy },
    { name: 'Guilds & Wars', path: '/admin/guilds', icon: Swords },
    { name: 'Updates', path: '/admin/updates', icon: Megaphone },
    { name: 'Anti-Cheat', path: '/admin/anti-cheat', icon: ShieldAlert },
    { name: 'Verify Users', path: '/admin/verify-users', icon: UserCheck },
    { name: 'Verify Results', path: '/admin/verify-results', icon: CheckCircle },
    { name: 'Audit Log', path: '/admin/audit-log', icon: History },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
        <div className="p-4 border-b border-gray-700">
            <h1 className="text-2xl font-bold text-brand-orange tracking-wider text-center">ADMIN PANEL</h1>
        </div>
        <nav className="flex-grow p-4 overflow-y-auto">
            <ul>
                {navItems.map(item => (
                    <li key={item.name}>
                        <NavLink
                            to={item.path}
                            end={item.path === '/admin'}
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) => 
                                `flex items-center gap-3 p-3 rounded-lg transition-colors mb-2 ${
                                    isActive ? 'bg-brand-orange text-white' : 'text-brand-text-secondary hover:bg-brand-light-gray hover:text-brand-text'
                                }`
                            }
                        >
                            <item.icon size={20} />
                            <span>{item.name}</span>
                        </NavLink>
                    </li>
                ))}
            </ul>
        </nav>
        <div className="p-4 border-t border-gray-700">
            <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 p-3 rounded-lg text-brand-text-secondary hover:bg-brand-red hover:text-white transition-colors">
                <LogOut size={20} />
                <span>Logout</span>
            </button>
        </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-brand-dark">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 bg-brand-gray shadow-lg">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <div className={`fixed inset-0 z-30 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out md:hidden`}>
          <div className="w-64 bg-brand-gray h-full shadow-lg">
            <SidebarContent />
          </div>
          <div className="absolute top-4 right-4" onClick={() => setIsSidebarOpen(false)}>
            <X className="text-white"/>
          </div>
      </div>
      {isSidebarOpen && <div className="fixed inset-0 bg-black/50 z-20 md:hidden" onClick={() => setIsSidebarOpen(false)}></div>}


      <div className="flex-1 flex flex-col">
        <header className="md:hidden bg-brand-gray p-4 flex justify-between items-center">
            <h1 className="text-lg font-bold text-brand-orange">ADMIN</h1>
            <button onClick={() => setIsSidebarOpen(true)} className="text-white">
                <Menu size={24} />
            </button>
        </header>
        <main className="flex-grow p-4 md:p-8 overflow-y-auto">
             {isImpersonating && (
                <div className="bg-yellow-900/50 border border-yellow-400/30 p-3 rounded-lg text-sm flex items-center justify-between gap-3 mb-6 animate-fade-in">
                    <div className="flex items-center gap-2">
                        <ShieldAlert className="text-yellow-400 h-5 w-5" />
                        <p className="text-yellow-200 font-semibold">
                            Impersonating user: <span className="font-bold text-white">{user?.username}</span>
                        </p>
                    </div>
                    <button onClick={handleStopImpersonation} className="bg-yellow-400/20 text-yellow-200 hover:bg-yellow-400/40 px-3 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 transition-colors">
                        <EyeOff size={14} /> Stop Impersonating
                    </button>
                </div>
            )}
            <div className="animate-fade-in">
                {children}
            </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;