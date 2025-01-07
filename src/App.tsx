import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Sidebar } from './components/Sidebar';
import { TodoBoard } from './components/TodoBoard';
import { X } from 'lucide-react';
import { ListsProvider } from './context/ListsContext';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { Auth } from './components/Auth';
import { useAuth } from './context/AuthContext';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeView, setActiveView] = useState<'all' | 'deleted' | 'templates'>('all');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2b2e4a]/10 to-[#e84545]/10 dark:from-[#2b2e4a]/5 dark:to-[#e84545]/5 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#723b78] dark:border-[#e84545]"></div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <>
      <Layout 
        isMobileMenuOpen={showMobileMenu} 
        setIsMobileMenuOpen={setShowMobileMenu}
        activeView={activeView}
      >
        <div className="flex h-[calc(100vh-4rem)]">
            <div className={`fixed md:static left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 bottom-[5.5rem] md:bottom-0 z-50 transform md:h-full w-[95%] md:w-64 ${
              showMobileMenu ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'
            } md:opacity-100 md:translate-y-0 transition-all duration-300 ease-in-out`}>
              <Sidebar 
                activeView={activeView} 
                onViewChange={(view) => {
                  setActiveView(view);
                  setShowMobileMenu(false);
                }} 
              />
            </div>
            {showMobileMenu && (
              <div 
                className="fixed inset-0 bg-black/80 z-30 md:hidden"
                onClick={() => setShowMobileMenu(false)}
              />
            )}
            <TodoBoard activeView={activeView} />
          </div>
      </Layout>
    </>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class">
      <AuthProvider> 
        <ListsProvider> 
          <AppContent />
          <Toaster 
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--toast-bg)',
                color: 'var(--toast-color)',
                border: '1px solid var(--toast-border)',
              },
            }}
          />
        </ListsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;