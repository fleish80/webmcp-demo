import { parseInputSchema } from '@webmcp-demo/devkit';
import type { ExplainerLab } from '../lab';

export function mountDiscover(root: HTMLElement, lab: ExplainerLab): void {
  const button = root.querySelector<HTMLButtonElement>('[data-action="discover"]')!;
  const result = root.querySelector<HTMLElement>('[data-role="result"]')!;
  const output = root.querySelector<HTMLPreElement>('[data-role="output"]')!;

  button.addEventListener('click', () => void lab.discover());

  lab.subscribe(() => {
    button.disabled = !lab.registered;
    result.hidden = !lab.discovered;
    const tools = lab.discoveredTools;
    if (tools === null) return;
    button.textContent = '↻ Run getTools() again';
    const printable = tools.map(({ name, description, inputSchema }) => ({
      name,
      description,
      inputSchema: parseInputSchema(inputSchema),
    }));
    output.textContent = JSON.stringify(printable, null, 2);
  });
}
