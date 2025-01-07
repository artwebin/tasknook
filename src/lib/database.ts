import { supabase } from './supabase';
import { TodoList, Todo, TextItem } from '../types';
import { format, isAfter, parseISO } from 'date-fns';

export interface DbList {
  id: string;
  user_id: string;
  name: string;
  type: 'tasks' | 'text';
  created_at: string;
  is_template: boolean;
  is_deleted: boolean;
  recurring_schedule: {
    enabled: boolean;
    time: string;
  } | null;
}

export interface DbItem {
  id: string;
  list_id: string;
  text: string;
  type: 'task' | 'text';
  priority: 'low' | 'medium' | 'high' | null;
  completed: boolean;
  is_deleted: boolean;
  created_at: string;
  deleted_at: string | null;
}

export async function getLists(userId: string) {
  const { data: lists, error } = await supabase
    .from('lists')
    .select(`
      *,
      items (
        id,
        text,
        type,
        priority,
        completed,
        is_deleted,
        created_at,
        deleted_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  const priorityWeight = { high: 3, medium: 2, low: 1 };

  return lists.map((list: DbList & { items: DbItem[] }) => ({
    id: parseInt(list.id),
    name: list.name,
    type: list.type,
    is_template: list.is_template,
    is_deleted: list.is_deleted,
    deletedAt: list.deleted_at,
    createdAt: list.created_at,
    todos: list.items
      .filter(item => item.type === 'task' && !item.is_deleted)
      .sort((a, b) => {
        const aPriority = a.priority || 'low';
        const bPriority = b.priority || 'low';
        return priorityWeight[bPriority] - priorityWeight[aPriority];
      })
      .map(item => ({
        id: parseInt(item.id),
        text: item.text,
        completed: item.completed,
        priority: item.priority as 'low' | 'medium' | 'high',
        isRemoving: false,
        isCompleting: false
      })),
    textItems: list.items
      .filter(item => item.type === 'text' && !item.is_deleted)
      .map(item => ({
        id: parseInt(item.id),
        text: item.text,
        isRemoving: false
      })),
    deletedTodos: list.items
      .filter(item => item.type === 'task' && item.is_deleted)
      .map(item => ({
        id: parseInt(item.id),
        text: item.text,
        completed: item.completed,
        priority: item.priority as 'low' | 'medium' | 'high',
        isRemoving: false,
        isCompleting: false,
        deletedAt: item.deleted_at
      })),
    deletedTextItems: list.items
      .filter(item => item.type === 'text' && item.is_deleted)
      .map(item => ({
        id: parseInt(item.id),
        text: item.text,
        isRemoving: false
      })),
    recurringSchedule: list.recurring_schedule
  }));
}

export async function createList(userId: string, list: Omit<TodoList, 'id'>) {
  const { data, error } = await supabase
    .from('lists')
    .insert({
      user_id: userId,
      name: list.name,
      type: list.type,
      is_template: 'is_template' in list ? list.is_template : false,
      is_deleted: false,
      recurring_schedule: list.recurringSchedule
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateList(listId: string, updates: Partial<DbList>) {
  const { error } = await supabase
    .from('lists')
    .update(updates)
    .eq('id', listId);

  if (error) throw error;
}

export async function createItem(item: {
  list_id: string;
  text: string;
  type: 'task' | 'text';
  priority?: 'low' | 'medium' | 'high';
}) {
  const { data, error } = await supabase
    .from('items')
    .insert(item)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateItem(itemId: string, updates: Partial<DbItem>) {
  const { error } = await supabase
    .from('items')
    .update(updates)
    .eq('id', itemId);

  if (error) throw error;
}

export async function deleteItem(itemId: string, permanent: boolean = false) {
  if (permanent) {
    const { error } = await supabase
      .from('items')
      .delete()
      .eq('id', itemId)
      .single();

    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('items')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', itemId)
      .single();

    if (error) throw error;
  }
}

export async function restoreItem(itemId: string) {
  const { error } = await supabase
    .from('items')
    .update({
      is_deleted: false,
      deleted_at: null,
      completed: false // Reset completed status when restoring
    })
    .eq('id', itemId);

  if (error) throw error;
}

export async function deleteListPermanently(listId: string) {
  const { error } = await supabase
    .from('lists')
    .delete()
    .eq('id', listId)
    .single();

  if (error) throw error;
}

export async function checkAndCreateRecurringLists() {
  const now = new Date();
  const currentTime = format(now, 'HH:mm');

  // Get all template lists with recurring schedules
  const { data: templates, error: templatesError } = await supabase
    .from('lists')
    .select('*')
    .eq('is_template', true)
    .not('recurring_schedule', 'is', null);

  if (templatesError) throw templatesError;

  for (const template of templates) {
    if (!template.recurring_schedule?.enabled) continue;

    const scheduleTime = template.recurring_schedule.time;
    if (currentTime !== scheduleTime) continue;

    // Find the existing list for this template
    const { data: existingLists, error: existingError } = await supabase
      .from('lists')
      .select('*')
      .eq('name', template.name.replace(' Template', ''))
      .eq('user_id', template.user_id)
      .eq('is_template', false)
      .eq('is_deleted', false);

    if (existingError) throw existingError;

    let targetList;
    if (existingLists?.length) {
      targetList = existingLists[0];
      
      // Delete all existing items
      const { error: deleteError } = await supabase
        .from('items')
        .delete()
        .eq('list_id', targetList.id);
      
      if (deleteError) throw deleteError;

      // Update the list's timestamp
      const { error: updateError } = await supabase
        .from('lists')
        .update({ created_at: new Date().toISOString() })
        .eq('id', targetList.id);
      
      if (updateError) throw updateError;
    } else {
      // Create new list if none exists
      const { data: newList, error: createError } = await supabase
        .from('lists')
        .insert({
          user_id: template.user_id,
          name: template.name.replace(' Template', ''),
          type: template.type,
          is_template: false,
          is_deleted: false
        })
        .select()
        .single();

      if (createError) throw createError;
      targetList = newList;
    }

    // Copy template items to target list
    const { data: templateItems, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('list_id', template.id)
      .eq('is_deleted', false);

    if (itemsError) throw itemsError;

    if (templateItems?.length) {
      const newItems = templateItems.map(item => ({
        list_id: targetList.id,
        text: item.text,
        type: item.type,
        priority: item.priority,
        completed: false,
        is_deleted: false
      }));

      const { error: insertError } = await supabase
        .from('items')
        .insert(newItems);

      if (insertError) throw insertError;
    }
  }
}