import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Tabs from '../../components/common/Tabs';
import { Swords, PlusCircle, CheckCircle } from 'lucide-react';
import type { Guild, GuildWar } from '../../types';

const ManageGuildsPage: React.FC = () => {
    const { guilds, guildWars, createGuildWar, resolveGuildWar } = useData();
    const { user: adminUser } = useAuth();

    const [isWarModalOpen, setWarModalOpen] = useState(false);
    const [warToResolve, setWarToResolve] = useState<GuildWar | null>(null);

    const initialFormState = {
        guild1Id: '',
        guild2Id: '',
        startTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        prizePool: 1000,
        commissionPercent: 10,
    };
    const [formState, setFormState] = useState(initialFormState);
    
    const availableGuildsForG1 = guilds;
    const availableGuildsForG2 = guilds.filter(g => g.id !== parseInt(formState.guild1Id));

    const handleOpenWarModal = () => {
        setFormState(initialFormState);
        setWarModalOpen(true);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: name.includes('Id') ? value : Number(value) || value }));
    };

    const handleCreateWar = () => {
        if (!formState.guild1Id || !formState.guild2Id || formState.guild1Id === formState.guild2Id || !adminUser) {
            // Notification is handled by createGuildWar function if needed
            return;
        }
        createGuildWar({
            ...formState,
            guild1Id: parseInt(formState.guild1Id),
            guild2Id: parseInt(formState.guild2Id),
            startTime: new Date(formState.startTime).toISOString()
        }, adminUser.username);

        setWarModalOpen(false);
    };

    const handleResolveWar = (winnerId: number) => {
        if (warToResolve && adminUser) {
            resolveGuildWar(warToResolve.id, winnerId, adminUser.username);
        }
        setWarToResolve(null);
    };

    const GuildsListTab = (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-brand-light-gray">
                        <th className="p-3">ID</th>
                        <th className="p-3">Name</th>
                        <th className="p-3">Members</th>
                        <th className="p-3">Wins / Losses</th>
                    </tr>
                </thead>
                <tbody>
                    {guilds.map(g => (
                        <tr key={g.id} className="border-b border-brand-light-gray last:border-b-0">
                            <td className="p-3">{g.id}</td>
                            <td className="p-3 font-semibold">{g.name}</td>
                            <td className="p-3">{g.memberIds.length}</td>
                            <td className="p-3">
                                <span className="text-green-400">{g.wins}</span> / <span className="text-red-400">{g.losses}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
    
    const GuildWarsListTab = (
        <div className="overflow-x-auto">
             <table className="w-full text-left">
                <thead>
                    <tr className="bg-brand-light-gray">
                        <th className="p-3">Matchup</th>
                        <th className="p-3">Prize Pool</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Winner</th>
                        <th className="p-3 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {guildWars.map(w => {
                        const g1 = guilds.find(g => g.id === w.guild1Id);
                        const g2 = guilds.find(g => g.id === w.guild2Id);
                        const winner = guilds.find(g => g.id === w.winnerGuildId);
                        return (
                        <tr key={w.id} className="border-b border-brand-light-gray last:border-b-0">
                            <td className="p-3 font-semibold">{g1?.name || 'N/A'} vs {g2?.name || 'N/A'}</td>
                            <td className="p-3">₹{w.prizePool}</td>
                            <td className="p-3">
                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${w.status === 'Upcoming' ? 'bg-blue-500/20 text-blue-400' : w.status === 'Live' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                    {w.status}
                                </span>
                            </td>
                            <td className="p-3 font-bold text-green-400">{winner?.name || 'N/A'}</td>
                            <td className="p-3 text-center">
                                {w.status === 'Upcoming' && (
                                    <Button onClick={() => setWarToResolve(w)} className="!py-1 !px-2 text-sm flex items-center gap-1 mx-auto">
                                        <CheckCircle size={14}/> Resolve War
                                    </Button>
                                )}
                            </td>
                        </tr>
                    )})}
                </tbody>
            </table>
        </div>
    );
    
    const tabs = [
        { label: 'All Guilds', content: GuildsListTab },
        { label: 'All Guild Wars', content: GuildWarsListTab },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-brand-orange">Manage Guilds & Wars</h1>
                <Button onClick={handleOpenWarModal} className="flex items-center gap-2">
                    <PlusCircle size={18} /> Create Guild War
                </Button>
            </div>

            <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
                <Tabs tabs={tabs} />
            </div>
            
            <Modal isOpen={isWarModalOpen} onClose={() => setWarModalOpen(false)} title="Create Guild War" size="md">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Guild 1</label>
                        <select name="guild1Id" value={formState.guild1Id} onChange={handleChange} className="w-full bg-brand-light-gray border border-gray-600 text-brand-text rounded-md px-3 py-2">
                            <option value="">Select Guild...</option>
                            {availableGuildsForG1.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-brand-text-secondary mb-1">Guild 2</label>
                        <select name="guild2Id" value={formState.guild2Id} onChange={handleChange} className="w-full bg-brand-light-gray border border-gray-600 text-brand-text rounded-md px-3 py-2">
                            <option value="">Select Guild...</option>
                            {availableGuildsForG2.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                        </select>
                    </div>
                    <Input label="Start Time" name="startTime" type="datetime-local" value={formState.startTime} onChange={handleChange} />
                    <Input label="Prize Pool (₹)" name="prizePool" type="number" value={formState.prizePool} onChange={e => setFormState(p=>({...p, prizePool: Number(e.target.value)}))} />
                    <Input label="Commission (%)" name="commissionPercent" type="number" value={formState.commissionPercent} onChange={e => setFormState(p=>({...p, commissionPercent: Number(e.target.value)}))} />
                    <Button onClick={handleCreateWar} className="w-full">Schedule War</Button>
                </div>
            </Modal>
            
            {warToResolve && (
                <Modal isOpen={!!warToResolve} onClose={() => setWarToResolve(null)} title="Declare War Winner">
                    <div className="space-y-4 text-center">
                       <p>Select the winning guild for the match between <strong>{guilds.find(g => g.id === warToResolve.guild1Id)?.name}</strong> and <strong>{guilds.find(g => g.id === warToResolve.guild2Id)?.name}</strong>.</p>
                       <p className="text-yellow-400 text-sm">This action is irreversible and will distribute all prize money and bets.</p>
                       <div className="flex gap-4 pt-4">
                          <Button onClick={() => handleResolveWar(warToResolve.guild1Id)} className="w-full">
                            {guilds.find(g => g.id === warToResolve.guild1Id)?.name}
                          </Button>
                          <Button onClick={() => handleResolveWar(warToResolve.guild2Id)} className="w-full">
                            {guilds.find(g => g.id === warToResolve.guild2Id)?.name}
                          </Button>
                       </div>
                    </div>
                </Modal>
            )}

        </div>
    );
};

export default ManageGuildsPage;
