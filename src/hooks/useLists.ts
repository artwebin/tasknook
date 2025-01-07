import { useState, useEffect } from 'react';
import { TodoList } from '../types';
import { listsService } from '../services/lists.service';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export function useLists() {
  const { user } = useAuth();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLists([]);
      setLoading(false);
      return;
    }

    listsService.getLists(user.id)
      .then((data) => {
        setLists(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading lists:', error);
        toast.error('Error loading lists');
        setLoading(false);
      });
  }, [user]);

  const createList = async (name: string, type: 'tasks' | 'text' = 'tasks') => {
    if (!user) return null;

    try {
      const newList = await listsService.createList(user.id, {
        name,
        type,
        todos: [],
        textItems: [],
        deletedTodos: [],
        deletedTextItems: [],
        createdAt: new Date().toISOString()
      });

      setLists(prev => [newList, ...prev]);
      toast.success(`Created list "${name}"`);
      return newList;
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Error creating list');
      return null;
    }
  };

  return {
    lists,
    loading,
    createList
  };
}