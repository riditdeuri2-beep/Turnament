import React, { useState, useMemo } from 'react';
import { useData, isVipActive, VIP_PLANS } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import { Users, PlusCircle, Shield, Trophy, Check, ArrowRight, Crown, Calendar, Star } from 'lucide-react';

const GuildsPage: React.FC = () => {
    const { user } = useAuth();
    const { guilds, users, createGuild, joinGuild, buyVip } = useData();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [isVipModalOpen, setVipModalOpen] = useState(false);
    const [guildName, setGuildName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [isJoining, setIsJoining] = useState<number | null>(null);

    const userIsVip = isVipActive(user?.vipExpiry);

    const leaderboard = useMemo(() => {
        return [...guilds].sort((a, b) => b.wins - a.wins);
    }, [guilds]);

    const handleOpenCreateModal = () => {
        if (userIsVip) {
            setCreateModalOpen(true);
        } else {
            setVipModalOpen(true);
        }
    };

    const handleCreateGuild = async () => {
        if (!user || !guildName.trim()) return;
        setIsCreating(true);
        await new Promise(res => setTimeout(res, 500)); // Simulate API call
        const success = createGuild(guildName.trim(), user.id);
        setIsCreating(false);
        if (success) {
            setCreateModalOpen(false);
            setGuildName('');
        }
    };
    
    const handleJoinGuild = async (guildId: number) => {
        if(!user) return;
        setIsJoining(guildId);
        await new Promise(res => setTimeout(res, 500)); // Simulate API call
        joinGuild(guildId, user.id);
        setIsJoining(null);
    };

    const handleBuyVip = (plan: 'month' | 'year') => {
        if (!user) return;
        const success = buyVip(user.id, plan);
        if (success) {
            setVipModalOpen(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="text-brand-orange" /> Guilds
                    </h1>
                    <p className="text-brand-text-secondary mt-1">Join a team, compete, and climb the leaderboard.</p>
                </div>
                {!user?.guildId && (
                    <Button onClick={handleOpenCreateModal} className="flex items-center gap-2">
                        {userIsVip ? <PlusCircle size={18} /> : <Crown size={18} className="text-yellow-300"/>}
                        {userIsVip ? 'Create a Guild' : 'Become VIP to Create'}
                    </Button>
                )}
            </div>

            {user?.guildId && (
                <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-orange/50">
                    <h2 className="text-xl font-semibold text-brand-orange">Your Guild</h2>
                    <div className="mt-4 flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div className="flex items-center gap-4">
                           <Shield size={40} className="text-green-400"/>
                           <div>
                               <p className="text-2xl font-bold">{user.guildName}</p>
                               <p className="text-sm text-brand-text-secondary">You are a member.</p>
                           </div>
                        </div>
                        <Link to={`/guilds/${user.guildId}`}>
                            <Button variant="secondary" className="flex items-center gap-2 w-full md:w-auto">View Your Guild <ArrowRight size={16}/></Button>
                        </Link>
                    </div>
                </div>
            )}

            <div className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Trophy className="text-yellow-400"/> Guild Leaderboard
                </h2>
                <div className="space-y-3">
                    {leaderboard.map((guild, index) => {
                        const leader = users.find(u => u.id === guild.leaderId);
                        return (
                        <div key={guild.id} className="bg-brand-dark p-4 rounded-lg flex flex-col md:flex-row items-center justify-between gap-3 animate-fade-in-up" style={{ animationDelay: `${index * 75}ms` }}>
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <span className="text-xl font-bold text-brand-orange w-8 text-center">#{index + 1}</span>
                                <div>
                                    <p className="text-lg font-bold text-white">{guild.name}</p>
                                    <p className="text-xs text-brand-text-secondary">Leader: {leader?.username || 'N/A'}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-center text-sm w-full md:w-auto justify-around">
                                <div>
                                    <p className="font-bold text-lg">{guild.memberIds.length}</p>
                                    <p className="text-brand-text-secondary">Members</p>
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-green-400">{guild.wins}</p>
                                    <p className="text-brand-text-secondary">Wins</p>
                                </div>
                                <div>
                                    <p className="font-bold text-lg text-red-400">{guild.losses}</p>
                                    <p className="text-brand-text-secondary">Losses</p>
                                </div>
                            </div>
                            <div className="flex-shrink-0 w-full md:w-auto">
                                {user?.guildId === guild.id ? (
                                    <Button variant="secondary" disabled className="w-full flex items-center justify-center gap-2"><Check size={16}/> Joined</Button>
                                ) : (
                                    <Button onClick={() => handleJoinGuild(guild.id)} variant="primary" disabled={!!user?.guildId || isJoining !== null} isLoading={isJoining === guild.id} className="w-full">Join</Button>
                                )}
                            </div>
                        </div>
                    )})}
                </div>
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Guild">
                <div className="space-y-4">
                    <p className="text-sm text-brand-text-secondary">Choose a powerful name for your new guild. You will automatically become the guild leader.</p>
                    <Input 
                        label="Guild Name"
                        placeholder="e.g., The Victors"
                        value={guildName}
                        onChange={(e) => setGuildName(e.target.value)}
                    />
                    <Button onClick={handleCreateGuild} className="w-full" isLoading={isCreating}>Create Guild</Button>
                </div>
            </Modal>
            
             <Modal isOpen={isVipModalOpen} onClose={() => setVipModalOpen(false)} title="Become a VIP Member">
                <div className="space-y-6 text-center">
                    <Crown size={48} className="mx-auto text-yellow-400"/>
                    <p className="text-lg text-brand-text-secondary">Unlock exclusive features by becoming a VIP member.</p>
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-brand-dark p-4 rounded-lg border border-brand-light-gray text-center">
                            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><Calendar size={20}/> 1 Month</h3>
                            <p className="text-3xl font-bold my-2 text-brand-orange">{VIP_PLANS.month.price} <span className="text-lg">Coins</span></p>
                            <Button onClick={() => handleBuyVip('month')} className="w-full">Purchase</Button>
                        </div>
                        <div className="flex-1 bg-brand-dark p-4 rounded-lg border-2 border-brand-orange text-center relative">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-orange px-3 py-0.5 rounded-full text-xs font-bold">BEST VALUE</div>
                            <h3 className="text-xl font-bold text-white flex items-center justify-center gap-2"><Star size={20}/> 1 Year</h3>
                            <p className="text-3xl font-bold my-2 text-brand-orange">{VIP_PLANS.year.price} <span className="text-lg">Coins</span></p>
                            <Button onClick={() => handleBuyVip('year')} className="w-full">Purchase</Button>
                        </div>
                    </div>
                     <ul className="text-left space-y-2 p-4 bg-brand-dark rounded-md text-sm">
                        <li className="flex items-center gap-2"><Check className="text-green-400"/> Create your own guild</li>
                        <li className="flex items-center gap-2"><Check className="text-green-400"/> Chat directly with Admins</li>
                        <li className="flex items-center gap-2"><Check className="text-green-400"/> Send photos to support</li>
                        <li className="flex items-center gap-2"><Check className="text-green-400"/> Exclusive VIP chat rooms</li>
                    </ul>
                </div>
            </Modal>
        </div>
    );
};

export default GuildsPage;
