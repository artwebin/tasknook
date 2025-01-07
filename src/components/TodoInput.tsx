import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export function TodoInput({ onAdd }: TodoInputProps) {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onAdd(input.trim());
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-6" onClick={(e) => e.stopPropagation()}>
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 gradient-border"
        />
        <div className="p-[3px] rounded-lg bg-[linear-gradient(150deg,#40c2d2,#3fb2e9,#739bef,#a97dda,#cd5aaa,#d5416a,#d34647,#dd5346,#e66044,#ee6d41,#f67a3f,#fc883c)]">
          <button
            type="submit"
            className="h-full w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-4 py-2 rounded-[6px] hover:opacity-90 transition-opacity"
          >
            <PlusCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </form>
  );
}