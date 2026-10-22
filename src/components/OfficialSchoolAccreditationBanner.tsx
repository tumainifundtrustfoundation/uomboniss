import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  Building2,
  Phone,
  ExternalLink,
  Award,
  CreditCard,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface OfficialSchoolAccreditationBannerProps {
  onOpenResults?: () => void;
  onOpenAdmissions?: () => void;
}

export const OfficialSchoolAccreditationBanner: React.FC<OfficialSchoolAccreditationBannerProps> = ({
  onOpenResults,
  onOpenAdmissions,
}) => {
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);
  const [showFullBankDetails, setShowFullBankDetails] = useState(false);

  const copyToClipboard = (text: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedAccount(label);
      setTimeout(() => setCopiedAccount(null), 3000);
    } catch {}
  };

  return (
    <section className="w-full bg-gradient-to-b from-[#0B1E32] to-[#102A43] text-white border-y-2 border-[#C9A227]/40 shadow-lg relative overflow-hidden">
      
      {/* Decorative background watermark */}
      <div className="absolute right-0 top-0 bottom-0 w-96 opacity-5 pointer-events-none flex items-center justify-center">
        <SchoolLogo size="lg" className="w-full h-full object-contain" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
        
        {/* Top Header Badge */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-white/10">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#C9A227] to-amber-200 text-slate-950 flex items-center justify-center shadow-md shrink-0 border border-amber-300">
              <ShieldCheck className="w-7 h-7 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-black uppercase tracking-wider">
                  ✓ Imethibitishwa Kisheria (Government Verified)
                </span>
                <span className="text-xs text-amber-300 font-bold">
                  NECTA Centre S0486
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
                Uthibitisho Rasmi wa Shule &amp; Tahadhari Dhidi ya Utapeli
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <a
              href="https://www.necta.go.tz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-[#FFFFF0] border border-white/20 transition-colors"
            >
              <span>Uhakiki wa NECTA (necta.go.tz)</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#C9A227]" />
            </a>
            {onOpenResults && (
              <button
                onClick={onOpenResults}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#C9A227] hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                <Award className="w-3.5 h-3.5 text-slate-950" />
                <span>Matokeo Rasmi ya Shule</span>
              </button>
            )}
          </div>
        </div>

        {/* 3 Pillars of Authenticity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-b border-white/10">
          
          {/* Pillar 1: Legal Registration */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-2 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-[#C9A227]">
              <Building2 className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Usajili wa Kiserikali
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Shule ya Sekondari Uomboni imesajiliwa kisheria na <strong>Wizara ya Elimu, Sayansi na Teknolojia</strong> (Usajili Na. S.0486). Ni kituo rasmi cha mitihani ya Kitaifa ya Kidato cha Pili (FTNA) na Kidato cha Nne (CSEE).
            </p>
            <div className="text-[11px] text-amber-200/90 font-medium pt-1">
              • Jimbo Katoliki la Moshi · Parokia ya Marangu
            </div>
          </div>

          {/* Pillar 2: Anti-Fraud Fee Warning */}
          <div className="bg-amber-950/30 rounded-xl p-5 border border-amber-500/30 space-y-2 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-amber-400">
              <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Tahadhari ya Ada (Anti-Fraud)
              </h3>
            </div>
            <p className="text-xs text-amber-100/90 leading-relaxed">
              <strong>ZINGATIA:</strong> Shule <span className="underline font-bold text-amber-300">HAINA</span> namba ya simu binafsi ya mtu ya kutuma ada (M-Pesa / TigoPesa). Malipo yote yanalipwa kwenye <strong>Akaunti Rasmi ya Benki ya Shule pekee</strong> au ofisi ya Mhasibu shuleni Marangu.
            </p>
            <div className="text-[11px] text-emerald-300 font-bold pt-1">
              ✓ Usilipe kwa namba ya simu ya mtu yeyote!
            </div>
          </div>

          {/* Pillar 3: Verified Direct Contacts */}
          <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-2 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-[#C9A227]">
              <Phone className="w-5 h-5 shrink-0" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Mawasiliano Rasmi ya Moja kwa Moja
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ili kuthibitisha udahili au malipo yoyote, wasiliana moja kwa moja na ofisi kuu ya shule au viongozi:
            </p>
            <div className="space-y-1 text-xs text-slate-200 font-mono pt-1">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Simu Kuu ya Shule:</span>
                <span className="font-bold text-amber-300">0767 207 688</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Mkuu wa Shule (Headmaster):</span>
                <span className="font-bold text-white">+255 782 558 127</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Mhasibu wa Shule (Bursar):</span>
                <span className="font-bold text-white">+255 752 000 939</span>
              </div>
            </div>
          </div>

        </div>

        {/* Official Bank Account Details Toggle */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <CreditCard className="w-4 h-4 text-[#C9A227]" />
            <span>Akaunti Rasmi ya Benki ya Shule: <strong className="text-white">CRDB Bank (A/C: 0150283084300 - UOMBONI SECONDARY SCHOOL)</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => copyToClipboard('0150283084300', 'crdb')}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-white/10 hover:bg-white/20 text-xs font-semibold text-white border border-white/20 transition-colors cursor-pointer"
            >
              {copiedAccount === 'crdb' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Imenakiliwa!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Nakili Namba ya Akaunti</span>
                </>
              )}
            </button>

            <button
              onClick={() => setShowFullBankDetails(!showFullBankDetails)}
              className="inline-flex items-center gap-1 text-xs text-[#C9A227] hover:text-amber-300 font-bold cursor-pointer"
            >
              <span>{showFullBankDetails ? 'Ficha Maelezo' : 'Tazama Maelezo Kamili ya Malipo'}</span>
              {showFullBankDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Detailed Bank Card Dropdown */}
        {showFullBankDetails && (
          <div className="mt-4 p-5 rounded-xl bg-white/10 border border-[#C9A227]/30 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
              <span className="text-[11px] font-bold uppercase text-[#C9A227] tracking-wider block">
                Akaunti Kuu ya Shule (CRDB Bank)
              </span>
              <div className="text-sm font-black text-white">
                0150283084300
              </div>
              <div className="text-xs text-slate-300 font-medium">
                Jina la Akaunti: <strong>UOMBONI SECONDARY SCHOOL</strong>
              </div>
              <div className="text-xs text-slate-400">
                Tawi: Moshi / Marangu · Malipo yote ya ada ya masomo na mabweni
              </div>
            </div>

            <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-1">
              <span className="text-[11px] font-bold uppercase text-[#C9A227] tracking-wider block">
                Uthibitisho wa Risiti
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                Baada ya kulipa benki, mzazi au mlezi anapewa risiti rasmi ya kielektroniki kutoka ofisi ya Mhasibu wa shule au kupitia portal ya mzazi kwa kupakia picha ya slip ya benki.
              </p>
              <div className="text-[11px] text-amber-200">
                Mawasiliano ya Mhasibu: +255 752 000 939 (Mwl. Sigbert Minja)
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
