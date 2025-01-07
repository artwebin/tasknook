import { TodoList } from '../types';

// In-memory storage for demo mode
let demoLists: TodoList[] = [];
let demoId = 1;

export const demoData = {
  getLists() {
    return demoLists;
  },

  createList(list: Omit<TodoList, 'id'>) {
    const newList = {
      ...list,
      id: demoId++,
      todos: [],
      textItems: [],
      deletedTodos: [],
      deletedTextItems: [],
      createdAt: new Date().toISOString()
    };
    demoLists = [newList, ...demoLists];
    return newList;
  },

  clearData() {
    demoLists = [];
    demoId = 1;
  }
};