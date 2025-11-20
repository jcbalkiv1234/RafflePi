import { RaffleState, User, Purchase, Winner, TicketPackage, LeaderboardEntry } from '@/types/raffle';
import { raffleScheduler } from './raffleScheduler';

// Platform wallet address for receiving all pot funds
const PLATFORM_WALLET_ADDRESS = 'GARP7BPENHKOOOHVVNAARZRV2TEKC22Y7V7YQ77V5F6LUWGWORE6I3OP';

// Simulated backend API using localStorage
class RaffleAPI {
  private static instance: RaffleAPI;
  
  static getInstance(): RaffleAPI {
    if (!RaffleAPI.instance) {
      RaffleAPI.instance = new RaffleAPI();
    }
    return RaffleAPI.instance;
  }

  // Initialize default data
  private initializeData() {
    if (!localStorage.getItem('raffleState')) {
      const defaultRaffle: RaffleState = {
        currentPot: 1250.75,
        endTime: raffleScheduler.getNextRaffleEnd(),
        totalTickets: 0,
        isActive: true
      };
      localStorage.setItem('raffleState', JSON.stringify(defaultRaffle));
    }

    if (!localStorage.getItem('users')) {
      localStorage.setItem('users', JSON.stringify([]));
    }

    if (!localStorage.getItem('purchases')) {
      localStorage.setItem('purchases', JSON.stringify([]));
    }

    if (!localStorage.getItem('winners')) {
      const defaultWinners: Winner[] = [
        {
          id: '1',
          username: 'PiMiner123',
          amount: 892.50,
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last Sunday
          raffleId: 'raffle-1'
        },
        {
          id: '2',
          username: 'CryptoKing',
          amount: 654.25,
          timestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 Sundays ago
          raffleId: 'raffle-2'
        }
      ];
      localStorage.setItem('winners', JSON.stringify(defaultWinners));
    }

    if (!localStorage.getItem('lastRaffleCheck')) {
      localStorage.setItem('lastRaffleCheck', new Date().toISOString());
    }

    if (!localStorage.getItem('currentRaffleId')) {
      localStorage.setItem('currentRaffleId', `raffle-${Date.now()}`);
    }

    // Initialize platform transactions log
    if (!localStorage.getItem('platformTransactions')) {
      localStorage.setItem('platformTransactions', JSON.stringify([]));
    }
  }

  constructor() {
    this.initializeData();
    this.checkRaffleSchedule();
  }

  // Check and handle raffle schedule
  private checkRaffleSchedule() {
    const lastCheck = new Date(localStorage.getItem('lastRaffleCheck') || new Date().toISOString());
    const now = new Date();
    
    // Only check once per minute to avoid excessive processing
    if (now.getTime() - lastCheck.getTime() < 60000) {
      return;
    }

    localStorage.setItem('lastRaffleCheck', now.toISOString());

    // Check if it's time to end current raffle and select winner
    if (raffleScheduler.isRaffleEndTime()) {
      this.handleRaffleEnd();
    }

    // Check if it's time to start new raffle
    if (raffleScheduler.isRaffleStartTime()) {
      this.handleRaffleStart();
    }

    // Update raffle end time if needed
    this.updateRaffleEndTime();
  }

  // Handle raffle end (Sunday 12pm EST)
  private async handleRaffleEnd() {
    try {
      const raffleState = this.getRaffleState();
      if (raffleState.isActive) {
        // Send entire pot to platform wallet first
        await this.sendEntirePotToPlatform();
        
        // Select winner if there are tickets sold
        const purchases: Purchase[] = JSON.parse(localStorage.getItem('purchases') || '[]');
        const currentRaffleId = localStorage.getItem('currentRaffleId') || `raffle-${Date.now()}`;
        const currentRafflePurchases = purchases.filter(p => p.raffleId === currentRaffleId);
        
        if (currentRafflePurchases.length > 0) {
          await this.selectWinner();
        }
        
        // Mark raffle as inactive
        this.updateRaffleState({ isActive: false });
        
        // Reset weekly limits for all users when raffle ends
        this.resetAllUserWeeklyLimits();
      }
    } catch (error) {
      console.error('Error handling raffle end:', error);
    }
  }

