import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { Megaphone, Sparkles, ArrowRight, X, Radio } from 'lucide-react';

interface UrgentNotificationBannerProps {
  onActionClick: (target: string) => void;
}

export const UrgentNotificationBanner: React.FC<UrgentNotificationBannerProps> = ({
  onActionClick,
}) => {
  const { language } = useLanguage();
  const { alerts, news, dismissAlert } = useData();

  const activeAlerts = alerts.filter((a) => a.active);

  // Collect items for the ticker ribbon: active urgent alerts first, then latest news titles
  const tickerItems: Array<{
    id: string;
    text: string;
    category?: string;
    isUrgent: boolean;
    action?: string;
    linkText?: string;
  }> = [];

  // Add urgent alerts
  activeAlerts.forEach((alert) => {
    tickerItems.push({
      id: `alert-${alert.id}`,
      text: language === 'sw' ? alert.messageSw : alert.messageEn,
      category: language === 'sw' ? 'HARAKA' : 'URGENT',
      isUrgent: true,
      action: alert.linkAction,
      linkText: language === 'sw' ? alert.linkTextSw : alert.linkTextEn,
    });
  });

  // Add recent news items as headline tickers
  if (news && news.length > 0) {
    news.slice(0, 5).forEach((n) => {
      tickerItems.push({
        id: `news-${n.id}`,
        text: language === 'sw' ? n.titleSw : n.titleEn,
        category: n.category,
        isUrgent: false,
        action: 'news',
      });
    });
  }

  // Fallback default message if everything was deleted
  if (tickerItems.length === 0) {
    tickerItems.push({
      id: 'default-1',
      text:
        language === 'sw'
          ? 'Nafasi za Kidato cha Kwanza 2026 na Uhamisho Ziko Wazi Shule ya Sekondari Uomboni (NECTA S0486) — Jimbo Katoliki Moshi'
          : 'Form 1 (2026) Admissions & Transfers Now Open at Uomboni Secondary School (NECTA S0486) — Catholic Diocese of Moshi',
      category: 'MATANGAZO',
      isUrgent: true,
      action: 'apply',
    });
  }

  return (
    <div
      id="top-marquee-utepe-banner"
      className="bg-[#0b2545] text-white border-b border-blue-900/80 shadow-xs relative z-30 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto flex items-center h-10 px-2 sm:px-4">
        
        {/* Left Fixed Badge (Live Announcement Indicator) */}
        <div className="flex items-center gap-1.5 shrink-0 bg-blue-700 text-white px-2.5 sm:px-3 py-1 rounded-md font-bold text-[10px] sm:text-xs shadow-xs uppercase tracking-wider mr-2 sm:mr-3 border border-blue-500/40">
          <Radio className="w-3 h-3 text-amber-300" />
          <span className="hidden xs:inline">
            {language === 'sw' ? 'MATANGAZO YA SASA' : 'LATEST NEWS'}
          </span>
          <span className="xs:hidden">
            {language === 'sw' ? 'TAARIFA' : 'NEWS'}
          </span>
        </div>

        {/* Continuous Horizontal Marquee Running Ticker */}
        <div className="flex-1 overflow-hidden relative select-none">
          <div className="animate-marquee flex items-center gap-8 sm:gap-12 text-xs font-medium text-slate-100 py-1">
            {/* Set 1 */}
            {tickerItems.map((item, idx) => (
              <div
                key={`ticker-1-${item.id}-${idx}`}
                className="flex items-center gap-2 shrink-0 cursor-pointer group"
                onClick={() => {
                  if (item.action) onActionClick(item.action);
                }}
              >
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.isUrgent
                      ? 'bg-red-700 text-white'
                      : 'bg-blue-900 text-amber-300 border border-blue-700/60'
                  }`}
                >
                  {item.isUrgent ? <Megaphone className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                  {item.category}
                </span>

                <span className="font-medium text-slate-100 group-hover:text-amber-300 transition-colors">
                  {item.text}
                </span>

                {item.linkText && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/50">
                    <span>{item.linkText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}

                <span className="text-slate-400 font-bold mx-2">•</span>
              </div>
            ))}

            {/* Set 2 (Duplicate for Seamless Infinite Marquee Loop) */}
            {tickerItems.map((item, idx) => (
              <div
                key={`ticker-2-${item.id}-${idx}`}
                className="flex items-center gap-2 shrink-0 cursor-pointer group"
                onClick={() => {
                  if (item.action) onActionClick(item.action);
                }}
              >
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                    item.isUrgent
                      ? 'bg-red-700 text-white'
                      : 'bg-blue-900 text-amber-300 border border-blue-700/60'
                  }`}
                >
                  {item.isUrgent ? <Megaphone className="w-2.5 h-2.5" /> : <Sparkles className="w-2.5 h-2.5" />}
                  {item.category}
                </span>

                <span className="font-medium text-slate-100 group-hover:text-amber-300 transition-colors">
                  {item.text}
                </span>

                {item.linkText && (
                  <span className="hidden sm:inline-flex items-center gap-0.5 text-[11px] font-bold text-amber-300 bg-blue-900/60 px-2 py-0.5 rounded border border-blue-700/50">
                    <span>{item.linkText}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                )}

                <span className="text-slate-400 font-bold mx-2">•</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action button if there is a primary urgent alert with action */}
        {activeAlerts[0]?.linkAction && (
          <button
            onClick={() => onActionClick(activeAlerts[0].linkAction!)}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 ml-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <span>
              {language === 'sw'
                ? activeAlerts[0].linkTextSw || 'Tazama'
                : activeAlerts[0].linkTextEn || 'View'}
            </span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
