import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import type { User, Tournament, Deposit, Withdrawal, AdminUpdate, AppSettings, CheatReport, Winner, Participant, TournamentResult, Message, AuditLog, Guild, GuildWar, Bet, GuildMessage, VipChat, VipChatMessage } from '../types';

// MOCK DATA
const initialUsers: User[] = [
  { id: 1, username: 'Riditx444', email: 'admin@test.com', password: 'Ridit6002146187', role: 'superadmin', status: 'active', winnableBalance: 10000, depositedBalance: 0, bonusBalance: 0, isBanned: false, vipExpiry: new Date(Date.now() + 365 * 86400000).toISOString(), lastIpAddress: '192.168.1.1', lastDeviceInfo: 'Admin Desktop' },
  { id: 2, username: 'player1', email: 'user@test.com', password: 'password', role: 'user', status: 'active', winnableBalance: 100, depositedBalance: 400, bonusBalance: 50, upiId: 'player1@upi', freefireUid: '123456789', inGameName: 'ProPlayer1', inGameLevel: 60, isUidVerified: true, isBanned: false, guildId: 1, guildName: 'Fire Dragons', vipExpiry: new Date(Date.now() + 30 * 86400000).toISOString(), lastIpAddress: '10.0.0.1', lastDeviceInfo: 'OnePlus 9', dailyBetLimitOverride: 5000 },
  { id: 3, username: 'player2', email: 'user2@test.com', password: 'password', role: 'user', status: 'active', winnableBalance: 50, depositedBalance: 200, bonusBalance: 0, upiId: 'player2@upi', freefireUid: '987654321', inGameName: 'NoobMaster', inGameLevel: 45, isUidVerified: false, isBanned: false, guildId: 2, guildName: 'Ice Wolves', vipExpiry: new Date(Date.now() - 86400000).toISOString(), lastIpAddress: '10.0.0.2', lastDeviceInfo: 'iPhone 13' }, // Expired VIP
  { id: 4, username: 'banned_user', email: 'banned@test.com', password: 'password', role: 'user', status: 'blocked', winnableBalance: 0, depositedBalance: 10, bonusBalance: 0, upiId: 'banned@upi', isBanned: true, banReason: 'Using hacks.' },
  { id: 5, username: 'guildless_player', email: 'user3@test.com', password: 'password', role: 'user', status: 'active', winnableBalance: 20, depositedBalance: 50, bonusBalance: 0, isBanned: false },
  { id: 6, username: 'dragon_member2', email: 'user4@test.com', password: 'password', role: 'user', status: 'active', winnableBalance: 20, depositedBalance: 50, bonusBalance: 0, isBanned: false, guildId: 1, guildName: 'Fire Dragons', vipExpiry: new Date(Date.now() + 15 * 86400000).toISOString(), lastIpAddress: '10.0.0.3', lastDeviceInfo: 'Samsung S22' },
];

const initialTournaments: Tournament[] = [
  {
    id: 1, name: 'Weekly Fire Fight', entryFee: 50, startTime: new Date(Date.now() + 86400000).toISOString(), status: 'Upcoming', participants: [], maxParticipants: 50, game: 'Free Fire', commissionPercent: 10, tournamentType: 'Normal', prizeDistribution: [{rank: 1, percentage: 50}, {rank: 2, percentage: 30}, {rank: 3, percentage: 20}], allowEmulators: true, glooWallMode: 'Unlimited', shotMode: 'Normal', maxKillsThreshold: 30,
  },
  {
    id: 2, name: 'Kill & Earn Daily', entryFee: 20, startTime: new Date().toISOString(), status: 'Live', participants: [{ userId: 2, deviceInfo: 'mock', emulatorDeclaration: false }, { userId: 3, deviceInfo: 'mock', emulatorDeclaration: false }], maxParticipants: 50, game: 'Free Fire', commissionPercent: 15, tournamentType: 'Kill', perKillReward: 5, allowEmulators: false, glooWallMode: 'Limited', shotMode: 'BodyShot', maxKillsThreshold: 20, roomId: '123456', roomPassword: 'pass', prizeDistribution: [], streamUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  },
  {
    id: 3, name: 'Grand Championship', entryFee: 100, startTime: new Date(Date.now() - 86400000).toISOString(), status: 'Completed', participants: [{ userId: 2, deviceInfo: 'mock', emulatorDeclaration: false }], maxParticipants: 100, game: 'Free Fire', commissionPercent: 10, tournamentType: 'Normal', prizeDistribution: [{rank: 1, percentage: 100}], allowEmulators: true, glooWallMode: 'Unlimited', shotMode: 'Headshot', maxKillsThreshold: 30, results: [{ userId: 2, username: 'player1', rank: 1, winnings: 9000, status: 'Verified' }]
  },
  {
    id: 4, name: 'Clash Squad Challenge', entryFee: 30, startTime: new Date(Date.now() + 172800000).toISOString(), status: 'Upcoming', participants: [], maxParticipants: 8, game: 'Free Fire', commissionPercent: 12, tournamentType: 'Clash Squad', roundsToWin: 4, allowEmulators: true, glooWallMode: 'Limited', shotMode: 'Normal', maxKillsThreshold: 0, prizeDistribution: []
  },
];

const initialDeposits: Deposit[] = [
    { id: 1, userId: 2, username: 'player1', amount: 200, transactionId: '112233445566', status: 'Completed', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: 2, userId: 3, username: 'player2', amount: 100, transactionId: '223344556677', status: 'Pending', timestamp: new Date().toISOString() },
    { id: 3, userId: 2, username: 'player1', amount: 300, transactionId: '334455667788', status: 'Completed', timestamp: new Date().toISOString() },
];

const initialWithdrawals: Withdrawal[] = [
    { id: 1, userId: 2, username: 'player1', amount: 50, upiId: 'player1@upi', status: 'Completed', timestamp: new Date(Date.now() - 86400000).toISOString() },
    { id: 2, userId: 3, username: 'player2', amount: 75, upiId: 'player2@upi', status: 'Pending', timestamp: new Date().toISOString() },
];

const initialAdminUpdates: AdminUpdate[] = [
    { id: 1, title: "Welcome to the New App!", content: "We've launched a brand new version of the app with exciting features. Check out the latest tournaments and enjoy!", timestamp: new Date().toISOString() }
];

