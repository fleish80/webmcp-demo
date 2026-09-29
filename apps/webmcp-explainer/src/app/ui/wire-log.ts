import type { WireEntry } from '../lab';

const ARROWS: Record<WireEntry['direction'], string> = { request: '→', response: '←', error: '✗' };

export function renderWireLog(list: HTMLOListElement, entries: readonly WireEntry[]): void {
  list.replaceChildren(
    ...entries.map((entry) => {
      const li = document.createElement('li');
      li.className = `wire-entry wire-${entry.direction}`;
      li.innerHTML = `<span class="wire-arrow">${ARROWS[entry.direction]}</span><pre class="wire-text"></pre>`;
      li.querySelector('pre')!.textContent = entry.text;
      return li;
    })
  );
}
