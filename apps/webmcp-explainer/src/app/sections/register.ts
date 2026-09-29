import type { ExplainerLab } from '../lab';

export function mountRegister(root: HTMLElement, lab: ExplainerLab): void {
  const button = root.querySelector<HTMLButtonElement>('[data-action="register"]')!;
  const result = root.querySelector<HTMLElement>('[data-role="result"]')!;

  button.addEventListener('click', () => void lab.register());

  lab.subscribe(() => {
    button.disabled = lab.registered;
    button.textContent = lab.registered ? '✓ registered' : '▶ Run registerTool()';
    result.hidden = !lab.registered;
  });
}
