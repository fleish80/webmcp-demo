import type { Todo, TodoStore } from '../todo-store';

/** Renders the list from the store and wires the per-item and clear-completed actions. */
export function mountTodoList(root: HTMLElement, store: TodoStore): void {
  const list = root.querySelector<HTMLUListElement>('[data-role="list"]')!;
  root.querySelector('[data-action="clear-completed"]')!.addEventListener('click', () => store.clearCompleted());

  const render = () => list.replaceChildren(...store.todos.map((todo) => renderItem(todo, store)));
  store.subscribe(render);
  render();
}

function renderItem(todo: Todo, store: TodoStore): HTMLLIElement {
  const li = document.createElement('li');
  li.className = `todo-item priority-${todo.priority}${todo.done ? ' todo-done' : ''}${
    todo.source === 'agent' ? ' todo-agent' : ''
  }`;
  li.innerHTML = `
    <span class="todo-id">#${todo.id}</span>
    <span class="todo-text"></span>
    <span class="todo-source">${todo.source === 'agent' ? '🤖 agent' : '👤 you'}</span>
    <button type="button" class="todo-complete" ${todo.done ? 'disabled' : ''}>✓</button>
    <button type="button" class="todo-remove">✕</button>
  `;
  li.querySelector('.todo-text')!.textContent = todo.text;
  li.querySelector('.todo-complete')!.addEventListener('click', () => store.complete(todo.id, 'user'));
  li.querySelector('.todo-remove')!.addEventListener('click', () => store.remove(todo.id));
  return li;
}
