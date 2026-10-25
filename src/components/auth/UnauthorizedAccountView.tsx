import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { SchoolLogo } from '../SchoolLogo';
import {
  ShieldAlert,
  Phone,
  Mail,
  MapPin,
  LogOut,
  Globe,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User,
  Building,
  BookOpen,
} from 'lucide-react';

export const UnauthorizedAccountView: React.FC = () => {
  const { user, userProfile, logout, setActiveView } = useAuth();
  const [showContactsModal, setShowContactsModal] = useState(false);

  const statusLabel = () => {
    const s = userProfile?.status || 'pending';
    switch (s) {
      case 'disabled':
        return {
          titleSw: 'Akaunti Imesitishwa (Account Disabled)',
          badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
        };
      case 'rejected':
        return {
          titleSw: 'Ombi Limekataliwa (Registration Rejected)',
          badgeColor: 'bg-red-100 text-red-800 border-red-300',
        };
      case 'pending':
      default:
        return {
          titleSw: 'Inasubiri Idhini ya Utawala (Pending Approval)',
          badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
        };
    }
  };

  const status = statusLabel();

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-[#102A43] flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Top Bar with School Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <SchoolLogo className="w-12 h-12 rounded-xl shadow-xs" />
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#102A43] tracking-tight">
              SHULE YA SEKONDARI UOMBONI
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-600 font-medium">
              NECTA S0486 &bull; Jimbo Katoliki la Moshi &bull; Marangu, Kilimanjaro
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveView('website')}
          className="text-xs font-bold text-[#102A43] hover:text-[#C9A227] flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#C9A227] transition-all cursor-pointer bg-white"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Tovuti Kuu</span>
        </button>
      </header>

      {/* Main Notice Box */}
      <main className="max-w-2xl mx-auto w-full my-8 bg-white border-2 border-amber-400/80 rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-6">
        {/* Warning Icon Badge */}
        <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-amber-50 border-2 border-amber-400 flex items-center justify-center text-amber-600 shadow-inner">
          <ShieldAlert className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>

        {/* Mandatory Header */}
        <div className="space-y-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${status.badgeColor}`}>
            {status.titleSw}
          </span>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-[#102A43] tracking-tight font-serif uppercase">
            HUJAIDHINISHWA KUTUMIA MFUMO
          </h1>
        </div>

        {/* Mandatory Exact Quote */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 sm:p-5 text-left text-sm sm:text-base text-slate-800 leading-relaxed font-medium">
          <p className="font-semibold text-[#102A43] mb-1">
            Taarifa ya Ulinzi wa Mfumo wa Ndani:
          </p>
          <p>
            Akaunti yako haijaidhinishwa kutumia mfumo wa ndani wa Uomboni Secondary School. Tafadhali wasiliana na uongozi wa shule ili kuthibitisha utambulisho wako na kupewa ruhusa zinazostahili.
          </p>
        </div>

        {/* Authenticated Identity Details */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-left space-y-1.5 text-slate-700">
          <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs sm:text-sm">
            <User className="w-4 h-4 text-[#102A43]" />
            <span>Utambulisho wa Akaunti Yako:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-slate-500 block text-[11px]">Jina Kamili:</span>
              <span className="font-semibold text-slate-900">{userProfile?.fullName || user?.displayName || 'Mtumiaji Mpya'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Barua Pepe (Email):</span>
              <span className="font-mono font-medium text-slate-900">{user?.email || userProfile?.email || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Firebase UID:</span>
              <span className="font-mono text-[10px] text-slate-600 truncate block">{user?.uid || userProfile?.uid || '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Jukumu Lililoombwa / Role:</span>
              <span className="font-bold uppercase text-[#102A43]">{userProfile?.role || 'student'}</span>
            </div>
          </div>
        </div>

        {/* Official Contacts Details Box */}
        <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-white text-left space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#102A43] flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#C9A227]" />
            <span>Mawasiliano Rasmi ya Uongozi wa Shule:</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <a
              href="tel:0767207688"
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-2.5 text-slate-800"
            >
              <Phone className="w-3.5 h-3.5 text-[#102A43] shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Simu Kuu ya Shule</span>
                <span className="font-bold text-[#102A43]">0767 207 688</span>
              </div>
            </a>

            <a
              href="tel:+255782558127"
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-2.5 text-slate-800"
            >
              <Phone className="w-3.5 h-3.5 text-[#102A43] shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Mkuu wa Shule (Headmaster)</span>
                <span className="font-bold text-[#102A43]">+255 782 558 127</span>
              </div>
            </a>

            <a
              href="tel:+255745548225"
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-2.5 text-slate-800"
            >
              <Phone className="w-3.5 h-3.5 text-[#102A43] shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Mkuu wa Taaluma (Academic Master)</span>
                <span className="font-bold text-[#102A43]">+255 745 548 225</span>
              </div>
            </a>

            <a
              href="mailto:uombonisecondary@gmail.com"
              className="p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors flex items-center gap-2.5 text-slate-800"
            >
              <Mail className="w-3.5 h-3.5 text-[#102A43] shrink-0" />
              <div>
                <span className="block text-[10px] text-slate-500 uppercase font-bold">Barua Pepe Rasmi</span>
                <span className="font-bold text-[#102A43] truncate block">uombonisecondary@gmail.com</span>
              </div>
            </a>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="tel:0767207688"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Phone className="w-4 h-4 text-[#C9A227]" />
            <span>Piga Simu Uongozini</span>
          </a>

          <button
            onClick={() => logout()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-800 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-600" />
            <span>Toka Kwenye Akaunti (Logout)</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 pt-4 border-t border-slate-200">
        Shule ya Sekondari Uomboni &bull; Elimu ni Maisha &mdash; Tujiendeleze Sisi Wenyewe &bull; S.L.P 361 Marangu, Moshi Vijijini
      </footer>
    </div>
  );
};
