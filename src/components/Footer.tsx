import React, { useState } from 'react';
import { Briefcase, Mail, Phone, MapPin, Heart, Github, Twitter, Linkedin } from 'lucide-react';
import AdminLogin from './AdminLogin';

const Footer: React.FC = () => {
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [secretSequence, setSecretSequence] = useState<string[]>([]);
  const [lastKeyTime, setLastKeyTime] = useState(0);

  // Secret key sequence to access admin (Konami Code style)
  const SECRET_SEQUENCE = ['f', 'r', 'e', 's', 'h', 'e', 'r', 'h', 'u', 'b', 'a', 'd', 'm', 'i', 'n'];
  const SEQUENCE_TIMEOUT = 2000; // 2 seconds between keys

  React.useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Check if event.key exists and is a string before processing
      if (!event.key || typeof event.key !== 'string') {
        return;
      }

      const currentTime = Date.now();
      const key = event.key.toLowerCase();

      // Reset sequence if too much time has passed
      if (currentTime - lastKeyTime > SEQUENCE_TIMEOUT) {
        setSecretSequence([key]);
      } else {
        setSecretSequence(prev => [...prev, key].slice(-SECRET_SEQUENCE.length));
      }

      setLastKeyTime(currentTime);

      // Check if the secret sequence matches
      const currentSequence = [...secretSequence, key].slice(-SECRET_SEQUENCE.length);
      if (currentSequence.length === SECRET_SEQUENCE.length && 
          currentSequence.every((k, i) => k === SECRET_SEQUENCE[i])) {
        setShowAdminLogin(true);
        setSecretSequence([]);
        
        // Optional: Show a subtle notification
        const notification = document.createElement('div');
        notification.textContent = '🔐 Admin access granted';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #10B981;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      }
    };

    // Alternative method: Triple-click on logo
    let clickCount = 0;
    let clickTimer: NodeJS.Timeout;

    const handleLogoClick = () => {
      clickCount++;
      clearTimeout(clickTimer);
      
      if (clickCount === 7) { // 7 rapid clicks
        setShowAdminLogin(true);
        clickCount = 0;
        
        // Show notification
        const notification = document.createElement('div');
        notification.textContent = '🔐 Secret admin access activated';
        notification.style.cssText = `
          position: fixed;
          top: 20px;
          right: 20px;
          background: #7C3AED;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          font-weight: 500;
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
      } else {
        clickTimer = setTimeout(() => {
          clickCount = 0;
        }, 1000);
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyPress);
    const logoElement = document.querySelector('[data-admin-trigger]');
    if (logoElement) {
      logoElement.addEventListener('click', handleLogoClick);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      if (logoElement) {
        logoElement.removeEventListener('click', handleLogoClick);
      }
      clearTimeout(clickTimer);
    };
  }, [secretSequence, lastKeyTime]);

  return (
    <footer className="bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3" data-admin-trigger>
              <Briefcase className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold">FresherHub</span>
            </div>
            <p className="text-gray-300 leading-relaxed">
              AI-powered job search platform designed specifically for freshers. 
              Find jobs, optimize resumes, and accelerate your career.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>


          <div>
            <h3 className="font-bold text-lg mb-6 text-purple-300">Company</h3>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">About</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-6 text-green-300">Tools</h3>
            <ul className="space-y-3 text-gray-300">
              <li><a href="#" className="hover:text-white transition-colors">ATS Analyzer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cover Letter Writer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Salary Calculator</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Job Search</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2 text-gray-400">
              <span>&copy; 2024 FresherHub. All rights reserved.</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-400">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500" />
              <span>for freshers worldwide</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hidden Admin Login Modal */}
      {showAdminLogin && (
        <AdminLogin onClose={() => setShowAdminLogin(false)} />
      )}
    </footer>
  );
};

export default Footer;