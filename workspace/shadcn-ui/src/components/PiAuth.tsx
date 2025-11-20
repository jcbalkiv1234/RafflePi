import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, User as UserIcon, LogOut, Coins } from 'lucide-react';
import { raffleAPI } from '@/lib/api';
import { User } from '@/types/raffle';

interface PiAuthProps {
  onAuthChange: (user: User | null) => void;
}

interface PiPayment {
  paymentId: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

interface PiUser {
  uid: string;
  username: string;
}

interface PiAuthResult {
  accessToken: string;
  user: PiUser;
}

declare global {
  interface Window {
    Pi: {
      init: (config: { version: string; sandbox: boolean }) => void;
      authenticate: (scopes: string[], onIncompletePaymentFound?: (payment: PiPayment) => void) => Promise<PiAuthResult>;
      createPayment: (paymentData: {
        amount: number;
        memo: string;
        metadata: Record<string, unknown>;
      }, callbacks: {
        onReadyForServerApproval: (paymentId: string) => void;
        onReadyForServerCompletion: (paymentId: string, txid: string) => void;
        onCancel: (paymentId: string) => void;
        onError: (error: Error, payment?: PiPayment) => void;
      }) => void;
    };
  }
}

export default function PiAuth({ onAuthChange }: PiAuthProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPiLoaded, setIsPiLoaded] = useState(false);
  const [weeklyLimit, setWeeklyLimit] = useState<{
    ticketsUsed: number;
    ticketsRemaining: number;
    piSpent: number;
    piRemaining: number;
  } | null>(null);

  useEffect(() => {
    // Check if user is already authenticated
    const currentUser = raffleAPI.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      onAuthChange(currentUser);
      updateWeeklyLimit(currentUser.id);
    }

    // Initialize Pi SDK
    const initializePi = () => {
      if (window.Pi) {
        window.Pi.init({ 
          version: "2.0", 
          sandbox: true // Set sandbox flag to true
        });
        setIsPiLoaded(true);
      } else {
        // Pi SDK not loaded, simulate for development
        setIsPiLoaded(true);
      }
    };

    // Load Pi SDK script
    if (!window.Pi) {
      const script = document.createElement('script');
      script.src = 'https://sdk.minepi.com/pi-sdk.js';
      script.onload = initializePi;
      script.onerror = () => {
        console.warn('Pi SDK failed to load, using simulation mode');
        setIsPiLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      initializePi();
    }
  }, [onAuthChange]);

  const updateWeeklyLimit = (userId: string) => {
    const limit = raffleAPI.getUserWeeklyLimit(userId);
    setWeeklyLimit(limit);
  };

  const handleAuth = async () => {
    setIsLoading(true);
    try {
      let piUser: PiUser;
      
      if (window.Pi && isPiLoaded) {
        // Real Pi Network authentication
        const authResult = await window.Pi.authenticate(['username', 'payments'], (payment: PiPayment) => {
          console.log('Incomplete payment found:', payment);
        });
        
        piUser = {
          uid: authResult.user.uid,
          username: authResult.user.username
        };
      } else {
        // Simulation mode for development
        const username = prompt('Enter your Pi username for testing:') || 'TestUser';
        piUser = {
          uid: `sim_${Date.now()}`,
          username: username
        };
      }

      // Authenticate with our backend
      const user = await raffleAPI.authenticateWithPi(piUser.uid, piUser.username);
      setUser(user);
      onAuthChange(user);
      updateWeeklyLimit(user.id);
    } catch (error) {
      console.error('Authentication failed:', error);
      alert('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUserId');
    setUser(null);
    setWeeklyLimit(null);
    onAuthChange(null);
  };

  if (user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <UserIcon className="h-5 w-5 text-green-600" />
            Connected to Pi Network
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">{user.username}</p>
              <p className="text-sm text-muted-foreground">Pi ID: {user.piId.slice(0, 8)}...</p>
            </div>
            <Badge className="bg-green-100 text-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              Connected
            </Badge>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">{user.ticketsPurchased}</div>
              <div className="text-xs text-muted-foreground">Total Tickets</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">{user.totalSpent.toFixed(2)}π</div>
              <div className="text-xs text-muted-foreground">Total Spent</div>
            </div>
          </div>

          {/* Weekly Limits */}
          {weeklyLimit && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-800 mb-2">Current Raffle Limits</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-blue-600">Tickets:</span> {weeklyLimit.ticketsUsed}/100
                </div>
                <div>
                  <span className="text-blue-600">Pi:</span> {weeklyLimit.piSpent.toFixed(2)}π/20
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-600">
                Remaining: {weeklyLimit.ticketsRemaining} tickets, {weeklyLimit.piRemaining.toFixed(2)}π
              </div>
            </div>
          )}

          {/* Winnings */}
          {user.winnings > 0 && (
            <div className="p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Total Winnings</span>
              </div>
              <div className="text-xl font-bold text-yellow-600">{user.winnings.toFixed(2)}π</div>
            </div>
          )}

          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="w-full"
            size="sm"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Disconnect
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-3">
        <CardTitle className="flex items-center justify-center gap-2">
          <Wallet className="h-6 w-6 text-purple-600" />
          Connect Pi Wallet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center text-sm text-muted-foreground">
          Connect your Pi Network wallet to participate in weekly raffles and purchase tickets.
        </div>
        
        <div className="space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Secure Pi Network authentication</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>100 tickets / 20π per raffle period</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <span>Instant payouts for winners</span>
          </div>
        </div>

        <Button 
          onClick={handleAuth} 
          disabled={isLoading || !isPiLoaded}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="h-4 w-4 mr-2" />
              Connect with Pi Network
            </>
          )}
        </Button>

        {!isPiLoaded && (
          <div className="text-xs text-center text-muted-foreground">
            Loading Pi Network SDK...
          </div>
        )}
      </CardContent>
    </Card>
  );
}