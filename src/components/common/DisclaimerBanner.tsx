import React, { useState } from 'react';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

const DisclaimerBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-warning-900 border-l-4 border-warning-500 p-4 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="text-warning-400 mr-3 mt-0.5 flex-shrink-0" size={20} />
        <div className="flex-1">
          <h3 className="text-warning-300 font-medium mb-2">Important Disclaimer</h3>
          <div className="text-warning-200 text-sm space-y-2">
            <p>
              <strong>OptionsWorld is not a broker-dealer or financial advisor.</strong> We provide educational tools and market data for informational purposes only. 
              All trading decisions are your own responsibility.
            </p>
            <p>
              Options trading involves substantial risk and is not suitable for all investors. You may lose more than your initial investment. 
              Past performance does not guarantee future results.
            </p>
            <p>
              Market data may be delayed. Always verify prices with your broker before trading. 
              OptionsWorld is not responsible for any trading losses or decisions made using this platform.
            </p>
            <div className="flex items-center mt-3">
              <a 
                href="#" 
                className="text-warning-300 hover:text-warning-200 underline flex items-center text-xs"
              >
                Read Full Risk Disclosure
                <ExternalLink size={12} className="ml-1" />
              </a>
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