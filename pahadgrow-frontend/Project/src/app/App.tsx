import { RouterProvider } from 'react-router';
import { useState, useEffect } from 'react';
import { router } from './routes';
import { LoadingScreen } from './components/LoadingScreen';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageSelectionModal } from './components/LanguageSelectionModal';
import { AuthProvider } from './contexts/AuthContext';

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
    // AuthProvider MUST wrap everything so ProtectedRoute can access auth state
    <AuthProvider>
      <LanguageProvider>
        <LanguageSelectionModal />
        <RouterProvider router={router} />
      </LanguageProvider>
    </AuthProvider>
  );
}
