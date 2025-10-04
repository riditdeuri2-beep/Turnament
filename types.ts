import { User, Shield } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
}

export interface Guild {
    id: number;
    name: string;
    leaderId: number;
    memberIds: number[];
    wins: number;
    losses: number;
}

export interface GuildWar {
    id: number;
    guild1Id: number;
    guild2Id: number;
    startTime: string; // ISO string
    status: 'Upcoming' | 'Live' | 'Completed';
    prizePool: number;
    commissionPercent: number;
    winnerGuildId?: number;
}

export interface Bet {
    id: number;
    userId: number;
    guildWarId: number;
    guildId: number; // The guild the user bet on
    amount: number;
    timestamp: string; // ISO string
}


export interface User {
  id: number;
  username: string;
  email: string;
  password?: string;
  role: 'user' | 'superadmin';
  status: 'active' | 'blocked';
  winnableBalance: number;
  depositedBalance: number;
  bonusBalance: number;
  upiId?: string;
  profilePicPath?: string;
  qrCodePath?: string;
  isBanned: boolean;
  banReason?: string;
  // In-Game Verification
  freefireUid?: string;
  inGameName?: string;
  inGameLevel?: number;
  isUidVerified?: boolean;
  // VIP Status
  vipExpiry?: string; // ISO string
  // Guild
  guildId?: number;
  guildName?: string;
  // Admin Info
  lastIpAddress?: string;
  lastDeviceInfo?: string;
  dailyBetLimitOverride?: number;
}

export interface Winner {
  userId: number;
  username:string;
  rank?: number;
  kills?: number;
  winnings: number;
  screenshotPath?: string;
  // AI Verification
  aiKillCount?: number;
  aiRank?: number;
  aiConfidence?: number;
  status: 'Verified' | 'PendingVerification' | 'Rejected';
}

export interface Participant {
  userId: number;
  deviceInfo: string;
  emulatorDeclaration: boolean;
}

export interface Tournament {
  id: number;
  name: string;
  entryFee: number;
  startTime: string; // ISO string
  status: 'Upcoming' | 'Live' | 'Completed';
  participants: Participant[]; 
  maxParticipants: number;
  game: string;
  commissionPercent: number;
  tournamentType: 'Normal' | 'Kill' | 'Clash Squad';
  prizeDistribution: { rank: number; percentage: number }[];
  perKillReward?: number;
  roundsToWin?: number;
  allowEmulators: boolean;
  glooWallMode: 'Limited' | 'Unlimited';
  shotMode: 'Normal' | 'BodyShot' | 'Headshot';
  maxKillsThreshold: number;
  results?: Winner[];
  roomId?: string;
  roomPassword?: string;
  streamUrl?: string;
}


export interface AdminUpdate {
  id: number;
  title: string;
  content: string;
  timestamp: string; // ISO string
  imagePath?: string;
}

export interface Deposit {
  id: number;
  userId: number;
  username: string;
  amount: number;
  transactionId: string;
  status: 'Pending' | 'Completed' | 'Rejected';
  timestamp: string; // ISO string
}

export interface Withdrawal {
  id: number;
  userId: number;
  username: string;
  amount: number;
  upiId: string;
  status: 'Pending' | 'Completed' | 'Rejected';
  timestamp: string; // ISO string
}

export interface AppSettings {
  upiId: string;
  qrCodePath: string;
  geminiApiKey?: string;
  shareLink?: string;
  minBetAmount?: number;
  maxBetAmount?: number;
  dailyBetLimit?: number;
}

export interface CheatReport {
    id: number;
    reporterId: number;
    reporterUsername: string;
    reportedUserId: number;
    reportedUsername: string;
    tournamentId?: number;
    description: string;
    screenshotPath?: string;
    status: 'Pending' | 'Reviewed' | 'Dismissed';
    timestamp: string; // ISO string
}

export interface TournamentResult {
    id: number;
    tournamentId: number;
    tournamentName: string;
    userId: number;
    username: string;
    rank: number;
    screenshotPath: string;
    aiRank?: number;
    aiConfidence?: number;
    status: 'Pending' | 'Verified' | 'Rejected';
    timestamp: string;
}

export interface Message {
    id: number;
    senderId: number;
    receiverId: number;
    content: string;
    timestamp: string; // ISO string
    isCoinTransfer?: boolean;
    amount?: number;
    imagePath?: string;
}

export interface GuildMessage {
    id: number;
    guildId: number;
    senderId: number;
    content: string;
    timestamp: string; // ISO string
}

export interface AuditLog {
    id: number;
    adminUsername: string;
    action: string;
    target: string; // e.g., "User: player1", "Tournament: Weekly Showdown"
    timestamp: string; // ISO string
}

export interface VipChat {
    id: number;
    title: string;
    adminId: number; // creator
    createdAt: string; // ISO string
}

export interface VipChatMessage {
    id: number;
    chatId: number;
    senderId: number;
    content: string;
    timestamp: string; // ISO string
}
