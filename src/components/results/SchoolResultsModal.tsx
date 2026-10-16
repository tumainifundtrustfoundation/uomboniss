import React from 'react';
import { X, FileText } from 'lucide-react';
import { ResultsPortal } from '../ResultsPortal';

interface SchoolResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenParentPortal?: () => void;
}

export const SchoolResultsModal: React.FC<SchoolResultsModalProps> = ({
  isOpen,
  onClose,
  onOpenParentPortal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#102A43]/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col border border-[#102A43]/20 overflow-hidden">
        {/* Header */}
        <div className="bg-[#102A43] text-white px-5 py-4 flex items-center justify-between border-b border-[#C9A227]/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-[#FFFFF0]/10 flex items-center justify-center text-[#C9A227]">
              <FileText className="w-5 h-5 text-[#C9A227]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                School Examination Results &amp; Reports
              </h2>
              <p className="text-xs text-[#FFFFF0]/80">
                Uomboni Secondary School · Continuous Assessment &amp; Terminal Broadsheets
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#FFFFF0]/80 hover:text-white rounded hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#FFFFF0]">
          <ResultsPortal
            onOpenParentPortal={() => {
              onClose();
              if (onOpenParentPortal) onOpenParentPortal();
            }}
          />
        </div>
      </div>
    </div>
  );
};
