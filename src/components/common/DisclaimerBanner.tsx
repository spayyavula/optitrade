import React, { useState } from 'react';
import { AlertTriangle, X, ExternalLink, RotateCcw } from 'lucide-react';

const DisclaimerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  const resetDisclaimer = () => {
    localStorage.removeItem('optionsworld-disclaimer-accepted');
    localStorage.removeItem('optionsworld-disclaimer-date');
    window.location.reload();
  };

  if (!isVisible) return null;

  return (
    <div className="bg-warning-900 border-l-4 border-warning-500 p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="text-warning-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="text-warning-300 font-medium mb-2">Educational Platform Reminder</h3>
          <div className="text-warning-200 text-sm space-y-2">
            <p>
              <strong>This is a simulation for educational purposes only.</strong> All data and trading features are simulated. 
              OptionsWorld is not a broker and cannot execute real trades.
            </p>
            <div className="flex items-center gap-4 mt-3">
              <a 
                href="#" 
                className="text-warning-300 hover:text-warning-200 underline flex items-center text-xs"
              >
                Read Full Risk Disclosure
                <ExternalLink size={12} className="ml-1" />
              </a>
              <button
                onClick={resetDisclaimer}
                className="text-warning-300 hover:text-warning-200 underline flex items-center text-xs"
              >
                <RotateCcw size={12} className="mr-1" />
                Review Disclaimer
              </button>
            </div>
          </div>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-warning-400 hover:text-warning-300 ml-4"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
};

export default DisclaimerBanner;