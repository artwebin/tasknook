import React, { createContext, useContext, useState, useEffect } from 'react';
import { Todo, TodoList, TextItem, RecurringSchedule } from '../types';
import { useAuth } from './AuthContext';
import * as db from '../lib/database';
import { toast } from 'sonner';

interface ListsContextType {
  lists: TodoList[];
  deletedLists: TodoList[];
  templateLists: TodoList[];
  activeListId: number | null;
  addList: (name: string, type?: 'tasks' | 'text') => void;
  deleteList: (id: number) => void;
  restoreList: (id: number) => void;
  permanentlyDeleteList: (id: number) => void;
  setActiveList: (id: number | null) => void;
  updateList: (id: number, updates: Partial<TodoList>) => void;
  addTodoToList: (listId: number, todo: Todo) => void;
  deleteTodoFromList: (listId: number, todoId: number) => void;
  toggleTodo: (listId: number, todoId: number) => void;
  updateTodoPriority: (listId: number, todoId: number) => void;
  restoreTodoInList: (listId: number, todoId: number) => void;
  permanentlyDeleteTodo: (listId: number, todoId: number) => void;
  saveAsTemplate: (listId: number) => void;
  deleteTemplate: (id: number) => void;
  useTemplate: (templateId: number, newName: string) => void;
  addTextItemToList: (listId: number, item: TextItem) => void;
  deleteTextItemFromList: (listId: number, itemId: number) => void;
  restoreTextItemInList: (listId: number, itemId: number) => void;
  permanentlyDeleteTextItem: (listId: number, itemId: number) => void;
  reorderLists: (view: 'all' | 'deleted' | 'templates', newOrder: TodoList[]) => void;
  updateTemplateSchedule: (templateId: number, schedule: RecurringSchedule) => void;
  updateTextItem: (listId: number, itemId: number, text: string) => void;
}

const ListsContext = createContext<ListsContextType | undefined>(undefined);

