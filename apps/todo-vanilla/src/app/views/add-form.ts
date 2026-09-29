import type { TodoPriority, TodoStore } from '../todo-store';

/** The human way in: a plain form that writes to the store. */
export function mountAddForm(form: HTMLFormElement, store: TodoStore): void {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const text = String(data.get('text') ?? '').trim();
    if (!text) return;
    store.add(text, data.get('priority') as TodoPriority, 'user');
    form.reset();
  });
}
