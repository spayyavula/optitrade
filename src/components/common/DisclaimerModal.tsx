import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, ExternalLink, Check } from 'lucide-react';

interface DisclaimerModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ isOpen, onAccept }) => {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadRisks, setHasReadRisks] = useState(false);
  const [hasReadDisclaimer, setHasReadDisclaimer] = useState(false);
  const [canProceed, setCanProceed] = useState(false);

  useEffect(() => {
    setCanProceed(hasReadTerms && hasReadRisks && hasReadDisclaimer);
  }, [hasReadTerms, hasReadRisks, hasReadDisclaimer]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-neutral-700">
        <div className="bg-gradient-to-r from-warning-900 to-error-900 p-6 border-b border-neutral-700">
          <div className="flex items-center">
            <AlertTriangle className="text-warning-400 mr-3" size={32} />
            <div>
              <h2 className="text-2xl font-bold text-white">Important Legal Disclaimer</h2>
              <p className="text-warning-200 mt-1">Please read and acknowledge before proceeding</p>
            </div>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-6">
            {/* Educational Platform Notice */}
            <div className="bg-primary-900/30 border border-primary-700 p-4 rounded-lg">
              <div className="flex items-start">
                <Shield className="text-primary-400 mr-3 mt-1 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-primary-300 mb-2">Educational Platform Only</h3>
                  <div className="text-neutral-200 space-y-2 text-sm">
                    <p>
                      <strong>OptionsWorld is NOT a broker-dealer, investment advisor, or financial institution.</strong> 
                      We provide educational tools, market simulations, and informational content only.
                    </p>
                    <p>
                      All trading features are simulated for educational purposes. We cannot and do not execute real trades, 
                      hold funds, or provide investment advice.
                    </p>
                  </div>
                  <label className="flex items-center mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasReadDisclaimer}
                      onChange={(e) => setHasReadDisclaimer(e.target.checked)}
                      className="mr-2 w-4 h-4 text-primary-600 bg-neutral-700 border-neutral-600 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-primary-300">I understand this is an educational platform only</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Trading Risks */}
            <div className="bg-error-900/30 border border-error-700 p-4 rounded-lg">
              <div className="flex items-start">
                <AlertTriangle className="text-error-400 mr-3 mt-1 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-error-300 mb-2">Options Trading Risks</h3>
                  <div className="text-neutral-200 space-y-2 text-sm">
                    <p>
                      <strong>Options trading involves substantial risk of loss.</strong> You can lose your entire investment 
                      and potentially more than your initial investment.
                    </p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Options can expire worthless, resulting in 100% loss</li>
                      <li>Complex strategies may have unlimited loss potential</li>
                      <li>Market volatility can cause rapid price changes</li>
                      <li>Time decay works against option buyers</li>
                      <li>Liquidity issues may prevent timely exits</li>
                    </ul>
                    <p>
                      <strong>Only trade with money you can afford to lose completely.</strong> 
                      Past performance does not guarantee future results.
                    </p>
                  </div>
                  <label className="flex items-center mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasReadRisks}
                      onChange={(e) => setHasReadRisks(e.target.checked)}
                      className="mr-2 w-4 h-4 text-error-600 bg-neutral-700 border-neutral-600 rounded focus:ring-error-500"
                    />
                    <span className="text-sm text-error-300">I understand the risks of options trading</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Data and Liability */}
            <div className="bg-warning-900/30 border border-warning-700 p-4 rounded-lg">
              <div className="flex items-start">
                <ExternalLink className="text-warning-400 mr-3 mt-1 flex-shrink-0" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-warning-300 mb-2">Data Accuracy & Liability</h3>
                  <div className="text-neutral-200 space-y-2 text-sm">
                    <p>
                      Market data displayed may be delayed, simulated, or inaccurate. Always verify prices and information 
                      with your licensed broker before making any trading decisions.
                    </p>
                    <p>
                      <strong>OptionsWorld disclaims all liability</strong> for any losses, damages, or decisions made 
                      based on information provided on this platform.
                    </p>
                    <p>
                      We are not responsible for system outages, data errors, or any technical issues that may affect 
                      your use of the platform.
                    </p>
                  </div>
                  <label className="flex items-center mt-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasReadTerms}
                      onChange={(e) => setHasReadTerms(e.target.checked)}
                      className="mr-2 w-4 h-4 text-warning-600 bg-neutral-700 border-neutral-600 rounded focus:ring-warning-500"
                    />
                    <span className="text-sm text-warning-300">I understand the data limitations and liability terms</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Professional Advice Notice */}
            <div className="bg-neutral-750 border border-neutral-600 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-200 mb-2">Seek Professional Advice</h3>
              <p className="text-neutral-300 text-sm">
                Before making any investment decisions, consult with a licensed financial advisor, tax professional, 
                or attorney. Consider your financial situation, investment objectives, and risk tolerance.
              </p>
            </div>

            {/* Regulatory Notice */}
            <div className="bg-neutral-750 border border-neutral-600 p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-neutral-200 mb-2">Regulatory Information</h3>
              <p className="text-neutral-300 text-sm">
                OptionsWorld is not registered with the SEC, FINRA, CFTC, or any other regulatory body as an investment advisor 
                or broker-dealer. We do not provide personalized investment advice or recommendations.
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-neutral-750 p-6 border-t border-neutral-700">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-neutral-400">
              By proceeding, you acknowledge that you have read, understood, and agree to these terms.
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-ghost px-6 py-2"
              >
                Exit
              </button>
              <button
                onClick={onAccept}
                disabled={!canProceed}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  canProceed
                    ? 'bg-primary-600 hover:bg-primary-700 text-white'
                    : 'bg-neutral-600 text-neutral-400 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center">
                  <Check size={18} className="mr-2" />
                  I Agree - Enter Platform
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal;