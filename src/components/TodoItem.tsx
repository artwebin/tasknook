import React from 'react';
import { Square, CheckSquare, Trash2, Flag } from 'lucide-react';
import { Todo } from '../types';
import { priorityStyles } from '../utils/priorityStyles';

interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
  onPriorityChange: () => void;
}

export function TodoItem({ todo, onToggle, onDelete, onPriorityChange }: TodoItemProps) {
  const priorityStyle = priorityStyles[todo.priority];

  return (
    <div 
      className={`flex items-center gap-3 p-2 md:p-4 rounded-xl group transition-all duration-500 border overflow-hidden ${
        priorityStyle.border
      } ${priorityStyle.bg} ${
        todo.isCompleting ? 'opacity-0 translate-x-full h-0 my-0 py-0 border-0' : 'opacity-100 translate-x-0'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onToggle}
        className="text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      >
        {todo.completed ? 
          <CheckSquare className="w-6 h-6 text-indigo-500 rounded-lg" /> :
          <Square className="w-6 h-6 rounded-lg" />
        }
      </button>
      
      <span 
        className={`flex-1 text-lg transition-all duration-500 ${
          todo.isCompleting || todo.completed ? 'text-gray-400 dark:text-gray-500 line-through' : 'text-gray-700 dark:text-gray-200'
        }`}
      >
        {todo.text}
      </span>
      
      <button
        onClick={onPriorityChange}
        className={`opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all ${priorityStyle.text}`}
        title={`Priority: ${todo.priority}`}
      >
        <Flag className="w-5 h-5" fill="currentColor" />
      </button>
      
      {/* Only show delete button on desktop */}
      <button
        onClick={onDelete}
        className="hidden md:block opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
}