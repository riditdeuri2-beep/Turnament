import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import { Swords, Calendar, Trophy } from 'lucide-react';

const GuildWarsPage: React.FC = () => {
    const { user } = useAuth();
    const { guilds, guildWars, bets, placeBet, settings } = useData();
    
    type BetState = {
        guildWarId: number;
        guildId: number;
        guildName: string;
    };
    const [bettingOn, setBettingOn] = useState<BetState | null>(null);
    const [betAmount, setBetAmount] = useState('');
    const [isPlacingBet, setIsPlacingBet] = useState(false);

    const upcomingWars = guildWars.filter(w => w.status === 'Upcoming');
    const completedWars = guildWars.filter(w => w.status === 'Completed');

    const dailyBetLimit = user?.dailyBetLimitOverride ?? settings.dailyBetLimit ?? 2000;

    const todaysBetsAmount = useMemo(() => {
        if (!user) return 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        return bets
            .filter(b => b.userId === user.id && new Date(b.timestamp) >= today)
            .reduce((sum, b) => sum + b.amount, 0);
    }, [bets, user]);

    const remainingDailyLimit = dailyBetLimit - todaysBetsAmount;


    const handlePlaceBet = async () => {
        if (!user || !bettingOn || !betAmount) return;
        
        setIsPlacingBet(true);
        await new Promise(res => setTimeout(res, 500)); // Simulate API call

        const amount = Number(betAmount);
        const success = placeBet({
            userId: user.id,
            guildWarId: bettingOn.guildWarId,
            guildId: bettingOn.guildId,
            amount: amount,
        });
        
        setIsPlacingBet(false);
        if (success) {
            setBettingOn(null);
            setBetAmount('');
        }
    };

    const getBettingPool = (guildWarId: number, guildId: number) => {
        return bets
            .filter(b => b.guildWarId === guildWarId && b.guildId === guildId)
            .reduce((sum, b) => sum + b.amount, 0);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Swords className="text-brand-orange" /> Guild Wars
                </h1>
                <p className="text-brand-text-secondary mt-1">Witness epic battles and bet on your favorite guilds to win rewards.</p>
            </div>
            
            {/* Upcoming Wars Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-brand-orange">Upcoming Wars</h2>
                {upcomingWars.length > 0 ? (
                    upcomingWars.map((war, index) => {
                        const guild1 = guilds.find(g => g.id === war.guild1Id);
                        const guild2 = guilds.find(g => g.id === war.guild2Id);
                        const userBet = bets.find(b => b.userId === user?.id && b.guildWarId === war.id);
                        
                        const guild1Pool = getBettingPool(war.id, war.guild1Id);
                        const guild2Pool = getBettingPool(war.id, war.guild2Id);

                        if (!guild1 || !guild2) return null;
                        
                        return (
                            <div key={war.id} className="bg-brand-gray p-6 rounded-lg shadow-lg border border-brand-light-gray animate-fade-in-up" style={{ animationDelay: `${index * 100}ms` }}>
                                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar size={16} className="text-brand-text-secondary"/>
                                        <span>Starts: {new Date(war.startTime).toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Trophy size={16} className="text-yellow-400"/>
                                        <span>Prize Pool: <span className="font-bold text-white">₹{war.prizePool}</span></span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-around text-center">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold">{guild1.name}</h3>
                                        <p className="text-sm text-brand-text-secondary mt-1">Betting Pool: ₹{guild1Pool.toFixed(2)}</p>
                                    </div>
                                    <div className="text-3xl font-bold text-brand-orange p-4">VS</div>
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold">{guild2.name}</h3>
                                        <p className="text-sm text-brand-text-secondary mt-1">Betting Pool: ₹{guild2Pool.toFixed(2)}</p>
                                    </div>
                                </div>
                                
                                {userBet ? (
                                    <div className="mt-6 p-3 bg-green-900/50 border border-green-400/30 rounded-lg text-center">
                                        <p className="text-green-300 font-semibold">You bet ₹{userBet.amount} on {userBet.guildId === guild1.id ? guild1.name : guild2.name}</p>
                                    </div>
                                ) : (
                                    <div className="mt-6 flex flex-col md:flex-row gap-4">
                                        <Button onClick={() => setBettingOn({ guildWarId: war.id, guildId: guild1.id, guildName: guild1.name })} className="flex-1">Bet on {guild1.name}</Button>
                                        <Button onClick={() => setBettingOn({ guildWarId: war.id, guildId: guild2.id, guildName: guild2.name })} className="flex-1">Bet on {guild2.name}</Button>
                                    </div>
                                )}
                            </div>
                        )
                    })
                ) : (
                    <div className="bg-brand-gray p-8 text-center rounded-lg border border-brand-light-gray">
                        <p className="text-brand-text-secondary">No upcoming wars scheduled. Check back soon!</p>
                    </div>
                )}
            </div>
            
             {/* Completed Wars Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-brand-orange">Completed Wars</h2>
                 {completedWars.length > 0 ? (
                    completedWars.map((war) => {
                        const guild1 = guilds.find(g => g.id === war.guild1Id);
                        const guild2 = guilds.find(g => g.id === war.guild2Id);
                        if (!guild1 || !guild2) return null;
                        
                        return (
                             <div key={war.id} className="bg-brand-dark p-4 rounded-lg flex items-center justify-between text-center opacity-70">
                                <h4 className={`text-lg font-bold ${war.winnerGuildId === guild1.id ? 'text-green-400' : 'text-red-400'}`}>{guild1.name}</h4>
                                <div className="font-bold text-brand-text-secondary">
                                    <Trophy size={20} className="mx-auto text-yellow-400 mb-1"/>
                                    Winner: {war.winnerGuildId === guild1.id ? guild1.name : guild2.name}
                                 </div>
                                <h4 className={`text-lg font-bold ${war.winnerGuildId === guild2.id ? 'text-green-400' : 'text-red-400'}`}>{guild2.name}</h4>
                             </div>
                        );
                    })
                 ) : (
                     <div className="bg-brand-gray p-8 text-center rounded-lg border border-brand-light-gray">
                        <p className="text-brand-text-secondary">No wars have been completed yet.</p>
                    </div>
                 )}
            </div>

            <ConfirmationModal
                isOpen={!!bettingOn}
                onClose={() => setBettingOn(null)}
                onConfirm={handlePlaceBet}
                title={`Place Bet on ${bettingOn?.guildName}`}
                confirmButtonText="Confirm Bet"
                isConfirmLoading={isPlacingBet}
            >
                 <div className="space-y-4">
                    <p>Enter the amount you wish to bet on <strong>{bettingOn?.guildName}</strong> to win. This amount will be deducted from your wallet immediately.</p>
                    <div className="text-sm p-3 bg-brand-dark rounded-md border border-brand-light-gray space-y-1">
                        <p className="flex justify-between"><span>Min / Max Bet:</span> <span className="font-semibold">₹{settings.minBetAmount || 10} / ₹{settings.maxBetAmount || 500}</span></p>
                        <p className="flex justify-between"><span>Remaining Daily Limit:</span> <span className="font-semibold">₹{remainingDailyLimit.toFixed(2)}</span></p>
                    </div>
                     <Input 
                        label="Bet Amount (₹)"
                        type="number"
                        placeholder={`e.g., ${settings.minBetAmount || 10}`}
                        value={betAmount}
                        onChange={(e) => setBetAmount(e.target.value)}
                     />
                 </div>
            </ConfirmationModal>
        </div>
    );
};

export default GuildWarsPage;
