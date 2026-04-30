import { useState } from 'react';
import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, Language } from '../contexts/LanguageContext';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en' as Language, label: 'English', short: 'EN' },
    { code: 'hi' as Language, label: 'हिंदी', short: 'हिं' },
    { code: 'garhwali' as Language, label: 'गढ़वाली', short: 'गढ़' },
    { code: 'kumaoni' as Language, label: 'कुमाऊँनी', short: 'कुम' },
  ];

  const currentLang = languages.find(l => l.code === language);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
      >
        <Globe size={18} className="text-icon" />
        <span className="text-sm font-medium text-foreground">{currentLang?.short}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-border overflow-hidden z-50"
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-3 text-left hover:bg-muted transition-colors flex items-center gap-2 ${
                    language === lang.code ? 'bg-primary/10 text-primary font-semibold' : 'text-foreground'
                  }`}
                >
                  <span className="text-lg">{lang.short}</span>
                  <span>{lang.label}</span>
                  {language === lang.code && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="ml-auto text-primary"
                    >
                      ✓
                    </motion.span>
                  )}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
