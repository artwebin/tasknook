import React, { useState } from 'react';
import { TodoItem } from './TodoItem';
import { TextItem } from './TextItem';
import { TodoInput } from './TodoInput';
import { TextInput } from './TextInput';
import { Trash2, RotateCcw, ChevronDown, ChevronUp, Save, Copy, GripVertical, ListTodo, ListPlus, Clock, AlarmClock, Plus, MoreVertical, Pencil } from 'lucide-react';
import { TodoList as TodoListType } from '../types';
import { useLists } from '../context/ListsContext';
import { Modal } from './Modal';
import { RecurringModal } from './RecurringModal';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDistanceToNow } from 'date-fns';

interface TodoListProps {
  list: TodoListType;
  isActive: boolean;
  isDragging?: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onRestore?: () => void;
  isTemplate?: boolean;
  activeView: 'all' | 'deleted' | 'templates';
  mobileListType?: 'tasks' | 'text';
  setMobileListType?: (type: 'tasks' | 'text') => void;
}

export function TodoList({ 
  list, 
  isActive, 
  isDragging,
  onActivate, 
  onDelete, 
  onRestore, 
  isTemplate,
  activeView,
  mobileListType,
  setMobileListType
}: TodoListProps) {
  const [isDeletedExpanded, setIsDeletedExpanded] = useState(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [showMobileInput, setShowMobileInput] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: list.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const { 
    addTodoToList, 
    deleteTodoFromList, 
    toggleTodo, 
    updateTodoPriority, 
    restoreTodoInList, 
    permanentlyDeleteTodo,
    saveAsTemplate,
    useTemplate,
    addTextItemToList,
    deleteTextItemFromList,
    restoreTextItemInList,
    permanentlyDeleteTextItem,
    updateTemplateSchedule
  } = useLists();

  const handleAddTodo = (text: string) => {
    if (list.type === 'tasks') {
      addTodoToList(list.id, {
        id: Date.now(),
        text,
        completed: false,
        priority: 'low',
        isRemoving: false,
        isCompleting: false
      });
    } else {
      addTextItemToList(list.id, {
        id: Date.now(),
        text,
        isRemoving: false
      });
    }
  };

  const handleToggle = (todoId: number) => {
    toggleTodo(list.id, todoId);
    setTimeout(() => {
      const todo = list.todos.find(t => t.id === todoId);
      if (todo) {
        todo.isCompleting = true;
      }
      setTimeout(() => {
      deleteTodoFromList(list.id, todoId);
      }, 300);
    }, 500);
  };

  const handleSaveTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveAsTemplate(list.id);
  };

  const handleUseTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTemplateModalOpen(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const handleRestore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRestore?.();
  };

  const handleRecurringClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRecurringModalOpen(true);
  };

  const ListTypeIcon = list.type === 'tasks' ? ListTodo : ListPlus;

  return (
    <>
      <div 
        ref={setNodeRef}
        style={style}
        className={`bg-white dark:bg-gray-800 md:rounded-xl transition-all duration-300 md:border md:border-gray-200 md:dark:border-gray-700 ${
          isActive 
            ? 'shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]' 
            : 'shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.2)]'
        } ${isDragging ? 'opacity-50' : ''} py-6 mb-4 border-y border-gray-200/95 dark:border-gray-700/95 last:border-b-0 last:mb-0`}
        onClick={onActivate}
      >
        <div className="px-2 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button
                className="hidden md:block p-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 cursor-grab active:cursor-grabbing"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="w-5 h-5" />
              </button>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  {activeView === 'all' ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.innerWidth < 768) {
                          setMobileListType?.(mobileListType === 'tasks' ? 'text' : 'tasks');
                        }
                      }}
                      className="md:pointer-events-none p-1 -m-1 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {mobileListType === 'tasks' ? (
                        <ListTodo className="w-5 h-5" />
                      ) : (
                        <ListPlus className="w-5 h-5" />
                      )}
                    </button>
                  ) : (
                    <ListTypeIcon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                  )}
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {list.name}
                  </h2>
                  {isTemplate && list.recurringSchedule?.enabled && (
                    <AlarmClock className="w-5 h-5 text-[#723b78] dark:text-[#e84545]" />
                  )}
                </div>
                <div className="hidden md:flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Created {formatDistanceToNow(new Date(list.createdAt))} ago</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!showMobileInput && (
                <>
                  <div className="relative md:hidden">                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowMobileMenu(!showMobileMenu);
                      }}
                      className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-all rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>
                    {showMobileMenu && (
                      <>
                        <div 
                          className="fixed inset-0 z-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMobileMenu(false);
                          }}
                        />
                        <div className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-40">
                          {!isTemplate && list.type === 'tasks' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMobileInput(true);
                                setShowMobileMenu(false);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                              Add Task
                            </button>
                          )}
                          {isTemplate && list.type === 'tasks' && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRecurringClick(e);
                                  setShowMobileMenu(false);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <AlarmClock className="w-4 h-4" />
                                Set Schedule
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleUseTemplate(e);
                                  setShowMobileMenu(false);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Copy className="w-4 h-4" />
                                Use Template
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(e);
                                  setShowMobileMenu(false);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete Template
                              </button>
                            </>
                          )}
                          {!onRestore && !isTemplate && list.type === 'tasks' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveTemplate(e);
                                setShowMobileMenu(false);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Save className="w-4 h-4" />
                              Save as Template
                            </button>
                          )}
                          {onRestore ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRestore(e);
                                setShowMobileMenu(false);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <RotateCcw className="w-4 h-4" />
                              Restore List
                            </button>
                          ) : null}
                          {!isTemplate && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(e);
                                setShowMobileMenu(false);
                              }}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              {list.type === 'tasks' ? "Move to Trash" : "Delete List"}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
              {!onRestore && !isTemplate && list.type === 'tasks' && (
                <button
                  onClick={handleSaveTemplate}
                  className="hidden md:block p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                  title="Save as template"
                >
                  <Save className="w-5 h-5" />
                </button>
              )}
              {!isTemplate && (
                <button
                  onClick={handleDelete}
                  className="hidden md:block p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700"
                  title={onRestore ? "Delete permanently" : list.type === 'tasks' ? "Move to trash" : "Delete list"}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
              {isTemplate && list.type === 'tasks' && (
                <>
                  <button
                    onClick={handleRecurringClick}
                    className="hidden md:block p-2 text-gray-400 dark:text-gray-500 hover:text-purple-500 dark:hover:text-purple-400 transition-all rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                    title="Set recurring schedule"
                  >
                    <AlarmClock className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleUseTemplate}
                    className="hidden md:block p-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-all rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700"
                    title="Use template"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="hidden md:block p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-all rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700"
                    title="Delete template"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </>
              )}
              {onRestore ? (
                <button
                  onClick={handleRestore}
                  className="hidden md:block p-2 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-all rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700"
                  title="Restore list"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              ) : null}
            </div>
          </div>

          <div className="space-y-4">
            {!isTemplate && (
              list.type === 'tasks' ? (
                <>
                  <div className="hidden md:block">
                    <TodoInput onAdd={handleAddTodo} />
                  </div>
                  {showMobileInput && (
                    <div className="md:hidden">
                      <TodoInput onAdd={(text) => {
                        handleAddTodo(text);
                        setShowMobileInput(false);
                      }} />
                    </div>
                  )}
                </>
              ) : (
                <TextInput onAdd={handleAddTodo} />
              )
            )}
              {list.type === 'tasks' ? (
                list.todos.map(todo => (
                  <div
                    key={todo.id}
                  >
                    <TodoItem
                      todo={todo}
                      onToggle={() => handleToggle(todo.id)}
                      onDelete={() => deleteTodoFromList(list.id, todo.id)}
                      onPriorityChange={() => updateTodoPriority(list.id, todo.id)}
                    />
                  </div>
                ))
              ) : (
                list.textItems.map(item => (
                  <div
                    key={item.id}
                  >
                    <TextItem
                      key={item.id}
                      listId={list.id}
                      item={item}
                      onDelete={() => deleteTextItemFromList(list.id, item.id)}
                    />
                  </div>
                ))
              )}

            {!isTemplate && (
              <div className="hidden md:block">
                {list.type === 'tasks' && list.deletedTodos.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeletedExpanded(!isDeletedExpanded);
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {isDeletedExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Completed Tasks ({list.deletedTodos.length})
                    </button>
                      {isDeletedExpanded && (
                        <div
                          className="mt-3 space-y-3 overflow-hidden"
                        >
                          {list.deletedTodos.map(todo => (
                            <TodoItem
                              key={todo.id}
                              todo={todo}
                              onToggle={() => restoreTodoInList(list.id, todo.id)}
                              onDelete={() => permanentlyDeleteTodo(list.id, todo.id)}
                              onPriorityChange={() => {}}
                            />
                          ))}
                        </div>
                      )}
                  </div>
                )}
                {list.type === 'text' && list.deletedTextItems.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeletedExpanded(!isDeletedExpanded);
                      }}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      {isDeletedExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Deleted Items ({list.deletedTextItems.length})
                    </button>
                      {isDeletedExpanded && (
                        <div
                          className="mt-3 space-y-3 overflow-hidden"
                        >
                          {list.deletedTextItems.map(item => (
                            <TextItem
                              key={item.id}
                              listId={list.id}
                              item={item}
                              onDelete={() => permanentlyDeleteTextItem(list.id, item.id)}
                              onRestore={() => restoreTextItemInList(list.id, item.id)}
                            />
                          ))}
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSubmit={(name) => {
          useTemplate(list.id, name);
        }}
        title="Create List from Template"
        placeholder="Enter list name..."
        submitText="Create List"
      />

      <RecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        onSave={(schedule) => updateTemplateSchedule(list.id, schedule)}
        initialSchedule={list.recurringSchedule}
      />
    </>
  );
}