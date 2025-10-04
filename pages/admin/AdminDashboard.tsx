import React from 'react';
import { useData } from '../../contexts/DataContext';
import { Users, Trophy, DollarSign, ShieldAlert, PlusCircle, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import DashboardSection from '../../components/admin/DashboardSection';
import ActionButton from '../../components/admin/ActionButton';

const AdminDashboard: React.FC = () => {
    const { users, tournaments, deposits, withdrawals, tournamentResults } = useData();
    
    // Aggregate data
    const totalUsers = users.filter(u => u.role === 'user').length;
    const pendingDeposits = deposits.filter(d => d.status === 'Pending').length;
    const pendingWithdrawals = withdrawals.filter(w => w.status === 'Pending').length;
    const pendingResultsVerification = tournamentResults.filter(r => r.status === 'Pending').length + tournaments.flatMap(t => t.results || []).filter(r => r.status === 'PendingVerification').length;
    
    const totalDeposited = deposits.filter(d => d.status === 'Completed').reduce((acc, d) => acc + d.amount, 0);
    const totalWithdrawn = withdrawals.filter(w => w.status === 'Completed').reduce((acc, w) => acc + w.amount, 0);

    const platformRevenue = tournaments
        .filter(t => t.status === 'Completed')
        .reduce((total, t) => {
            const tournamentTotal = t.entryFee * t.participants.length;
            return total + (tournamentTotal * (t.commissionPercent / 100));
        }, 0);

    // Recent Activities
    const recentDeposits = deposits.slice(0, 3).map(d => ({
        id: `d-${d.id}`,
        text: `${d.username} requested a deposit of ₹${d.amount.toFixed(2)}`,
        timestamp: new Date(d.timestamp),
    }));
    const recentWithdrawals = withdrawals.slice(0, 3).map(w => ({
        id: `w-${w.id}`,
        text: `${w.username} requested a withdrawal of ₹${w.amount.toFixed(2)}`,
        timestamp: new Date(w.timestamp),
    }));
    
    const recentUsers = users.filter(u => u.role === 'user').sort((a,b) => b.id - a.id).slice(0, 3).map(u => ({
        id: `u-${u.id}`,
        text: `${u.username} just registered.`,
        timestamp: new Date(u.id), 
    }));
    
    const recentActivity = [...recentDeposits, ...recentWithdrawals, ...recentUsers]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

    const liveTournaments = tournaments.filter(t => t.status === 'Live');
        
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-brand-orange">Admin Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Users" value={totalUsers} icon={Users} className="animate-fade-in-up opacity-0" />
        <StatCard title="Platform Revenue" value={`₹${platformRevenue.toFixed(2)}`} icon={DollarSign} className="animate-fade-in-up opacity-0" style={{ animationDelay: '100ms' }} />
        <StatCard title="Active Tournaments" value={liveTournaments.length} icon={Trophy} className="animate-fade-in-up opacity-0" style={{ animationDelay: '200ms' }}/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
            <DashboardSection title="Pending Actions" className="animate-fade-in-up opacity-0" style={{ animationDelay: '300ms' }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <Link to="/admin/deposits" className="bg-brand-dark p-4 rounded-lg hover:bg-brand-light-gray transition-colors border border-brand-light-gray">
                        <h4 className="text-4xl font-bold text-yellow-400">{pendingDeposits}</h4>
                        <p className="text-sm text-brand-text-secondary mt-1">Deposit Requests</p>
                    </Link>
                    <Link to="/admin/withdrawals" className="bg-brand-dark p-4 rounded-lg hover:bg-brand-light-gray transition-colors border border-brand-light-gray">
                        <h4 className="text-4xl font-bold text-yellow-400">{pendingWithdrawals}</h4>
                        <p className="text-sm text-brand-text-secondary mt-1">Withdrawal Requests</p>
                    </Link>
                    <Link to="/admin/verify-results" className="bg-brand-dark p-4 rounded-lg hover:bg-brand-light-gray transition-colors border border-brand-light-gray">
                        <h4 className="text-4xl font-bold text-yellow-400">{pendingResultsVerification}</h4>
                        <p className="text-sm text-brand-text-secondary mt-1">Results to Verify</p>
                    </Link>
                </div>
            </DashboardSection>
            
            <DashboardSection title="Live Tournament Rooms" className="animate-fade-in-up opacity-0" style={{ animationDelay: '400ms' }}>
                <div className="space-y-3">
                    {liveTournaments.length > 0 ? liveTournaments.map(t => (
                        <div key={t.id} className="flex items-center gap-3 p-3 bg-brand-dark rounded-md text-sm">
                            <KeyRound size={20} className="text-brand-orange flex-shrink-0" />
                            <p className="flex-grow font-semibold">{t.name}</p>
                            <div className="flex items-center gap-3 text-xs">
                                <span>ID: <span className="font-mono text-white bg-brand-light-gray px-1.5 py-0.5 rounded">{t.roomId || 'N/A'}</span></span>
                                <span>Pass: <span className="font-mono text-white bg-brand-light-gray px-1.5 py-0.5 rounded">{t.roomPassword || 'N/A'}</span></span>
                            </div>
                        </div>
                    )) : <p className="text-brand-text-secondary text-sm">No tournaments are currently live.</p>}
                </div>
            </DashboardSection>

            <DashboardSection title="Recent Activity" className="animate-fade-in-up opacity-0" style={{ animationDelay: '500ms' }}>
                <div className="space-y-3">
                    {recentActivity.length > 0 ? recentActivity.map(activity => (
                        <div key={activity.id} className="flex items-center gap-3 p-3 bg-brand-dark rounded-md text-sm">
                            <div className="w-1 h-full bg-brand-orange rounded-full self-stretch"></div>
                            <p><span className="text-brand-text-secondary">{activity.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}:</span> {activity.text}</p>
                        </div>
                    )) : <p className="text-brand-text-secondary text-sm">No recent activity.</p>}
                </div>
            </DashboardSection>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
            <DashboardSection title="Quick Links" className="animate-fade-in-up opacity-0" style={{ animationDelay: '600ms' }}>
                <div className="space-y-3">
                    <ActionButton to="/admin/tournaments" title="Manage Tournaments" icon={Trophy} />
                    <ActionButton to="/admin/users" title="Manage Users" icon={Users} />
                    <ActionButton to="/admin/anti-cheat" title="Anti-Cheat Center" icon={ShieldAlert} />
                    <ActionButton to="/admin/updates" title="Post an Update" icon={PlusCircle} />
                </div>
            </DashboardSection>

            <DashboardSection title="Financial Overview" className="animate-fade-in-up opacity-0" style={{ animationDelay: '700ms' }}>
                <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-green-400">Total Deposited</span>
                        <span className="font-bold text-white">₹{totalDeposited.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-red-400">Total Withdrawn</span>
                        <span className="font-bold text-white">₹{totalWithdrawn.toFixed(2)}</span>
                    </div>
                    <div className="w-full bg-brand-dark rounded-full h-2.5 mt-2">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${totalDeposited + totalWithdrawn > 0 ? (totalDeposited / (totalDeposited + totalWithdrawn)) * 100 : 0}%` }}></div>
                    </div>
                </div>
            </DashboardSection>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
