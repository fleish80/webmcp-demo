import {
  computed,
  createEnvironmentInjector,
  debounced,
  declareExperimentalWebMcpTool,
  EnvironmentInjector,
  inject,
  linkedSignal,
  Service,
  signal,
} from '@angular/core';
import type { ChromeModelContext, RegisteredTool } from '@mcp-b/webmcp-types';
import { exampleArgs, parseInputSchema } from '@webmcp-demo/devkit';
import { CounterStore } from './counter.store';
import { MODEL_CONTEXT_INFO } from './model-context.token';

/**
 * One line of the agent console's wire log.
 *
 * @example
 * { direction: 'request',  text: 'increment({ "amount": 5 })' }
 * { direction: 'response', text: 'Count is now 5.' }
 * { direction: 'error',    text: 'Error: Tool not discovered yet, or this backend has no executeTool().' }
 */
export interface WireEntry {
  direction: 'request' | 'response' | 'error';
  text: string;
}

/** The tool's life on this page: `idle` → `registered` (step 3) → `destroyed` (step 6). */
type ToolLifecycle = 'idle' | 'registered' | 'destroyed';

const TOOL_NAME = 'increment';
const DEFAULT_ARGS = '{ "amount": 5 }';

/**
 * The walkthrough's state machine. Three things are stored — the tool lifecycle, the last
 * discovery result, and the wire log — everything else the sections read is derived from them.
 *
 * A full run, as the sections see it:
 *
 *   step                    | phase        | discoveredTools        | wireLog                 | agentArgs
 *   ------------------------|--------------|------------------------|-------------------------|-----------------
 *   page load               | 'idle'       | null                   | []                      | '{ "amount": 5 }'
 *   3 · register()          | 'registered' | null                   | []                      | unchanged
 *   4 · discover()          | 'registered' | [increment]            | []                      | re-seeded from schema
 *   5 · callAsAgent()       | 'registered' | [increment]            | [request, response]     | unchanged
 *   6 · destroyInjector()   | 'destroyed'  | []  (re-discovered)    | unchanged               | unchanged (kept)
 */
@Service()
export class ExplainerLab {
  /** `{ backend: 'polyfill' | 'native', modelContext }` — captured in main.ts before Angular bootstraps. */
  private readonly info = inject(MODEL_CONTEXT_INFO);
  /** The browser API (`document.modelContext`); `ChromeModelContext` adds the optional `executeTool()`. */
  private readonly modelContext = this.info.modelContext as ChromeModelContext;
  /** Root environment injector — the parent for the child injector the tool is declared in. */
  private readonly rootInjector = inject(EnvironmentInjector);

  // The tool gets its own child injector so the lifecycle step can destroy it and show the tool vanish.
  private toolInjector: EnvironmentInjector | undefined;

  /** 'polyfill' in every browser today; 'native' once Chromium ships WebMCP unflagged. */
  readonly backend = this.info.backend;

  private readonly phase = signal<ToolLifecycle>('idle');
  /** true from step 3 on — stays true after destroy (the tool *was* registered). Gates step 4. */
  readonly registered = computed(() => this.phase() !== 'idle');
  /** true after step 6. Gates the recap. */
  readonly destroyed = computed(() => this.phase() === 'destroyed');

  /**
   * Raw result of `document.modelContext.getTools()`.
   * null = not discovered yet; [] = discovered, nothing registered (after the injector is destroyed).
   *
   * @example after step 4 (one entry):
   * [{ name: 'increment',
   *    description: 'Increase the page counter by a given amount.',
   *    inputSchema: '{"type":"object","properties":{"amount":{"type":"number","description":"How much to add. Defaults to 1."}}}',
   *    window, origin: 'http://localhost:4213' }]
   *
   * Note `inputSchema` may arrive as a JSON *string* (Chromium) or an object (polyfill) —
   * `parseInputSchema()` normalises it.
   */
  readonly discoveredTools = signal<RegisteredTool[] | null>(null);
  /**
   * What step 4 prints: the tool list as an agent's LLM would receive it (name, description, schema).
   *
   * @example
   * [
   *   {
   *     "name": "increment",
   *     "description": "Increase the page counter by a given amount.",
   *     "inputSchema": { "type": "object", "properties": { "amount": { "type": "number", "description": "How much to add. Defaults to 1." } } }
   *   }
   * ]
   * → after step 6: "[]"
   */
  readonly discoveredJson = computed(() => {
    const tools = this.discoveredTools();
    if (tools === null) return null;
    const printable = tools.map(({ name, description, inputSchema }) => ({
      name,
      description,
      inputSchema: parseInputSchema(inputSchema),
    }));
    return JSON.stringify(printable, null, 2);
  });

  /** Append-only; every `callAsAgent()` adds a request line and then a response *or* an error line. */
  readonly wireLog = signal<WireEntry[]>([]);
  /** "At least one call succeeded" — derived from the log, so a failed call does not unlock step 6. */
  readonly called = computed(() => this.wireLog().some((entry) => entry.direction === 'response'));

