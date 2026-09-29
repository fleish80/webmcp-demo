import { computed, DestroyRef, effect, inject, resource, Service, signal } from '@angular/core';
import type { ChromeModelContext, RegisteredTool } from '@mcp-b/webmcp-types';
import { MODEL_CONTEXT_INFO } from '../model-context.token';

export interface InspectorLogEntry {
  kind: 'lifecycle' | 'call' | 'error';
  text: string;
  at: Date;
}

/** Observes `document.modelContext` through the standard surface only: `getTools()` + `toolchange`. */
@Service()
export class ToolInspectorStore {
  private readonly info = inject(MODEL_CONTEXT_INFO);
  private readonly modelContext = this.info.modelContext as ChromeModelContext;
  private readonly destroyRef = inject(DestroyRef);

  readonly backend = this.info.backend;
  // executeTool() is a Chromium extension of the spec (the polyfill implements it too).
  readonly canExecute = typeof this.modelContext.executeTool === 'function';

  // resource(): getTools() as a signal. toolchange events call reload(); the resource itself
  // discards out-of-order responses, so rapid re-registrations cannot leave a stale list.
  private readonly toolsResource = resource({
    loader: () => this.modelContext.getTools(),
    defaultValue: [] as RegisteredTool[],
  });
  readonly tools = computed(() => (this.toolsResource.hasValue() ? this.toolsResource.value() : []));
  readonly unavailable = computed(() => this.toolsResource.status() === 'error');

  readonly log = signal<InspectorLogEntry[]>([]);

  private knownNames = new Set<string>();

  constructor() {
    const reload = () => this.toolsResource.reload();
    this.modelContext.addEventListener('toolchange', reload);
    this.destroyRef.onDestroy(() => this.modelContext.removeEventListener('toolchange', reload));

    effect(() => {
      const names = new Set(this.tools().map((t) => t.name));
      for (const name of names) {
        if (!this.knownNames.has(name)) this.append('lifecycle', `+ registered: ${name}`);
      }
      for (const name of this.knownNames) {
        if (!names.has(name)) this.append('lifecycle', `- unregistered: ${name}`);
      }
      this.knownNames = names;
    });
  }

  /** Runs a tool the way an agent would and logs the exchange; rejects with the tool's error. */
  async call(tool: RegisteredTool, argsJson: string): Promise<string> {
    try {
      const result = prettify(await this.modelContext.executeTool!(tool, argsJson));
      this.append('call', `${tool.name}(${argsJson})\n→ ${result}`);
      return result;
    } catch (error) {
      this.append('error', `${tool.name}(${argsJson})\n✗ ${String(error)}`);
      throw error;
    }
  }

  private append(kind: InspectorLogEntry['kind'], text: string): void {
    this.log.update((entries) => [{ kind, text, at: new Date() }, ...entries]);
  }
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