  // Send entire pot (100%) to platform wallet
  private async sendEntirePotToPlatform() {
    try {
      const raffleState = this.getRaffleState();
      const currentRaffleId = localStorage.getItem('currentRaffleId') || `raffle-${Date.now()}`;
      
      // Calculate entire pot amount (100% goes to platform wallet)
      const entirePotAmount = Math.floor(raffleState.currentPot * 100) / 100;
      
      if (entirePotAmount > 0) {
        // Log platform transaction for entire pot
        const platformTransactions = JSON.parse(localStorage.getItem('platformTransactions') || '[]');
        const transaction = {
          id: Date.now().toString(),
          raffleId: currentRaffleId,
          amount: entirePotAmount,
          walletAddress: PLATFORM_WALLET_ADDRESS,
          timestamp: new Date(),
          type: 'pot_collection'
        };
        
        platformTransactions.push(transaction);
        localStorage.setItem('platformTransactions', JSON.stringify(platformTransactions));
        
        // In a real implementation, this would trigger the actual Pi Network transaction
        console.log(`Platform pot collection: ${entirePotAmount.toFixed(2)}π sent to ${PLATFORM_WALLET_ADDRESS}`);
      }
    } catch (error) {
      console.error('Error sending entire pot to platform:', error);
    }
  }

  // Send winner payout from platform wallet (this would be done manually from platform wallet)
  private async sendWinnerPayout(winnerAmount: number, winnerUserId: string) {
    try {
      const currentRaffleId = localStorage.getItem('currentRaffleId') || `raffle-${Date.now()}`;
      
      // Log platform transaction for winner payout (from platform wallet to winner)
      const platformTransactions = JSON.parse(localStorage.getItem('platformTransactions') || '[]');
      const transaction = {
        id: Date.now().toString(),
        raffleId: currentRaffleId,
        amount: -winnerAmount, // Negative amount indicates outgoing payment
        walletAddress: PLATFORM_WALLET_ADDRESS,
        timestamp: new Date(),
        type: 'winner_payout',
        recipientUserId: winnerUserId
      };
      
      platformTransactions.push(transaction);
      localStorage.setItem('platformTransactions', JSON.stringify(platformTransactions));
      
      // In a real implementation, this would trigger the actual Pi Network transaction from platform wallet to winner
      console.log(`Winner payout: ${winnerAmount.toFixed(2)}π sent from platform wallet ${PLATFORM_WALLET_ADDRESS} to winner`);
    } catch (error) {
      console.error('Error logging winner payout:', error);
    }
  }

  // Handle raffle start (Sunday 1pm EST)
  private handleRaffleStart() {
    // Generate new raffle ID
    const newRaffleId = `raffle-${Date.now()}`;
    localStorage.setItem('currentRaffleId', newRaffleId);

    // Reset for new raffle week - start with small base pot
    this.updateRaffleState({
      currentPot: 50.00, // Start new raffle with base pot
      endTime: raffleScheduler.getNextRaffleEnd(),
      totalTickets: 0,
      isActive: true,
      winnerId: undefined,
      winnerAmount: undefined
    });

    // Note: We don't clear purchases anymore, just filter by raffleId
    // Weekly limits were already reset when the previous raffle ended
  }

  // Reset weekly limits for all users
  private resetAllUserWeeklyLimits() {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const resetUsers = users.map(user => ({
      ...user,
      weeklyTicketsUsed: 0,
      weeklyPiSpent: 0,
      lastWeeklyReset: new Date()
    }));
    localStorage.setItem('users', JSON.stringify(resetUsers));
  }

