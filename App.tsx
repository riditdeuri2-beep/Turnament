import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/common/NotificationContainer';
import LoginPage from './pages/LoginPage';
import UserLayout from './components/layouts/UserLayout';
import AdminLayout from './components/layouts/AdminLayout';
import UserDashboard from './pages/user/UserDashboard';
import WalletPage from './pages/user/WalletPage';
import ProfilePage from './pages/user/ProfilePage';
import ChatPage from './pages/user/ChatPage';
import UpdatesPage from './pages/user/UpdatesPage';
import TournamentDetailsPage from './pages/user/TournamentDetailsPage';
import GuildsPage from './pages/user/GuildsPage';
import GuildDetailsPage from './pages/user/GuildDetailsPage';
import GuildWarsPage from './pages/user/GuildWarsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import DepositRequestsPage from './pages/admin/DepositRequestsPage';
import WithdrawalRequestsPage from './pages/admin/WithdrawalRequestsPage';
import ManageTournamentsPage from './pages/admin/ManageTournamentsPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';
import ManageUpdatesPage from './pages/admin/ManageUpdatesPage';
import AntiCheatPage from './pages/admin/AntiCheatPage';
import VerifyUsersPage from './pages/admin/VerifyUsersPage';
import VerifyResultsPage from './pages/admin/VerifyResultsPage';
import AuditLogPage from './pages/admin/AuditLogPage';
import ManageGuildsPage from './pages/admin/ManageGuildsPage';


interface ProtectedRouteProps {
  children: React.ReactNode;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, adminOnly = false }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (adminOnly) {
    // This route requires Super Admin
    if (user.role === 'superadmin') {
      return <>{children}</>;
    }
    // A regular user is trying to access an admin route
    return <Navigate to="/dashboard" replace />;
  } else {
    // This is a regular user route
    if (user.role === 'user') {
      return <>{children}</>;
    }
    // An admin is trying to access a user route (likely during impersonation start)
    // Or a non-impersonating admin is trying to access a user route manually
    return <Navigate to="/admin" replace />;
  }
};


const AppRoutes: React.FC = () => {
    const { user } = useAuth();
    
    return (
        <Routes>
            <Route path="/" element={user ? <Navigate to={user.role === 'superadmin' ? '/admin' : '/dashboard'} /> : <LoginPage />} />
            
            {/* User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><UserLayout><UserDashboard /></UserLayout></ProtectedRoute>} />
            <Route path="/tournament/:id" element={<ProtectedRoute><UserLayout><TournamentDetailsPage /></UserLayout></ProtectedRoute>} />
            <Route path="/updates" element={<ProtectedRoute><UserLayout><UpdatesPage /></UserLayout></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><UserLayout><WalletPage /></UserLayout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><UserLayout><ProfilePage /></UserLayout></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><UserLayout><ChatPage /></UserLayout></ProtectedRoute>} />
            <Route path="/guilds" element={<ProtectedRoute><UserLayout><GuildsPage /></UserLayout></ProtectedRoute>} />
            <Route path="/guilds/:id" element={<ProtectedRoute><UserLayout><GuildDetailsPage /></UserLayout></ProtectedRoute>} />
            <Route path="/guild-wars" element={<ProtectedRoute><UserLayout><GuildWarsPage /></UserLayout></ProtectedRoute>} />

            {/* Admin (Super Admin Only) Routes */}
            <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute adminOnly={true}><AdminLayout><ManageUsersPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/deposits" element={<ProtectedRoute adminOnly={true}><AdminLayout><DepositRequestsPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/withdrawals" element={<ProtectedRoute adminOnly={true}><AdminLayout><WithdrawalRequestsPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/tournaments" element={<ProtectedRoute adminOnly={true}><AdminLayout><ManageTournamentsPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/guilds" element={<ProtectedRoute adminOnly={true}><AdminLayout><ManageGuildsPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/updates" element={<ProtectedRoute adminOnly={true}><AdminLayout><ManageUpdatesPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/anti-cheat" element={<ProtectedRoute adminOnly={true}><AdminLayout><AntiCheatPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/verify-users" element={<ProtectedRoute adminOnly={true}><AdminLayout><VerifyUsersPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/verify-results" element={<ProtectedRoute adminOnly={true}><AdminLayout><VerifyResultsPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute adminOnly={true}><AdminLayout><AdminSettingsPage /></AdminLayout></ProtectedRoute>} />
            <Route path="/admin/audit-log" element={<ProtectedRoute adminOnly={true}><AdminLayout><AuditLogPage /></AdminLayout></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <DataProvider>
          <NotificationContainer />
          <HashRouter>
            <AppRoutes />
          </HashRouter>
        </DataProvider>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;