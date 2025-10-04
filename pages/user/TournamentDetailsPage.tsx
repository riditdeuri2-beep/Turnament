import React, { useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Tabs from '../../components/common/Tabs';
import Stat from '../../components/common/Stat';
import { Trophy, Users, Clock, Gamepad2, Shield, Crosshair, DollarSign, KeyRound, CheckCircle, Info, Youtube, Upload, X } from 'lucide-react';
import { analyzeScreenshot } from '../../utils/aiScreenshotAnalyzer';
import Input from '../../components/common/Input';

const TournamentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { users, tournaments, joinTournament, tournamentResults, submitNormalModeResult } = useData();
  
  const [isJoinConfirmModalOpen, setJoinConfirmModalOpen] = useState(false);
  const [emulatorDeclaration, setEmulatorDeclaration] = useState(false);
  const [isSubmitResultModalOpen, setSubmitResultModalOpen] = useState(false);
  const [resultState, setResultState] = useState({ rank: '', screenshot: null as File | null });
  const [isJoining, setIsJoining] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tournamentId = parseInt(id || '0', 10);
  const tournament = tournaments.find(t => t.id === tournamentId);

  if (!tournament || !user) {
    return <Navigate to="/dashboard" />;
  }

  const isJoined = tournament.participants.some(p => p.userId === user.id);
  const isFull = tournament.participants.length >= tournament.maxParticipants;
  const hasSubmitted = tournamentResults.some(r => r.tournamentId === tournament.id && r.userId === user.id);
  const canSeeCredentials = isJoined && tournament.status === 'Live';
  const canWatchLive = tournament.status === 'Live' && tournament.streamUrl;

  const handleOpenJoinConfirm = () => {
    const totalBalance = user.depositedBalance + user.winnableBalance + user.bonusBalance;
    if (totalBalance < tournament.entryFee) {
        joinTournament(tournament.id, user.id, false); // This will trigger the insufficient funds notification
        return;
    }
    if (!tournament.allowEmulators) {
        setEmulatorDeclaration(false);
        setJoinConfirmModalOpen(true);
    } else {
        handleRegister(true);
    }
  };

  const handleRegister = async (declaration: boolean) => {
    setIsJoining(true);
    await new Promise(res => setTimeout(res, 500)); // Simulate API call
    joinTournament(tournament.id, user.id, declaration);
    setIsJoining(false);
    setJoinConfirmModalOpen(false);
  };
  
  const handleResultSubmit = async () => {
      if (!resultState.rank || !resultState.screenshot) {
          // A notification would be better here if we had it
          return;
      }
      setIsSubmitting(true);
      const rank = parseInt(resultState.rank);
      
      const aiResult = await analyzeScreenshot(resultState.screenshot, { rank });
      
      submitNormalModeResult({
          tournamentId: tournament.id,
          tournamentName: tournament.name,
          userId: user.id,
          username: user.username,
          rank,
          screenshotPath: URL.createObjectURL(resultState.screenshot),
          aiRank: aiResult.aiRank,
          aiConfidence: aiResult.aiConfidence
      });
      setIsSubmitting(false);
      setSubmitResultModalOpen(false);
  };

  const totalPrizePool = (tournament.entryFee * tournament.participants.length) * (1 - tournament.commissionPercent / 100);

  const DetailsTab = (
    <div className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Stat icon={DollarSign} label="Entry Fee" value={`₹${tournament.entryFee}`} />
            <Stat icon={Trophy} label="Prize Pool" value={`₹${totalPrizePool.toFixed(2)}`} />
            <Stat icon={Users} label="Players" value={`${tournament.participants.length} / ${tournament.maxParticipants}`} />
            <Stat icon={Clock} label="Starts On" value={new Date(tournament.startTime).toLocaleDateString()} />
        </div>
         <div className="bg-brand-dark p-4 rounded-lg">
            <h4 className="font-bold text-brand-orange mb-3 text-lg">Rules & Settings</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2"><Gamepad2 size={16} /><span>Emulators: <span className={tournament.allowEmulators ? 'text-green-400' : 'text-red-400'}>{tournament.allowEmulators ? 'Allowed' : 'Not Allowed'}</span></span></div>
                <div className="flex items-center gap-2"><Shield size={16} /><span>Gloo Walls: <span className="text-white">{tournament.glooWallMode}</span></span></div>
                <div className="flex items-center gap-2"><Crosshair size={16} /><span>Shot Mode: <span className="text-white">{tournament.shotMode}</span></span></div>
                {tournament.tournamentType === 'Kill' && <div className="flex items-center gap-2"><DollarSign size={16} /><span>Per Kill: <span className="text-white">₹{tournament.perKillReward}</span></span></div>}
                {tournament.tournamentType === 'Clash Squad' && <div className="flex items-center gap-2"><CheckCircle size={16} /><span>Rounds to Win: <span className="text-white">{tournament.roundsToWin}</span></span></div>}
            </div>
        </div>
        {tournament.tournamentType === 'Normal' && (
            <div className="bg-brand-dark p-4 rounded-lg">
                <h4 className="font-bold text-brand-orange mb-3 text-lg">Prize Distribution</h4>
                <ul className="space-y-2">
                {tournament.prizeDistribution.map(p => (
                    <li key={p.rank} className="flex justify-between items-center text-sm p-2 bg-brand-light-gray rounded-md">
                        <span>Rank #{p.rank}</span>
                        <span className="font-bold text-white">{p.percentage}% of Prize Pool (₹{(totalPrizePool * p.percentage / 100).toFixed(2)})</span>
                    </li>
                ))}
                </ul>
            </div>
        )}
    </div>
  );

  const ParticipantsTab = (
    <div>
        <h4 className="font-bold text-white mb-3">{tournament.participants.length} Registered Players</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tournament.participants.map(p => {
            const participantUser = users.find(u => u.id === p.userId);
            return (
                <div key={p.userId} className="bg-brand-dark p-3 rounded-md text-sm">
                    <p className="font-semibold truncate">{participantUser?.username || 'Unknown Player'}</p>
                </div>
            );
        })}
        </div>
    </div>
  );
  
  const ResultsTab = (
    <div>
      <h4 className="font-bold text-white mb-3">Final Leaderboard</h4>
      {tournament.results && tournament.results.length > 0 ? (
        <div className="space-y-2">
        {tournament.results.sort((a,b) => (a.rank || 0) - (b.rank || 0)).map(r => (
           <div key={r.userId} className="flex items-center justify-between p-3 bg-brand-dark rounded-md">
              <div className="flex items-center gap-3">
                 <span className="font-bold text-brand-orange text-lg w-8 text-center">#{r.rank || r.kills}</span>
                 <span>{r.username}</span>
              </div>
              <span className="font-bold text-green-400">+ ₹{r.winnings.toFixed(2)}</span>
           </div>
        ))}
        </div>
      ) : <p className="text-brand-text-secondary">Results are not yet available.</p>}
    </div>
  );

  const tabs = [
    { label: 'Details', content: DetailsTab },
    { label: 'Participants', content: ParticipantsTab },
    { label: 'Results', content: ResultsTab },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
                <span className={`px-3 py-1 text-xs rounded-full font-semibold mb-2 inline-block ${
                  tournament.status === 'Live' ? 'bg-red-500/30 text-red-400 animate-pulse' 
                  : tournament.status === 'Upcoming' ? 'bg-blue-500/30 text-blue-400'
                  : 'bg-gray-500/30 text-gray-400'
                }`}>{tournament.status}</span>
                <h1 className="text-3xl font-bold text-white">{tournament.name}</h1>
                <p className="text-brand-text-secondary mt-1">{tournament.game} - {tournament.tournamentType} Mode</p>
            </div>
            <div className="flex-shrink-0 flex items-center gap-2">
                {canWatchLive && (
                    <a href={tournament.streamUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="danger" className="flex items-center gap-2 animate-pulse">
                            <Youtube size={18}/> Watch Live
                        </Button>
                    </a>
                )}
                {tournament.status === 'Upcoming' && <Button onClick={handleOpenJoinConfirm} disabled={isJoined || isFull || isJoining} isLoading={isJoining} className="w-full md:w-auto">{isFull ? 'Tournament Full' : (isJoined ? 'Already Joined' : 'Join Now')}</Button>}
                {tournament.status === 'Completed' && tournament.tournamentType === 'Normal' && isJoined && <Button onClick={() => setSubmitResultModalOpen(true)} disabled={hasSubmitted}>{hasSubmitted ? 'Result Submitted' : 'Submit Result'}</Button>}
            </div>
          </div>
          {canSeeCredentials && (
            <div className="mt-4 pt-4 border-t border-brand-light-gray space-y-2 text-sm bg-brand-dark/50 p-3 rounded-lg flex items-center gap-4">
              <KeyRound size={20} className="text-brand-orange"/>
              <div>
                <h4 className="font-bold text-brand-orange">Room Credentials</h4>
                <p>Room ID: <span className="font-mono text-white bg-brand-light-gray px-2 py-1 rounded">{tournament.roomId || 'N/A'}</span></p>
                <p>Password: <span className="font-mono text-white bg-brand-light-gray px-2 py-1 rounded">{tournament.roomPassword || 'N/A'}</span></p>
              </div>
            </div>
          )}
      </div>

       <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
          <Tabs tabs={tabs} />
       </div>

       <Modal isOpen={isJoinConfirmModalOpen} onClose={() => setJoinConfirmModalOpen(false)} title="Confirm Registration">
            <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-yellow-900/50 border border-yellow-400/30 rounded-lg text-sm">
                    <Info className="text-yellow-400 h-5 w-5 mt-0.5 flex-shrink-0"/>
                    <p className="text-yellow-200">This tournament does not allow emulator players. Please confirm you are playing on a mobile device to proceed.</p>
                </div>
                <div className="flex items-center gap-2 p-2 bg-brand-dark rounded-md">
                    <input type="checkbox" id="emulatorDeclaration" checked={emulatorDeclaration} onChange={e => setEmulatorDeclaration(e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-brand-light-gray text-brand-orange focus:ring-brand-orange"/>
                    <label htmlFor="emulatorDeclaration" className="text-sm text-brand-text-secondary">I confirm I am not using an emulator.</label>
                </div>
                <Button onClick={() => handleRegister(emulatorDeclaration)} className="w-full" disabled={!emulatorDeclaration} isLoading={isJoining}>
                    Confirm and Join (Fee: ₹{tournament.entryFee})
                </Button>
            </div>
        </Modal>

        <Modal isOpen={isSubmitResultModalOpen} onClose={() => setSubmitResultModalOpen(false)} title="Submit Your Result">
            <div className="space-y-4">
                <Input 
                    label="Your Final Rank"
                    type="number"
                    placeholder="e.g., 1"
                    value={resultState.rank}
                    onChange={e => setResultState(prev => ({ ...prev, rank: e.target.value }))}
                />
                 <div>
                    <label className="block text-sm font-medium text-brand-text-secondary mb-1">Upload Screenshot Proof</label>
                    {resultState.screenshot ? (
                        <div className="p-2 bg-brand-dark rounded-md flex items-center justify-between">
                            <p className="text-sm text-green-400 truncate">{resultState.screenshot.name}</p>
                            <button onClick={() => setResultState(p => ({ ...p, screenshot: null}))} className="p-1 text-red-400 hover:text-red-600"><X size={16}/></button>
                        </div>
                    ) : (
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                <Upload size={48} className="mx-auto text-gray-500" />
                                <div className="flex text-sm text-gray-400">
                                    <label htmlFor="screenshot-upload" className="relative cursor-pointer bg-brand-dark rounded-md font-medium text-brand-orange hover:text-orange-400 p-1">
                                        <span>Upload a file</span>
                                        <input id="screenshot-upload" name="screenshot-upload" type="file" className="sr-only" onChange={e => e.target.files && setResultState(p => ({ ...p, screenshot: e.target.files![0] }))} accept="image/*" />
                                    </label>
                                </div>
                                <p className="text-xs text-gray-500">PNG or JPG</p>
                            </div>
                        </div>
                    )}
                </div>
                <Button onClick={handleResultSubmit} className="w-full" disabled={!resultState.rank || !resultState.screenshot} isLoading={isSubmitting}>Submit for Verification</Button>
            </div>
        </Modal>
    </div>
  );
};

export default TournamentDetailsPage;
