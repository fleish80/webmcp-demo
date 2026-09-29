import { computed, declareExperimentalWebMcpTool, Service, signal } from '@angular/core';

export type TodoPriority = 'low' | 'medium' | 'high';
export type ChangeSource = 'user' | 'agent';

export interface Todo {
  id: number;
  text: string;
  priority: TodoPriority;
  notes: string;
  done: boolean;
  source: ChangeSource;
}

// @Service() (Angular 22) is the ergonomic replacement for @Injectable({ providedIn: 'root' }):
// auto-provided at root, tree-shakable, no constructor-parameter DI.
@Service()
export class TodoStore {
  readonly #todos = signal<Todo[]>([]);
  #nextId = 1;

  readonly todos = this.#todos.asReadonly();
  readonly openCount = computed(() => this.#todos().filter((t) => !t.done).length);
  readonly doneCount = computed(() => this.#todos().filter((t) => t.done).length);

  constructor() {
    // A service-level tool: registered when the service is first created, unregistered
    // when its injector is destroyed. The execute callback reads live signal state.
    void declareExperimentalWebMcpTool({
      name: 'getTodoCount',
      description: 'Read how many to-do items are open and how many are done.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => `Open: ${this.openCount()}, done: ${this.doneCount()}.`,
    });
  }

  add(input: { text: string; priority?: TodoPriority; notes?: string }, source: ChangeSource): void {
    const todo: Todo = {
      id: this.#nextId++,
      text: input.text,
      priority: input.priority ?? 'medium',
      notes: input.notes ?? '',
      done: false,
      source,
    };
    this.#todos.update((todos) => [...todos, todo]);
  }

  complete(id: number, source: ChangeSource): void {
    this.#todos.update((todos) =>
      todos.map((t) => (t.id === id && !t.done ? { ...t, done: true, source } : t))
    );
  }

  remove(id: number): void {
    this.#todos.update((todos) => todos.filter((t) => t.id !== id));
  }
}
