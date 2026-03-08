'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from './LanguageContext';

export default function LanguageModal() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('destiny-lang');
    if (!saved) {
      setIsOpen(true);
    }
  }, []);

  const handleSelect = (selectedLang: 'zh' | 'en') => {
    setLang(selectedLang);
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-2">请选择语言 / Select Language</h2>
        <p className="text-center text-gray-500 mb-8">Choose your preferred language</p>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleSelect('zh')}
            className="flex items-center justify-center p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl mr-2">🇨🇳</span>
            <span className="text-xl font-semibold">中文</span>
          </button>
          <button
            onClick={() => handleSelect('en')}
            className="flex items-center justify-center p-6 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-2xl mr-2">🇺🇸</span>
            <span className="text-xl font-semibold">English</span>
          </button>
        </div>
      </div>
    </div>
  );
}
