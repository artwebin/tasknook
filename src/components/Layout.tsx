import React, { useState } from 'react';
import { PlusCircle, Moon, Sun, Menu, X, LogOut, User, ListChecks, Trash2, Layout as LayoutIcon } from 'lucide-react';
import { useLists } from '../context/ListsContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from 'next-themes';
import { Modal } from './Modal';

interface LayoutProps {
  children: React.ReactNode;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  activeView: 'all' | 'deleted' | 'templates';
}

export function Layout({ children, isMobileMenuOpen, setIsMobileMenuOpen, activeView }: LayoutProps) {
  const { addList } = useLists();
  const { user, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const [isNewListModalOpen, setIsNewListModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
  };

  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get the current view icon
  const getCurrentViewIcon = () => {
    switch (activeView) {
      case 'all':
        return <ListChecks className="w-6 h-6" />;
      case 'deleted':
        return <Trash2 className="w-6 h-6" />;
      case 'templates':
        return <LayoutIcon className="w-6 h-6" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2b2e4a]/10 to-[#e84545]/10 dark:from-[#2b2e4a]/5 dark:to-[#e84545]/5 dark:bg-gray-900">
      {/* Desktop Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 relative z-50">
        <div className="w-full px-4 md:px-6 h-16 hidden md:flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img
              src={
                theme === 'dark'
                  ? 'https://artwebin.com/media/2024/12/TaskNook_logo_T01.png'
                  : 'https://artwebin.com/media/2024/12/TaskNook_logo_T02.png'
              }
              alt="ArtWebIn Logo"
              className="h-8"
            />
            <span className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">TaskNook</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            {/* Desktop User Menu */}
            <div className="relative" ref={menuRef}>
              <div
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
              >
                <User className="w-5 h-5" />
              </div>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                    {user?.email}
                  </div>
                  <div
                    onClick={handleSignOut}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Desktop New List Button */}
            <button
              onClick={() => setIsNewListModalOpen(true)}
              className="inline-flex items-center gap-2 bg-brand-gradient text-white px-3 md:px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
            >
              <PlusCircle className="w-5 h-5" />
              <span className="hidden md:inline">New List</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div
        className="fixed md:hidden bottom-0 left-0 w-full z-[60] bg-brand-gradient"
        style={{
          // Respect safe-area inset + add extra bottom padding
          paddingBottom: 'calc(env(safe-area-inset-bottom, 20px) + 1.8rem)',
        }}
      >
        <div className="relative flex items-center justify-between">
          {/* Left: Current View Icon */}
          <div className="w-[20%] flex justify-center py-4 text-white/80">
            {getCurrentViewIcon()}
          </div>

          <div className="w-px h-8 bg-white/20" />

          {/* Middle: Actions */}
          <div className="w-[60%] flex items-center justify-center">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-[33.33%] py-4 flex justify-center text-white/80 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
            </button>

            <div className="w-px h-8 bg-white/20" />

            {/* New List Button */}
            <div className="w-[33.33%]">
              <button
                onClick={() => setIsNewListModalOpen(true)}
                className="w-full py-4 flex justify-center text-white/80 hover:text-white transition-colors"
              >
                <PlusCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="w-px h-8 bg-white/20" />

            {/* User Menu */}
            <div className="relative w-[33.33%]">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-full py-4 flex justify-center text-white/80 hover:text-white transition-colors"
              >
                <User className="w-6 h-6" />
              </button>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 bg-black/50"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute bottom-full right-0 mb-2 w-48 py-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700">
                      {user?.email}
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="w-px h-8 bg-white/20" />

          {/* Right: Menu Toggle */}
          <div className="w-[20%] flex justify-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="w-full py-4 flex justify-center text-white/80 hover:text-white transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="w-full relative">
        <div className="pb-0">{children}</div>
      </main>

      {/* New List Modal */}
      <Modal
        isOpen={isNewListModalOpen}
        onClose={() => setIsNewListModalOpen(false)}
        onSubmit={addList}
        title="Create New List"
        placeholder="Enter list name..."
        submitText="Create List"
        showListTypeSelection={true}
      />
    </div>
  );
}
