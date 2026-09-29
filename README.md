# WebMCP demo — Nx workspace

A teaching workspace for **WebMCP** (Web Model Context Protocol): the same todo app built twice —
once with the raw browser API in plain TypeScript, once with Angular 22's experimental WebMCP
wrappers — so the two layers are directly comparable.

## What is WebMCP?

WebMCP is an emerging W3C standard (Google + Microsoft, developed in the
[W3C Web Machine Learning Community Group](https://webmachinelearning.github.io/webmcp/)). The idea:
instead of AI agents scraping and clicking your DOM, **the page itself exposes typed tools**:

```js
document.modelContext.registerTool({
  name: 'addTodo',
  description: 'Add a new item to the to-do list.',
  inputSchema: {
    type: 'object',
    properties: { text: { type: 'string' } },
    required: ['text'],
  },
  execute: ({ text }) => {
    /* run real app logic */
    return { content: [{ type: 'text', text: 'Added.' }] };
  },
});
```

An agent (browser-built-in, an extension bridge, or an automation harness like Playwright MCP)
discovers the tools with `getTools()`, sends arguments matching the JSON Schema, and gets structured
results back. Key differences from classic (server-side) MCP:

| | Classic MCP | WebMCP |
|---|---|---|
| Tools live in | a separate server process | the web page itself |
| Transport | stdio / HTTP / SSE | the browser (`document.modelContext`) |
| State | server-side | the page's own JS state — the user *sees* what the agent does |
| Auth | tokens per server | the user's existing session, same-origin |

### API surface used in this demo

- `document.modelContext.registerTool(tool, { signal })` — register; abort the signal to unregister.
- `document.modelContext.getTools()` / `'toolchange'` event — observe what is registered.
- `document.modelContext.executeTool(tool, argsJson)` — Chromium extension (the polyfill implements
  it too); this is what the in-page Inspector uses for its "Call tool" buttons.
- Declarative forms: `<form toolname="…" tooldescription="…" toolautosubmit>` becomes a tool with
  zero JS; the `submit` event gets `agentInvoked` and `respondWith()`.

### Browser support & polyfill

No stable browser ships WebMCP unflagged yet (Chromium: `--enable-features=WebMCP` / Origin Trial).
Both apps therefore call `ensureModelContext()` from `libs/webmcp-devkit` first: it leaves a native
or agent-injected implementation untouched and otherwise installs the spec-pure
[`@mcp-b/webmcp-polyfill`](https://www.npmjs.com/package/@mcp-b/webmcp-polyfill). (The heavier
[`@mcp-b/global`](https://www.npmjs.com/package/@mcp-b/global) package additionally bridges tools to
extension-based MCP clients, but wraps `modelContext` in a way that confuses Playwright's bridge —
this demo deliberately uses the pure polyfill.)

## Workspace layout

```
apps/webmcp-explainer          START HERE — interactive "WebMCP in 5 minutes" walkthrough (port 4212)
apps/webmcp-explainer-angular  the same walkthrough, Angular edition (+ injector lifecycle) (port 4213)
apps/todo-vanilla              plain TS + Vite — the raw document.modelContext API         (port 4210)
apps/todo-angular              Angular 22 — all provider-based WebMCP wrappers             (port 4211)
libs/webmcp-devkit             ensureModelContext() + the framework-free Tool Inspector panel
```

Run them (ports are baked into each project's config):

```bash
npm start                        # all four apps in parallel
npm run start:explainer          # http://localhost:4212 — the guided intro
npm run start:explainer-angular  # http://localhost:4213 — Angular edition
npm run start:todo-vanilla       # http://localhost:4210
npm run start:todo-angular       # http://localhost:4211
npm run check                    # build + lint every project
```

**New to WebMCP? Open the explainer first.** It teaches the protocol with runnable steps against a
one-counter app: you click "Run registerTool()", then discover the tool with `getTools()`, then play
the agent and call it — watching the request/response wire log and the counter react. Each section
unlocks the next.

Its source mirrors the Angular edition without a framework: each step is a `sections/<name>.html`
partial (loaded with Vite's `?raw` import) plus a `sections/<name>.ts` that binds it; `app/lab.ts`
is the step state machine; `app/progress.ts` locks sections via `data-requires="registered|discovered|called"`;
`main.ts` just stitches the partials together and mounts each section.

The **Angular edition** repeats the same steps with `declareExperimentalWebMcpTool` (the tool's
`execute` runs in the injection context and uses `inject(CounterStore)`), and adds a step the raw API
can't show as cleanly: the tool is declared against a child `EnvironmentInjector`, and pressing
"Destroy the injector" unregisters it — `getTools()` returns `[]` and the next agent call fails. That
is the same mechanism behind route-scoped tools and `withExperimentalAutoCleanupInjectors`.

Its source is organised so you can read it top-down: `app.html` lists the steps; each step is a
component under `sections/` that injects the `ExplainerLab` service (`explainer-lab.ts` — one method
per step, one signal per outcome); the code shown on the page lives as strings in `snippets.ts`;
and `ui/` holds the four shared primitives (`StepSection`, `CodeBlock`, `RunButton`, `WireLog`).

Every page shows the **Tool Inspector** on the right: live tool list (via `getTools()` +
`toolchange`), manual invocation, and an activity log — so you can watch registrations and calls
without any agent attached.

## Feature → file map

### `todo-vanilla` (the raw API)

| Feature | File |
|---|---|
| Imperative `registerTool` × 5 (`addTodo`, `listTodos`, `completeTodo`, `removeTodo`, `clearCompleted`) | `apps/todo-vanilla/src/app/webmcp/todo-tools.ts` |
| Declarative form tool (`addTodoViaForm`) + `agentInvoked` + `respondWith()` | `apps/todo-vanilla/index.html` (the form) + `apps/todo-vanilla/src/app/views/declarative-form.ts` (the handler) |
| Agent-vs-user change highlighting | `apps/todo-vanilla/src/app/todo-store.ts` (`source`) |

Layout: all static markup lives in `index.html` (elements tagged `data-view="…"`); `main.ts` only
composes — `views/add-form.ts`, `views/declarative-form.ts`, `views/todo-list.ts` each bind one
piece of that markup to the store, and `webmcp/todo-tools.ts` holds the tool registrations.

Declarative-form gotchas demonstrated in `views/declarative-form.ts`:
- without `toolautosubmit`, an agent call only **focuses the submit button** and waits for a human
  click (that's the built-in human-in-the-loop mode);
- after `preventDefault()` the handler **must** call `event.respondWith(promise)` or the agent call
  fails;
- resetting the form while the agent submission is pending **cancels** it.

### `todo-angular` (Angular 22 wrappers — all experimental)

| Feature | API | File |
|---|---|---|
| App-level tools (`addTodo`, `listTodos`, `completeTodo`, `removeTodo`) — `execute` runs in the injection context, so `inject(TodoStore)` works | `provideExperimentalWebMcpTools` (`@angular/core`) | `apps/todo-angular/src/app/webmcp/todo-tools.ts` (`provideTodoTools()`, wired in `app.config.ts`) |
| Route-scoped tool (`exportStats`) — appears on `/stats`, disappears on navigation | route `providers` + `withExperimentalAutoCleanupInjectors` (`@angular/router`) | `apps/todo-angular/src/app/stats-page/stats-tools.ts` (`provideStatsTools()`, wired in `app.routes.ts`) |
| Service-level tool (`getTodoCount`) reading live signals | `declareExperimentalWebMcpTool` (`@angular/core`) | `apps/todo-angular/src/app/todo.store.ts` |
| Signal Form as a tool (`addDetailedTodo`) — schema inferred from the model, validators become required fields, validation errors are returned to the agent | `provideExperimentalWebMcpForms` + `experimentalWebMcpTool` form option (`@angular/forms/signals`) | `apps/todo-angular/src/app/todos-page/todo-form/todo-form.ts` |

`todo-angular` is laid out feature-first: `todos-page/` composes `todo-form/` (the Signal Form + its
tool), `todo-filter/` (a `model()` two-way binding over the page's `linkedSignal`) and the shared
`todo-item/`; `stats-page/` owns its route tools and the lazily loaded exporter; `webmcp/` holds the
app-level tool providers so `app.config.ts` stays a flat list of `provideX()` calls. The Tool Inspector
is a native Angular implementation (`tool-inspector/` — a `@Service()` store around `resource()` +
`toolchange`, a panel, and a `ToolCard` per tool) rather than the devkit's DOM widget, which the
vanilla app keeps using; both share the devkit's `parseInputSchema`/`exampleArgs` helpers.

#### Angular 22 features used (beyond WebMCP)

Both Angular apps deliberately use the newest APIs, including experimental ones:

| Feature | Status in 22.1 | Where |
|---|---|---|
| `@Service()` instead of `@Injectable({providedIn: 'root'})` | stable (22.0) | `todo.store.ts`, `counter.store.ts`, `stats-exporter.ts` |
| `injectAsync()` + `onIdle` prefetch — lazy-loaded service chunk | stable (22.0) | `stats-page.ts` |
| `debounced()` — a `Resource` that settles after typing stops | experimental (22.0) | explainer-angular `app.ts` (JSON-validity check) |
| Signal Forms: `form`, `FormRoot`, `FormField`, `required`/`minLength`/`maxLength`/`debounce` | stable (22.0) | `todos-page.ts` |
| `linkedSignal` (writable, resets from a source) | stable | `todos-page.ts` (filter resets when the list empties); `stats-page.ts` (a copied export clears when the counts it describes change); explainer-angular `explainer-lab.ts` (agent args re-seeded from the discovered tool's schema) |
| `input.required()` / `output()` / `host` bindings / `viewChild.required()` | stable | `todo-item.ts`, `todos-page.ts`, `counter-card.ts` |
| `animate.enter` / `animate.leave` | stable | todo list items, wire log, step results |
| `@let`, `@if … as`, `@for … @empty`, `@switch`, `@defer (on idle)` + `@placeholder` | stable | all templates; `app.html` defers the Inspector |
| `withExperimentalPlatformNavigation()` — router on the Navigation API | experimental (21.1) | `todo-angular/app.config.ts` |
| `resource()` — `getTools()` as a signal, reloaded on `toolchange` | stable (22.0) | `todo-angular/tool-inspector/tool-inspector.store.ts` |
| CDK `Clipboard` service, `FormField.focus()`, `DatePipe` — no raw DOM / browser API calls in the app | stable | `stats-exporter.ts`, `todo-form.ts`, `tool-inspector.html` |
| `withExperimentalAutoCleanupInjectors()` | experimental | `todo-angular/app.config.ts` |
| Zoneless change detection, `provideBrowserGlobalErrorListeners()` | stable | both apps |

Two things we tried and backed out, so you don't have to:
- **Selectorless components** (`<CounterCard />` with the private `_enableSelectorless` compiler
  flag): compiles in 22.1, but the element is silently dropped at runtime — still internal-only.
- **`withViewTransitions()` together with `withExperimentalPlatformNavigation()`** throws
  `InvalidStateError: Transition was aborted because of invalid state` on every navigation; each
  works alone.

Angular-specific notes:
- Angular **silently no-ops** if `modelContext` is missing when a tool registers — that's why
  `main.ts` awaits `ensureModelContext()` *before* `bootstrapApplication`.
- Angular unregisters tools by aborting an `AbortSignal` tied to the owning injector's `DestroyRef`
  — destroy the injector (route navigation, component destroy) and the tool is gone. The
  `addDetailedTodo` form tool disappears when you leave `/todos` for the same reason.
- Angular tool `execute` returns a plain value (typically a string) which Angular serializes; the
  raw API convention is an MCP `{content: [...]}` block — compare the two apps' outputs in the
  Inspector log.

## Driving the apps as an agent

Any WebMCP-capable client works. From Claude Code with the Playwright MCP server:

1. `browser_navigate` → `http://localhost:4210` (or `4211`)
2. `browser_webmcp_list` — enumerate the page's tools
3. `browser_webmcp_call` — e.g. `addTodo {"text": "Buy milk", "priority": "high"}`

The todo appears in the UI flagged **🤖 agent**. Known quirk: Playwright's `browser_webmcp_list` is
a load-time snapshot — tools registered later (lazy routes, service instantiation) may be missing
from the *list*, but `browser_webmcp_call` still reaches them.

Other agent hosts: Chromium with the WebMCP flag (native `modelContext`), and the MCP-B browser
extension (requires the `@mcp-b/global` transport bridge instead of the pure polyfill).

## Building blocks worth stealing

- `libs/webmcp-devkit/src/lib/ensure-model-context.ts` — the load-order-safe polyfill bootstrap.
- `libs/webmcp-devkit/src/lib/tool-inspector.ts` — a drop-in, framework-free panel that makes any
  WebMCP page self-documenting (uses only the standard observation surface, so it works against
  native implementations too).
- `libs/webmcp-devkit/src/lib/schema.ts` — `parseInputSchema()` (Chromium returns `inputSchema`
  as a string on some builds, as an object on others) and `exampleArgs()` (a valid starter argument
  object from a JSON Schema); shared by the Inspector and both explainers.
