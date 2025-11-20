import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Trophy, Users, Clock, Gift, Shield, Zap } from 'lucide-react';
import PiAuth from '@/components/PiAuth';
import RaffleHeader from '@/components/RaffleHeader';
import TicketPackages from '@/components/TicketPackages';
import LeaderBoard from '@/components/LeaderBoard';
import WinnersHistory from '@/components/WinnersHistory';
import Footer from '@/components/Footer';
import { User } from '@/types/raffle';
import { raffleAPI } from '@/lib/api';

export default function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = raffleAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleAuthChange = (newUser: User | null) => {
    setUser(newUser);
  };

  const handleTicketPurchase = () => {
    // Trigger refresh of components that depend on user data
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Welcome to <span className="text-yellow-300">RafflePi</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-purple-100">
              Weekly Pi Network Raffles with Instant Payouts
            </p>
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
                <Trophy className="h-4 w-4 mr-2" />
                50% Winner Prize
              </Badge>
              <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
                <Clock className="h-4 w-4 mr-2" />
                Weekly Draws
              </Badge>
              <Badge className="bg-white/20 text-white px-4 py-2 text-sm">
                <Shield className="h-4 w-4 mr-2" />
                Pi Network Secure
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Current Raffle Status */}
        <div className="mb-12">
          <RaffleHeader key={refreshTrigger} />
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column - Auth & Tickets */}
          <div className="lg:col-span-1 space-y-6">
            <PiAuth onAuthChange={handleAuthChange} />
            {user && (
              <TicketPackages 
                user={user} 
                onPurchase={handleTicketPurchase}
                key={refreshTrigger}
              />
            )}
          </div>

          {/* Right Column - Leaderboard & Winners */}
          <div className="lg:col-span-2 space-y-6">
            <LeaderBoard key={refreshTrigger} />
            <WinnersHistory key={refreshTrigger} />
          </div>
        </div>

        {/* How It Works Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Gift className="h-6 w-6 text-purple-600" />
              How RafflePi Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">1. Connect & Buy</h3>
                <p className="text-sm text-muted-foreground">
                  Connect your Pi Network wallet and purchase raffle tickets. Each ticket costs 0.20π with a maximum of 100 tickets per raffle.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">2. Weekly Draw</h3>
                <p className="text-sm text-muted-foreground">
                  Every Sunday at 12:00 PM EST, we randomly select a winner from all ticket holders. New raffles start at 1:00 PM EST.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">3. Instant Payout</h3>
                <p className="text-sm text-muted-foreground">
                  Winners receive 50% of the total pot instantly to their Pi Network wallet. The remaining 50% supports the platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Section */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Why Choose RafflePi?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Secure & Transparent</h4>
                    <p className="text-sm text-muted-foreground">Built on Pi Network with transparent smart contracts and fair random selection.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="h-5 w-5 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Instant Payouts</h4>
                    <p className="text-sm text-muted-foreground">Winners receive their prizes immediately after each draw.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Fair Play</h4>
                    <p className="text-sm text-muted-foreground">Weekly limits ensure everyone has an equal chance to win.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Trophy className="h-5 w-5 text-yellow-600 mt-1" />
                  <div>
                    <h4 className="font-semibold">Growing Prizes</h4>
                    <p className="text-sm text-muted-foreground">Prize pools grow throughout the week as more participants join.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator className="my-8" />

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-purple-600">1,250π</div>
            <div className="text-sm text-muted-foreground">Total Distributed</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-blue-600">47</div>
            <div className="text-sm text-muted-foreground">Happy Winners</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-green-600">2,340</div>
            <div className="text-sm text-muted-foreground">Tickets Sold</div>
          </Card>
          <Card className="text-center p-4">
            <div className="text-2xl font-bold text-yellow-600">12</div>
            <div className="text-sm text-muted-foreground">Weeks Running</div>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}