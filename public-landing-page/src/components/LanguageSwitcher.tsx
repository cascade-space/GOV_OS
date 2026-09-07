"use client";

import { useState } from 'react';
import { Globe, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', flag: '🏳️' },
] as const;

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  
  const currentLang = languages.find(l => l.code === locale) || languages[0];

  const switchLanguage = (newLocale: 'en' | 'hi' | 'kn') => {
    setLocale(newLocale);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer"
        title="Choose Language / भाषा चुनें / ಭಾಷೆ ಆಯ್ಕೆ"
      >
        <Globe className="w-3.5 h-3.5 text-green-600 shrink-0" />
        <span className="font-semibold text-gray-800">{currentLang.nativeName}</span>
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
            <p className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 mb-1">
              Language / भाषा / ಭಾಷೆ
            </p>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => switchLanguage(lang.code)}
                className={`w-full text-left px-3 py-2 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2 ${
                  locale === lang.code ? 'bg-green-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm">{lang.flag}</span>
                  <div>
                    <div className={`text-xs font-bold leading-tight ${locale === lang.code ? 'text-green-700' : 'text-gray-800'}`}>
                      {lang.nativeName}
                    </div>
                    <div className="text-[10px] text-gray-400 leading-none">{lang.name}</div>
                  </div>
                </div>
                {locale === lang.code && (
                  <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
