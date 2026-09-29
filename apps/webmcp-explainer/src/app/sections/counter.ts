import type { CounterStore } from '../counter-store';

export function mountCounter(root: HTMLElement, store: CounterStore): void {
  const card = root.querySelector<HTMLElement>('[data-role="card"]')!;
  const value = root.querySelector<HTMLElement>('[data-role="value"]')!;
  const actor = root.querySelector<HTMLElement>('[data-role="actor"]')!;

  root.querySelector('[data-action="increment"]')!.addEventListener('click', () => store.increment(1, 'you'));

  store.subscribe(() => {
    value.textContent = String(store.count);
    actor.textContent = store.lastActor === 'agent' ? 'last changed by 🤖 the agent' : 'last changed by 👤 you';
    // Re-adding the class restarts the CSS animation; the reflow read forces the removal to apply first.
    card.classList.remove('counter-flash-you', 'counter-flash-agent');
    void card.offsetWidth;
    card.classList.add(store.lastActor === 'agent' ? 'counter-flash-agent' : 'counter-flash-you');
  });
}
