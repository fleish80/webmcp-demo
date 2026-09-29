import type { TodoStore } from '../todo-store';

/**
 * The declarative WebMCP form: the `toolname`/`tooldescription`/`toolautosubmit` attributes in
 * index.html register it as a tool with no JS. This handler serves both humans and agents; the
 * `submit` event's `agentInvoked` flag says which.
 */
export function mountDeclarativeForm(form: HTMLFormElement, store: TodoStore): void {
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const agentInvoked = event.agentInvoked === true;
    const data = new FormData(form);
    const text = String(data.get('text') ?? '').trim();
    if (!text) return;
    store.add(text, 'medium', agentInvoked ? 'agent' : 'user');
    // After preventDefault, an agent-invoked submission must resolve via respondWith();
    // resetting the form during a pending agent submission would cancel it.
    if (agentInvoked && typeof event.respondWith === 'function') {
      const todo = store.todos.at(-1);
      event.respondWith(Promise.resolve(todo ? `Added todo #${todo.id}: "${todo.text}".` : 'Added.'));
    } else {
      form.reset();
    }
  });
}
