import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to RafflePi
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Terms of Service</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: November 1, 2025</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By using RafflePi, you agree to these Terms of Service. If you do not agree to these terms, 
                please do not use our service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Service Description</h2>
              <p className="text-muted-foreground mb-2">
                RafflePi is a weekly raffle platform that operates on the Pi Network. Key features include:
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Weekly raffles with Pi cryptocurrency prizes</li>
                <li>Ticket purchasing with Pi Network payments</li>
                <li>Automated winner selection and prize distribution</li>
                <li>User limits: 100 tickets maximum, π20 maximum per raffle period</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Raffle Rules</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Raffles run weekly from Sunday 1:00 PM EST to the following Sunday 12:00 PM EST</li>
                <li>Winners are selected randomly from all valid ticket holders</li>
                <li>Winners receive 50% of the total pot, platform retains 50%</li>
                <li>Tickets are non-refundable once purchased</li>
                <li>Users must have a valid Pi Network account to participate</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. User Responsibilities</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Provide accurate Pi Network authentication information</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Not attempt to manipulate or exploit the raffle system</li>
                <li>Respect the weekly purchase limits</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Prohibited Activities</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Creating multiple accounts to circumvent limits</li>
                <li>Using automated systems or bots</li>
                <li>Attempting to hack or exploit the platform</li>
                <li>Engaging in fraudulent activities</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Platform Fees</h2>
              <p className="text-muted-foreground">
                RafflePi retains 50% of each raffle pot to cover operational costs, platform development, 
                and ensure service sustainability. This fee structure is transparent and applied to all raffles.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Disclaimers</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>RafflePi is provided "as is" without warranties</li>
                <li>We are not responsible for Pi Network service interruptions</li>
                <li>Participation in raffles involves risk of loss</li>
                <li>Past performance does not guarantee future results</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                RafflePi's liability is limited to the amount of Pi you have paid for tickets in the current 
                raffle period. We are not liable for indirect, consequential, or punitive damages.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
              <p className="text-muted-foreground">
                We reserve the right to terminate or suspend accounts that violate these terms. 
                Users may discontinue use of the service at any time.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We may update these terms from time to time. Continued use of the service after 
                changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
              <p className="text-muted-foreground">
                For questions about these Terms of Service, please contact us through our support channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}