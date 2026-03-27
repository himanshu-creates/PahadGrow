import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage, Language } from '../contexts/LanguageContext';

export function LanguageSelectionModal() {
  const { setLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already selected a language
    const hasSelectedLanguage = localStorage.getItem('pahadgrow_language');
    if (!hasSelectedLanguage) {
      setIsVisible(true);
    }
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  const languages = [
    { code: 'en' as Language, label: 'English', flag: '🇬🇧', native: 'English' },
    { code: 'hi' as Language, label: 'हिंदी', flag: '🇮🇳', native: 'हिंदी' },
    { code: 'garhwali' as Language, label: 'गढ़वाली', flag: '🏔️', native: 'गढ़वाली' },
    { code: 'kumaoni' as Language, label: 'कुमाऊँनी', flag: '🏔️', native: 'कुमाऊँनी' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] bg-gradient-to-br from-primary via-secondary to-primary flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-8 md:p-12"
        >
          {/* Logo */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-bold">PG</span>
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Choose Your Language
            </h1>
            <p className="text-2xl text-primary font-semibold mb-2">
              अपनी भाषा चुनें
            </p>
            <p className="text-muted-foreground">
              Select your preferred language to continue
            </p>
          </motion.div>

          {/* Language Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {languages.map((lang, index) => (
              <motion.button
                key={lang.code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                onClick={() => handleLanguageSelect(lang.code)}
                className="group relative overflow-hidden bg-gradient-to-br from-card to-primary/5 border-2 border-border hover:border-primary rounded-2xl p-6 transition-all hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-center gap-4">
                  <div className="text-5xl">{lang.flag}</div>
                  <div className="text-left flex-1">
                    <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                      {lang.native}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {lang.label}
                    </div>
                  </div>
                  <motion.div
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    whileHover={{ scale: 1.1 }}
                  >
                    <svg
                      className="w-6 h-6 text-primary"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </motion.div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl" />
              </motion.button>
            ))}
          </div>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="text-center text-sm text-muted-foreground"
          >
            You can change this anytime from the language menu
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
