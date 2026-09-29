import type { ExplainerLab } from '../lab';

export function mountHero(root: HTMLElement, lab: ExplainerLab): void {
  const badge = root.querySelector<HTMLSpanElement>('[data-role="backend"]')!;
  badge.textContent = lab.backend;
  badge.classList.add(`badge-${lab.backend}`);
}