  // Update raffle end time to next Sunday if needed
  private updateRaffleEndTime() {
    const raffleState = this.getRaffleState();
    const nextRaffleEnd = raffleScheduler.getNextRaffleEnd();
    
    // If current end time is in the past, update to next Sunday
    if (raffleState.endTime < new Date()) {
      this.updateRaffleState({ endTime: nextRaffleEnd });
    }
  }

  // Get current raffle ID
  private getCurrentRaffleId(): string {
    return localStorage.getItem('currentRaffleId') || `raffle-${Date.now()}`;
  }

  // Get user's current raffle ticket purchases
  private getUserCurrentRafflePurchases(userId: string): Purchase[] {
    const purchases: Purchase[] = JSON.parse(localStorage.getItem('purchases') || '[]');
    const currentRaffleId = this.getCurrentRaffleId();
    
    return purchases.filter(purchase => 
      purchase.userId === userId && 
      purchase.raffleId === currentRaffleId
    );
  }

  // Calculate remaining weekly tickets for user (resets when raffle ends)
  getUserWeeklyLimit(userId: string): { ticketsUsed: number; ticketsRemaining: number; piSpent: number; piRemaining: number } {
    const currentRafflePurchases = this.getUserCurrentRafflePurchases(userId);
    const ticketsUsed = currentRafflePurchases.reduce((sum, purchase) => sum + purchase.tickets, 0);
    const piSpent = currentRafflePurchases.reduce((sum, purchase) => sum + purchase.amount, 0);
    
    const WEEKLY_TICKET_LIMIT = 100;
    const WEEKLY_PI_LIMIT = 20;
    
    return {
      ticketsUsed,
      ticketsRemaining: Math.max(0, WEEKLY_TICKET_LIMIT - ticketsUsed),
      piSpent,
      piRemaining: Math.max(0, WEEKLY_PI_LIMIT - piSpent)
    };
  }

  // Ticket packages - updated to respect weekly limits
  getTicketPackages(): TicketPackage[] {
    return [
      {
        id: 'starter',
        name: 'Starter',
        price: 5,
        tickets: 25, // 25 tickets for 5 Pi (0.2 Pi per ticket)
        color: 'bg-blue-500'
      },
      {
        id: 'standard',
        name: 'Standard',
        price: 10,
        tickets: 50, // 50 tickets for 10 Pi (0.2 Pi per ticket)
        color: 'bg-green-500'
      },
      {
        id: 'plus',
        name: 'Plus',
        price: 15,
        tickets: 75, // 75 tickets for 15 Pi (0.2 Pi per ticket)
        color: 'bg-purple-500',
        popular: true
      },
      {
        id: 'premium',
        name: 'Premium',
        price: 20,
        tickets: 100, // 100 tickets for 20 Pi (0.2 Pi per ticket) - Max weekly
        color: 'bg-orange-500'
      }
    ];
  }

  // Get available packages for user based on weekly limits
  getAvailablePackages(userId: string): TicketPackage[] {
    const allPackages = this.getTicketPackages();
    const { ticketsRemaining, piRemaining } = this.getUserWeeklyLimit(userId);
    
    return allPackages.filter(pkg => 
      pkg.tickets <= ticketsRemaining && pkg.price <= piRemaining
    );
  }

  // Get current raffle state
  getRaffleState(): RaffleState {
    this.checkRaffleSchedule(); // Check schedule on every state access
    
    const state = localStorage.getItem('raffleState');
    if (state) {
      const parsed = JSON.parse(state);
      parsed.endTime = new Date(parsed.endTime);
      return parsed;
    }
    throw new Error('Raffle state not found');
  }

  // Update raffle state
  updateRaffleState(state: Partial<RaffleState>): void {
    const currentState = this.getRaffleState();
    const updatedState = { ...currentState, ...state };
    localStorage.setItem('raffleState', JSON.stringify(updatedState));
  }

