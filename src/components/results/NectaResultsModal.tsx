import React from 'react';
import { X, Award, ExternalLink } from 'lucide-react';
import { NectaResultsOfficialView } from '../NectaResultsOfficialView';

interface NectaResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NectaResultsModal: React.FC<NectaResultsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102A43]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-[#102A43]/20 overflow-hidden">
        {/* Header */}
        <div className="bg-[#102A43] text-white px-5 py-4 flex items-center justify-between border-b border-[#C9A227]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#FFFFF0]/10 flex items-center justify-center text-[#C9A227]">
              <Award className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                NECTA National Examination Results (Centre S0486)
              </h2>
              <p className="text-xs text-[#FFFFF0]/80">
                Official National Examination Records · CSEE &amp; FTNA
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.necta.go.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-white/10 hover:bg-white/20 text-[#FFFFF0] rounded border border-white/20 transition-colors"
            >
              <span>NECTA Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-1.5 text-[#FFFFF0]/80 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FFFFF0]">
          <NectaResultsOfficialView />
        </div>
      </div>
    </div>
  );
};
