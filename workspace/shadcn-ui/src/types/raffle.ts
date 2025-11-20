export interface User {
  id: string;
  username: string;
  piId: string;
  ticketsPurchased: number;
  totalSpent: number;
  winnings: number;
  weeklyTicketsUsed?: number;
  weeklyPiSpent?: number;
  lastWeeklyReset?: Date;
}

export interface Purchase {
  id: string;
  userId: string;
  packageId: string;
  tickets: number;
  amount: number;
  timestamp: Date;
  raffleId: string;
}

export interface Winner {
  id: string;
  username: string;
  amount: number;
  timestamp: Date;
  raffleId: string;
}

export interface RaffleState {
  currentPot: number;
  endTime: Date;
  totalTickets: number;
  isActive: boolean;
  winnerId?: string;
  winnerAmount?: number;
}

export interface TicketPackage {
  id: string;
  name: string;
  price: number;
  tickets: number;
  color: string;
  popular?: boolean;
}

export interface LeaderboardEntry {
  user: User;
  rank: number;
  tickets: number;
}