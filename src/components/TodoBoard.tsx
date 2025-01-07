import React, { useState } from 'react';
import { useLists } from '../context/ListsContext';
import { TodoList } from './TodoList';
import { ConfirmationModal } from './ConfirmationModal';
import { ListTodo, ListPlus } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface TodoBoardProps {
  activeView: 'all' | 'deleted' | 'templates';
}

export function TodoBoard({ activeView }: TodoBoardProps) {
  const { 
    lists, 
    deletedLists, 
    templateLists,
    activeListId,
    setActiveList,
    deleteList,
    restoreList,
    permanentlyDeleteList,
    deleteTemplate,
    reorderLists
  } = useLists();

  const [draggedId, setDraggedId] = React.useState<number | null>(null);
  const [listToDelete, setListToDelete] = useState<{ id: number; name: string } | null>(null);
  const [mobileListType, setMobileListType] = useState<'tasks' | 'text'>('tasks');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getViewLists = () => {
    switch (activeView) {
      case 'all':
        return lists;
      case 'deleted':
        return deletedLists;
      case 'templates':
        return templateLists;
      default:
        return [];
    }
  };

  let viewLists = getViewLists();
  // Filter lists by type on mobile
  if (window.innerWidth < 768 && activeView === 'all') {
    viewLists = viewLists.filter(list => list.type === mobileListType);
  }
  
  const draggedList = viewLists.find(list => list.id === draggedId);

  const handleDragStart = (event: DragStartEvent) => {
    setDraggedId(Number(event.active.id));
    document.body.classList.add('cursor-grabbing');
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggedId(null);
    document.body.classList.remove('cursor-grabbing');

    if (!over) return;

    if (active.id !== over.id) {
      const oldIndex = viewLists.findIndex((list) => list.id === active.id);
      const newIndex = viewLists.findIndex((list) => list.id === over.id);
      
      const newOrder = arrayMove(viewLists, oldIndex, newIndex);
      reorderLists(activeView, newOrder);
    }
  };

  const handleDragCancel = () => {
    setDraggedId(null);
    document.body.classList.remove('cursor-grabbing');
  };

  const handleDeleteList = (id: number) => {
    if (activeView === 'deleted') {
      const list = deletedLists.find(l => l.id === id);
      if (list) {
        setListToDelete({ id: list.id, name: list.name });
      }
    } else if (activeView === 'templates') {
      deleteTemplate(id);
    } else {
      deleteList(id);
    }
  };

  if (viewLists.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <p className="text-gray-500 dark:text-gray-400 text-lg px-4 text-center">
          {activeView === 'all' 
            ? 'No lists yet. Create your first list!' 
            : activeView === 'deleted'
            ? 'No deleted lists'
            : 'No templates available'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 p-0 pb-24 md:p-6 overflow-auto bg-white dark:bg-gray-800">
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 3xl:grid-cols-3 gap-6 md:gap-6 max-w-[2400px] mx-auto">
            <SortableContext
              items={viewLists.map(list => list.id)}
              strategy={verticalListSortingStrategy}
            >
              {viewLists.map(list => (
                <TodoList
                  key={list.id}
                  list={list}
                  isActive={list.id === activeListId}
                  isDragging={list.id === draggedId}
                  onActivate={() => setActiveList(list.id)}
                  onDelete={() => handleDeleteList(list.id)}
                  onRestore={activeView === 'deleted' ? () => restoreList(list.id) : undefined}
                  isTemplate={activeView === 'templates'}
                  activeView={activeView}
                  mobileListType={mobileListType}
                  setMobileListType={setMobileListType}
                />
              ))}
            </SortableContext>

            <DragOverlay>
              {draggedId && draggedList ? (
                <div className="opacity-80 rotate-[2deg] scale-105 transition-transform">
                  <TodoList
                    list={draggedList}
                    isActive={false}
                    isDragging={true}
                    onActivate={() => {}}
                    onDelete={() => {}}
                    isTemplate={activeView === 'templates'}
                    activeView={activeView}
                  />
                </div>
              ) : null}
            </DragOverlay>
          </div>
        </DndContext>
      </div>

      <ConfirmationModal
        isOpen={!!listToDelete}
        onClose={() => setListToDelete(null)}
        onConfirm={() => {
          if (listToDelete) {
            permanentlyDeleteList(listToDelete.id);
          }
        }}
        title="Delete List Permanently"
        message={`Are you sure you want to permanently delete "${listToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete Permanently"
      />
    </>
  );
}