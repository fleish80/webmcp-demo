import { EnvironmentProviders, inject, provideExperimentalWebMcpTools } from '@angular/core';
import { TodoPriority, TodoStore } from '../todo.store';

/**
 * App-level WebMCP tools — alive for the whole application. Each `execute` runs in the
 * injection context, so it reaches the store through `inject()` like any other consumer.
 */
export function provideTodoTools(): EnvironmentProviders {
  return provideExperimentalWebMcpTools([
    {
      name: 'listTodos',
      description:
        'Read the current to-do list, including each item id, text, priority, notes, and completion state.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const store = inject(TodoStore);
        return store.todos().length === 0 ? 'The to-do list is empty.' : JSON.stringify(store.todos(), null, 2);
      },
    },
    {
      name: 'addTodo',
      description: 'Add a new item to the to-do list. Use when the user asks to create, add, or remember a task.',
      inputSchema: {
        type: 'object',
        properties: {
          text: { type: 'string', description: 'The task description.' },
          priority: {
            type: 'string',
            enum: ['low', 'medium', 'high'],
            description: 'Task priority. Defaults to medium.',
          },
        },
        required: ['text'],
        additionalProperties: false,
      },
      execute: ({ text, priority }) => {
        if (typeof text !== 'string' || text.trim() === '') {
          throw new Error('addTodo requires a non-empty "text" argument.');
        }
        const store = inject(TodoStore);
        store.add({ text: text.trim(), priority: priority as TodoPriority | undefined }, 'agent');
        const todo = store.todos().at(-1);
        if (!todo) throw new Error('The todo was not added.');
        return `Added todo #${todo.id}: "${todo.text}" (priority: ${todo.priority}).`;
      },
    },
    {
      name: 'completeTodo',
      description: 'Mark a to-do item as done by its id. Use listTodos first to find the id.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'The id of the todo to complete.' },
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id }) => {
        const store = inject(TodoStore);
        const todo = store.todos().find((t) => t.id === Number(id) && !t.done);
        if (!todo) throw new Error(`No open todo with id ${id}.`);
        store.complete(todo.id, 'agent');
        return `Completed todo #${todo.id}: "${todo.text}".`;
      },
    },
    {
      name: 'removeTodo',
      description: 'Delete a to-do item by its id, whether or not it is done. Use listTodos first to find the id.',
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'number', description: 'The id of the todo to remove.' },
        },
        required: ['id'],
        additionalProperties: false,
      },
      execute: ({ id }) => {
        const store = inject(TodoStore);
        const todo = store.todos().find((t) => t.id === Number(id));
        if (!todo) throw new Error(`No todo with id ${id}.`);
        store.remove(todo.id);
        return `Removed todo #${todo.id}: "${todo.text}".`;
      },
    },
  ]);
}
