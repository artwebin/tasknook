import React from 'react';
import { ListChecks, Trash2, Layout as LayoutIcon } from 'lucide-react';
import { useLists } from '../context/ListsContext';

interface SidebarProps {
  activeView: 'all' | 'deleted' | 'templates';
  onViewChange: (view: 'all' | 'deleted' | 'templates') => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { lists, deletedLists, templateLists } = useLists();

  const navItems = [
    { id: 'all', label: 'All Lists', icon: ListChecks, count: lists.length },
    { id: 'deleted', label: 'Deleted Lists', icon: Trash2, count: deletedLists.length },
    { id: 'templates', label: 'Templates', icon: LayoutIcon, count: templateLists.length },
  ] as const;

  return (
    <nav className={`w-full h-full bg-white dark:bg-gray-800 backdrop-blur-lg rounded-2xl md:rounded-none border border-gray-200/50 dark:border-gray-700/50 md:border-r md:border-gray-200 md:dark:border-gray-700 p-3 md:p-4 flex flex-col overflow-hidden ${
      window.innerWidth < 768 ? 'h-[350px]' : 'h-full'
    }`}>
      <div className="flex flex-col space-y-2">
        {navItems.map(({ id, label, icon: Icon, count }) => (
          <button
            key={id}
            onClick={() => onViewChange(id)}
            className={`flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
              activeView === id
                ? 'bg-brand-gradient text-white'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5" />
              <span className="whitespace-nowrap">{label}</span>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-sm ${
              activeView === id
                ? 'bg-white/20'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
            }`}>
              {count}
            </span>
          </button>
        ))}
      </div>
      <div className="hidden md:block mt-auto pt-4 text-center text-sm text-gray-400 dark:text-gray-500">
        © TaskNook, ver. 1.5
      </div>
    </nav>
  );
}