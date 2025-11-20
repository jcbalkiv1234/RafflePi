// Raffle Scheduler - Handles automatic raffle timing and winner selection
export class RaffleScheduler {
  private static instance: RaffleScheduler;
  
  static getInstance(): RaffleScheduler {
    if (!RaffleScheduler.instance) {
      RaffleScheduler.instance = new RaffleScheduler();
    }
    return RaffleScheduler.instance;
  }

  // Get next Sunday at 12pm EST
  getNextRaffleEnd(): Date {
    const now = new Date();
    const nextSunday = new Date(now);
    
    // Find next Sunday
    const daysUntilSunday = (7 - now.getDay()) % 7;
    if (daysUntilSunday === 0 && now.getDay() === 0) {
      // If it's Sunday, check if it's before 12pm EST
      const currentEST = this.convertToEST(now);
      if (currentEST.getHours() >= 12) {
        // After 12pm on Sunday, go to next Sunday
        nextSunday.setDate(now.getDate() + 7);
      }
    } else {
      nextSunday.setDate(now.getDate() + daysUntilSunday);
    }
    
    // Set to 12pm EST (convert to UTC)
    nextSunday.setHours(17, 0, 0, 0); // 12pm EST = 5pm UTC (standard time)
    
    return nextSunday;
  }

  // Get next Sunday at 1pm EST (raffle start time)
  getNextRaffleStart(): Date {
    const raffleEnd = this.getNextRaffleEnd();
    const raffleStart = new Date(raffleEnd);
    raffleStart.setHours(18, 0, 0, 0); // 1pm EST = 6pm UTC (standard time)
    return raffleStart;
  }

  // Convert UTC time to EST
  convertToEST(utcDate: Date): Date {
    const est = new Date(utcDate);
    est.setHours(est.getHours() - 5); // EST is UTC-5 (standard time)
    return est;
  }

  // Convert EST time to UTC
  convertToUTC(estDate: Date): Date {
    const utc = new Date(estDate);
    utc.setHours(utc.getHours() + 5); // Convert EST to UTC
    return utc;
  }

  // Check if it's time to end current raffle (Sunday 12pm EST)
  isRaffleEndTime(): boolean {
    const now = new Date();
    const currentEST = this.convertToEST(now);
    
    return (
      currentEST.getDay() === 0 && // Sunday
      currentEST.getHours() === 12 && // 12pm
      currentEST.getMinutes() === 0 // Exactly 12:00pm
    );
  }

  // Check if it's time to start new raffle (Sunday 1pm EST)
  isRaffleStartTime(): boolean {
    const now = new Date();
    const currentEST = this.convertToEST(now);
    
    return (
      currentEST.getDay() === 0 && // Sunday
      currentEST.getHours() === 13 && // 1pm
      currentEST.getMinutes() === 0 // Exactly 1:00pm
    );
  }

  // Get time until next raffle end
  getTimeUntilRaffleEnd(): {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } {
    const now = new Date();
    const raffleEnd = this.getNextRaffleEnd();
    const diff = raffleEnd.getTime() - now.getTime();

    if (diff <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  }

  // Format countdown display
  formatCountdown(): string {
    const time = this.getTimeUntilRaffleEnd();
    
    if (time.days > 0) {
      return `${time.days}d ${time.hours}h ${time.minutes}m`;
    } else if (time.hours > 0) {
      return `${time.hours}h ${time.minutes}m ${time.seconds}s`;
    } else {
      return `${time.minutes}m ${time.seconds}s`;
    }
  }

  // Get raffle status message
  getRaffleStatusMessage(): string {
    const now = new Date();
    const currentEST = this.convertToEST(now);
    const dayName = currentEST.toLocaleDateString('en-US', { weekday: 'long' });
    
    if (currentEST.getDay() === 0) { // Sunday
      if (currentEST.getHours() === 12 && currentEST.getMinutes() < 60) {
        return "🎉 Winner Selection in Progress! Check back at 1pm EST for the next raffle.";
      } else if (currentEST.getHours() === 13 && currentEST.getMinutes() === 0) {
        return "🚀 New Raffle Starting Now! Get your tickets for this week's draw!";
      }
    }
    
    return `📅 Current raffle ends this Sunday at 12pm EST • Today is ${dayName}`;
  }

  // Check if we're in the winner announcement period (Sunday 12pm-1pm EST)
  isWinnerAnnouncementPeriod(): boolean {
    const now = new Date();
    const currentEST = this.convertToEST(now);
    
    return (
      currentEST.getDay() === 0 && // Sunday
      currentEST.getHours() === 12 // Between 12pm-1pm EST
    );
  }
}

export const raffleScheduler = RaffleScheduler.getInstance();