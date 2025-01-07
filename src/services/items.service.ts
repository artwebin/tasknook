import { api } from '../utils/api';
import { ITEM_TYPES, PRIORITIES } from '../utils/constants';
import { ValidationError } from '../utils/errors';

export const itemsService = {
  async createItem(listId: string, data: {
    text: string;
    type: 'task' | 'text';
    priority?: 'low' | 'medium' | 'high';
  }) {
    if (!text.trim()) {
      throw new ValidationError('Item text is required');
    }

    return api.items.create({
      list_id: listId,
      text: data.text,
      type: data.type,
      priority: data.type === ITEM_TYPES.TASK ? (data.priority || PRIORITIES.LOW) : null,
      completed: false,
      is_deleted: false
    });
  },

  async updateItem(id: string, data: {
    text?: string;
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
    is_deleted?: boolean;
  }) {
    if (data.text !== undefined && !data.text.trim()) {
      throw new ValidationError('Item text cannot be empty');
    }

    return api.items.update(id, {
      ...data,
      ...(data.is_deleted ? { deleted_at: new Date().toISOString() } : {})
    });
  }
};