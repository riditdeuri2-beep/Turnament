import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useNotification } from '../contexts/NotificationContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { User, LogIn, Mail, Lock, Eye, EyeOff, Crown, Gamepad2 } from 'lucide-react';

const IDENTIFIER_STORAGE_KEY = 'ff-tournament-identifier';

const LoginPage: React.FC = () => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [isAdminView, setIsAdminView] = useState(false);

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [inGameName, setInGameName] = useState('');
  const [inGameLevel, setInGameLevel] = useState('');
  const [error, setError] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { login } = useAuth();
  const { users, addUser } = useData();
  const { addNotification } = useNotification();
  
  useEffect(() => {
    const rememberedIdentifier = localStorage.getItem(IDENTIFIER_STORAGE_KEY);
    if (rememberedIdentifier) {
        setIdentifier(rememberedIdentifier);
        setRememberMe(true);
    }
  }, []);

  const resetFormState = () => {
    // Keep identifier and rememberMe state, but clear other fields
    setPassword('');
    setUsername('');
    setEmail('');
    setInGameName('');
    setInGameLevel('');
    setError('');
    setShowPassword(false);
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const roleToFind = isAdminView ? 'superadmin' : 'user';

    const foundUser = users.find(u =>
        (u.email.toLowerCase() === identifier.toLowerCase() || u.username.toLowerCase() === identifier.toLowerCase()) &&
        u.password === password &&
        u.role === roleToFind
    );

    if (foundUser) {
      if (foundUser.isBanned) {
          setError(`Your account has been banned. Reason: ${foundUser.banReason}`);
          return;
      }
      login(foundUser, rememberMe, identifier);
      addNotification(`Welcome back, ${foundUser.username}!`, 'success');
    } else {
      setError('Invalid credentials for the selected role.');
    }
  };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const level = parseInt(inGameLevel, 10);
    if (!username || !email || !password || !inGameName || !inGameLevel) {
        setError('Please fill in all fields.');
        return;
    }

    const result = addUser({ username, email, password, inGameName, inGameLevel: isNaN(level) ? 0 : level, upiId: '', profilePicPath: '', qrCodePath: '', freefireUid: '' });
    if (result.success && result.user) {
        login(result.user);
    } else {
       // Error notification is handled by the addUser function itself
    }
  };

  const toggleUserView = () => {
    setIsLoginView(!isLoginView);
    resetFormState();
  };
  
  const toggleAdminView = () => {
      setIsAdminView(!isAdminView);
      resetFormState();
  };

  const PasswordInput = (
     <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <Input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10 pr-10 !py-3 text-lg"/>
        <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            aria-label={showPassword ? "Hide password" : "Show password"}
        >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
     </div>
  );

  const RememberMeCheckbox = ({id}: {id: string}) => (
    <div className="flex items-center">
        <input 
            id={id} 
            type="checkbox" 
            checked={rememberMe}
            onChange={e => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-600 bg-brand-light-gray text-brand-orange focus:ring-brand-orange cursor-pointer"
        />
        <label htmlFor={id} className="ml-2 text-sm text-brand-text-secondary cursor-pointer">Remember me</label>
    </div>
  );
  
  const UserForm = (
    <>
        <h1 className="text-3xl font-bold text-center text-brand-orange mb-2 tracking-wider">
            {isLoginView ? 'Welcome Back!' : 'Create Account'}
        </h1>
        <p className="text-center text-brand-text-secondary mb-8">
            {isLoginView ? 'Login to continue your journey.' : 'Join the battle today!'}
        </p>
        <form onSubmit={isLoginView ? handleLogin : handleSignup} className="space-y-6">
            {isLoginView ? (
                <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <Input type="text" placeholder="Username or Email" value={identifier} onChange={e => setIdentifier(e.target.value)} required className="pl-10 !py-3 text-lg"/>
                </div>
            ) : (
                <>
                    <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required className="pl-10 !py-3 text-lg"/>
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 !py-3 text-lg"/>
                    </div>
                    <div className="relative">
                        <Gamepad2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input type="text" placeholder="In-Game Name (IGN)" value={inGameName} onChange={e => setInGameName(e.target.value)} required className="pl-10 !py-3 text-lg"/>
                    </div>
                     <div className="relative">
                        <Crown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <Input type="number" placeholder="In-Game Level" value={inGameLevel} onChange={e => setInGameLevel(e.target.value)} required className="pl-10 !py-3 text-lg"/>
                    </div>
                </>
            )}
            {PasswordInput}
            {isLoginView && <RememberMeCheckbox id="remember-me-user"/>}
            {error && <p className="text-sm text-brand-red text-center">{error}</p>}
            <Button type="submit" className="w-full gap-2 !py-3 hover:shadow-[0_0_15px_rgba(255,102,0,0.5)]">
                <LogIn size={18} />
                {isLoginView ? 'Login Securely' : 'Create My Account'}
            </Button>
        </form>
        <div className="text-center text-sm text-brand-text-secondary mt-6 h-5">
            {isLoginView ? "Don't have an account?" : "Already have an account?"}
            <button onClick={toggleUserView} className="font-semibold text-brand-orange hover:underline ml-1">
                {isLoginView ? 'Sign Up' : 'Login'}
            </button>
        </div>
    </>
  );

  const AdminForm = (
    <>
        <h1 className="text-3xl font-bold text-center text-brand-orange mb-2 tracking-wider">
            Admin Portal
        </h1>
        <p className="text-center text-brand-text-secondary mb-8">
            Super Admin Access Only
        </p>
        
        <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <Input type="text" placeholder="Username or Email" value={identifier} onChange={e => setIdentifier(e.target.value)} required className="pl-10 !py-3 text-lg"/>
            </div>
            {PasswordInput}
            <RememberMeCheckbox id="remember-me-admin"/>
            {error && <p className="text-sm text-brand-red text-center">{error}</p>}
            <Button type="submit" className="w-full gap-2 !py-3 hover:shadow-[0_0_15px_rgba(255,102,0,0.5)]">
                <LogIn size={18} />
                Login
            </Button>
        </form>
        <div className="text-center text-sm text-brand-text-secondary mt-6 h-5">
            <button onClick={toggleAdminView} className="font-semibold text-brand-orange hover:underline ml-1 inline-flex items-center gap-1.5">
                <User size={14}/> Back to User Portal
            </button>
        </div>
    </>
  );


  return (
    <div className="min-h-screen bg-brand-dark flex items-center justify-center p-4 bg-grid">
      <div className="w-full max-w-sm lg:max-w-4xl bg-brand-gray rounded-xl shadow-2xl overflow-hidden animate-fade-in-up lg:grid lg:grid-cols-2">
        
        {/* Branding Column */}
        <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-brand-dark/50 text-center relative overflow-hidden border-r border-brand-light-gray">
             <div className="absolute inset-0 bg-pattern-animated opacity-20"></div>
             <Gamepad2 className="text-brand-orange h-16 w-16 mb-4" />
             <h2 className="text-3xl font-bold text-white tracking-wider">FF TOURNAMENT HUB</h2>
             <p className="text-brand-text-secondary mt-2">Dominate the Arena. Claim Your Victory.</p>
        </div>

        {/* Form Column */}
        <div className="p-8 md:p-12">
            {isAdminView ? AdminForm : UserForm}

            <div className="mt-8 border-t border-brand-light-gray pt-4 text-center">
                <button onClick={toggleAdminView} className="font-semibold text-brand-text-secondary hover:text-brand-orange ml-1 inline-flex items-center gap-1.5 text-sm transition-colors">
                    <Crown size={16}/> {isAdminView ? "User Portal" : "Admin Portal"}
                </button>
            </div>
        </div>

      </div>
       <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes subtle-glow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out forwards;
        }
        .bg-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 2rem 2rem;
        }
        .bg-pattern-animated {
             background-image: radial-gradient(circle at top left, rgba(255, 102, 0, 0.25), transparent 30%), radial-gradient(circle at bottom right, rgba(255, 102, 0, 0.25), transparent 30%);
             background-size: 250% 250%;
             animation: subtle-glow 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;
