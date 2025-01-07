import React from 'react';
import { Trash2, RotateCcw, Pencil, Check, X } from 'lucide-react';
import { TextItem as TextItemType } from '../types';
import { useState, useRef, useEffect } from 'react';
import { useLists } from '../context/ListsContext';

interface TextItemProps {
  listId: number;
  item: TextItemType;
  onDelete: () => void;
  onRestore?: () => void;
}

export function TextItem({ listId, item, onDelete, onRestore }: TextItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(item.text);
  const inputRef = useRef<HTMLInputElement>(null);
  const { updateTextItem } = useLists();

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditText(item.text);
  };

  const handleSave = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    if (editText.trim()) {
      updateTextItem(listId, item.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
    setEditText(item.text);
  };

  return (
    <div 
      className={`flex items-center gap-4 p-4 rounded-xl group transition-all duration-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700/30 ${
        item.isRemoving ? 'opacity-0 transform translate-x-full' : 'opacity-100 transform translate-x-0'
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {isEditing ? (
        <form onSubmit={handleSave} className="flex-1 flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="flex-1 px-3 py-1 text-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 rounded-lg gradient-border"
          />
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="text-green-500 dark:text-green-400 hover:text-green-600 dark:hover:text-green-300 transition-colors"
              disabled={!editText.trim()}
            >
              <Check className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </form>
      ) : (
        <span className="flex-1 text-lg text-gray-700 dark:text-gray-200">
          {item.text}
        </span>
      )}
      
      <div className="flex items-center gap-2">
        {!isEditing && !onRestore && (
          <button
            onClick={handleEdit}
            className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all"
          >
            <Pencil className="w-5 h-5" />
          </button>
        )}
        {onRestore ? (
          <button
            onClick={onRestore}
            className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-all"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        ) : null}
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}