import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Ticket, Star, AlertTriangle, Clock } from 'lucide-react';
import { TicketPackage } from '@/types/raffle';
import { raffleAPI } from '@/lib/api';
import { toast } from 'sonner';

// Pi Network SDK types
interface PiPayment {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  from_address: string;
  to_address: string;
  direction: string;
  network: string;
  status: {
    developer_approved: boolean;
    transaction_verified: boolean;
    developer_completed: boolean;
    cancelled: boolean;
    user_cancelled: boolean;
  };
  transaction?: {
    txid: string;
    verified: boolean;
    _link: string;
  };
}

interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
}

interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, payment?: PiPayment) => void;
}

declare global {
  interface Window {
    Pi: {
      createPayment: (paymentData: PiPaymentData, callbacks: PiPaymentCallbacks) => void;
    };
  }
}

interface TicketPackagesProps {
  onPurchaseSuccess?: () => void;
}

export default function TicketPackages({ onPurchaseSuccess }: TicketPackagesProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [weeklyLimits, setWeeklyLimits] = useState<{
    ticketsUsed: number;
    ticketsRemaining: number;
    piSpent: number;
    piRemaining: number;
  } | null>(null);
  const [availablePackages, setAvailablePackages] = useState<TicketPackage[]>([]);

  useEffect(() => {
    const user = raffleAPI.getCurrentUser();
    if (user) {
      const limits = raffleAPI.getUserWeeklyLimit(user.id);
      setWeeklyLimits(limits);
      const packages = raffleAPI.getAvailablePackages(user.id);
      setAvailablePackages(packages);
    }
  }, []);

  const handlePiPayment = async (packageId: string, amount: number, tickets: number) => {
    if (!window.Pi) {
      toast.error('Pi Network SDK not available');
      return false;
    }

    return new Promise<boolean>((resolve) => {
      window.Pi.createPayment({
        amount: amount,
        memo: `RafflePi - ${tickets} tickets`,
        metadata: { 
          packageId, 
          tickets,
          raffleApp: 'RafflePi',
          timestamp: new Date().toISOString()
        }
      }, {
        onReadyForServerApproval: (paymentId) => {
          console.log('Payment approved:', paymentId);
          // In a real app, you would verify this payment on your server
          toast.success('Payment approved! Processing tickets...');
          resolve(true);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          console.log('Payment completed:', paymentId, txid);
          toast.success('Payment completed successfully!');
          resolve(true);
        },
        onCancel: (paymentId) => {
          console.log('Payment cancelled:', paymentId);
          toast.info('Payment cancelled');
          resolve(false);
        },
        onError: (error, payment) => {
          console.error('Payment error:', error, payment);
          toast.error('Payment failed: ' + error.message);
          resolve(false);
        }
      });
    });
  };

  const handlePurchase = async (packageId: string) => {
    const user = raffleAPI.getCurrentUser();
    if (!user) {
      toast.error('Please connect your Pi wallet first!');
      return;
    }

    const selectedPackage = availablePackages.find(p => p.id === packageId);
    if (!selectedPackage) {
      toast.error('Package not found');
      return;
    }

    setLoading(packageId);
    try {
      // Process Pi Network payment
      const paymentSuccess = await handlePiPayment(
        packageId, 
        selectedPackage.price, 
        selectedPackage.tickets
      );

      if (paymentSuccess) {
        // Process the ticket purchase after successful payment
        await raffleAPI.purchaseTickets(packageId);
        toast.success(`Successfully purchased ${selectedPackage.tickets} tickets for ${selectedPackage.price}π!`);
        
        // Update weekly limits after purchase
        const limits = raffleAPI.getUserWeeklyLimit(user.id);
        setWeeklyLimits(limits);
        const packages = raffleAPI.getAvailablePackages(user.id);
        setAvailablePackages(packages);
        
        onPurchaseSuccess?.();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to purchase tickets. Please try again.');
      console.error('Purchase error:', error);
    } finally {
      setLoading(null);
    }
  };

  const allPackages = raffleAPI.getTicketPackages();

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Choose Your Ticket Package</h2>
        <p className="text-muted-foreground">Weekly limit: 100 tickets for 20π • Rate: 0.2π per ticket</p>
        <p className="text-sm text-orange-600 mt-1">💳 Payments processed through Pi Network</p>
      </div>

      {/* Weekly Limits Display */}
      {weeklyLimits && (
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">Weekly Usage</h3>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                Resets Monday
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Tickets Used</span>
                  <span className="text-sm font-bold text-blue-600">
                    {weeklyLimits.ticketsUsed} / 100
                  </span>
                </div>
                <Progress 
                  value={(weeklyLimits.ticketsUsed / 100) * 100} 
                  className="h-2 mb-1"
                />
                <p className="text-xs text-gray-600">
                  {weeklyLimits.ticketsRemaining} tickets remaining
                </p>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Pi Spent</span>
                  <span className="text-sm font-bold text-purple-600">
                    {weeklyLimits.piSpent.toFixed(2)}π / 20.00π
                  </span>
                </div>
                <Progress 
                  value={(weeklyLimits.piSpent / 20) * 100} 
                  className="h-2 mb-1"
                />
                <p className="text-xs text-gray-600">
                  {weeklyLimits.piRemaining.toFixed(2)}π remaining
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning if limits reached */}
      {weeklyLimits && (weeklyLimits.ticketsRemaining === 0 || weeklyLimits.piRemaining === 0) && (
        <Card className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Weekly Limit Reached</span>
            </div>
            <p className="text-sm text-orange-700 mt-1">
              You've reached your weekly limit. New tickets will be available next Monday.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {allPackages.map((pkg) => {
          const isAvailable = availablePackages.some(ap => ap.id === pkg.id);
          const isDisabled = !isAvailable || loading !== null;
          
          return (
            <Card 
              key={pkg.id} 
              className={`relative transition-all duration-300 ${
                isAvailable ? 'hover:scale-105 hover:shadow-lg' : 'opacity-60'
              } ${
                pkg.popular && isAvailable ? 'ring-2 ring-purple-500 shadow-purple-200' : ''
              }`}
            >
              {pkg.popular && isAvailable && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-3 py-1 flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto rounded-full ${pkg.color} flex items-center justify-center mb-3 ${
                  !isAvailable ? 'opacity-50' : ''
                }`}>
                  <Ticket className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
              </CardHeader>

              <CardContent className="text-center space-y-4">
                <div>
                  <div className="text-3xl font-bold text-primary">
                    {pkg.price}π
                  </div>
                  <div className="text-sm text-muted-foreground">
                    0.2π per ticket
                  </div>
                </div>

                <div className="bg-muted rounded-lg p-3">
                  <div className="text-2xl font-bold text-green-600">
                    {pkg.tickets}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Tickets
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Win chance: ~{((pkg.tickets / 1000) * 100).toFixed(2)}%*
                </div>

                <Button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={isDisabled}
                  className={`w-full ${
                    isAvailable ? `${pkg.color} hover:opacity-90 text-white border-0` : 'bg-gray-400'
                  }`}
                  size="lg"
                >
                  {loading === pkg.id ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing Pi Payment...
                    </>
                  ) : !isAvailable ? (
                    'Limit Reached'
                  ) : (
                    `Buy ${pkg.tickets} Tickets`
                  )}
                </Button>

                {!isAvailable && weeklyLimits && (
                  <div className="text-xs text-red-600">
                    {pkg.tickets > weeklyLimits.ticketsRemaining 
                      ? `Need ${pkg.tickets - weeklyLimits.ticketsRemaining} more tickets`
                      : `Need ${(pkg.price - weeklyLimits.piRemaining).toFixed(2)}π more Pi`
                    }
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center text-xs text-muted-foreground">
        * Win chance is estimated based on 1000 total tickets. Actual odds depend on total tickets sold.
        <br />
        Weekly limits reset every Monday at 00:00 UTC. All payments are processed securely through Pi Network.
        <br />
        <span className="text-orange-600">⚠️ Currently in sandbox mode - for testing purposes only</span>
      </div>
    </div>
  );
}