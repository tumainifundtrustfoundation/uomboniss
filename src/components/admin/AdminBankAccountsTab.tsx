import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { BankAccount } from '../../types';
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  Building,
  RotateCcw
} from 'lucide-react';
import { INITIAL_BANK_ACCOUNTS } from '../../data/initialData';

export const AdminBankAccountsTab: React.FC = () => {
  const { language } = useLanguage();
  const { bankAccounts, addBankAccount, updateBankAccount, deleteBankAccount } = useData();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [bankName, setBankName] = useState('');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [branch, setBranch] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [type, setType] = useState<BankAccount['type']>('Ada ya Shule (School Fees)');

  const resetForm = () => {
    setBankName('');
    setAccountName('');
    setAccountNumber('');
    setBranch('');
    setSwiftCode('');
    setType('Ada ya Shule (School Fees)');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (acc: BankAccount) => {
    setEditingId(acc.id);
    setBankName(acc.bankName);
    setAccountName(acc.accountName);
    setAccountNumber(acc.accountNumber);
    setBranch(acc.branch);
    setSwiftCode(acc.swiftCode);
    setType(acc.type);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankName.trim() || !accountNumber.trim()) return;

    if (editingId) {
      updateBankAccount({
        id: editingId,
        bankName: bankName.trim(),
        accountName: accountName.trim() || 'UOMBONI SECONDARY SCHOOL',
        accountNumber: accountNumber.trim(),
        branch: branch.trim() || 'Moshi / Marangu',
        swiftCode: swiftCode.trim() || 'CRDBTZTZ',
        type
      });
    } else {
      const newAcc: BankAccount = {
        id: `bank-${Date.now()}`,
        bankName: bankName.trim(),
        accountName: accountName.trim() || 'UOMBONI SECONDARY SCHOOL',
        accountNumber: accountNumber.trim(),
        branch: branch.trim() || 'Moshi / Marangu',
        swiftCode: swiftCode.trim() || 'CRDBTZTZ',
        type
      };
      addBankAccount(newAcc);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              {language === 'sw' ? 'Akaunti Rasmi za Benki za Shule' : 'Official School Bank Accounts'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'sw'
              ? 'Akaunti hizi zinasomwa na wazazi kwenye fomu ya kujiunga, fomu ya ada, na tovuti nzima.'
              : 'These bank accounts are displayed in joining forms, fee payment sections, and parent portals.'}
          </p>
        </div>

        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'sw' ? 'Ongeza Akaunti ya Benki' : 'Add Bank Account'}</span>
          </button>
        )}
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="bg-slate-900 p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {editingId
                ? (language === 'sw' ? 'Hariri Akaunti ya Benki' : 'Edit Bank Account')
                : (language === 'sw' ? 'Sajili Akaunti Mpya ya Benki' : 'Add New Bank Account')}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Jina la Benki *' : 'Bank Name *'}
              </label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="mf. CRDB Bank, NMB Bank"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Jina la Akaunti (Account Name) *' : 'Account Name *'}
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="mf. UOMBONI SECONDARY SCHOOL"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Namba ya Akaunti *' : 'Account Number *'}
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="mf. 0150244799000"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Tawi (Branch)' : 'Branch'}
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="mf. Marangu Branch / Moshi"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'SWIFT Code' : 'SWIFT Code'}
              </label>
              <input
                type="text"
                value={swiftCode}
                onChange={(e) => setSwiftCode(e.target.value)}
                placeholder="mf. CORUTZTZ au NMBLTZTZ"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Madhumuni / Aina ya Akaunti' : 'Account Category'}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as BankAccount['type'])}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Ada ya Shule (School Fees)">Ada ya Shule (School Fees)</option>
                <option value="Michango ya Kikanisa/Misa">Michango ya Kikanisa / Misa</option>
                <option value="Ununuzi wa Sare na Vifaa">Ununuzi wa Sare na Vifaa</option>
                <option value="Bweni na Chakula">Bweni na Chakula</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? (language === 'sw' ? 'Sasisha Akaunti' : 'Update Account') : (language === 'sw' ? 'Hifadhi Akaunti' : 'Save Account')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Accounts List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {bankAccounts.map((acc) => (
          <div
            key={acc.id}
            className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white">{acc.bankName}</h4>
                    <span className="text-[10px] text-slate-400 font-medium">{acc.branch}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(acc)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title={language === 'sw' ? 'Hariri' : 'Edit'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(language === 'sw' ? `Futa akaunti ya ${acc.bankName}?` : `Delete account for ${acc.bankName}?`)) {
                        deleteBankAccount(acc.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title={language === 'sw' ? 'Futa' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Namba ya Akaunti:</span>
                  <span className="text-sm font-bold text-amber-300 tracking-wider">{acc.accountNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Jina la Akaunti:</span>
                  <span className="text-xs text-white font-medium truncate block">{acc.accountName}</span>
                </div>
                {acc.swiftCode && (
                  <div className="text-[10px] text-slate-400">
                    SWIFT: <span className="text-slate-300 font-bold">{acc.swiftCode}</span>
                  </div>
                )}
              </div>
            </div>

            <span className="inline-block px-2.5 py-1 rounded-full bg-slate-800 text-emerald-400 text-[10px] font-bold border border-slate-700 w-fit">
              {acc.type}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
