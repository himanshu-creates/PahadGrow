import { useState, useEffect, ReactNode } from 'react';
import { useLanguage, translateViaAPI, Language } from '../contexts/LanguageContext';

// Use this component to auto-translate any dynamic text (product names, descriptions, etc.)
// Usage: <TranslatedText text={product.description} />
interface TranslatedTextProps {
  text: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function TranslatedText({ text, as: Tag = 'span', className }: TranslatedTextProps) {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (language === 'en' || !text) {
      setTranslated(text);
      return;
    }
    let cancelled = false;
    translateViaAPI(text, language).then(result => {
      if (!cancelled) setTranslated(result);
    });
    return () => { cancelled = true; };
  }, [text, language]);

  return <Tag className={className}>{translated}</Tag>;
}

// Hook version for programmatic use
export function useTranslatedText(text: string): string {
  const { language } = useLanguage();
  const [translated, setTranslated] = useState(text);

  useEffect(() => {
    if (language === 'en' || !text) { setTranslated(text); return; }
    let cancelled = false;
    translateViaAPI(text, language).then(r => { if (!cancelled) setTranslated(r); });
    return () => { cancelled = true; };
  }, [text, language]);

  return translated;
}
