import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations, Language, TranslationKeys } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: TranslationKeys) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper hàm trích xuất ngôn ngữ từ URL query parameter (?lang=en hoặc ?lang=vi)
// Mặc định chuẩn 100% là Tiếng Việt ('vi')
export function getLanguageFromUrl(): Language {
  if (typeof window === 'undefined') return 'vi';
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang') || params.get('l') || params.get('locale');
    if (urlLang) {
      const lower = urlLang.toLowerCase().trim();
      if (lower === 'en') return 'en';
      if (lower === 'vi') return 'vi';
    }
  } catch {}
  return 'vi';
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Mặc định luôn là Tiếng Việt ('vi') trừ khi có ?lang=en trên URL
  const [language, setLanguageState] = useState<Language>(() => {
    return getLanguageFromUrl();
  });

  // Tự động đồng bộ ngôn ngữ khi URL thay đổi (ví dụ: popstate / back / forward)
  useEffect(() => {
    const checkUrl = () => {
      const fromUrl = getLanguageFromUrl();
      if (fromUrl !== language) {
        setLanguageState(fromUrl);
      }
    };

    window.addEventListener('popstate', checkUrl);
    return () => window.removeEventListener('popstate', checkUrl);
  }, [language]);

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    try {
      const url = new URL(window.location.href);
      if (newLang === 'en') {
        url.searchParams.set('lang', 'en');
      } else {
        // Nếu là 'vi' thì bỏ param để URL giữ nguyên dạng mặc định sạch đẹp
        url.searchParams.delete('lang');
      }
      window.history.replaceState(null, '', url.toString());

      // Xoá mọi stale localStorage cũ gây kẹt tiếng Anh
      localStorage.removeItem('vm_marathon_language');
    } catch {}
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  }, [language, setLanguage]);

  const t = useCallback(
    (key: TranslationKeys): string => {
      const dict = translations[language] || translations.vi;
      return dict[key] || translations.vi[key] || key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Nút chuyển đổi ngôn ngữ ở Header (khi xem trang trực tiếp ngoài Iframe)
 */
export const LanguageSwitcher: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 bg-black/20 backdrop-blur-xs border border-white/25 rounded-full select-none ${className}`}
      title="Ngôn ngữ / Language (VN / EN)"
    >
      <button
        type="button"
        onClick={() => setLanguage('vi')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
          language === 'vi'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
        aria-label="Chọn Tiếng Việt"
      >
        <span className="text-[11px]">🇻🇳</span>
        <span>VN</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
          language === 'en'
            ? 'bg-white text-slate-900 shadow-xs'
            : 'text-white/80 hover:text-white hover:bg-white/10'
        }`}
        aria-label="Select English"
      >
        <span className="text-[11px]">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