const initialCheatReports: CheatReport[] = [
    { id: 1, reporterId: 3, reporterUsername: 'player2', reportedUserId: 2, reportedUsername: 'player1', tournamentId: 3, description: 'He was using a speed hack.', status: 'Pending', timestamp: new Date().toISOString() }
];

const initialTournamentResults: TournamentResult[] = [
    { id: 1, tournamentId: 1, tournamentName: 'Weekly Fire Fight', userId: 3, username: 'player2', rank: 5, screenshotPath: '/mock-path.jpg', status: 'Pending', timestamp: new Date().toISOString(), aiRank: 5, aiConfidence: 0.95 }
];

const initialMessages: Message[] = [];
const initialAuditLogs: AuditLog[] = [];

const initialGuilds: Guild[] = [
    { id: 1, name: 'Fire Dragons', leaderId: 2, memberIds: [2, 6], wins: 10, losses: 2 },
    { id: 2, name: 'Ice Wolves', leaderId: 3, memberIds: [3], wins: 5, losses: 5 },
];

const initialGuildWars: GuildWar[] = [
    { id: 1, guild1Id: 1, guild2Id: 2, startTime: new Date(Date.now() + 2 * 86400000).toISOString(), status: 'Upcoming', prizePool: 5000, commissionPercent: 10 },
    { id: 2, guild1Id: 2, guild2Id: 1, startTime: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'Completed', prizePool: 2000, commissionPercent: 10, winnerGuildId: 1 },
];

const initialBets: Bet[] = [];

const initialGuildMessages: GuildMessage[] = [
    { id: 1, guildId: 1, senderId: 2, content: "Welcome to the Fire Dragons guild chat!", timestamp: new Date(Date.now() - 100000).toISOString() },
    { id: 2, guildId: 1, senderId: 6, content: "Glad to be here! Let's win the next war.", timestamp: new Date().toISOString() },
];

const initialVipChats: VipChat[] = [
    { id: 1, title: "VIP Announcements", adminId: 1, createdAt: new Date(Date.now() - 86400000).toISOString() }
];
const initialVipChatMessages: VipChatMessage[] = [
    { id: 1, chatId: 1, senderId: 1, content: "Welcome, VIPs, to your exclusive chat room! We'll post major updates here first.", timestamp: new Date().toISOString() }
];


const initialSettings: AppSettings = {
    upiId: 'admin-payments@upi',
    qrCodePath: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=admin-payments@upi',
    geminiApiKey: '',
    shareLink: 'https://example.com/share?ref=12345',
    minBetAmount: 10,
    maxBetAmount: 500,
    dailyBetLimit: 2000,
};

export const VIP_PLANS = {
    month: { price: 200, durationDays: 30 },
    year: { price: 1000, durationDays: 365 },
};

export const isVipActive = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) > new Date();
};