  // The schema as a string so the linkedSignal below only re-seeds when the definition changes,
  // not on every getTools() call (a fresh array each time).
  /** @example '{"type":"object","properties":{"amount":{"type":"number","description":"How much to add. Defaults to 1."}}}' */
  private readonly toolSchemaJson = computed(() => {
    const tool = this.discoveredTools()?.find((t) => t.name === TOOL_NAME);
    return tool ? JSON.stringify(parseInputSchema(tool.inputSchema)) : null;
  });
  /**
   * The agent console's argument text. linkedSignal: user-writable (the input's `(input)` handler
   * calls `agentArgs.set(...)`), but its default is derived — re-seeded from the tool's JSON Schema
   * whenever the discovered definition changes.
   *
   * @example
   *   moment                                  | value
   *   ----------------------------------------|--------------------
   *   page load                               | '{ "amount": 5 }'   (DEFAULT_ARGS)
   *   user types 99 before discovery          | '{ "amount": 99 }'
   *   first getTools()  (schema: null → set)  | '{ "amount": 5 }'   (re-seeded: number → 5)
   *   user types 37, then getTools() again    | '{ "amount": 37 }'  (same schema string → no reset)
   *   after destroyInjector() (tool gone)     | '{ "amount": 37 }'  (schema null → previous kept)
   */
  readonly agentArgs = linkedSignal<string | null, string>({
    source: this.toolSchemaJson,
    computation: (schemaJson, previous) =>
      schemaJson === null ? (previous?.value ?? DEFAULT_ARGS) : formatArgs(exampleArgs(JSON.parse(schemaJson))),
  });
  // debounced() (experimental, 22.0): a Resource that settles 250ms after typing stops.
  private readonly settledArgs = debounced(this.agentArgs, 250);
  /**
   * Live JSON check for the args input; step 5 disables "Call as agent" unless 'valid'.
   *
   * @example typing `{ "amount": ` → 'checking' (≤250ms) → 'invalid'; fixing it → 'checking' → 'valid'
   */
  readonly argsCheck = computed<'valid' | 'invalid' | 'checking'>(() => {
    if (this.settledArgs.isLoading()) return 'checking';
    try {
      JSON.parse(this.settledArgs.value());
      return 'valid';
    } catch {
      return 'invalid';
    }
  });

  /**
   * Step 3 — publish the tool. Angular's `declareExperimentalWebMcpTool` wraps
   * `document.modelContext.registerTool()` and ties the registration to `toolInjector`:
   * destroying that injector aborts the registration (see `destroyInjector`).
   *
   * What the browser now holds:
   *   { name: 'increment', description: 'Increase the page counter by a given amount.',
   *     inputSchema: { type: 'object', properties: { amount: { type: 'number', … } } } }
   *
   * What an agent gets back from a call — `execute` runs in the injection context, so it can
   * `inject(CounterStore)`; the plain string it returns is what Angular hands to the agent:
   *   execute({ amount: 5 })  →  'Count is now 5.'
   *   execute({})             →  'Count is now 6.'   (amount defaults to 1)
   */
  async register(): Promise<void> {
    this.toolInjector = createEnvironmentInjector([], this.rootInjector, 'explainer-tool');

    await declareExperimentalWebMcpTool(
      {
        name: TOOL_NAME,
        description: 'Increase the page counter by a given amount.',
        inputSchema: {
          type: 'object',
          properties: {
            amount: { type: 'number', description: 'How much to add. Defaults to 1.' },
          },
        },
        execute: ({ amount }) => {
          const store = inject(CounterStore);
          store.increment(amount ?? 1, 'agent');
          return `Count is now ${store.count()}.`;
        },
      },
      this.toolInjector
    );

    this.phase.set('registered');
  }

  /**
   * Step 4 — the agent's side: ask the browser what this page can do.
   * Standard API, no Angular involved. See `discoveredTools` for the shape of the result.
   */
  async discover(): Promise<void> {
    this.discoveredTools.set(await this.modelContext.getTools());
  }

  /**
   * Step 5 — play the agent: send `agentArgs` to the tool through the browser's `executeTool()`
   * (a Chromium extension of the spec that the polyfill implements too). Everything is logged to
   * the wire log; nothing throws out of this method.
   *
   * @example agentArgs = '{ "amount": 41 }', counter at 1
   *   → wireLog += { request:  'increment({ "amount": 41 })' }
   *   → wireLog += { response: 'Count is now 42.' }          (counter card flashes 🤖)
   *
   * @example agentArgs = 'not json'
   *   → wireLog += { request: 'increment(not json)' }
   *   → wireLog += { error:   'SyntaxError: Unexpected token …' }
   *
   * @example after destroyInjector()
   *   → wireLog += { error: 'Error: Tool not discovered yet, or this backend has no executeTool().' }
   */
  async callAsAgent(): Promise<void> {
    const rawArgs = this.agentArgs();
    this.log('request', `${TOOL_NAME}(${rawArgs.trim()})`);
    try {
      JSON.parse(rawArgs);
      const tool = this.discoveredTools()?.find((t) => t.name === TOOL_NAME);
      if (!tool || typeof this.modelContext.executeTool !== 'function') {
        throw new Error('Tool not discovered yet, or this backend has no executeTool().');
      }
      const response = await this.modelContext.executeTool(tool, rawArgs);
      this.log('response', response ?? '(empty response)');
    } catch (error) {
      this.log('error', String(error));
    }
  }

  /**
   * Step 6 — Angular's contribution: no `unregister` call anywhere. Destroying the injector fires
   * the `AbortSignal` Angular attached at registration, and the browser drops the tool.
   * Re-discovering afterwards makes step 4's output show `[]`.
   *
   * This is the same mechanism that removes route-scoped tools on navigation
   * (`withExperimentalAutoCleanupInjectors`) and component-declared tools on destroy.
   */
  async destroyInjector(): Promise<void> {
    this.toolInjector?.destroy();
    this.toolInjector = undefined;
    this.phase.set('destroyed');
    await this.discover();
  }

  private log(direction: WireEntry['direction'], text: string): void {
    this.wireLog.update((entries) => [...entries, { direction, text }]);
  }
}

/** `{ amount: 5 }` → '{ "amount": 5 }' — one line, spaced like the snippet on the page. */
function formatArgs(args: Record<string, unknown>): string {
  return JSON.stringify(args, null, 1).replace(/\n\s*/g, ' ');
}
