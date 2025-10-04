import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Tournament, User, Winner } from '../../types';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { PlusCircle, Edit, AlertTriangle, Upload, Eye, Trash2, X, Plus, Percent } from 'lucide-react';
import { analyzeScreenshot } from '../../utils/aiScreenshotAnalyzer';
import ConfirmationModal from '../../components/common/ConfirmationModal';

type PrizeDist = { rank: number; percentage: number };

const ManageTournamentsPage: React.FC = () => {
  const { users, tournaments, addTournament, updateTournament, deleteTournament, setKillAndEarnResults } = useData();
  const { user: adminUser } = useAuth();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  const [resultsTournament, setResultsTournament] = useState<Tournament | null>(null);
  const [tournamentToDelete, setTournamentToDelete] = useState<Tournament | null>(null);
  const [filterStatus, setFilterStatus] = useState<'active' | 'completed' | 'all'>('active');
  
  const [killResults, setKillResults] = useState<Record<number, { kills: string; screenshot?: File; screenshotPath?: string }>>({});


  const initialFormState: Omit<Tournament, 'id' | 'participants' | 'results'> = {
    name: '',
    entryFee: 0,
    startTime: '',
    status: 'Upcoming',
    maxParticipants: 50,
    game: 'Free Fire',
    commissionPercent: 10,
    tournamentType: 'Normal',
    prizeDistribution: [{ rank: 1, percentage: 100 }],
    perKillReward: 0,
    roundsToWin: 4,
    allowEmulators: true,
    glooWallMode: 'Unlimited',
    shotMode: 'Normal',
    maxKillsThreshold: 30,
    roomId: '',
    roomPassword: '',
    streamUrl: '',
  };

  const [formState, setFormState] = useState(initialFormState);
  
  const totalPrizePercentage = formState.prizeDistribution.reduce((sum, p) => sum + (Number(p.percentage) || 0), 0);

  const handleOpenFormModal = (tournament: Tournament | null = null) => {
    if (tournament) {
      setEditingTournament(tournament);
      const tournamentData = {
        ...tournament,
        prizeDistribution: tournament.prizeDistribution.length > 0 ? tournament.prizeDistribution : [{ rank: 1, percentage: 100 }],
        roundsToWin: tournament.roundsToWin ?? 4,
        startTime: new Date(tournament.startTime).toISOString().slice(0, 16),
      };
      setFormState(tournamentData);
    } else {
      setEditingTournament(null);
      setFormState({ ...initialFormState, startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16) });
    }
    setIsFormModalOpen(true);
  };

  const handleOpenResultsModal = (tournament: Tournament) => {
    setResultsTournament(tournament);
    if (tournament.tournamentType === 'Kill') {
        const initialKills: Record<number, { kills: string; screenshot?: File; screenshotPath?: string }> = {};
        tournament.participants.forEach(p => {
            initialKills[p.userId] = { kills: '0', screenshot: undefined, screenshotPath: undefined };
        });
        setKillResults(initialKills);
    }
    setIsResultsModalOpen(true);
  };

  const handleCloseModals = () => {
    setIsFormModalOpen(false);
    setIsResultsModalOpen(false);
    setEditingTournament(null);
    setResultsTournament(null);
    setFormState(initialFormState);
    setKillResults({});
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormState(prev => ({...prev, [name]: checked }));
    } else {
        const isNumeric = ['entryFee', 'maxParticipants', 'commissionPercent', 'perKillReward', 'maxKillsThreshold', 'roundsToWin'].includes(name);
        setFormState(prev => ({ ...prev, [name]: isNumeric ? Number(value) : value }));
    }
  };
  
  const handlePrizeChange = (index: number, field: 'rank' | 'percentage', value: string) => {
    const updatedPrizes = [...formState.prizeDistribution];
    updatedPrizes[index] = { ...updatedPrizes[index], [field]: Number(value) };
    setFormState(prev => ({...prev, prizeDistribution: updatedPrizes}));
  };
  
  const addPrizeRank = () => {
      setFormState(prev => ({...prev, prizeDistribution: [...prev.prizeDistribution, { rank: prev.prizeDistribution.length + 1, percentage: 0 }]}));
  };
  
  const removePrizeRank = (index: number) => {
      setFormState(prev => ({...prev, prizeDistribution: prev.prizeDistribution.filter((_, i) => i !== index)}));
  };
  
  const handleKillResultChange = (userId: number, field: 'kills' | 'screenshot', value: string | File) => {
      setKillResults(prev => ({
          ...prev,
          [userId]: {
              ...prev[userId],
              [field]: value,
              ...(field === 'screenshot' && value instanceof File ? { screenshotPath: URL.createObjectURL(value) } : {})
          }
      }));
  };

  const handleFormSubmit = () => {
    if (formState.tournamentType === 'Normal' && totalPrizePercentage !== 100) {
        // A notification would be better here if we could use it
        return;
    }
    const tournamentData = { ...formState, startTime: new Date(formState.startTime).toISOString() };
    if (editingTournament) {
      updateTournament({ ...editingTournament, ...tournamentData });
    } else {
      addTournament(tournamentData);
    }
    handleCloseModals();
  };
  
 const handleResultsSubmit = async () => {
    if (!resultsTournament || resultsTournament.tournamentType !== 'Kill') return;

    const resultsToSubmit: Omit<Winner, 'winnings' | 'username' | 'status'>[] = [];

    for (const [userIdStr, data] of Object.entries(killResults)) {
        const userId = parseInt(userIdStr);
        const resultData = data as { kills: string; screenshot?: File; screenshotPath?: string };
        const kills = parseInt(resultData.kills) || 0;

        if (kills > 0) {
            if (!resultData.screenshot) {
                // A notification would be better here if we could use it
                return;
            }
            const aiResult = await analyzeScreenshot(resultData.screenshot, { kills });
            resultsToSubmit.push({
                userId,
                kills,
                screenshotPath: resultData.screenshotPath,
                aiKillCount: aiResult.aiKills,
                aiConfidence: aiResult.aiConfidence
            });
        }
    }

    setKillAndEarnResults(resultsTournament.id, resultsToSubmit);
    handleCloseModals();
  };

  const handleDeleteClick = (tournament: Tournament) => {
    setTournamentToDelete(tournament);
  };

  const handleConfirmDelete = () => {
      if (tournamentToDelete && adminUser) {
          deleteTournament(tournamentToDelete.id, adminUser.username);
          setTournamentToDelete(null);
      }
  };

  const tournamentParticipants = resultsTournament ? users.filter(u => resultsTournament.participants.some(p => p.userId === u.id)) : [];
  
  const filteredTournaments = tournaments.filter(t => {
    if (filterStatus === 'active') {
      return t.status === 'Live' || t.status === 'Upcoming';
    }
    if (filterStatus === 'completed') {
      return t.status === 'Completed';
    }
    return true; // 'all'
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-orange">Manage Tournaments</h1>
        <Button onClick={() => handleOpenFormModal()} className="flex items-center gap-2">
          <PlusCircle size={20} /> Create Tournament
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-lg bg-brand-gray p-1 border border-brand-light-gray w-fit">
        <Button onClick={() => setFilterStatus('active')} variant={filterStatus === 'active' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-sm !shadow-none !hover:-translate-y-0">Live & Upcoming</Button>
        <Button onClick={() => setFilterStatus('completed')} variant={filterStatus === 'completed' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-sm !shadow-none !hover:-translate-y-0">Completed</Button>
        <Button onClick={() => setFilterStatus('all')} variant={filterStatus === 'all' ? 'primary' : 'secondary'} className="!py-1.5 !px-3 text-sm !shadow-none !hover:-translate-y-0">All</Button>
      </div>

      <div className="bg-brand-gray rounded-lg shadow-lg overflow-hidden border border-brand-light-gray">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-brand-light-gray">
              <tr>
                <th className="p-4">Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Entry Fee</th>
                <th className="p-4">Status</th>
                <th className="p-4">Players</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTournaments.map(t => (
                <tr key={t.id} className="border-b border-brand-light-gray last:border-b-0">
                  <td className="p-4 font-semibold">{t.name}</td>
                  <td className="p-4">{t.tournamentType}</td>
                  <td className="p-4">₹{t.entryFee}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      t.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' :
                      t.status === 'Live' ? 'bg-red-500/20 text-red-400' :
                      t.status === 'Completed' ? 'bg-gray-500/20 text-gray-400' : ''
                    }`}>{t.status}</span>
                  </td>
                  <td className="p-4">{t.participants.length}/{t.maxParticipants}</td>
                  <td className="p-4 text-center flex justify-center gap-2">
                    <Button onClick={() => handleOpenFormModal(t)} variant="secondary" className="!py-1 !px-2 text-sm flex items-center gap-1"><Edit size={14}/> Edit</Button>
                    {t.status !== 'Completed' && t.tournamentType === 'Kill' && <Button onClick={() => handleOpenResultsModal(t)} variant="primary" className="!py-1 !px-2 text-sm">Set Kills</Button>}
                    <Button onClick={() => handleDeleteClick(t)} variant="danger" className="!py-1 !px-2 text-sm flex items-center gap-1"><Trash2 size={14}/> Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Form Modal */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseModals} title={editingTournament ? 'Edit Tournament' : 'Create Tournament'} size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            <Input label="Tournament Name" name="name" value={formState.name} onChange={handleChange} />
            <Input label="Live Stream URL (Optional)" name="streamUrl" value={formState.streamUrl || ''} onChange={handleChange} placeholder="https://youtube.com/live/..."/>
            <div className="grid grid-cols-2 gap-4">
                <Input label="Entry Fee (₹)" name="entryFee" type="number" value={formState.entryFee} onChange={handleChange} />
                <Input label="Max Participants" name="maxParticipants" type="number" value={formState.maxParticipants} onChange={handleChange} />
            </div>
            <div>
              <label htmlFor="tournamentType" className="block text-sm font-medium text-brand-text-secondary mb-1">Tournament Type</label>
              <select id="tournamentType" name="tournamentType" value={formState.tournamentType} onChange={handleChange} className="w-full bg-brand-light-gray border border-gray-600 text-brand-text rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-orange focus:outline-none">
                  <option value="Normal">Normal (Rank-based)</option>
                  <option value="Kill">Kill (Kill-based)</option>
                  <option value="Clash Squad">Clash Squad (Round-based)</option>
              </select>
            </div>

            {formState.tournamentType === 'Normal' && (
                <div className="p-3 bg-brand-dark rounded-md space-y-3">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-semibold text-white">Prize Distribution</h4>
                            <p className={`text-xs ${totalPrizePercentage !== 100 ? 'text-red-400' : 'text-green-400'}`}>Total: {totalPrizePercentage}%</p>
                        </div>
                        <Button onClick={addPrizeRank} variant="secondary" className="!p-2"><Plus size={16} /></Button>
                    </div>
                    {formState.prizeDistribution.map((p, i) => (
                        <div key={i} className="flex items-center gap-2">
                           <Input type="number" placeholder="Rank" value={p.rank || ''} onChange={e => handlePrizeChange(i, 'rank', e.target.value)} className="w-1/2" />
                           <div className="relative w-1/2">
                               <Input type="number" placeholder="%" value={p.percentage || ''} onChange={e => handlePrizeChange(i, 'percentage', e.target.value)} className="pr-8"/>
                               <Percent size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                           </div>
                           <Button onClick={() => removePrizeRank(i)} variant="danger" className="!p-2"><X size={16} /></Button>
                        </div>
                    ))}
                </div>
            )}
            {formState.tournamentType === 'Kill' && (
                 <Input label="Reward Per Kill (₹)" name="perKillReward" type="number" value={formState.perKillReward} onChange={handleChange} />
            )}
             {formState.tournamentType === 'Clash Squad' && (
                <Input label="Rounds to Win (e.g., 4 for Bo7)" name="roundsToWin" type="number" value={formState.roundsToWin} onChange={handleChange} />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Input label="Room ID (Optional)" name="roomId" value={formState.roomId} onChange={handleChange} />
              <Input label="Room Password (Optional)" name="roomPassword" value={formState.roomPassword} onChange={handleChange} />
            </div>
            <Input label="Commission (%)" name="commissionPercent" type="number" value={formState.commissionPercent} onChange={handleChange} />
             <div className="flex items-center gap-2 pt-2">
                <input type="checkbox" id="allowEmulators" name="allowEmulators" checked={formState.allowEmulators} onChange={handleChange} className="h-4 w-4 rounded border-gray-600 bg-brand-light-gray text-brand-orange focus:ring-brand-orange"/>
                <label htmlFor="allowEmulators" className="text-sm text-brand-text-secondary">Allow Emulator Players</label>
             </div>
            <Input label="Start Time" name="startTime" type="datetime-local" value={formState.startTime} onChange={handleChange} />
            <Button onClick={handleFormSubmit} className="w-full mt-2">{editingTournament ? 'Save Changes' : 'Create Tournament'}</Button>
        </div>
      </Modal>

      <Modal isOpen={isResultsModalOpen} onClose={handleCloseModals} title={`Set Kills for ${resultsTournament?.name}`}>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
             {resultsTournament?.tournamentType === 'Kill' && (
                <div className="space-y-3">
                    <p className="text-brand-text-secondary text-sm">Enter the number of kills for each participant and upload proof.</p>
                    {tournamentParticipants.map(user => (
                        <div key={user.id} className="p-3 bg-brand-dark rounded-md flex items-center gap-3">
                            <span className="flex-1 font-semibold">{user.username}</span>
                            <div className="relative">
                                <Input type="number" placeholder="Kills" className="!w-24" value={killResults[user.id]?.kills || '0'} onChange={e => handleKillResultChange(user.id, 'kills', e.target.value)} />
                                {resultsTournament && parseInt(killResults[user.id]?.kills || '0') > resultsTournament.maxKillsThreshold && resultsTournament.maxKillsThreshold > 0 && (
                                    <AlertTriangle size={14} className="text-red-400 absolute right-3 top-1/2 -translate-y-1/2" title={`Exceeds max kills threshold of ${resultsTournament.maxKillsThreshold}`} />
                                )}
                            </div>
                            <div className="relative w-48">
                                <label htmlFor={`screenshot-${user.id}`} className="w-full bg-brand-light-gray hover:bg-gray-600 text-brand-text-secondary rounded-md px-3 py-2 text-sm flex items-center justify-center gap-2 cursor-pointer">
                                    <Upload size={14}/> <span>{killResults[user.id]?.screenshot ? 'Uploaded' : 'Upload Proof'}</span>
                                </label>
                                <input type="file" id={`screenshot-${user.id}`} className="hidden" onChange={e => e.target.files && handleKillResultChange(user.id, 'screenshot', e.target.files[0])} accept="image/*" />
                                {killResults[user.id]?.screenshotPath && <a href={killResults[user.id]?.screenshotPath} target="_blank" rel="noopener noreferrer"><Eye size={16} className="absolute -right-6 top-1/2 -translate-y-1/2 text-blue-400 hover:text-blue-300"/></a>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <Button onClick={handleResultsSubmit} className="w-full mt-2">Submit and Finalize Results</Button>
          </div>
      </Modal>

      <ConfirmationModal
        isOpen={!!tournamentToDelete}
        onClose={() => setTournamentToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Tournament"
        message={<p>Are you sure you want to delete <strong>{tournamentToDelete?.name}</strong>? This action is irreversible and will remove all associated data.</p>}
        confirmButtonText="Yes, Delete"
        confirmButtonVariant="danger"
      />
    </div>
  );
};

export default ManageTournamentsPage;
