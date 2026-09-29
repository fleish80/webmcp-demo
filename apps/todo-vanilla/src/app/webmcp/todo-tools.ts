import type { ModelContext } from '@mcp-b/webmcp-types';
import type { TodoPriority, TodoStore } from '../todo-store';

/**
 * The raw WebMCP API, no framework involved: each call hands the browser a typed tool —
 * name + description (how the agent decides when to use it), a JSON Schema for the
 * arguments, and an `execute` callback. Results follow the MCP content-block convention
 * (`{content: [{type: 'text', text}]}`), which every MCP client understands.
 */
export async function registerTodoTools(modelContext: ModelContext, store: TodoStore): Promise<void> {
  const text = (value: string) => ({ content: [{ type: 'text' as const, text: value }] });

  await modelContext.registerTool({
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
    execute: ({ text: taskText, priority }) => {
      if (typeof taskText !== 'string' || taskText.trim() === '') {
        throw new Error('addTodo requires a non-empty "text" argument.');
      }
      store.add(taskText.trim(), (priority as TodoPriority) ?? 'medium', 'agent');
      const todo = store.todos.at(-1);
      if (!todo) throw new Error('The todo was not added.');
      return text(`Added todo #${todo.id}: "${todo.text}" (priority: ${todo.priority}).`);
    },
  });

  await modelContext.registerTool({
    name: 'listTodos',
    description: 'Read the current to-do list, including each item id, text, priority, and completion state.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    execute: () =>
      text(
        store.todos.length === 0
          ? 'The to-do list is empty.'
          : JSON.stringify(store.todos, null, 2)
      ),
  });

  await modelContext.registerTool({
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
      const todo = store.todos.find((t) => t.id === Number(id) && !t.done);
      if (!todo) throw new Error(`No open todo with id ${id}.`);
      store.complete(todo.id, 'agent');
      return text(`Completed todo #${todo.id}: "${todo.text}".`);
    },
  });

  await modelContext.registerTool({
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
      const todo = store.todos.find((t) => t.id === Number(id));
      if (!todo) throw new Error(`No todo with id ${id}.`);
      store.remove(todo.id);
      return text(`Removed todo #${todo.id}: "${todo.text}".`);
    },
  });

  await modelContext.registerTool({
    name: 'clearCompleted',
    description: 'Remove every completed item from the to-do list.',
    inputSchema: { type: 'object', properties: {}, additionalProperties: false },
    execute: () => {
      const done = store.todos.filter((t) => t.done).length;
      store.clearCompleted();
      return text(`Removed ${done} completed todo(s).`);
    },
  });
}
