import type { ChromeModelContext, RegisteredTool } from '@mcp-b/webmcp-types';
import type { ModelContextInfo } from '@webmcp-demo/devkit';
import type { CounterStore } from './counter-store';

export interface WireEntry {
  direction: 'request' | 'response' | 'error';
  text: string;
}

/**
 * The walkthrough's state machine. Three things are stored — whether the tool is registered,
 * the last discovery result, and the wire log — everything else the sections read is derived.
 */
export class ExplainerLab {
  readonly #modelContext: ChromeModelContext;
  readonly #wire: WireEntry[] = [];
  #listeners = new Set<() => void>();

  registered = false;
  // null = not discovered yet.
  discoveredTools: RegisteredTool[] | null = null;

  constructor(
    private readonly info: ModelContextInfo,
    private readonly counter: CounterStore
  ) {
    this.#modelContext = info.modelContext as ChromeModelContext;
  }

  get backend(): ModelContextInfo['backend'] {
    return this.info.backend;
  }

  get discovered(): boolean {
    return this.discoveredTools !== null;
  }

  get called(): boolean {
    return this.#wire.some((entry) => entry.direction === 'response');
  }

  get wire(): readonly WireEntry[] {
    return this.#wire;
  }

  // Must stay in sync with the snippet shown in sections/register.html.
  async register(): Promise<void> {
    const counter = this.counter;
    await this.#modelContext.registerTool({
      name: 'increment',
      description: 'Increase the page counter by a given amount.',
      inputSchema: {
        type: 'object',
        properties: {
          amount: { type: 'number', description: 'How much to add. Defaults to 1.' },
        },
      },
      execute: ({ amount }) => {
        counter.increment((amount as number | undefined) ?? 1, 'agent');
        return { content: [{ type: 'text', text: `Count is now ${counter.count}.` }] };
      },
    });
    this.registered = true;
    this.#notify();
  }

  async discover(): Promise<void> {
    this.discoveredTools = await this.#modelContext.getTools();
    this.#notify();
  }

  async callAsAgent(rawArgs: string): Promise<void> {
    this.#log('request', `increment(${rawArgs.trim()})`);
    try {
      JSON.parse(rawArgs);
      const tool = this.discoveredTools?.find((t) => t.name === 'increment');
      if (!tool || typeof this.#modelContext.executeTool !== 'function') {
        throw new Error('Tool not discovered yet, or this backend has no executeTool().');
      }
      const response = await this.#modelContext.executeTool(tool, rawArgs);
      this.#log('response', response ?? '(empty response)');
    } catch (error) {
      this.#log('error', String(error));
    }
    this.#notify();
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }

  #log(direction: WireEntry['direction'], text: string): void {
    this.#wire.push({ direction, text });
  }

  #notify(): void {
    for (const listener of this.#listeners) listener();
  }
}
