import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  CreditCard,
  Building,
  Copy,
  Check,
  CheckCircle2,
  FileCheck,
  Printer,
  Sparkles,
  ShieldCheck,
  QrCode,
  ArrowRight,
  Download,
  MessageCircle,
  HelpCircle,
  Lock
} from 'lucide-react';
import { downloadFeePaymentReceiptPdf } from '../utils/pdfService';

interface FeePaymentSectionProps {
  onOpenBursar?: () => void;
}

export const FeePaymentSection: React.FC<FeePaymentSectionProps> = ({ onOpenBursar }) => {
  const { language, t } = useLanguage();
  const { bankAccounts, submitPaymentRecord, isBursarLoggedIn } = useData();

  const [copiedBankId, setCopiedBankId] = useState<string | null>(null);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [examNumber, setExamNumber] = useState('');
  const [selectedForm, setSelectedForm] = useState('Form 1');
  const [amount, setAmount] = useState('650000');
  const [paymentMethod, setPaymentMethod] = useState('CRDB Bank - 01J1079051400');
  const [transactionReference, setTransactionReference] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [submittedReceipt, setSubmittedReceipt] = useState<any | null>(null);

  // Helper to generate a pre-filled WhatsApp link with a template message for payment inquiries
  const getBursarWhatsAppUrl = (customData?: { studentName?: string; form?: string; amount?: string; ref?: string; receiptNo?: string }) => {
    const sName = customData?.studentName ?? studentName;
    const sForm = customData?.form ?? selectedForm;
    const sAmount = customData?.amount ?? amount;
    const sRef = customData?.ref ?? transactionReference;
    const sReceipt = customData?.receiptNo;

    const formattedAmount = sAmount && !isNaN(Number(sAmount)) ? Number(sAmount).toLocaleString() : sAmount;

    let messageSw = `Habari Mhasibu (Bursar Desk) - UOMBONI SECONDARY SCHOOL,\n\nNina swali / ufafanuzi kuhusu malipo ya ada ya shule:\n`;
    if (sReceipt) {
      messageSw += `• Namba ya Risiti: ${sReceipt}\n`;
    }
    if (sName) {
      messageSw += `• Jina la Mwanafunzi: ${sName}\n`;
    }
    if (sForm) {
      messageSw += `• Kidato / Darasa: ${sForm}\n`;
    }
    if (formattedAmount) {
      messageSw += `• Kiasi cha Ada (TZS): ${formattedAmount} /=\n`;
    }
    if (sRef) {
      messageSw += `• Kumbukumbu ya Muamala (TXN / Slip): ${sRef}\n`;
    }
    messageSw += `• Ufafanuzi / Ombi: Ninaomba msaada wa uthibitisho wa malipo ya ada na maelekezo ya muamala.\n\nAsante sana!`;

    let messageEn = `Hello Bursar / Accounts Desk - UOMBONI SECONDARY SCHOOL,\n\nI have an inquiry regarding school fees payment:\n`;
    if (sReceipt) {
      messageEn += `• Receipt Number: ${sReceipt}\n`;
    }
    if (sName) {
      messageEn += `• Student Name: ${sName}\n`;
    }
    if (sForm) {
      messageEn += `• Class / Form: ${sForm}\n`;
    }
    if (formattedAmount) {
      messageEn += `• Amount (TZS): ${formattedAmount} /=\n`;
    }
    if (sRef) {
      messageEn += `• Transaction / Deposit Ref: ${sRef}\n`;
    }
    messageEn += `• Inquiry / Request: Please assist with fee verification and payment clearance instructions.\n\nThank you!`;

    const text = language === 'sw' ? messageSw : messageEn;
    return `https://wa.me/255752000939?text=${encodeURIComponent(text)}`;
  };

  const handleCopy = (text: string, id: string, isBank: boolean = true) => {
    navigator.clipboard.writeText(text);
    if (isBank) {
      setCopiedBankId(id);
      setTimeout(() => setCopiedBankId(null), 2500);
    }
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName || !amount || !transactionReference || !parentPhone) {
      alert(language === 'sw' ? 'Tafadhali jaza taarifa zote zinazohitajika' : 'Please fill all required fields');
      return;
    }

    const newRecord = submitPaymentRecord({
      studentName,
      examNumber: examNumber || 'S0486/UNREGISTERED',
      form: selectedForm,
      amount: Number(amount),
      paymentMethod,
      transactionReference,
      paymentDate: new Date().toISOString().split('T')[0],
      parentPhone,
    });

    setSubmittedReceipt(newRecord);
  };

  return (
    <section id="fees" className="py-16 sm:py-20 bg-slate-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#102A43] text-xs font-semibold border border-blue-200">
            <CreditCard className="w-3.5 h-3.5 text-[#102A43]" />
            <span>{language === 'sw' ? 'Mfumo wa Malipo Mtandaoni' : 'Online Payment System'}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
            {t('fees.title')}
          </h2>
          <p className="text-sm sm:text-base text-slate-700 leading-[1.7] font-normal">
            {t('fees.subtitle')}
          </p>

          {/* Direct Action Buttons (Chat with Bursar WhatsApp + Bursar Portal) */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href={getBursarWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-chat-with-bursar-header"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer border border-[#102A43]"
              title={language === 'sw' ? 'Wasiliana na Mhasibu WhatsApp (+255 752 000 939)' : 'Chat with Bursar on WhatsApp (+255 752 000 939)'}
            >
              <MessageCircle className="w-4 h-4 text-white" />
              <span>{language === 'sw' ? 'Chat na Mhasibu (WhatsApp)' : 'Chat with Bursar (WhatsApp)'}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#0A1C2E] text-blue-100 text-[10px] font-mono font-medium">
                +255 752 000 939
              </span>
            </a>
          </div>
        </div>

        {/* Bank & Mobile Payment Channels Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Official Bank Accounts (Col 6) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <Building className="w-5 h-5 text-[#102A43]" />
              <h3 className="text-base sm:text-lg font-semibold text-[#102A43]">
                {language === 'sw' ? 'Akaunti Rasmi za Benki' : 'Official Bank Accounts'}
              </h3>
            </div>

            <div className="space-y-4">
              {bankAccounts.map((acc) => (
                <div
                  key={acc.id}
                  className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200 shadow-xs hover:border-blue-500/50 transition-all space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-[#0b2545] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                      {acc.bankName}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">{acc.type}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">
                      {language === 'sw' ? 'Jina la Akaunti' : 'Account Name'}
                    </span>
                    <div className="text-xs sm:text-sm font-bold text-slate-800">
                      {acc.accountName}
                    </div>
                  </div>

                  {/* Account Number Box with Copy Button */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-mono block">
                        {language === 'sw' ? 'Namba ya Akaunti' : 'Account Number'}
                      </span>
                      <span className="text-sm sm:text-base font-bold font-mono text-[#0b2545] tracking-wider">
                        {acc.accountNumber}
                      </span>
                    </div>

                    <button
                      onClick={() => handleCopy(acc.accountNumber, acc.id, true)}
                      className="px-3 py-1.5 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                    >
                      {copiedBankId === acc.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-amber-300" />
                          <span>{language === 'sw' ? 'Imenakiliwa' : 'Copied'}</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>{language === 'sw' ? 'Nakili' : 'Copy'}</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>{language === 'sw' ? 'Tawi' : 'Branch'}: {acc.branch}</span>
                    <span className="font-mono">SWIFT: {acc.swiftCode}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct WhatsApp Assistance Card */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0b2545] flex items-center justify-center shrink-0 border border-blue-100">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {language === 'sw' ? 'Maswali ya Malipo ya Ada?' : 'Fee Payment Inquiries?'}
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    {language === 'sw'
                      ? 'Wasiliana moja kwa moja na Mhasibu kupitia WhatsApp kwa ufafanuzi au uthibitisho.'
                      : 'Chat directly with the Bursar on WhatsApp for inquiries or payment assistance.'}
                  </p>
                </div>
              </div>
              <a
                href={getBursarWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                id="btn-chat-with-bursar-card"
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Chat na Mhasibu' : 'Chat with Bursar'}</span>
              </a>
            </div>
          </div>

          {/* Online Payment Proof Submission & Receipt Generator (Col 6) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
              <FileCheck className="w-5 h-5 text-[#0b2545]" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                {language === 'sw' ? 'Wasilisha Malipo & Pata Risiti' : 'Submit Proof & Generate Receipt'}
              </h3>
            </div>

            {submittedReceipt ? (
              /* Generated Official Digital Receipt */
              <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6 animate-in zoom-in-95 duration-200">
                <div className="text-center pb-4 border-b border-slate-200 space-y-1">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-[#0b2545] flex items-center justify-center mx-auto mb-2 border border-blue-200">
                    <CheckCircle2 className="w-7 h-7 text-[#0b2545]" />
                  </div>
                  <span className="text-[10px] font-bold text-[#0b2545] uppercase tracking-widest block">
                    UOMBONI SECONDARY SCHOOL • MARANGU
                  </span>
                  <h4 className="text-lg font-bold text-slate-900">
                    {language === 'sw' ? 'RISITI RASMI YA MALIPO YA ADA' : 'OFFICIAL FEES PAYMENT RECEIPT'}
                  </h4>
                  <p className="text-xs font-mono font-bold text-[#0b2545]">
                    {submittedReceipt.receiptNumber}
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{language === 'sw' ? 'Jina la Mwanafunzi:' : 'Student Name:'}</span>
                    <span className="font-bold text-slate-900">{submittedReceipt.studentName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{language === 'sw' ? 'Namba ya Mtihani / Kidato:' : 'Exam No / Class:'}</span>
                    <span className="font-mono font-bold text-slate-900">{submittedReceipt.examNumber} ({submittedReceipt.form})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{language === 'sw' ? 'Kiasi Kilicholipwa:' : 'Amount Paid:'}</span>
                    <span className="font-bold text-[#0b2545] text-sm">
                      TZS {(submittedReceipt?.amount ?? 0).toLocaleString()} /=
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{language === 'sw' ? 'Njia ya Malipo:' : 'Payment Channel:'}</span>
                    <span className="font-medium text-slate-800">{submittedReceipt.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{language === 'sw' ? 'Kumbukumbu ya Muamala:' : 'Transaction Reference:'}</span>
                    <span className="font-mono font-bold text-slate-900">{submittedReceipt.transactionReference}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-500">{language === 'sw' ? 'Simu ya Mzazi:' : 'Parent Contact:'}</span>
                    <span className="font-mono text-slate-800">{submittedReceipt.parentPhone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">{language === 'sw' ? 'Hali ya Muamala:' : 'Status:'}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      {submittedReceipt.status}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-center text-[11px] text-amber-900 font-medium">
                  {language === 'sw'
                    ? '⚠️ Taarifa za muamala wako zimewasilishwa. Risiti rasmi itathibitishwa na Mhasibu (Bursar) kabla ya kupakuliwa. Tuma ujumbe WhatsApp kwa uthibitisho wa haraka.'
                    : '⚠️ Your payment submission is pending verification. The official receipt will be downloadable once confirmed by the Bursar.'}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSubmittedReceipt(null)}
                    className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer"
                  >
                    {language === 'sw' ? 'Lipa Tena / Fomu Mpya' : 'Submit Another'}
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href={getBursarWhatsAppUrl({
                        studentName: submittedReceipt.studentName,
                        form: submittedReceipt.form,
                        amount: String(submittedReceipt.amount),
                        ref: submittedReceipt.transactionReference,
                        receiptNo: submittedReceipt.receiptNumber,
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      id="btn-chat-bursar-receipt"
                      className="px-4 py-2 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      title={language === 'sw' ? 'Tuma risiti hii kwa Mhasibu WhatsApp kwa uthibitisho wa papo hapo' : 'Chat with Bursar on WhatsApp with this receipt info'}
                    >
                      <MessageCircle className="w-4 h-4 text-white" />
                      <span>{language === 'sw' ? 'Thibitisha na Mhasibu WhatsApp' : 'Confirm on WhatsApp'}</span>
                    </a>

                    {submittedReceipt.status === 'Imethibitishwa' ? (
                      <button
                        type="button"
                        onClick={() => downloadFeePaymentReceiptPdf(submittedReceipt)}
                        className="px-4 py-2 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-amber-300" />
                        <span>{language === 'sw' ? 'Pakua Risiti Rasmi (PDF)' : 'Download PDF'}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2 rounded-lg bg-slate-200 text-slate-500 text-xs font-bold flex items-center gap-1.5 cursor-not-allowed opacity-80"
                        title="Inasubiri uthibitisho wa Mhasibu (Bursar) kabla ya kupakuliwa"
                      >
                        <Lock className="w-4 h-4 text-slate-400" />
                        <span>{language === 'sw' ? 'Inasubiri Uthibitisho wa Bursar' : 'Pending Bursar Verification'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Payment Submission Form */
              <form
                onSubmit={handlePaymentSubmit}
                className="bg-white rounded-xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4"
              >
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-[#0b2545] uppercase tracking-wider block">
                    {language === 'sw' ? 'Uthibitisho wa Papo Hapo' : 'Instant Online Verification'}
                  </span>
                  <p className="text-xs text-slate-500">
                    {language === 'sw'
                      ? 'Baada ya kuweka pesa benki au kulipa kwa simu, jaza fomu hii kupata risiti ya kielektroniki.'
                      : 'After depositing funds, submit this form to generate your official digital payment slip.'}
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Jina Kamili la Mwanafunzi *' : 'Student Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder={language === 'sw' ? 'Jina kamili la mwanafunzi...' : 'Student full name...'}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-800 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'sw' ? 'Namba ya Mtihani (Kama ipo)' : 'Exam No. (If known)'}
                      </label>
                      <input
                        type="text"
                        value={examNumber}
                        onChange={(e) => setExamNumber(e.target.value)}
                        placeholder="S0486/0001/2025"
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'sw' ? 'Kidato *' : 'Class/Form *'}
                      </label>
                      <select
                        value={selectedForm}
                        onChange={(e) => setSelectedForm(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                      >
                        <option value="Form 1">Kidato cha 1 (Form 1)</option>
                        <option value="Form 2">Kidato cha 2 (Form 2)</option>
                        <option value="Form 3">Kidato cha 3 (Form 3)</option>
                        <option value="Form 4">Kidato cha 4 (Form 4)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'sw' ? 'Kiasi Kilicholipwa (TZS) *' : 'Amount Paid (TZS) *'}
                      </label>
                      <input
                        type="number"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-mono font-bold text-[#0b2545]"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        {language === 'sw' ? 'Namba ya Simu ya Mzazi *' : 'Parent Phone No. *'}
                      </label>
                      <input
                        type="tel"
                        required
                        value={parentPhone}
                        onChange={(e) => setParentPhone(e.target.value)}
                        placeholder="+255 754 ..."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw' ? 'Akaunti / Mtandao Uliotumika *' : 'Channel Used *'}
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white"
                    >
                      <option value="CRDB Bank - 01J1079051400">CRDB Bank (01J1079051400)</option>
                      <option value="NMB Bank - 40302507439">NMB Bank (40302507439)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      {language === 'sw'
                        ? 'Namba ya Muamala / Risiti ya Benki (Transaction Ref) *'
                        : 'Transaction Ref / Deposit Slip Number *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                      placeholder="Mfano: TXN-984210 au QKD82910AA"
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="btn-submit-fee-payment"
                  className="w-full py-3 px-4 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <FileCheck className="w-4 h-4 text-amber-300" />
                  <span>{language === 'sw' ? 'Wasilisha Malipo & Tengeneza Risiti' : 'Submit & Generate Receipt'}</span>
                </button>

                {/* Pre-filled WhatsApp Inquiry Trigger */}
                <div className="pt-1 text-center">
                  <a
                    href={getBursarWhatsAppUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    id="btn-chat-with-bursar-form-footer"
                    className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-[#0b2545] hover:underline cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-blue-700" />
                    <span>
                      {language === 'sw'
                        ? 'Ungependa kuuliza swali kabla ya kulipa? Chat na Mhasibu WhatsApp (+255 752 000 939) →'
                        : 'Have payment questions before paying? Chat with Bursar on WhatsApp (+255 752 000 939) →'}
                    </span>
                  </a>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
