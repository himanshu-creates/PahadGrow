import { RouterProvider } from 'react-router';
import { useState, useEffect } from 'react';
import { router } from './routes';
import { LoadingScreen } from './components/LoadingScreen';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelectionModal } from './components/LanguageSelectionModal';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <LanguageProvider>
      <LanguageSelectionModal />
      <RouterProvider router={router} />
    </LanguageProvider>
  );
}