  // Get current user (simulated)
  getCurrentUser(): User | null {
    const userId = localStorage.getItem('currentUserId');
    if (!userId) return null;
    
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    return users.find(u => u.id === userId) || null;
  }

  // Create or login user (Pi Network simulation)
  async authenticateWithPi(piId: string, username: string): Promise<User> {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    let user = users.find(u => u.piId === piId);
    
    if (!user) {
      user = {
        id: Date.now().toString(),
        username,
        piId,
        ticketsPurchased: 0,
        totalSpent: 0,
        winnings: 0,
        weeklyTicketsUsed: 0,
        weeklyPiSpent: 0,
        lastWeeklyReset: new Date()
      };
      users.push(user);
      localStorage.setItem('users', JSON.stringify(users));
    }
    
    localStorage.setItem('currentUserId', user.id);
    return user;
  }

  // Purchase tickets with weekly limit validation
  async purchaseTickets(packageId: string): Promise<Purchase> {
    const user = this.getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const packages = this.getTicketPackages();
    const selectedPackage = packages.find(p => p.id === packageId);
    if (!selectedPackage) throw new Error('Package not found');

    // Check if raffle is active
    const raffleState = this.getRaffleState();
    if (!raffleState.isActive) {
      throw new Error('Raffle is not currently active. New raffle starts Sunday at 1pm EST.');
    }

    // Check if we're in winner announcement period
    if (raffleScheduler.isWinnerAnnouncementPeriod()) {
      throw new Error('Raffle is ending soon! Winner will be announced at 12pm EST. New raffle starts at 1pm EST.');
    }

    // Check weekly limits (now based on current raffle, not calendar week)
    const { ticketsRemaining, piRemaining } = this.getUserWeeklyLimit(user.id);
    
    if (selectedPackage.tickets > ticketsRemaining) {
      throw new Error(`Weekly ticket limit exceeded. You can only buy ${ticketsRemaining} more tickets this raffle period.`);
    }
    
    if (selectedPackage.price > piRemaining) {
      throw new Error(`Weekly Pi limit exceeded. You can only spend ${piRemaining.toFixed(2)}π more this raffle period.`);
    }

    // Simulate Pi Network payment
    await new Promise(resolve => setTimeout(resolve, 1000));

    const currentRaffleId = this.getCurrentRaffleId();
    const purchase: Purchase = {
      id: Date.now().toString(),
      userId: user.id,
      packageId,
      tickets: selectedPackage.tickets,
      amount: selectedPackage.price,
      timestamp: new Date(),
      raffleId: currentRaffleId
    };

    // Update purchases
    const purchases: Purchase[] = JSON.parse(localStorage.getItem('purchases') || '[]');
    purchases.push(purchase);
    localStorage.setItem('purchases', JSON.stringify(purchases));

    // Update user stats
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.id === user.id);
    if (userIndex !== -1) {
      users[userIndex].ticketsPurchased += selectedPackage.tickets;
      users[userIndex].totalSpent += selectedPackage.price;
      users[userIndex].weeklyTicketsUsed = (users[userIndex].weeklyTicketsUsed || 0) + selectedPackage.tickets;
      users[userIndex].weeklyPiSpent = (users[userIndex].weeklyPiSpent || 0) + selectedPackage.price;
      localStorage.setItem('users', JSON.stringify(users));
    }

    // Update raffle state
    this.updateRaffleState({
      currentPot: raffleState.currentPot + selectedPackage.price,
      totalTickets: raffleState.totalTickets + selectedPackage.tickets
    });

