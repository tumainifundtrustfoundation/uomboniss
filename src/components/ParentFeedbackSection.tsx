import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  MessageSquare,
  Send,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  MessageCircle,
  MessageSquareText
} from 'lucide-react';

export const ParentFeedbackSection: React.FC = () => {
  const { language } = useLanguage();
  const { submitInquiry } = useData();

  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [studentName, setStudentName] = useState('');
  const [category, setCategory] = useState<'Kujiunga na Shule' | 'Malipo na Ada' | 'Matokeo na Taaluma' | 'Maoni ya Jumla' | 'Nidhamu na Bweni'>('Kujiunga na Shule');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submittedTicket, setSubmittedTicket] = useState<string | null>(null);

  const getFormattedMessage = () => {
    const lines = [
      `HABARI UOMBONI SECONDARY SCHOOL`,
      `Kutoka: ${parentName || 'Mzazi/Mlezi'}`,
      `Simu: ${parentPhone || 'Hajaweka'}`,
      `Idara: ${category}`,
      subject ? `Mada: ${subject}` : '',
      `Ujumbe: ${message}`
    ].filter(Boolean);
    return lines.join('\n');
  };

  const handleSendViaSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!parentName.trim() || !parentPhone.trim() || !message.trim()) {
      alert(language === 'sw' ? 'Tafadhali jaza jina lako, namba ya simu na ujumbe kabla ya kutuma.' : 'Please enter your name, phone number, and message.');
      return;
    }

    const newFeedback = submitInquiry({
      parentName,
      phone: parentPhone,
      email: parentEmail || 'N/A',
      studentName: studentName || 'N/A',
      form: 'Kidato cha Kwanza',
      category,
      message: `${subject ? `[${subject}] ` : ''}${message}`,
    });

    setSubmittedTicket(newFeedback.id);

    // Formatted text for native SMS messenger
    const fullBody = getFormattedMessage();
    const smsUrl = `sms:+255782558127?body=${encodeURIComponent(fullBody)}`;
    window.location.href = smsUrl;
  };

  const handleSendViaWhatsApp = () => {
    if (!parentName.trim() || !parentPhone.trim() || !message.trim()) {
      alert(language === 'sw' ? 'Tafadhali jaza jina lako, namba ya simu na ujumbe kwanza.' : 'Please fill in name, phone, and message first.');
      return;
    }

    submitInquiry({
      parentName,
      phone: parentPhone,
      email: parentEmail || 'N/A',
      studentName: studentName || 'N/A',
      form: 'Kidato cha Kwanza',
      category,
      message: `${subject ? `[${subject}] ` : ''}${message}`,
    });

    const fullBody = getFormattedMessage();
    const waUrl = `https://wa.me/255754889001?text=${encodeURIComponent(fullBody)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0b2545] text-xs font-bold border border-blue-200">
            <MessageSquare className="w-3.5 h-3.5 text-blue-800" />
            <span>{language === 'sw' ? 'Wasiliana Nasi & Tuma Ujumbe' : 'Contact Us & Send Inquiries'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {language === 'sw' ? (
              <>
                Tuko Hapa Kwa Ajili Yako •{' '}
                <span className="text-[#0b2545]">Uomboni Secondary</span>
              </>
            ) : (
              <>
                We Are Here for You •{' '}
                <span className="text-[#0b2545]">Get in Touch</span>
              </>
            )}
          </h2>
          <p className="text-sm sm:text-base text-slate-600">
            {language === 'sw'
              ? 'Tuma ujumbe wako moja kwa moja kupitia Messenger ya simu (SMS), WhatsApp, au namba rasmi za uongozi wa shule.'
              : 'Send your message directly via your phone\'s SMS messenger, WhatsApp, or official administrative phone lines.'}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Card (Col 5) */}
          <div className="lg:col-span-5 bg-[#0b2545] text-white rounded-xl p-6 sm:p-8 border border-blue-900 shadow-xs space-y-6">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest block font-mono">
                MAWASILIANO RASMI YA SHULE
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white">
                Uomboni Secondary School
              </h3>
              <p className="text-xs text-slate-300">
                Jimbo Katoliki Moshi • Marangu Magharibi (NECTA S0486)
              </p>
            </div>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-white/5 border border-white/10">
                <MapPin className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 block">
                    {language === 'sw' ? 'Anwani ya Shule:' : 'Physical Address:'}
                  </span>
                  <span className="text-slate-300 text-xs leading-relaxed">
                    Kijiji cha Uomboni, Kata ya Marangu Magharibi, Wilaya ya Moshi Vijijini, Mkoa wa Kilimanjaro, Tanzania. (S.L.P 361 Marangu).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-white/5 border border-white/10">
                <Phone className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 block">
                    {language === 'sw' ? 'Namba za Simu za Ofisi:' : 'Phone Lines:'}
                  </span>
                  <div className="text-slate-300 text-xs space-y-0.5 font-mono">
                    <p>+255 745 548 225 (Mtaaluma Mkuu / Academic Master)</p>
                    <p>+255 752 000 939 (Mhasibu wa Shule / Bursar)</p>
                    <p>+255 782 558 127 (Mkuu wa Shule / Headmaster)</p>
                    <p>+255 754 532 949 (Udahili & Makamu Mkuu wa Shule)</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-white/5 border border-white/10">
                <Mail className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 block">
                    {language === 'sw' ? 'Barua Pepe Rasmi:' : 'Official Email Addresses:'}
                  </span>
                  <div className="text-slate-300 text-xs space-y-0.5">
                    <p>info@uombonisec.sc.tz</p>
                    <p>headmaster@uombonisec.sc.tz</p>
                    <p>admissions@uombonisec.sc.tz</p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-lg bg-white/5 border border-white/10">
                <Clock className="w-5 h-5 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 block">
                    {language === 'sw' ? 'Saa za Kazi & Mapokezi:' : 'Office Working Hours:'}
                  </span>
                  <span className="text-slate-300 text-xs">
                    Jumatatu – Ijumaa: Saa 1:30 Asubuhi – Saa 10:30 Jioni
                    <br />
                    Jumamosi: Saa 2:00 Asubuhi – Saa 6:00 Mchana
                  </span>
                </div>
              </div>
            </div>

            {/* Direct Instant Action Links: SMS Messenger & WhatsApp */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href="sms:+255782558127?body=Habari%20Shule%20ya%20Sekondari%20Uomboni%2C%20ninaomba%20msaada%20wa..."
                className="w-full py-3 px-3.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all"
                title="Tuma Ujumbe kwa Messenger ya Simu (SMS)"
              >
                <MessageSquareText className="w-4 h-4 text-white" />
                <span>{language === 'sw' ? 'Tuma SMS ya Simu' : 'Send SMS (Phone)'}</span>
              </a>

              <a
                href="https://wa.me/255754889001?text=Habari%20Uomboni%20Secondary%20School%2C%20ninaomba%20msaada%20wa..."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 px-3.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all border border-blue-600"
                title="WhatsApp Uomboni Secondary"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Direct Interactive Inquiry Form (Col 7) */}
          <div className="lg:col-span-7 bg-slate-50 rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            {submittedTicket && (
              <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 text-slate-800 flex items-start gap-3 animate-in fade-in">
                <CheckCircle2 className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <span className="font-bold text-sm block text-[#0b2545]">
                    {language === 'sw' ? 'Ujumbe Wako Umepokelewa Kikamilifu!' : 'Your Message Has Been Received!'}
                  </span>
                  <p>
                    {language === 'sw'
                      ? `Tiketi namba: ${submittedTicket}. Messenger ya simu imefunguliwa au unaweza kuwasiliana nasi moja kwa moja.`
                      : `Ticket Reference: ${submittedTicket}. Phone messenger is launched or contact us directly.`}
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSendViaSMS} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Jina Kamili la Mzazi / Mlezi *' : 'Your Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Mfano: Peter Mushi"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Namba ya Simu ya Mkononi *' : 'Mobile Phone Number *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="Mfano: 0754 123 456"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0b2545] font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Barua Pepe (Email)' : 'Email Address'}
                  </label>
                  <input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="mzazi@example.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0b2545]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Aina ya Ujumbe / Idara' : 'Inquiry Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0b2545]"
                  >
                    <option value="Kujiunga na Shule">Udahili na Fomu za Kujiunga 2026</option>
                    <option value="Matokeo na Taaluma">Taaluma na Matokeo ya Mtihani</option>
                    <option value="Malipo na Ada">Ada na Malipo ya Shule</option>
                    <option value="Nidhamu na Bweni">Maisha ya Bweni, Nidhamu & Afya</option>
                    <option value="Maoni ya Jumla">Maoni Mengine ya Jumla</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'sw' ? 'Kichwa cha Habari (Subject)' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={language === 'sw' ? 'Mfano: Maombi ya kujiunga Kidato cha Kwanza 2026' : 'e.g. Inquiry regarding Form One admission'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'sw' ? 'Ujumbe Wako Kamili *' : 'Your Detailed Message *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={language === 'sw' ? 'Andika ujumbe au swali lako hapa kwa undani...' : 'Write your inquiry or feedback here...'}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0b2545]"
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <MessageSquareText className="w-4 h-4 text-white" />
                  <span>{language === 'sw' ? 'Fungua Messenger ya Simu (SMS)' : 'Open Phone Messenger (SMS)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSendViaWhatsApp}
                  className="w-full py-3.5 px-4 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span>{language === 'sw' ? 'Tuma kwa WhatsApp' : 'Send via WhatsApp'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