export function ListsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [lists, setLists] = useState<TodoList[]>([]);
  const [deletedLists, setDeletedLists] = useState<TodoList[]>([]);
  const [templateLists, setTemplateLists] = useState<TodoList[]>([]);
  const [activeListId, setActiveListId] = useState<number | null>(null);

  // Check for recurring lists every minute
  useEffect(() => {
    if (user) {
      const checkRecurring = () => {
        db.checkAndCreateRecurringLists()
          .then(() => {
            // Refresh lists after checking
            return db.getLists(user.id);
          })
          .then(lists => {
            setLists(lists.filter(list => !list.is_template && !list.is_deleted));
            setDeletedLists(lists.filter(list => !list.is_template && list.is_deleted));
            setTemplateLists(lists.filter(list => list.is_template));
          })
          .catch(error => {
            console.error('Error checking recurring lists:', error);
          });
      };

      // Check immediately on mount
      checkRecurring();

      // Then check every minute
      const interval = setInterval(checkRecurring, 60000);

      return () => clearInterval(interval);
    }
  }, [user]);

  // Load lists from Supabase when user changes
  useEffect(() => {
    if (user) {
      db.getLists(user.id)
        .then(lists => {
          setLists(lists.filter(list => !list.is_template && !list.is_deleted));
          setDeletedLists(lists.filter(list => !list.is_template && list.is_deleted));
          setTemplateLists(lists.filter(list => list.is_template));
        })
        .catch(error => {
          console.error('Error loading lists:', error);
          toast.error('Error loading your lists');
        });
    } else {
      setLists([]);
      setDeletedLists([]);
      setTemplateLists([]);
      setActiveListId(null);
    }
  }, [user]);

  const addList = async (name: string, type: 'tasks' | 'text' = 'tasks') => {
    if (!user) return;

    const newList: TodoList = {
      id: Date.now(),
      name,
      type,
      todos: [],
      textItems: [],
      deletedTodos: [],
      deletedTextItems: [],
      createdAt: new Date().toISOString()
    };

    try {
      const dbList = await db.createList(user.id, newList);
      const list = { ...newList, id: parseInt(dbList.id) };
      setLists(prev => [list, ...prev]);
      setActiveListId(list.id);
      toast.success(`Created new list "${name}"`);
    } catch (error) {
      console.error('Error creating list:', error);
      toast.error('Error creating list');
    }
  };

  const deleteList = async (id: number) => {
    if (!user) return;

    const listToDelete = lists.find(list => list.id === id);
    if (!listToDelete) return;

    try {
      await db.updateList(id.toString(), { 
        is_deleted: true,
        deleted_at: new Date().toISOString()
      });

      setLists(prev => prev.filter(list => list.id !== id));
      setDeletedLists(prev => [{ ...listToDelete, is_deleted: true }, ...prev]);
      
      if (activeListId === id) {
        setActiveListId(null);
      }
      
      toast.success(`Moved "${listToDelete.name}" to trash`);
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Error deleting list');
    }
  };

  const restoreList = async (id: number) => {
    if (!user) return;

    const listToRestore = deletedLists.find(list => list.id === id);
    if (!listToRestore) return;

    try {
      await db.updateList(id.toString(), { 
        is_deleted: false,
        deleted_at: null
      });

      setDeletedLists(prev => prev.filter(list => list.id !== id));
      setLists(prev => [{ ...listToRestore, is_deleted: false }, ...prev]);
      toast.success(`Restored list "${listToRestore.name}"`);
    } catch (error) {
      console.error('Error restoring list:', error);
      toast.error('Error restoring list');
    }
  };

  const permanentlyDeleteList = async (id: number) => {
    if (!user) return;

    const listToDelete = deletedLists.find(list => list.id === id);
    if (!listToDelete) return;

    try {
      await db.deleteListPermanently(id.toString());
      setDeletedLists(prev => prev.filter(list => list.id !== id));
      toast.success(`Permanently deleted "${listToDelete.name}"`);
    } catch (error) {
      console.error('Error permanently deleting list:', error);
      toast.error('Error deleting list');
    }
  };

  const updateList = async (id: number, updates: Partial<TodoList>) => {
    if (!user) return;

    try {
      await db.updateList(id.toString(), updates);
      setLists(prev => prev.map(list => 
        list.id === id ? { ...list, ...updates } : list
      ));
    } catch (error) {
      console.error('Error updating list:', error);
      toast.error('Error updating list');
    }
  };

  const addTodoToList = async (listId: number, todo: Todo) => {
    if (!user) return;

    const priorityWeight = { high: 3, medium: 2, low: 1 };

    try {
      const dbItem = await db.createItem({
        list_id: listId.toString(),
        text: todo.text,
        type: 'task',
        priority: todo.priority
      });

      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          const newTodos = [...list.todos, { ...todo, id: parseInt(dbItem.id) }]
            .sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority]);
          return { ...list, todos: newTodos };
        }
        return list;
      }));
    } catch (error) {
      console.error('Error adding todo:', error);
      toast.error('Error adding todo');
    }
  };

  const deleteTodoFromList = async (listId: number, todoId: number) => {
    if (!user) return;

    try {
      await db.updateItem(todoId.toString(), {
        is_deleted: true,
        deleted_at: new Date().toISOString()
      });

      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          const todoToDelete = list.todos.find(t => t.id === todoId);
          if (todoToDelete) {
            return {
              ...list,
              todos: list.todos.filter(t => t.id !== todoId),
              deletedTodos: [{ ...todoToDelete, isRemoving: false }, ...list.deletedTodos]
            };
          }
        }
        return list;
      }));
    } catch (error) {
      console.error('Error deleting todo:', error);
      toast.error('Error deleting todo');
    }
  };

  const toggleTodo = async (listId: number, todoId: number) => {
    if (!user) return;

    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const list = lists.find(l => l.id === listId);
    const todo = list?.todos.find(t => t.id === todoId);
    if (!todo) return;

    const newCompleted = !todo.completed;

    try {
      await db.updateItem(todoId.toString(), { completed: newCompleted });
      
      setLists(prev => prev.map(list =>
        list.id === listId ? {
          ...list,
          todos: list.todos.map(todo => 
            todo.id === todoId ? { ...todo, completed: newCompleted } : todo
          ).sort((a, b) => priorityWeight[b.priority] - priorityWeight[a.priority])
        } : list
      ));
    } catch (error) {
      console.error('Error updating todo:', error);
      toast.error('Error updating todo');
    }
  };

  const updateTodoPriority = async (listId: number, todoId: number) => {
    if (!user) return;

    const priorityWeight = { high: 3, medium: 2, low: 1 };
    const priorities: ['low', 'medium', 'high'] = ['low', 'medium', 'high'];

    try {
      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          let updatedTodos = list.todos.map(todo => {
            if (todo.id === todoId) {
              const currentIndex = priorities.indexOf(todo.priority);
              const nextPriority = priorities[(currentIndex + 1) % priorities.length];
              
              // Update in database
              db.updateItem(todoId.toString(), { priority: nextPriority })
                .catch(error => {
                  console.error('Error updating todo priority:', error);
                  toast.error('Error updating priority');
                });

              return { ...todo, priority: nextPriority };
            }
            return todo;
          });
          
          // Sort todos by priority
          updatedTodos = updatedTodos.sort((a, b) => 
            priorityWeight[b.priority] - priorityWeight[a.priority]
          );
          
          return { ...list, todos: updatedTodos };
        }
        return list;
      }));
    } catch (error) {
      console.error('Error updating todo priority:', error);
      toast.error('Error updating priority');
    }
  };

  const restoreTodoInList = async (listId: number, todoId: number) => {
    if (!user) return;

    try {
      await db.restoreItem(todoId.toString());

      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          const todoToRestore = list.deletedTodos.find(t => t.id === todoId);
          if (todoToRestore) {
            return {
              ...list,
              todos: [{ 
                ...todoToRestore, 
                completed: false, 
                isRemoving: false,
                isCompleting: false 
              }, ...list.todos],
              deletedTodos: list.deletedTodos.filter(t => t.id !== todoId)
            };
          }
        }
        return list;
      }));
    } catch (error) {
      console.error('Error restoring todo:', error);
      toast.error('Error restoring todo');
    }
  };

  const permanentlyDeleteTodo = async (listId: number, todoId: number) => {
    if (!user) return;

    try {
      await db.deleteItem(todoId.toString(), true);
      setLists(prev => prev.map(list =>
        list.id === listId ? {
          ...list,
          deletedTodos: list.deletedTodos.filter(todo => todo.id !== todoId)
        } : list
      ));
    } catch (error) {
      console.error('Error permanently deleting todo:', error);
      toast.error('Error deleting todo');
    }
  };

  const saveAsTemplate = async (listId: number) => {
    if (!user) return;

    const listToTemplate = lists.find(list => list.id === listId);
    if (!listToTemplate) return;

    // Create the template list first
    const templateList: TodoList = {
      ...listToTemplate,
      name: `${listToTemplate.name} Template`,
      createdAt: new Date().toISOString()
    };

    try {
      const dbList = await db.createList(user.id, {
        ...templateList,
        is_template: true
      });

      // Copy all items from the original list to the template
      const itemPromises = listToTemplate.todos.map(todo =>
        db.createItem({
          list_id: dbList.id,
          text: todo.text,
          type: 'task',
          priority: todo.priority,
          completed: false
        })
      );

      if (listToTemplate.type === 'text') {
        itemPromises.push(
          ...listToTemplate.textItems.map(item =>
            db.createItem({
              list_id: dbList.id,
              text: item.text,
              type: 'text'
            })
          )
        );
      }

      await Promise.all(itemPromises);

      const template = { ...templateList, id: parseInt(dbList.id), is_template: true };
      setTemplateLists(prev => [template, ...prev]);
      toast.success(`Saved "${listToTemplate.name}" as template`);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Error saving template');
    }
  };

  const deleteTemplate = async (id: number) => {
    if (!user) return;

    const templateToDelete = templateLists.find(template => template.id === id);
    if (!templateToDelete) return;

    try {
      await db.deleteListPermanently(id.toString());
      setTemplateLists(prev => prev.filter(template => template.id !== id));
      toast.success(`Deleted template "${templateToDelete.name}"`);
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Error deleting template');
    }
  };

  const useTemplate = async (templateId: number, newName: string) => {
    if (!user) return;

    const template = templateLists.find(t => t.id === templateId); 
    if (!template) return;

    try {
      // First create the new list
      const dbList = await db.createList(user.id, {
        ...template,
        name: newName,
        is_template: false,
        createdAt: new Date().toISOString()
      });

      // Copy all items from template to the new list
      const itemPromises = template.todos.map(todo =>
        db.createItem({
          list_id: dbList.id,
          text: todo.text,
          type: 'task',
          priority: todo.priority,
          completed: false
        })
      );

      if (template.type === 'text') {
        itemPromises.push(
          ...template.textItems.map(item =>
            db.createItem({
              list_id: dbList.id,
              text: item.text,
              type: 'text'
            })
          )
        );
      }

      await Promise.all(itemPromises);

      // Create the new list object with all items
      const newList = {
        ...template,
        id: parseInt(dbList.id),
        name: newName,
        createdAt: new Date().toISOString(),
        deletedTodos: [],
        deletedTextItems: [],
        is_template: false,
        todos: template.todos.map(todo => ({
          ...todo,
          completed: false,
          isRemoving: false,
          isCompleting: false
        })),
        textItems: template.textItems.map(item => ({
          ...item,
          isRemoving: false
        }))
      };

      setLists(prev => {
        const existingList = prev.find(list => list.name === newName);
        if (existingList) {
          toast.info(`Replacing existing list "${newName}"`);
        }
        return [newList, ...prev.filter(list => list.name !== newName)];
      });

      toast.success(`Created list "${newName}" from template`);
    } catch (error) {
      console.error('Error using template:', error);
      toast.error('Error creating list from template');
    }
  };

  const addTextItemToList = async (listId: number, item: TextItem) => {
    if (!user) return;

    try {
      const dbItem = await db.createItem({
        list_id: listId.toString(),
        text: item.text,
        type: 'text'
      });

      setLists(prev => prev.map(list =>
        list.id === listId ? {
          ...list,
          textItems: [{ ...item, id: parseInt(dbItem.id) }, ...list.textItems]
        } : list
      ));
    } catch (error) {
      console.error('Error adding text item:', error);
      toast.error('Error adding item');
    }
  };

  const deleteTextItemFromList = async (listId: number, itemId: number) => {
    if (!user) return;

    try {
      await db.updateItem(itemId.toString(), {
        is_deleted: true,
        deleted_at: new Date().toISOString()
      });

      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          const itemToDelete = list.textItems.find(t => t.id === itemId);
          if (itemToDelete) {
            return {
              ...list,
              textItems: list.textItems.filter(t => t.id !== itemId),
              deletedTextItems: [{ ...itemToDelete, isRemoving: false }, ...list.deletedTextItems]
            };
          }
        }
        return list;
      }));
    } catch (error) {
      console.error('Error deleting text item:', error);
      toast.error('Error deleting item');
    }
  };

  const restoreTextItemInList = async (listId: number, itemId: number) => {
    if (!user) return;

    try {
      await db.updateItem(itemId.toString(), {
        is_deleted: false,
        deleted_at: null
      });

      setLists(prev => prev.map(list => {
        if (list.id === listId) {
          const itemToRestore = list.deletedTextItems.find(t => t.id === itemId);
          if (itemToRestore) {
            return {
              ...list,
              textItems: [{ ...itemToRestore, isRemoving: false }, ...list.textItems],
              deletedTextItems: list.deletedTextItems.filter(t => t.id !== itemId)
            };
          }
        }
        return list;
      }));
    } catch (error) {
      console.error('Error restoring text item:', error);
      toast.error('Error restoring item');
    }
  };

  const permanentlyDeleteTextItem = async (listId: number, itemId: number) => {
    if (!user) return;

    try {
      await db.deleteItem(itemId.toString(), true);
      setLists(prev => prev.map(list =>
        list.id === listId ? {
          ...list,
          deletedTextItems: list.deletedTextItems.filter(item => item.id !== itemId)
        } : list
      ));
    } catch (error) {
      console.error('Error permanently deleting text item:', error);
      toast.error('Error deleting item');
    }
  };

  const updateTextItem = async (listId: number, itemId: number, text: string) => {
    if (!user) return;

    try {
      await db.updateItem(itemId.toString(), { text });
      setLists(prev => prev.map(list =>
        list.id === listId ? {
          ...list,
          textItems: list.textItems.map(item =>
            item.id === itemId ? { ...item, text } : item
          )
        } : list
      ));
    } catch (error) {
      console.error('Error updating text item:', error);
      toast.error('Error updating item');
    }
  };

  const reorderLists = (view: 'all' | 'deleted' | 'templates', newOrder: TodoList[]) => {
    switch (view) {
      case 'all':
        setLists(newOrder);
        break;
      case 'deleted':
        setDeletedLists(newOrder);
        break;
      case 'templates':
        setTemplateLists(newOrder);
        break;
    }
  };

  const updateTemplateSchedule = async (templateId: number, schedule: RecurringSchedule) => {
    if (!user) return;

    try {
      await db.updateList(templateId.toString(), { recurring_schedule: schedule });
      
      setTemplateLists(prev => {
        const template = prev.find(t => t.id === templateId);
        const updated = prev.map(t =>
          t.id === templateId ? { ...t, recurringSchedule: schedule } : t
        );
        
        if (template) {
          if (schedule.enabled) {
            toast.success(`Scheduled "${template.name.replace(' Template', '')}" to create daily at ${schedule.time}`);
          } else {
            toast.info(`Disabled scheduling for "${template.name.replace(' Template', '')}"`);
          }
        }
        
        return updated;
      });
    } catch (error) {
      console.error('Error updating template schedule:', error);
      toast.error('Error updating schedule');
    }
  };

  const value = {
    lists,
    deletedLists,
    templateLists,
    activeListId,
    addList,
    deleteList,
    restoreList,
    permanentlyDeleteList,
    setActiveList: setActiveListId,
    updateList,
    addTodoToList,
    deleteTodoFromList,
    toggleTodo,
    updateTodoPriority,
    restoreTodoInList,
    permanentlyDeleteTodo,
    saveAsTemplate,
    deleteTemplate,
    useTemplate,
    addTextItemToList,
    deleteTextItemFromList,
    restoreTextItemInList,
    updateTextItem,
    permanentlyDeleteTextItem,
    reorderLists,
    updateTemplateSchedule,
  };

  return (
    <ListsContext.Provider value={value}>
      {children}
    </ListsContext.Provider>
  );
}

export const useLists = () => {
  const context = useContext(ListsContext);
  if (context === undefined) {
    throw new Error('useLists must be used within a ListsProvider');
  }
  return context;
};