    return purchase;
  }

  // Get leaderboard
  getLeaderboard(): LeaderboardEntry[] {
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const purchases: Purchase[] = JSON.parse(localStorage.getItem('purchases') || '[]');
    const currentRaffleId = this.getCurrentRaffleId();
    
    // Calculate current raffle tickets for each user
    const currentRaffleTickets: Record<string, number> = {};
    
    purchases
      .filter(p => p.raffleId === currentRaffleId)
      .forEach(purchase => {
        currentRaffleTickets[purchase.userId] = (currentRaffleTickets[purchase.userId] || 0) + purchase.tickets;
      });

    // Create leaderboard based on current raffle tickets
    const leaderboardUsers = users
      .map(user => ({
        user,
        tickets: currentRaffleTickets[user.id] || 0
      }))
      .filter(entry => entry.tickets > 0)
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 10);

    return leaderboardUsers.map((entry, index) => ({
      user: entry.user,
      rank: index + 1,
      tickets: entry.tickets
    }));
  }

  // Get winners history
  getWinners(): Winner[] {
    const winners: Winner[] = JSON.parse(localStorage.getItem('winners') || '[]');
    return winners.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Select winner (automated function)
  async selectWinner(): Promise<Winner> {
    const raffleState = this.getRaffleState();
    const users: User[] = JSON.parse(localStorage.getItem('users') || '[]');
    const purchases: Purchase[] = JSON.parse(localStorage.getItem('purchases') || '[]');
    const currentRaffleId = this.getCurrentRaffleId();

    // Get all tickets from current raffle
    const currentRafflePurchases = purchases.filter(p => p.raffleId === currentRaffleId);
    
    const tickets: string[] = [];
    currentRafflePurchases.forEach(purchase => {
      for (let i = 0; i < purchase.tickets; i++) {
        tickets.push(purchase.userId);
      }
    });

    if (tickets.length === 0) {
      // No tickets sold this raffle, no winner to pay out
      return {
        id: Date.now().toString(),
        username: 'No Winner',
        amount: 0,
        timestamp: new Date(),
        raffleId: currentRaffleId
      };
    }

    // Random winner selection
    const winnerUserId = tickets[Math.floor(Math.random() * tickets.length)];
    const winnerUser = users.find(u => u.id === winnerUserId);
    if (!winnerUser) throw new Error('Winner user not found');

    const winAmount = Math.floor(raffleState.currentPot * 0.5 * 100) / 100; // 50% of pot

    const winner: Winner = {
      id: Date.now().toString(),
      username: winnerUser.username,
      amount: winAmount,
      timestamp: new Date(),
      raffleId: currentRaffleId
    };

    // Update winners
    const winners: Winner[] = JSON.parse(localStorage.getItem('winners') || '[]');
    winners.unshift(winner);
    localStorage.setItem('winners', JSON.stringify(winners));

    // Update winner's balance
    const userIndex = users.findIndex(u => u.id === winnerUserId);
    if (userIndex !== -1) {
      users[userIndex].winnings += winAmount;
      localStorage.setItem('users', JSON.stringify(users));
    }

    // Log the winner payout transaction (from platform wallet to winner)
    await this.sendWinnerPayout(winAmount, winnerUserId);

    // Update raffle state - pot will be reset to base amount in handleRaffleStart
    this.updateRaffleState({
      winnerId: winnerUserId,
      winnerAmount: winAmount
    });

    return winner;
  }

  // Get raffle schedule info
  getRaffleScheduleInfo() {
    return {
      nextEnd: raffleScheduler.getNextRaffleEnd(),
      nextStart: raffleScheduler.getNextRaffleStart(),
      timeUntilEnd: raffleScheduler.getTimeUntilRaffleEnd(),
      countdown: raffleScheduler.formatCountdown(),
      statusMessage: raffleScheduler.getRaffleStatusMessage(),
      isWinnerPeriod: raffleScheduler.isWinnerAnnouncementPeriod()
    };
  }

  // Get platform transactions (for admin/debugging purposes)
  getPlatformTransactions() {
    return JSON.parse(localStorage.getItem('platformTransactions') || '[]');
  }

  // Get platform wallet address
  getPlatformWalletAddress(): string {
    return PLATFORM_WALLET_ADDRESS;
  }
}

export const raffleAPI = RaffleAPI.getInstance();