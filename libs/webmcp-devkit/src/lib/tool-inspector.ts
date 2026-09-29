import type { ChromeModelContext, RegisteredTool } from '@mcp-b/webmcp-types';
import type { ModelContextInfo } from './ensure-model-context';
import { exampleArgs, parseInputSchema } from './schema';
import { INSPECTOR_STYLES } from './tool-inspector.styles';

type LogKind = 'lifecycle' | 'call' | 'error';

const STYLE_ID = 'webmcp-inspector-styles';

/**
 * Mounts the WebMCP Tool Inspector into `host`: a live view of every tool the page has
 * registered on `modelContext`, with manual invocation (via the Chromium `executeTool`
 * extension, which the polyfill also implements) and a scrolling call log. Uses only the
 * standard observation surface — `getTools()` + `toolchange` events — so it works the same
 * against the native API and the polyfill. Returns an unmount function.
 */
export function mountToolInspector(host: HTMLElement, info: ModelContextInfo): () => void {
  const modelContext = info.modelContext as ChromeModelContext;
  const canExecute = typeof modelContext.executeTool === 'function';
  const canObserve = typeof modelContext.getTools === 'function' && typeof modelContext.addEventListener === 'function';

  if (!document.getElementById(STYLE_ID)) {
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = INSPECTOR_STYLES;
    document.head.append(style);
  }

  const root = document.createElement('aside');
  root.className = 'wmi-panel';
  root.innerHTML = `
    <header class="wmi-header">
      <h2 class="wmi-title">WebMCP Tool Inspector</h2>
      <span class="wmi-badge wmi-badge-${info.backend}">${info.backend}</span>
    </header>
    <section class="wmi-tools"></section>
    <section class="wmi-log-section">
      <h3 class="wmi-log-title">Activity log</h3>
      <ol class="wmi-log"></ol>
    </section>
  `;
  host.append(root);

  const toolsEl = root.querySelector<HTMLElement>('.wmi-tools');
  const logEl = root.querySelector<HTMLOListElement>('.wmi-log');
  if (!toolsEl || !logEl) throw new Error('Inspector template failed to render.');

  const log = (kind: LogKind, text: string) => {
    const li = document.createElement('li');
    li.className = `wmi-log-entry wmi-log-${kind}`;
    li.innerHTML = `<span class="wmi-log-time">${new Date().toLocaleTimeString()}</span><pre class="wmi-log-text"></pre>`;
    li.querySelector('pre')!.textContent = text;
    logEl.prepend(li);
  };

  // Registration diffing needs the previous list; the sequence number drops out-of-order
  // getTools() responses when several toolchange events fire in quick succession.
  let knownNames = new Set<string>();
  let renderSeq = 0;

  const render = async () => {
    const seq = ++renderSeq;
    const tools = await modelContext.getTools();
    if (seq !== renderSeq) return;

    const names = new Set(tools.map((t) => t.name));
    for (const name of names) {
      if (!knownNames.has(name)) log('lifecycle', `+ registered: ${name}`);
    }
    for (const name of knownNames) {
      if (!names.has(name)) log('lifecycle', `- unregistered: ${name}`);
    }
    knownNames = names;

    if (tools.length === 0) {
      toolsEl.innerHTML = '<p class="wmi-empty">No tools registered yet.</p>';
    } else {
      toolsEl.replaceChildren(...tools.map((tool) => renderToolCard(tool)));
    }
  };

  const renderToolCard = (tool: RegisteredTool): HTMLElement => {
    const schema = parseInputSchema(tool.inputSchema);
    const card = document.createElement('article');
    card.className = 'wmi-card';
    card.innerHTML = `
      <h3 class="wmi-card-name"></h3>
      <p class="wmi-card-description"></p>
      <details class="wmi-card-schema">
        <summary>inputSchema</summary>
        <pre></pre>
      </details>
      <div class="wmi-card-run">
        <textarea class="wmi-card-args" rows="2" spellcheck="false"></textarea>
        <button type="button" class="wmi-card-button">Call tool</button>
      </div>
      <pre class="wmi-card-result" hidden></pre>
    `;
    card.querySelector('.wmi-card-name')!.textContent = tool.name;
    card.querySelector('.wmi-card-description')!.textContent = tool.description;
    card.querySelector('.wmi-card-schema pre')!.textContent = JSON.stringify(schema, null, 2);

    const argsEl = card.querySelector<HTMLTextAreaElement>('.wmi-card-args')!;
    const buttonEl = card.querySelector<HTMLButtonElement>('.wmi-card-button')!;
    const resultEl = card.querySelector<HTMLPreElement>('.wmi-card-result')!;
    argsEl.value = JSON.stringify(exampleArgs(schema));

    if (!canExecute) {
      buttonEl.disabled = true;
      buttonEl.title = 'This modelContext implementation does not expose executeTool().';
    }

    buttonEl.addEventListener('click', async () => {
      resultEl.hidden = false;
      try {
        const result = prettify(await modelContext.executeTool!(tool, argsEl.value));
        resultEl.textContent = result;
        log('call', `${tool.name}(${argsEl.value})\n→ ${result}`);
      } catch (error) {
        resultEl.textContent = String(error);
        log('error', `${tool.name}(${argsEl.value})\n✗ ${String(error)}`);
      }
    });
    return card;
  };

  const onToolChange = () => void render();
  if (canObserve) {
    modelContext.addEventListener('toolchange', onToolChange);
    void render();
  } else {
    toolsEl.innerHTML =
      '<p class="wmi-empty">This modelContext implementation does not expose getTools() — tools are registered but cannot be listed here.</p>';
  }

  return () => {
    if (canObserve) modelContext.removeEventListener('toolchange', onToolChange);
    root.remove();
  };
}

function prettify(result: unknown): string {
  if (typeof result === 'string') {
    try {
      return JSON.stringify(JSON.parse(result), null, 2);
    } catch {
      return result;
    }
  }
  return JSON.stringify(result, null, 2);
}