interface DataContextType {
    users: User[];
    tournaments: Tournament[];
    deposits: Deposit[];
    withdrawals: Withdrawal[];
    adminUpdates: AdminUpdate[];
    cheatReports: CheatReport[];
    tournamentResults: TournamentResult[];
    messages: Message[];
    settings: AppSettings;
    auditLogs: AuditLog[];
    guilds: Guild[];
    guildWars: GuildWar[];
    bets: Bet[];
    guildMessages: GuildMessage[];
    vipChats: VipChat[];
    vipChatMessages: VipChatMessage[];
    updateUserStatus: (userId: number, status: 'active' | 'blocked') => void;
    addDepositRequest: (requestData: Omit<Deposit, 'id' | 'status' | 'timestamp'>) => void;
    updateDepositStatus: (depositId: number, status: 'Completed' | 'Rejected', adminUsername: string) => void;
    addWithdrawalRequest: (requestData: Omit<Withdrawal, 'id' | 'status' | 'timestamp'>) => boolean;
    updateWithdrawalStatus: (withdrawalId: number, status: 'Completed' | 'Rejected', adminUsername: string) => void;
    addTournament: (tournamentData: Omit<Tournament, 'id' | 'participants' | 'results'>) => void;
    updateTournament: (updatedTournament: Tournament) => void;
    deleteTournament: (tournamentId: number, adminUsername: string) => void;
    joinTournament: (tournamentId: number, userId: number, emulatorDeclaration: boolean) => boolean;
    addAdminUpdate: (updateData: { title: string; content: string; imagePath?: string }) => void;
    addCheatReport: (reportData: Omit<CheatReport, 'id' | 'timestamp'>) => void;
    updateCheatReportStatus: (reportId: number, status: 'Reviewed' | 'Dismissed') => void;
    updateUserBanStatus: (userId: number, isBanned: boolean, adminUsername: string, reason?: string) => void;
    updateUserVerificationStatus: (userId: number, isVerified: boolean, adminUsername: string) => void;
    submitNormalModeResult: (resultData: Omit<TournamentResult, 'id' | 'status' | 'timestamp'>) => void;
    verifyNormalModeResult: (resultId: number, status: 'Verified' | 'Rejected', adminUsername: string) => void;
    setKillAndEarnResults: (tournamentId: number, results: Omit<Winner, 'winnings'|'username'|'status'>[]) => boolean;
    verifyKillModeResult: (tournamentId: number, userId: number, status: 'Verified' | 'Rejected', adminUsername: string) => void;
    updateSettings: (newSettings: AppSettings, adminUsername: string) => void;
    addUser: (userData: Omit<User, 'id' | 'role' | 'status' | 'winnableBalance' | 'depositedBalance' | 'bonusBalance' | 'isBanned' | 'vipExpiry'>) => { success: boolean; user?: User };
    getMessages: (userId1: number, userId2: number) => Message[];
    sendMessage: (senderId: number, receiverId: number, content: string, imagePath?: string) => void;
    sendCoins: (senderId: number, receiverId: number, amount: number) => boolean;
    updateUserPassword: (userId: number, newPassword: string) => boolean;
    addBonusBalance: (userId: number, amount: number, adminUsername: string) => void;
    updateUserByAdmin: (adminUsername: string, updatedUserData: User) => boolean;
    updateUserProfile: (userId: number, updatedDetails: Partial<Omit<User, 'password'>>) => boolean;
    // Guilds
    createGuild: (name: string, leaderId: number) => boolean;
    joinGuild: (guildId: number, userId: number) => boolean;
    leaveGuild: (userId: number) => boolean;
    createGuildWar: (warData: Omit<GuildWar, 'id' | 'status' | 'winnerGuildId'>, adminUsername: string) => void;
    placeBet: (betData: Omit<Bet, 'id' | 'timestamp'>) => boolean;
    resolveGuildWar: (guildWarId: number, winnerGuildId: number, adminUsername: string) => boolean;
    // VIP & Guild Chat
    buyVip: (userId: number, plan: 'month' | 'year') => boolean;
    getGuildMessages: (guildId: number) => GuildMessage[];
    sendGuildMessage: (senderId: number, guildId: number, content: string) => void;
    // VIP Chat Rooms
    createVipChat: (title: string, adminId: number) => void;
    sendVipChatMessage: (chatId: number, senderId: number, content: string) => void;
    getVipChatMessages: (chatId: number) => VipChatMessage[];
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user: authUser, updateUser: updateAuthUser } = useAuth();
    const { addNotification } = useNotification();
    
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [tournaments, setTournaments] = useState<Tournament[]>(initialTournaments);
    const [deposits, setDeposits] = useState<Deposit[]>(initialDeposits);
    const [withdrawals, setWithdrawals] = useState<Withdrawal[]>(initialWithdrawals);
    const [adminUpdates, setAdminUpdates] = useState<AdminUpdate[]>(initialAdminUpdates);
    const [cheatReports, setCheatReports] = useState<CheatReport[]>(initialCheatReports);
    const [tournamentResults, setTournamentResults] = useState<TournamentResult[]>(initialTournamentResults);
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [settings, setSettings] = useState<AppSettings>(initialSettings);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
    const [guilds, setGuilds] = useState<Guild[]>(initialGuilds);
    const [guildWars, setGuildWars] = useState<GuildWar[]>(initialGuildWars);
    const [bets, setBets] = useState<Bet[]>(initialBets);
    const [guildMessages, setGuildMessages] = useState<GuildMessage[]>(initialGuildMessages);
    const [vipChats, setVipChats] = useState<VipChat[]>(initialVipChats);
    const [vipChatMessages, setVipChatMessages] = useState<VipChatMessage[]>(initialVipChatMessages);

    // Effect to check for and expire VIP statuses on app load
    useEffect(() => {
        setUsers(currentUsers => {
            return currentUsers.map(u => {
                if (u.vipExpiry && !isVipActive(u.vipExpiry)) {
                    return { ...u, vipExpiry: undefined };
                }
                return u;
            });
        });
    }, []);

    const updateAuthenticatedUserIfApplicable = useCallback((userToUpdate: User) => {
        if (authUser && userToUpdate.id === authUser.id) {
            updateAuthUser(userToUpdate);
        }
    }, [authUser, updateAuthUser]);
    
    const addAuditLog = useCallback((adminUsername: string, action: string, target: string) => {
        const newLog: AuditLog = {
            id: Date.now(),
            adminUsername,
            action,
            target,
            timestamp: new Date().toISOString(),
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, []);

    const updateUserStatus = useCallback((userId: number, status: 'active' | 'blocked') => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
    }, []);

    const deductBalance = useCallback((userId: number, amount: number) => {
        let success = false;
        let finalUser: User | null = null;
        
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                const totalBalance = u.depositedBalance + u.winnableBalance + u.bonusBalance;
                if (totalBalance < amount) return u;

                let remainingDeduction = amount;
                let updatedUser = { ...u };

                // [Corrected Logic Order] Use Bonus, then Deposited, then Winnable
                const bonusDeduction = Math.min(updatedUser.bonusBalance, remainingDeduction);
                updatedUser.bonusBalance -= bonusDeduction;
                remainingDeduction -= bonusDeduction;

                const depositedDeduction = Math.min(updatedUser.depositedBalance, remainingDeduction);
                updatedUser.depositedBalance -= depositedDeduction;
                remainingDeduction -= depositedDeduction;
                
                updatedUser.winnableBalance -= remainingDeduction;

                success = true;
                finalUser = updatedUser;
                return updatedUser;
            }
            return u;
        }));

        if(finalUser) {
            updateAuthenticatedUserIfApplicable(finalUser);
        }
        return success;
    }, [updateAuthenticatedUserIfApplicable]);

    const addDepositRequest = useCallback((requestData: Omit<Deposit, 'id' | 'status' | 'timestamp'>) => {
        const newDeposit: Deposit = {
            ...requestData,
            id: Date.now(),
            status: 'Pending',
            timestamp: new Date().toISOString(),
        };
        setDeposits(prev => [newDeposit, ...prev]);
    }, []);

    const updateDepositStatus = useCallback((depositId: number, status: 'Completed' | 'Rejected', adminUsername: string) => {
        const deposit = deposits.find(d => d.id === depositId);
        if (!deposit || deposit.status !== 'Pending') return;

        addAuditLog(adminUsername, `${status} Deposit`, `User: ${deposit.username}, Amount: ${deposit.amount}`);

        setDeposits(prev => prev.map(d => d.id === depositId ? { ...d, status } : d));
        if (status === 'Completed') {
            setUsers(prev => prev.map(u => {
                if(u.id === deposit.userId) {
                    const updatedUser = { ...u, depositedBalance: u.depositedBalance + deposit.amount };
                    updateAuthenticatedUserIfApplicable(updatedUser);
                    return updatedUser;
                }
                return u;
            }));
        }
        addNotification(`Deposit request for ${deposit.username} has been ${status.toLowerCase()}.`, 'success');
    }, [deposits, addAuditLog, addNotification, updateAuthenticatedUserIfApplicable]);
    
    const addWithdrawalRequest = useCallback((requestData: Omit<Withdrawal, 'id' | 'status' | 'timestamp'>) => {
        const user = users.find(u => u.id === requestData.userId);
        let message = '';
        let success = false;

        if (!user) {
            message = "User not found.";
        } else if (requestData.amount <= 0) {
            message = "Invalid withdrawal amount.";
        } else if (user.winnableBalance < requestData.amount) {
            message = "Insufficient winnable balance.";
        } else if (requestData.amount < 30) {
            message = "Minimum withdrawal amount is ₹30.";
        } else {
            const newWithdrawal: Withdrawal = {
                ...requestData,
                id: Date.now(),
                status: 'Pending',
                timestamp: new Date().toISOString(),
            };
            setWithdrawals(prev => [newWithdrawal, ...prev]);
            message = "Withdrawal request submitted successfully for admin review.";
            success = true;
        }
        addNotification(message, success ? 'success' : 'error');
        return success;
    }, [users, addNotification]);


    const updateWithdrawalStatus = useCallback((withdrawalId: number, status: 'Completed' | 'Rejected', adminUsername: string) => {
        const withdrawal = withdrawals.find(w => w.id === withdrawalId);
        if (!withdrawal || withdrawal.status !== 'Pending') return;
    
        addAuditLog(adminUsername, `${status} Withdrawal`, `User: ${withdrawal.username}, Amount: ${withdrawal.amount}`);

        let notificationMessage = '';

        if (status === 'Completed') {
            const user = users.find(u => u.id === withdrawal.userId);
            if (user && user.winnableBalance >= withdrawal.amount) {
                setUsers(prevUsers => prevUsers.map(u => {
                    if(u.id === withdrawal.userId) {
                        const updatedUser = { ...u, winnableBalance: u.winnableBalance - withdrawal.amount };
                        updateAuthenticatedUserIfApplicable(updatedUser);
                        return updatedUser;
                    }
                    return u;
                }));
                setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? { ...w, status } : w));
                notificationMessage = `Withdrawal for ${withdrawal.username} approved.`;
            } else {
                setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? { ...w, status: 'Rejected' } : w));
                notificationMessage = `Withdrawal for ${withdrawal.username} failed due to insufficient funds and was auto-rejected.`;
            }
        } else { // Rejected status
            setWithdrawals(prev => prev.map(w => w.id === withdrawalId ? { ...w, status } : w));
            notificationMessage = `Withdrawal for ${withdrawal.username} has been rejected.`;
        }
        addNotification(notificationMessage, 'info');
    }, [withdrawals, users, addAuditLog, updateAuthenticatedUserIfApplicable, addNotification]);

    const addTournament = useCallback((tournamentData: Omit<Tournament, 'id' | 'participants' | 'results'>) => {
        const newTournament: Tournament = {
            ...tournamentData,
            id: Date.now(),
            participants: [],
        };
        setTournaments(prev => [newTournament, ...prev]);
        addNotification(`Tournament "${tournamentData.name}" created successfully.`, 'success');
    }, [addNotification]);
    
    const updateTournament = useCallback((updatedTournament: Tournament) => {
        setTournaments(prev => prev.map(t => t.id === updatedTournament.id ? updatedTournament : t));
        addNotification(`Tournament "${updatedTournament.name}" updated successfully.`, 'success');
    }, [addNotification]);

    const deleteTournament = useCallback((tournamentId: number, adminUsername: string) => {
        const tournament = tournaments.find(t => t.id === tournamentId);
        if(tournament) {
            addAuditLog(adminUsername, 'Deleted Tournament', `Tournament: ${tournament.name} (ID: ${tournamentId})`);
            setTournaments(prev => prev.filter(t => t.id !== tournamentId));
            addNotification(`Tournament "${tournament.name}" has been deleted.`, 'success');
        }
    }, [tournaments, addAuditLog, addNotification]);
    
    const joinTournament = useCallback((tournamentId: number, userId: number, emulatorDeclaration: boolean) => {
        const tournament = tournaments.find(t => t.id === tournamentId);
        const user = users.find(u => u.id === userId);
        let message = '';
        let success = false;
    
        if (!tournament || !user) {
            message = "Tournament or user not found.";
        } else if (tournament.participants.some(p => p.userId === userId)) {
            message = "You have already joined this tournament.";
        } else if (tournament.participants.length >= tournament.maxParticipants) {
            message = "Tournament is full.";
        } else {
            const totalBalance = user.depositedBalance + user.winnableBalance + user.bonusBalance;
            if (totalBalance < tournament.entryFee) {
                message = "Insufficient balance to join.";
            } else if (deductBalance(userId, tournament.entryFee)) {
                const newParticipant: Participant = { userId, deviceInfo: user.lastDeviceInfo || 'N/A', emulatorDeclaration };
                setTournaments(prev => prev.map(t =>
                    t.id === tournamentId ? { ...t, participants: [...t.participants, newParticipant] } : t
                ));
                message = "Successfully joined the tournament!";
                success = true;
            } else {
                message = "Failed to deduct entry fee.";
            }
        }
        addNotification(message, success ? 'success' : 'error');
        return success;
    }, [tournaments, users, deductBalance, addNotification]);
    
    const addAdminUpdate = useCallback((updateData: { title: string; content: string; imagePath?: string }) => {
        const newUpdate: AdminUpdate = {
            id: Date.now(),
            ...updateData,
            timestamp: new Date().toISOString()
        };
        setAdminUpdates(prev => [newUpdate, ...prev]);
        addNotification("New app update has been posted.", 'success');
    }, [addNotification]);
    
    const addCheatReport = useCallback((reportData: Omit<CheatReport, 'id' | 'timestamp'>) => {
        const newReport: CheatReport = {
            ...reportData,
            id: Date.now(),
            timestamp: new Date().toISOString(),
        };
        setCheatReports(prev => [newReport, ...prev]);
        addNotification("Your cheat report has been submitted for review.", 'success');
    }, [addNotification]);
    
    const updateCheatReportStatus = useCallback((reportId: number, status: 'Reviewed' | 'Dismissed') => {
        setCheatReports(prev => prev.map(r => r.id === reportId ? { ...r, status } : r));
    }, []);
    
    const updateUserBanStatus = useCallback((userId: number, isBanned: boolean, adminUsername: string, reason?: string) => {
        const user = users.find(u => u.id === userId);
        if(user) {
            const action = isBanned ? 'Banned User' : 'Unbanned User';
            const target = `User: ${user.username} (ID: ${userId})`;
            addAuditLog(adminUsername, action, target);
            setUsers(prev => prev.map(u => {
                 const updatedUser = u.id === userId ? { ...u, isBanned, banReason: isBanned ? reason : undefined, status: isBanned ? 'blocked' : 'active' } : u;
                 if (authUser?.id === userId && isBanned) {
                     // If the currently impersonated/logged-in user is banned, we don't log them out here.
                     // The effect in UserLayout will handle the alert and logout.
                 }
                 return updatedUser;
            }));
            addNotification(`User ${user.username} has been ${isBanned ? 'banned' : 'unbanned'}.`, 'success');
        }
    }, [users, addAuditLog, authUser, addNotification]);
    
    const updateUserVerificationStatus = useCallback((userId: number, isVerified: boolean, adminUsername: string) => {
        const user = users.find(u => u.id === userId);
        if(user) {
            const action = isVerified ? 'Verified User IGN' : 'Rejected User IGN';
            const target = `User: ${user.username} (ID: ${userId})`;
            addAuditLog(adminUsername, action, target);
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, isUidVerified: isVerified } : u));
            addNotification(`In-game details for ${user.username} have been ${isVerified ? 'verified' : 'rejected'}.`, 'success');
        }
    }, [users, addAuditLog, addNotification]);
    
    const submitNormalModeResult = useCallback((resultData: Omit<TournamentResult, 'id' | 'status' | 'timestamp'>) => {
        const newResult: TournamentResult = {
            ...resultData,
            id: Date.now(),
            status: 'Pending',
            timestamp: new Date().toISOString(),
        };
        setTournamentResults(prev => [newResult, ...prev]);
        addNotification("Your result has been submitted for verification.", 'success');
    }, [addNotification]);
    
    const verifyNormalModeResult = useCallback((resultId: number, status: 'Verified' | 'Rejected', adminUsername: string) => {
        const result = tournamentResults.find(r => r.id === resultId);
        if (!result) return;
        
        const action = status === 'Verified' ? 'Approved' : 'Rejected';
        addAuditLog(adminUsername, `${action} Normal Result`, `User: ${result.username}, Tournament: ${result.tournamentName}`);
        
        if (status === 'Verified') {
            const tournament = tournaments.find(t => t.id === result.tournamentId);
            if(tournament) {
                const totalPrizePool = (tournament.entryFee * tournament.participants.length) * (1 - tournament.commissionPercent / 100);
                const prizeInfo = tournament.prizeDistribution.find(p => p.rank === result.rank);
                const winnings = prizeInfo ? totalPrizePool * (prizeInfo.percentage / 100) : 0;

                if (winnings > 0) {
                    setUsers(prevUsers => prevUsers.map(u => {
                        if(u.id === result.userId) {
                            const updatedUser = { ...u, winnableBalance: u.winnableBalance + winnings };
                            updateAuthenticatedUserIfApplicable(updatedUser);
                            return updatedUser;
                        }
                        return u;
                    }));
                }
            }
        }
        setTournamentResults(prev => prev.map(r => r.id === resultId ? { ...r, status } : r));
        addNotification(`Result for ${result.username} has been ${status.toLowerCase()}.`, 'success');
    }, [tournamentResults, tournaments, addAuditLog, addNotification, updateAuthenticatedUserIfApplicable]);
    
    const setKillAndEarnResults = useCallback((tournamentId: number, results: Omit<Winner, 'winnings'|'username'|'status'>[]) => {
        const tournament = tournaments.find(t => t.id === tournamentId);
        if (!tournament) {
            addNotification("Tournament not found.", 'error');
            return false;
        }
        
        const newWinners: Winner[] = results.map(r => {
            const user = users.find(u => u.id === r.userId);
            return {
                ...r,
                username: user?.username || 'Unknown',
                winnings: (r.kills || 0) * (tournament.perKillReward || 0),
                status: 'PendingVerification',
            };
        });
    
        setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, results: newWinners, status: 'Completed' } : t));
        addNotification("Results submitted for kill-based tournament. Go to 'Verify Results' to approve them.", 'success');
        return true;
    }, [tournaments, users, addNotification]);
    
    const verifyKillModeResult = useCallback((tournamentId: number, userId: number, status: 'Verified' | 'Rejected', adminUsername: string) => {
        const tournament = tournaments.find(t => t.id === tournamentId);
        const user = users.find(u => u.id === userId);
        if(!tournament || !user) return;

        const action = status === 'Verified' ? 'Approved' : 'Rejected';
        addAuditLog(adminUsername, `${action} Kill Result`, `User: ${user.username}, Tournament: ${tournament.name}`);

        setTournaments(prev => prev.map(t => {
            if (t.id === tournamentId) {
                const updatedResults = t.results?.map(r => {
                    if (r.userId === userId) {
                        if(status === 'Verified' && r.winnings > 0) {
                            setUsers(prevUsers => prevUsers.map(u => {
                                if (u.id === userId) {
                                    const updatedUser = { ...u, winnableBalance: u.winnableBalance + r.winnings };
                                    updateAuthenticatedUserIfApplicable(updatedUser);
                                    return updatedUser;
                                }
                                return u;
                            }));
                        }
                        return { ...r, status };
                    }
                    return r;
                });
                return { ...t, results: updatedResults };
            }
            return t;
        }));
        addNotification(`Kill result for ${user.username} has been ${status.toLowerCase()}.`, 'success');
    }, [tournaments, users, addAuditLog, addNotification, updateAuthenticatedUserIfApplicable]);
    
    const updateSettings = useCallback((newSettings: AppSettings, adminUsername: string) => {
        addAuditLog(adminUsername, 'Updated App Settings', 'UPI, Share Link and API Key settings');
        setSettings(newSettings);
        addNotification("App settings have been saved successfully.", 'success');
    }, [addAuditLog, addNotification]);
    
    const addUser = useCallback((userData: Omit<User, 'id' | 'role' | 'status' | 'winnableBalance' | 'depositedBalance' | 'bonusBalance' | 'isBanned' | 'vipExpiry'>) => {
        if (users.some(u => u.username.toLowerCase() === userData.username.toLowerCase())) {
            addNotification("Username is already taken.", 'error');
            return { success: false };
        }
        if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            addNotification("Email is already registered.", 'error');
            return { success: false };
        }
        
        const newUser: User = {
            ...userData,
            id: Date.now(),
            role: 'user',
            status: 'active',
            winnableBalance: 0,
            depositedBalance: 0,
            bonusBalance: 0,
            isBanned: false,
            lastIpAddress: '127.0.0.1', // Mocked
            lastDeviceInfo: 'New User Device' // Mocked
        };
        setUsers(prev => [...prev, newUser]);
        addNotification("Account created successfully! You are now logged in.", 'success');
        return { success: true, user: newUser };
    }, [users, addNotification]);
    
    const getMessages = useCallback((userId1: number, userId2: number) => {
        return messages.filter(m => 
            (m.senderId === userId1 && m.receiverId === userId2) ||
            (m.senderId === userId2 && m.receiverId === userId1)
        ).sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [messages]);
    
    const sendMessage = useCallback((senderId: number, receiverId: number, content: string, imagePath?: string) => {
        const newMessage: Message = {
            id: Date.now(),
            senderId,
            receiverId,
            content,
            timestamp: new Date().toISOString(),
            imagePath,
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);
    
    const sendCoins = useCallback((senderId: number, receiverId: number, amount: number) => {
        if (amount <= 0) {
            addNotification("Invalid amount.", 'error');
            return false;
        }

        const sender = users.find(u => u.id === senderId);
        if (!sender) {
            addNotification("Sender not found.", 'error');
            return false;
        }

        // Use the centralized deductBalance function to ensure consistent logic
        if (deductBalance(senderId, amount)) {
            // Add the amount to the receiver's deposited balance
            setUsers(prev => prev.map(u => {
                if (u.id === receiverId) {
                    return { ...u, depositedBalance: u.depositedBalance + amount };
                }
                return u;
            }));

            const receiver = users.find(u => u.id === receiverId);
            const coinMessage: Message = {
                id: Date.now(),
                senderId,
                receiverId,
                content: `sent ${amount} coins.`,
                timestamp: new Date().toISOString(),
                isCoinTransfer: true,
                amount,
            };
            setMessages(prev => [...prev, coinMessage]);
            addNotification(`Successfully sent ${amount} coins to ${receiver?.username}.`, 'success');
            return true;
        } else {
            addNotification('Insufficient balance to send coins.', 'error');
            return false;
        }
    }, [users, addNotification, deductBalance]);
    
    const updateUserPassword = useCallback((userId: number, newPassword: string) => {
        let success = false;
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                success = true;
                const updatedUser = { ...u, password: newPassword };
                if (authUser?.id === userId) {
                    updateAuthUser({ password: newPassword });
                }
                return updatedUser;
            }
            return u;
        }));
        
        addNotification(
            success ? "Password updated successfully." : "User not found.",
            success ? 'success' : 'error'
        );
        return success;
    }, [authUser, updateAuthUser, addNotification]);

    const addBonusBalance = useCallback((userId: number, amount: number, adminUsername: string) => {
        const user = users.find(u => u.id === userId);
        if(user && amount > 0) {
            addAuditLog(adminUsername, 'Added Bonus Balance', `Added ₹${amount} to ${user.username}`);
            setUsers(prev => prev.map(u => {
                if(u.id === userId) {
                    const updatedUser = { ...u, bonusBalance: u.bonusBalance + amount };
                    updateAuthenticatedUserIfApplicable(updatedUser);
                    return updatedUser;
                }
                return u;
            }));
            addNotification(`Successfully added ₹${amount} bonus to ${user.username}.`, 'success');
        }
    }, [users, addAuditLog, addNotification, updateAuthenticatedUserIfApplicable]);

     const updateUserByAdmin = useCallback((adminUsername: string, updatedUserData: User) => {
        if (!users.find(u => u.id === updatedUserData.id)) {
            addNotification("User not found.", 'error');
            return false;
        }
        addAuditLog(adminUsername, 'Edited User Profile', `User: ${updatedUserData.username} (ID: ${updatedUserData.id})`);
        setUsers(prev => prev.map(u => u.id === updatedUserData.id ? updatedUserData : u));
        updateAuthenticatedUserIfApplicable(updatedUserData);
        addNotification("User profile updated successfully.", 'success');
        return true;
    }, [users, addAuditLog, addNotification, updateAuthenticatedUserIfApplicable]);
    
    const updateUserProfile = useCallback((userId: number, updatedDetails: Partial<Omit<User, 'password'>>) => {
        let finalUser: User | null = null;
        let success = false;
        let gameDetailsChanged = false;

        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                gameDetailsChanged = u.freefireUid !== updatedDetails.freefireUid || u.inGameName !== updatedDetails.inGameName;
                
                const updatedUser = {
                    ...u,
                    ...updatedDetails,
                    isUidVerified: gameDetailsChanged ? false : u.isUidVerified, // Reset verification if details change
                };
                finalUser = updatedUser;
                success = true;
                return updatedUser;
            }
            return u;
        }));

        if (finalUser) {
            updateAuthenticatedUserIfApplicable(finalUser);
        }
        
        addNotification(
            success ? "Profile updated successfully!" : "User not found.",
            success ? 'success' : 'error'
        );

        if (gameDetailsChanged) {
            addNotification("In-game details updated. Your account will require re-verification.", 'info');
        }

        return success;
    }, [users, addNotification, updateAuthenticatedUserIfApplicable]);


    // Guild Functions
    const createGuild = useCallback((name: string, leaderId: number) => {
        const user = users.find(u => u.id === leaderId);
        let message = '';
        let success = false;

        if (!user) message = "User not found.";
        else if (!isVipActive(user.vipExpiry)) message = "Only VIP members can create guilds.";
        else if (user.guildId) message = "You are already in a guild.";
        else if (guilds.some(g => g.name.toLowerCase() === name.toLowerCase())) message = "A guild with this name already exists.";
        else {
             const newGuild: Guild = {
                id: Date.now(),
                name,
                leaderId,
                memberIds: [leaderId],
                wins: 0,
                losses: 0
            };

            setGuilds(prev => [newGuild, ...prev]);
            setUsers(prev => prev.map(u => {
                if(u.id === leaderId) {
                    const updatedUser = { ...u, guildId: newGuild.id, guildName: newGuild.name };
                    updateAuthenticatedUserIfApplicable(updatedUser);
                    return updatedUser;
                }
                return u;
            }));
            message = `Guild "${name}" created successfully!`;
            success = true;
        }

        addNotification(message, success ? 'success' : 'error');
        return success;
    }, [users, guilds, addNotification, updateAuthenticatedUserIfApplicable]);

    const joinGuild = useCallback((guildId: number, userId: number) => {
        const guild = guilds.find(g => g.id === guildId);
        const user = users.find(u => u.id === userId);
        let message = '';
        let success = false;

        if (!guild || !user) message = "Guild or user not found.";
        else if (user.guildId) message = "You must leave your current guild first.";
        else {
             setGuilds(prev => prev.map(g => g.id === guildId ? { ...g, memberIds: [...g.memberIds, userId] } : g));
             setUsers(prev => prev.map(u => {
                if(u.id === userId) {
                    const updatedUser = { ...u, guildId: guild.id, guildName: guild.name };
                    updateAuthenticatedUserIfApplicable(updatedUser);
                    return updatedUser;
                }
                return u;
            }));
            message = `Successfully joined ${guild.name}!`;
            success = true;
        }
        
        addNotification(message, success ? 'success' : 'error');
        return success;
    }, [guilds, users, addNotification, updateAuthenticatedUserIfApplicable]);

    const leaveGuild = useCallback((userId: number) => {
        const user = users.find(u => u.id === userId);
        if (!user || !user.guildId) {
            addNotification("You are not in a guild.", 'error');
            return false;
        }
        
        let guildIsEmpty = false;
        const guildId = user.guildId;

        setGuilds(prev => {
            const newGuilds = prev.map(g => {
                if (g.id === guildId) {
                    const newMembers = g.memberIds.filter(id => id !== userId);
                    if (newMembers.length === 0) {
                        guildIsEmpty = true;
                        return g; // Will be filtered out later
                    }
                    const newLeaderId = g.leaderId === userId ? newMembers[0] : g.leaderId;
                    return { ...g, memberIds: newMembers, leaderId: newLeaderId };
                }
                return g;
            });
            return guildIsEmpty ? newGuilds.filter(g => g.id !== guildId) : newGuilds;
        });

        setUsers(prev => prev.map(u => {
            if(u.id === userId) {
                const updatedUser = { ...u, guildId: undefined, guildName: undefined };
                updateAuthenticatedUserIfApplicable(updatedUser);
                return updatedUser;
            }
            return u;
        }));
        
        addNotification("You have left the guild.", 'success');
        return true;
    }, [users, addNotification, updateAuthenticatedUserIfApplicable]);
    
    const createGuildWar = useCallback((warData: Omit<GuildWar, 'id' | 'status' | 'winnerGuildId'>, adminUsername: string) => {
        const newWar: GuildWar = {
            ...warData,
            id: Date.now(),
            status: 'Upcoming',
        };
        setGuildWars(prev => [newWar, ...prev]);
        const g1 = guilds.find(g => g.id === warData.guild1Id);
        const g2 = guilds.find(g => g.id === warData.guild2Id);
        addAuditLog(adminUsername, 'Created Guild War', `${g1?.name} vs ${g2?.name}`);
        addNotification("Guild war created successfully!", 'success');
    }, [addAuditLog, guilds, addNotification]);

    const placeBet = useCallback((betData: Omit<Bet, 'id' | 'timestamp'>) => {
        const user = users.find(u => u.id === betData.userId);
        let message = '';
        let success = false;

        if (!user) {
            message = "User not found.";
        } else if (user.depositedBalance + user.winnableBalance + user.bonusBalance < betData.amount) {
            message = "Insufficient balance for this bet.";
        } else if (betData.amount < (settings.minBetAmount || 10)) {
            message = `Minimum bet amount is ₹${settings.minBetAmount || 10}.`;
        } else if (betData.amount > (settings.maxBetAmount || 500)) {
            message = `Maximum bet amount is ₹${settings.maxBetAmount || 500}.`;
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const todaysBetsAmount = bets
                .filter(b => b.userId === betData.userId && new Date(b.timestamp) >= today)
                .reduce((sum, b) => sum + b.amount, 0);
            const dailyLimit = user.dailyBetLimitOverride ?? settings.dailyBetLimit ?? 2000;
            if (todaysBetsAmount + betData.amount > dailyLimit) {
                message = `Placing this bet would exceed your daily limit of ₹${dailyLimit}. You have ₹${dailyLimit - todaysBetsAmount} remaining for today.`;
            } else if (bets.some(b => b.userId === betData.userId && b.guildWarId === betData.guildWarId)) {
                message = "You have already placed a bet on this war.";
            } else if (deductBalance(betData.userId, betData.amount)) {
                const newBet: Bet = { ...betData, id: Date.now(), timestamp: new Date().toISOString() };
                setBets(prev => [...prev, newBet]);
                message = "Bet placed successfully!";
                success = true;
            } else {
                message = "Failed to deduct balance.";
            }
        }
        addNotification(message, success ? 'success' : 'error');
        return success;
    }, [users, bets, deductBalance, settings, addNotification]);
    
    const resolveGuildWar = useCallback((guildWarId: number, winnerGuildId: number, adminUsername: string) => {
        const war = guildWars.find(w => w.id === guildWarId);
        if (!war || war.status === 'Completed') {
            addNotification("War not found or already completed.", 'error');
            return false;
        }
        
        const loserGuildId = war.guild1Id === winnerGuildId ? war.guild2Id : war.guild1Id;
        const winnerGuild = guilds.find(g => g.id === winnerGuildId);
        const loserGuild = guilds.find(g => g.id === loserGuildId);
        if(!winnerGuild || !loserGuild) {
            addNotification("Competing guilds not found.", 'error');
            return false;
        }
        
        addAuditLog(adminUsername, 'Resolved Guild War', `${winnerGuild.name} declared winner over ${loserGuild.name}`);

        setGuildWars(prev => prev.map(w => w.id === guildWarId ? { ...w, status: 'Completed', winnerGuildId } : w));
        setGuilds(prev => prev.map(g => {
            if (g.id === winnerGuildId) return { ...g, wins: g.wins + 1 };
            if (g.id === loserGuildId) return { ...g, losses: g.losses + 1 };
            return g;
        }));

        const commissionRate = war.commissionPercent / 100;
        if (winnerGuild.memberIds.length > 0 && war.prizePool > 0) {
            const prizePerMember = (war.prizePool / winnerGuild.memberIds.length) * (1 - commissionRate);
            setUsers(prev => prev.map(u => {
                if (winnerGuild.memberIds.includes(u.id)) {
                    const updatedUser = { ...u, winnableBalance: u.winnableBalance + prizePerMember };
                    updateAuthenticatedUserIfApplicable(updatedUser);
                    return updatedUser;
                }
                return u;
            }));
        }

        const warBets = bets.filter(b => b.guildWarId === guildWarId);
        const winningBets = warBets.filter(b => b.guildId === winnerGuildId);
        const losingBets = warBets.filter(b => b.guildId === loserGuildId);
        const totalLosingPool = losingBets.reduce((sum, b) => sum + b.amount, 0);
        const totalWinningBetAmount = winningBets.reduce((sum, b) => sum + b.amount, 0);
        
        if (totalLosingPool > 0 && totalWinningBetAmount > 0) {
            winningBets.forEach(bet => {
                const proportion = bet.amount / totalWinningBetAmount;
                const grossWinnings = proportion * totalLosingPool;
                const netWinnings = grossWinnings * (1 - commissionRate);
                const totalReturn = bet.amount + netWinnings;
                
                setUsers(prev => prev.map(u => {
                    if(u.id === bet.userId) {
                        const updatedUser = { ...u, winnableBalance: u.winnableBalance + totalReturn };
                        updateAuthenticatedUserIfApplicable(updatedUser);
                        return updatedUser;
                    }
                    return u;
                }));
            });
        } else {
             winningBets.forEach(bet => {
                setUsers(prev => prev.map(u => {
                    if(u.id === bet.userId) {
                        const updatedUser = { ...u, winnableBalance: u.winnableBalance + bet.amount };
                        updateAuthenticatedUserIfApplicable(updatedUser);
                        return updatedUser;
                    }
                    return u;
                }));
            });
        }
        
        addNotification("War resolved and all payouts processed.", 'success');
        return true;
    }, [guilds, guildWars, bets, addAuditLog, addNotification, updateAuthenticatedUserIfApplicable]);

    const buyVip = useCallback((userId: number, plan: 'month' | 'year') => {
        const user = users.find(u => u.id === userId);
        let message = '';
        let success = false;

        if (!user) {
            message = "User not found.";
        } else {
            const planDetails = VIP_PLANS[plan];
            if (deductBalance(userId, planDetails.price)) {
                const expiryDate = new Date();
                expiryDate.setDate(expiryDate.getDate() + planDetails.durationDays);

                setUsers(prev => prev.map(u => {
                    if(u.id === userId) {
                        const updatedUser = { ...u, vipExpiry: expiryDate.toISOString() };
                        updateAuthenticatedUserIfApplicable(updatedUser);
                        return updatedUser;
                    }
                    return u;
                }));
                message = "Congratulations! You are now a VIP member.";
                success = true;
            } else {
                message = `Insufficient balance. VIP membership costs ${planDetails.price} coins.`;
            }
        }
        addNotification(message, success ? 'success' : 'error');
        return success;
    }, [users, deductBalance, addNotification, updateAuthenticatedUserIfApplicable]);

    const getGuildMessages = useCallback((guildId: number) => {
        return guildMessages
            .filter(m => m.guildId === guildId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [guildMessages]);

    const sendGuildMessage = useCallback((senderId: number, guildId: number, content: string) => {
        const newMessage: GuildMessage = {
            id: Date.now(),
            senderId,
            guildId,
            content,
            timestamp: new Date().toISOString(),
        };
        setGuildMessages(prev => [...prev, newMessage]);
    }, []);
    
    const createVipChat = useCallback((title: string, adminId: number) => {
        const newChat: VipChat = {
            id: Date.now(),
            title,
            adminId,
            createdAt: new Date().toISOString()
        };
        setVipChats(prev => [...prev, newChat]);
        addAuditLog(users.find(u => u.id === adminId)?.username || 'Admin', 'Created VIP Chat', `Title: ${title}`);
        addNotification(`VIP Chat Room "${title}" created.`, 'success');
    }, [addAuditLog, users, addNotification]);

    const getVipChatMessages = useCallback((chatId: number) => {
        return vipChatMessages
            .filter(m => m.chatId === chatId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    }, [vipChatMessages]);

    const sendVipChatMessage = useCallback((chatId: number, senderId: number, content: string) => {
        const newMessage: VipChatMessage = {
            id: Date.now(),
            chatId,
            senderId,
            content,
            timestamp: new Date().toISOString(),
        };
        setVipChatMessages(prev => [...prev, newMessage]);
    }, []);


    const value = {
        users,
        tournaments,
        deposits,
        withdrawals,
        adminUpdates,
        cheatReports,
        tournamentResults,
        messages,
        settings,
        auditLogs,
        guilds,
        guildWars,
        bets,
        guildMessages,
        vipChats,
        vipChatMessages,
        updateUserStatus,
        addDepositRequest,
        updateDepositStatus,
        addWithdrawalRequest,
        updateWithdrawalStatus,
        addTournament,
        updateTournament,
        deleteTournament,
        joinTournament,
        addAdminUpdate,
        addCheatReport,
        updateCheatReportStatus,
        updateUserBanStatus,
        updateUserVerificationStatus,
        submitNormalModeResult,
        verifyNormalModeResult,
        setKillAndEarnResults,
        verifyKillModeResult,
        updateSettings,
        addUser,
        getMessages,
        sendMessage,
        sendCoins,
        updateUserPassword,
        addBonusBalance,
        updateUserByAdmin,
        updateUserProfile,
        createGuild,
        joinGuild,
        leaveGuild,
        createGuildWar,
        placeBet,
        resolveGuildWar,
        buyVip,
        getGuildMessages,
        sendGuildMessage,
        createVipChat,
        sendVipChatMessage,
        getVipChatMessages,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};