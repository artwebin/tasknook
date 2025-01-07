import { api } from '../utils/api';
import { LIST_TYPES } from '../utils/constants';
import { ValidationError } from '../utils/errors';
import type { TodoList } from '../types';

export const listsService = {
  async getLists(userId: string) {
    return api.lists.getAll(userId);
  },

  async createList(userId: string, data: {
    name: string;
    type: 'tasks' | 'text';
    is_template?: boolean;
    recurring_schedule?: {
      enabled: boolean;
      time: string;
    };
  }) {
    if (!data.name.trim()) {
      throw new ValidationError('List name is required');
    }

    if (!Object.values(LIST_TYPES).includes(data.type)) {
      throw new ValidationError('Invalid list type');
    }

    return api.lists.create({
      user_id: userId,
      name: data.name,
      type: data.type,
      is_template: data.is_template || false,
      is_deleted: false,
      recurring_schedule: data.recurring_schedule
    });
  }
};