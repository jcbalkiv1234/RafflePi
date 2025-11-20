import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
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
            <CardTitle className="text-2xl font-bold text-center">Privacy Policy</CardTitle>
            <p className="text-center text-muted-foreground">Last updated: November 1, 2025</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p className="text-muted-foreground mb-2">We collect the following information when you use RafflePi:</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Pi Network username and user ID for authentication</li>
                <li>Raffle participation data (tickets purchased, winnings)</li>
                <li>Transaction history for raffle payments</li>
                <li>Usage statistics to improve our service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>To process raffle ticket purchases and payments</li>
                <li>To maintain leaderboards and winner histories</li>
                <li>To ensure fair play and prevent fraud</li>
                <li>To improve our platform and user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Data Storage and Security</h2>
              <p className="text-muted-foreground">
                Your data is stored locally in your browser and on secure servers. We implement industry-standard 
                security measures to protect your information. We do not sell or share your personal data with 
                third parties except as required for Pi Network transactions.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Pi Network Integration</h2>
              <p className="text-muted-foreground">
                RafflePi integrates with Pi Network for authentication and payments. Your Pi Network data is 
                handled according to Pi Network's privacy policy. We only access the minimum required information 
                to provide our raffle services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>You can disconnect your Pi Network account at any time</li>
                <li>You can request deletion of your data by contacting us</li>
                <li>You can view your transaction history within the app</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this privacy policy from time to time. We will notify users of any material 
                changes by updating the "Last updated" date above.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this privacy policy, please contact us through our support channels.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}