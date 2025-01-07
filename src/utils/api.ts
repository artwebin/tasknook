import { supabase } from '../lib/supabase';
import { API_ENDPOINTS } from './constants';
import { DatabaseError } from './errors';

export async function fetchFromSupabase(
  table: string,
  query: any,
  errorMessage: string = 'API Error'
) {
  try {
    const { data, error } = await query;
    
    if (error) {
      throw new DatabaseError(error.message);
    }
    
    return data;
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    throw error;
  }
}

export const api = {
  lists: {
    getAll: (userId: string) => 
      fetchFromSupabase(
        API_ENDPOINTS.LISTS,
        supabase
          .from(API_ENDPOINTS.LISTS)
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
          .order('created_at', { ascending: false }),
        'Error fetching lists'
      ),
      
    create: (data: any) =>
      fetchFromSupabase(
        API_ENDPOINTS.LISTS,
        supabase
          .from(API_ENDPOINTS.LISTS)
          .insert(data)
          .select()
          .single(),
        'Error creating list'
      )
  },
  
  items: {
    create: (data: any) =>
      fetchFromSupabase(
        API_ENDPOINTS.ITEMS,
        supabase
          .from(API_ENDPOINTS.ITEMS)
          .insert(data)
          .select()
          .single(),
        'Error creating item'
      ),
      
    update: (id: string, data: any) =>
      fetchFromSupabase(
        API_ENDPOINTS.ITEMS,
        supabase
          .from(API_ENDPOINTS.ITEMS)
          .update(data)
          .eq('id', id),
        'Error updating item'
      )
  }
};