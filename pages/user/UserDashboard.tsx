import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Trophy, Users, Clock, Gamepad2, Shield, Crosshair, Megaphone, ShieldAlert, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import { Link } from 'react-router-dom';
import type { Tournament } from '../../types';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const { users, tournaments, joinTournament, adminUpdates, addCheatReport, submitNormalModeResult, tournamentResults } = useData();
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [reportState, setReportState] = useState({ reportedUserId: '', tournamentId: '', description: '', screenshot: null as File | null });

  const handleReportSubmit = () => {
      if(!user || !reportState.reportedUserId || !reportState.description) {
          alert("Please select a user to report and provide a description.");
          return;
      }
      const reportedUser = users.find(u => u.id === parseInt(reportState.reportedUserId));
      if (!reportedUser) {
          alert("Selected user not found.");
          return;
      }

      addCheatReport({
          reporterId: user.id,
          reporterUsername: user.username,
          reportedUserId: reportedUser.id,
          reportedUsername: reportedUser.username,
          tournamentId: reportState.tournamentId ? parseInt(reportState.tournamentId) : undefined,
          description: reportState.description,
          screenshotPath: reportState.screenshot ? URL.createObjectURL(reportState.screenshot) : undefined,
          status: 'Pending',
      });
      alert('Report submitted successfully.');
      setReportModalOpen(false);
  };
  
  const allTournaments = tournaments.filter(t => t.status === 'Upcoming' || t.status === 'Live');
  const otherUsers = users.filter(u => u.id !== user?.id && u.role === 'user');
  const latestUpdate = adminUpdates[0];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold text-white">Welcome, <span className="text-brand-orange">{user?.username}!</span></h1>
            <p className="text-brand-text-secondary mt-1">Ready for the battle? Check out the latest updates and tournaments.</p>
        </div>
        <Button onClick={() => setReportModalOpen(true)} variant="secondary" className="flex items-center gap-2">
            <ShieldAlert size={18} /> Report Cheater
        </Button>
      </div>

      {latestUpdate && (
         <div className="bg-brand-gray/50 border border-brand-orange/30 p-4 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Megaphone className="text-brand-orange" size={20} />
              <h3 className="font-bold text-brand-orange text-lg">{latestUpdate.title}</h3>
            </div>
            <p className="text-sm text-brand-text-secondary">{latestUpdate.content}</p>
            <p className="text-xs text-right text-gray-500 mt-2">{new Date(latestUpdate.timestamp).toLocaleString()}</p>
        </div>
      )}


      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-brand-orange">Active Tournaments</h2>
        {allTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allTournaments.map((t, index) => {
              const isJoined = t.participants.some(p => p.userId === user?.id);
              const isFull = t.participants.length >= t.maxParticipants;

              return (
              <Link to={`/tournament/${t.id}`} key={t.id}
                className="bg-brand-gray rounded-lg shadow-lg p-5 border border-brand-light-gray flex flex-col justify-between hover:border-brand-orange transition-all duration-300 animate-fade-in-up opacity-0 transform hover:-translate-y-1 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div>
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-bold text-white pr-2">{t.name}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full font-semibold whitespace-nowrap ${
                      t.status === 'Live' ? 'bg-red-500/30 text-red-400 animate-pulse' 
                      : 'bg-blue-500/30 text-blue-400'
                    }`}>{t.status}</span>
                  </div>
                  <p className="text-sm text-brand-text-secondary mt-1">{t.game}</p>
                
                  <div className="my-4 border-t border-brand-light-gray"/>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                     <div className="flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-400" />
                        <span className="text-brand-text-secondary">Mode: <span className="font-bold text-white">{t.tournamentType}</span></span>
                    </div>
                     <div className="flex items-center gap-2">
                        <span className="font-bold text-green-400 text-lg">₹</span>
                        <span className="text-brand-text-secondary">Entry: <span className="font-bold text-white">{t.entryFee}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={16} className="text-brand-orange" />
                        <span className="text-brand-text-secondary">Players: <span className="font-bold text-white">{t.participants.length}/{t.maxParticipants}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={16} className="text-brand-orange" />
                        <span className="text-brand-text-secondary">{new Date(t.startTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-between items-center text-sm font-semibold">
                   <div className="flex items-center gap-2">
                    {isJoined && <CheckCircle size={16} className="text-green-400"/>}
                    <span className={isJoined ? "text-green-400" : "text-brand-text-secondary"}>
                      {isFull ? 'Full' : (isJoined ? 'Joined' : 'Open for Registration')}
                    </span>
                   </div>
                   <span className="flex items-center gap-1 text-brand-orange group-hover:gap-2 transition-all">
                      View Details <ArrowRight size={16} />
                   </span>
                </div>
              </Link>
            )})}
          </div>
        ) : (
          <div className="bg-brand-gray rounded-lg p-8 text-center border border-brand-light-gray">
            <Trophy size={48} className="mx-auto text-brand-text-secondary mb-4" />
            <p className="text-brand-text-secondary">No tournaments right now. Check back later!</p>
          </div>
        )}
      </div>

      {/* Report Modal */}
        <Modal isOpen={isReportModalOpen} onClose={() => setReportModalOpen(false)} title="Report a Player">
            <div className="space-y-4">
                <div>
                    <label htmlFor="reportedUser" className="block text-sm font-medium text-brand-text-secondary mb-1">Player to Report</label>
                    <select id="reportedUser" value={reportState.reportedUserId} onChange={e => setReportState(p => ({...p, reportedUserId: e.target.value}))} className="w-full bg-brand-light-gray border border-gray-600 text-brand-text rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                        <option value="">Select a player...</option>
                        {otherUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="tournament" className="block text-sm font-medium text-brand-text-secondary mb-1">Associated Tournament (Optional)</label>
                    <select id="tournament" value={reportState.tournamentId} onChange={e => setReportState(p => ({...p, tournamentId: e.target.value}))} className="w-full bg-brand-light-gray border border-gray-600 text-brand-text rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                        <option value="">Select a tournament...</option>
                        {tournaments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-brand-text-secondary mb-1">Reason for Reporting</label>
                    <textarea id="description" rows={3} value={reportState.description} onChange={e => setReportState(p => ({...p, description: e.target.value}))} className="w-full bg-brand-light-gray border border-gray-600 text-brand-text rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none" placeholder="Describe the cheating incident..."></textarea>
                </div>
                <Button onClick={handleReportSubmit} className="w-full">Submit Report</Button>
            </div>
        </Modal>
    </div>
  );
};

export default UserDashboard;