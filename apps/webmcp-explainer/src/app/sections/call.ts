import type { ExplainerLab } from '../lab';
import { renderWireLog } from '../ui/wire-log';

export function mountCall(root: HTMLElement, lab: ExplainerLab): void {
  const args = root.querySelector<HTMLInputElement>('[data-role="args"]')!;
  const button = root.querySelector<HTMLButtonElement>('[data-action="call"]')!;
  const log = root.querySelector<HTMLOListElement>('[data-role="wire-log"]')!;

  button.addEventListener('click', () => void lab.callAsAgent(args.value));

  lab.subscribe(() => {
    button.disabled = !lab.discovered;
    renderWireLog(log, lab.wire);
  });
}
