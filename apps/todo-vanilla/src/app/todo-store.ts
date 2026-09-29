export type TodoPriority = 'low' | 'medium' | 'high';
export type ChangeSource = 'user' | 'agent';

export interface Todo {
  id: number;
  text: string;
  priority: TodoPriority;
  done: boolean;
  source: ChangeSource;
}

export class TodoStore {
  #todos: Todo[] = [];
  #nextId = 1;
  #listeners = new Set<() => void>();

  get todos(): readonly Todo[] {
    return this.#todos;
  }

  add(text: string, priority: TodoPriority, source: ChangeSource): void {
    const todo: Todo = { id: this.#nextId++, text, priority, done: false, source };
    this.#todos = [...this.#todos, todo];
    this.#notify();
  }

  complete(id: number, source: ChangeSource): void {
    this.#todos = this.#todos.map((t) => (t.id === id && !t.done ? { ...t, done: true, source } : t));
    this.#notify();
  }

  remove(id: number): void {
    this.#todos = this.#todos.filter((t) => t.id !== id);
    this.#notify();
  }

  clearCompleted(): void {
    this.#todos = this.#todos.filter((t) => !t.done);
    this.#notify();
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #notify(): void {
    for (const listener of this.#listeners) listener();
  }
}
