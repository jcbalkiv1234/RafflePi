import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 py-6 border-t border-gray-200 bg-white/50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © 2025 RafflePi. All rights reserved.
          </div>
          
          <div className="flex space-x-6 text-sm">
            <Link 
              to="/privacy-policy" 
              className="text-muted-foreground hover:text-purple-600 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              to="/terms-of-service" 
              className="text-muted-foreground hover:text-purple-600 transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
        
        <div className="mt-4 text-xs text-center text-muted-foreground">
          RafflePi operates on Pi Network. Please gamble responsibly.
        </div>
      </div>
    </footer>
  );
}