import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Calendar, Coins } from 'lucide-react';
import { Winner } from '@/types/raffle';
import { raffleAPI } from '@/lib/api';

export default function WinnersHistory() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWinners = () => {
      try {
        const data = raffleAPI.getWinners();
        setWinners(data);
      } catch (error) {
        console.error('Failed to load winners:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWinners();
    const interval = setInterval(loadWinners, 15000); // Refresh every 15 seconds

    return () => clearInterval(interval);
  }, []);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Recent Winners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-muted rounded-lg"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (winners.length === 0) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Recent Winners
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Crown className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No winners yet.</p>
            <p className="text-sm">Be the first to win the raffle!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-6 w-6 text-yellow-500" />
          Recent Winners
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Latest raffle winners and their prizes
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {winners.slice(0, 10).map((winner, index) => (
            <div
              key={winner.id}
              className="relative overflow-hidden rounded-lg border bg-gradient-to-r from-yellow-50 to-orange-50 p-4 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {winner.username}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="h-3 w-3" />
                      {formatDate(winner.timestamp)}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xl font-bold text-green-600">
                    <Coins className="h-5 w-5" />
                    {winner.amount.toFixed(2)}π
                  </div>
                  <div className="text-sm text-gray-500">
                    {getTimeAgo(winner.timestamp)}
                  </div>
                </div>
              </div>

              {index === 0 && (
                <div className="absolute top-2 right-2">
                  <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                    Latest Winner! 🎉
                  </Badge>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>🏆 Winners are selected randomly from all ticket holders</p>
          <p>💰 Each winner receives 50% of the total pot</p>
        </div>
      </CardContent>
    </Card>
  );
}