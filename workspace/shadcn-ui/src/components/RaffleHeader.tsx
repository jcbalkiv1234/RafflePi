import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Trophy, Calendar, AlertCircle } from 'lucide-react';
import { raffleAPI } from '@/lib/api';
import { RaffleState } from '@/types/raffle';

interface RaffleScheduleInfo {
  nextEnd: Date;
  nextStart: Date;
  timeUntilEnd: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
  countdown: string;
  statusMessage: string;
  isWinnerPeriod: boolean;
}

export default function RaffleHeader() {
  const [raffleState, setRaffleState] = useState<RaffleState | null>(null);
  const [scheduleInfo, setScheduleInfo] = useState<RaffleScheduleInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateRaffleData = () => {
      try {
        const state = raffleAPI.getRaffleState();
        const schedule = raffleAPI.getRaffleScheduleInfo();
        setRaffleState(state);
        setScheduleInfo(schedule);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching raffle data:', error);
        setLoading(false);
      }
    };

    // Initial load
    updateRaffleData();

    // Update every second for countdown
    const interval = setInterval(updateRaffleData, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-4">
        <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-white/20 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-12 bg-white/20 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-2xl">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Header */}
            <div className="flex items-center justify-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-300" />
              <h1 className="text-4xl font-bold">RafflePi</h1>
              <Trophy className="h-8 w-8 text-yellow-300" />
            </div>

            {/* Status Badge */}
            <div className="flex justify-center">
              {scheduleInfo?.isWinnerPeriod ? (
                <Badge className="bg-yellow-500 text-yellow-900 px-4 py-2 text-lg font-semibold">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Winner Selection in Progress
                </Badge>
              ) : raffleState?.isActive ? (
                <Badge className="bg-green-500 text-green-900 px-4 py-2 text-lg font-semibold animate-pulse">
                  <div className="w-3 h-3 bg-green-300 rounded-full mr-2 animate-ping"></div>
                  Live Raffle
                </Badge>
              ) : (
                <Badge className="bg-red-500 text-red-900 px-4 py-2 text-lg font-semibold">
                  Raffle Ended
                </Badge>
              )}
            </div>

            {/* Current Pot */}
            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="text-lg text-white/80 mb-2">Current Pot</div>
              <div className="text-5xl font-bold text-yellow-300 mb-2">
                {raffleState?.currentPot?.toFixed(2) || '0.00'}π
              </div>
              <div className="text-sm text-white/70">
                Winner gets {((raffleState?.currentPot || 0) * 0.5).toFixed(2)}π (50%)
              </div>
            </div>

            {/* Countdown and Schedule */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Countdown */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Clock className="h-5 w-5 text-white/80" />
                  <span className="text-white/80 font-medium">Time Remaining</span>
                </div>
                <div className="text-2xl font-bold text-center">
                  {scheduleInfo?.countdown || '0m 0s'}
                </div>
              </div>

              {/* Total Tickets */}
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Trophy className="h-5 w-5 text-white/80" />
                  <span className="text-white/80 font-medium">Total Tickets</span>
                </div>
                <div className="text-2xl font-bold text-center">
                  {raffleState?.totalTickets?.toLocaleString() || '0'}
                </div>
              </div>
            </div>

            {/* Schedule Information */}
            <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-white/80" />
                <span className="text-white/80 font-medium">Raffle Schedule</span>
              </div>
              <div className="text-center space-y-2">
                <div className="text-sm text-white/90">
                  {scheduleInfo?.statusMessage || 'Loading schedule...'}
                </div>
                <div className="text-xs text-white/70 space-y-1">
                  <div>🏆 Winner announced: Every Sunday at 12:00pm EST</div>
                  <div>🚀 New raffle starts: Every Sunday at 1:00pm EST</div>
                  <div>🎫 Weekly limits reset: When each raffle ends (Sunday 12pm EST)</div>
                </div>
              </div>
            </div>

            {/* Winner Announcement Period Message */}
            {scheduleInfo?.isWinnerPeriod && (
              <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-xl p-4">
                <div className="flex items-center justify-center gap-2 text-yellow-100">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">Winner Selection in Progress</span>
                </div>
                <div className="text-sm text-yellow-200 mt-2">
                  The current raffle has ended. Winner will be announced shortly!
                  <br />
                  New raffle starts at 1:00pm EST with fresh weekly limits.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}