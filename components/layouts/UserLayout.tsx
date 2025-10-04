import React, { useEffect } from 'react';
import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Home, Wallet, User as UserIcon, LogOut, MessageSquare, PlusCircle, Megaphone, Users, Swords } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import AnimatedCounter from '../common/AnimatedCounter';

const UserLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { users } = useData();
  const navigate = useNavigate();

  // Effect to log out user if they are banned mid-session
  useEffect(() => {
    if (user) {
      const latestUserData = users.find(u => u.id === user.id);
      if (latestUserData && latestUserData.isBanned) {
        alert("Your account has been banned by an administrator.");
        logout();
        navigate('/');
      }
    }
  }, [users, user, logout, navigate]);


  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const navItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Updates', path: '/updates', icon: Megaphone },
    { name: 'Wallet', path: '/wallet', icon: Wallet },
    { name: 'Guilds', path: '/guilds', icon: Users },
    { name: 'Guild Wars', path: '/guild-wars', icon: Swords },
    { name: 'Chat', path: '/chat', icon: MessageSquare },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];
  
  const totalBalance = user ? user.depositedBalance + user.winnableBalance + user.bonusBalance : 0;
  const winnablePercent = totalBalance > 0 && user ? (user.winnableBalance / totalBalance) * 100 : 0;
  const bonusPercent = totalBalance > 0 && user ? (user.bonusBalance / totalBalance) * 100 : 0;
  const depositedPercent = 100 - winnablePercent - bonusPercent;


  return (
    <div className="min-h-screen bg-brand-dark flex flex-col">
      <header className="bg-brand-gray p-4 flex justify-between items-center shadow-md sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-brand-orange tracking-wider">FF TOURNAMENT HUB</h1>
        <button onClick={handleLogout} className="text-brand-text-secondary hover:text-brand-orange transition-colors">
          <LogOut size={24} />
        </button>
      </header>
      <main className="flex-grow p-4 md:p-6 animate-fade-in">
        {/* Wallet Balance Display */}
        {user && (
          <div className="bg-brand-gray p-4 rounded-lg shadow-lg mb-6 border border-brand-light-gray">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-brand-dark p-3 rounded-full">
                  <Wallet className="text-brand-orange" size={24} />
                </div>
                <div>
                  <p className="text-brand-text-secondary text-sm">Total Balance</p>
                  <h3 className="text-2xl font-bold text-white">₹<AnimatedCounter value={totalBalance} /></h3>
                </div>
              </div>
              <div className="flex items-center gap-4 text-center text-sm">
                  <div>
                      <p className="text-blue-400">Deposited</p>
                      <p className="font-semibold">₹{user.depositedBalance.toFixed(2)}</p>
                  </div>
                  <div>
                      <p className="text-green-400">Winnable</p>
                      <p className="font-semibold">₹{user.winnableBalance.toFixed(2)}</p>
                  </div>
                   <div>
                      <p className="text-yellow-400">Bonus</p>
                      <p className="font-semibold">₹{user.bonusBalance.toFixed(2)}</p>
                  </div>
              </div>
              <Link to="/wallet" className="w-full md:w-auto">
                  <button className="bg-brand-orange/20 text-brand-orange hover:bg-brand-orange/40 px-4 py-2 rounded-md text-sm font-bold flex items-center gap-2 transition-colors w-full justify-center">
                      <PlusCircle size={16} /> Add Money
                  </button>
              </Link>
            </div>
            <div className="mt-4">
                <div className="w-full bg-brand-dark rounded-full h-2 flex overflow-hidden">
                    <div 
                        className="bg-green-500 h-2 transition-width duration-700 ease-out" 
                        style={{ width: `${winnablePercent}%` }}>
                    </div>
                     <div 
                        className="bg-yellow-500 h-2 transition-width duration-700 ease-out" 
                        style={{ width: `${bonusPercent}%` }}>
                    </div>
                    <div 
                        className="bg-blue-500 h-2 transition-width duration-700 ease-out" 
                        style={{ width: `${depositedPercent}%` }}>
                    </div>
                </div>
            </div>
          </div>
        )}

        {children}
      </main>
      <footer className="bg-brand-gray p-2 sticky bottom-0 z-10 md:hidden">
        <nav className="flex justify-around">
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-16 text-center ${
                  isActive ? 'text-brand-orange' : 'text-brand-text-secondary hover:text-brand-text'
                }`
              }
            >
              <item.icon size={24} />
              <span className="text-xs">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </footer>
    </div>
  );
};

export default UserLayout;