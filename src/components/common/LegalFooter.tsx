import React from 'react';
import { Shield, AlertCircle, ExternalLink } from 'lucide-react';

const LegalFooter: React.FC = () => {
  return (
    <div className="bg-neutral-850 border-t border-neutral-700 p-6 mt-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="flex items-start">
            <Shield className="text-primary-400 mr-3 mt-1 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-neutral-200 mb-2">Not Financial Advice</h4>
              <p className="text-sm text-neutral-400">
                OptionsWorld provides educational tools only. We are not licensed financial advisors, 
                broker-dealers, or investment advisors. All content is for informational purposes.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <AlertCircle className="text-warning-400 mr-3 mt-1 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-neutral-200 mb-2">Trading Risks</h4>
              <p className="text-sm text-neutral-400">
                Options trading involves substantial risk of loss. You may lose your entire investment. 
                Only trade with money you can afford to lose. Past performance does not predict future results.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <ExternalLink className="text-secondary-400 mr-3 mt-1 flex-shrink-0" size={20} />
            <div>
              <h4 className="font-medium text-neutral-200 mb-2">Data Sources</h4>
              <p className="text-sm text-neutral-400">
                Market data may be delayed or simulated. Always verify prices with your broker. 
                OptionsWorld is not responsible for data accuracy or trading decisions.
              </p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-neutral-700 pt-4">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-neutral-500">
            <p>
              OptionsWorld © {new Date().getFullYear()} | Educational Platform Only | Not a Registered Investment Advisor
            </p>
            <div className="flex space-x-4 mt-2 md:mt-0">
              <a href="#" className="hover:text-neutral-300">Risk Disclosure</a>
              <a href="#" className="hover:text-neutral-300">Terms of Service</a>
              <a href="#" className="hover:text-neutral-300">Privacy Policy</a>
              <a href="#" className="hover:text-neutral-300">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LegalFooter;