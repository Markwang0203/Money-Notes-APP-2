import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Camera, Loader2, ListPlus, Banknote, Coins } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Category, IncomeCategory, CATEGORY_ICONS, CATEGORY_COLORS, TransactionType, ReceiptItem } from '../types';
// 已移除對 analyzeDocumentImage 的匯入

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (amount: number, category: string, note: string, date: string, type: TransactionType, items?: ReceiptItem[], tax?: number, superannuation?: number) => void;
  exchangeRate: number;
}

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd, exchangeRate }) => {
  const [activeTab, setActiveTab] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<string>(Category.GROCERIES);
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<ReceiptItem[]>([]);
  
  // New fields for Payslip
  const [tax, setTax] = useState('');
  const [superannuation, setSuperannuation] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setCategory(activeTab === 'expense' ? Category.GROCERIES : IncomeCategory.SALARY_FULL);
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
      setItems([]);
      setTax('');
      setSuperannuation('');
      setIsAnalyzing(false);
    }
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numTax = tax ? parseFloat(tax) : undefined;
    const numSuper = superannuation ? parseFloat(superannuation) : undefined;

    if (!isNaN(numAmount) && numAmount > 0) {
      onAdd(numAmount, category, note, date, activeTab, items, numTax, numSuper);
      onClose();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type (image or pdf)
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('請上傳圖片 (JPG/PNG) 或 PDF 文件');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        // Remove data URL prefix (e.g., "data:image/jpeg;base64," or "data:application/pdf;base64,")
        const base64String = (reader.result as string).split(',')[1];
        const mimeType = file.type;
        
        // 由於 AI 服務已移除，我們不再調用 analyzeDocumentImage
        alert("AI 辨識服務已暫時停用，請手動輸入資料。");
        setIsAnalyzing(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
    } catch (err) {
      setIsAnalyzing(false);
    }
  };

  const calculatedTWD = amount ? (parseFloat(amount) * exchangeRate).toFixed(0) : '0';
  const categoryList = activeTab === 'expense' ? Object.values(Category) : Object.values(IncomeCategory);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl transform transition-all p-6 animate-in slide-in-from-bottom-10 fade-in duration-300 max-h-[95vh] flex flex-col">
        
        {/* Header & Tabs */}
        <div className="flex flex-col gap-4 mb-4 flex-shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-slate-800">
               {activeTab === 'expense' ? '新增消費' : '新增收入'}
            </h2>
            <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors">
              <X size={20} className="text-slate-600" />
            </button>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl">
             <button 
                type="button"
                onClick={() => setActiveTab('expense')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'expense' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
                支出 Expense
             </button>
             <button 
                type="button"
                onClick={() => setActiveTab('income')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'income' ? 'bg-white text-oz-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
             >
                收入 Income
             </button>
          </div>
        </div>

        {/* Camera/Upload Button */}
        <div className="absolute top-6 right-14">
            <button 
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
              className={`p-2 rounded-full transition-colors border flex items-center gap-1 px-3 disabled:opacity-50 ${activeTab === 'income' ? 'bg-oz-50 text-oz-600 border-oz-200 hover:bg-oz-100' : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'}`}
            >
               {isAnalyzing ? (
                 <Loader2 size={18} className="animate-spin" />
               ) : (
                 <Camera size={18} />
               )}
               <span className="text-xs font-bold hidden sm:inline">
                 {isAnalyzing ? '分析中...' : (activeTab === 'income' ? '上傳薪資單' : '拍收據')}
               </span>
            </button>
            <input/> 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,application/pdf" 
              onChange={handleFileChange}
              // 這裡已被修正
            />
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto no-scrollbar space-y-5 pb-2">
          {/* Amount Input */}
          <div className="relative">
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 ml-1">
              {activeTab === 'income' ? '實領金額 (Net Pay AUD)' : '金額 (AUD)'}
            </label>
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">$</span>
                    <input/>
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        required
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 text-3xl font-bold bg-slate-50 rounded-2xl focus:outline-none focus:ring-2 transition-all placeholder:text-slate-200 ${activeTab === 'income' ? 'text-oz-600 focus:ring-oz-500' : 'text-slate-800 focus:ring-slate-400'}`}
                        placeholder="0.00"
                        autoFocus={!isAnalyzing}
                        // 這裡是閉合符號
                    />
                </div>
