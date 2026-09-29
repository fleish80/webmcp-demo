import type { ModelContext } from '@mcp-b/webmcp-types';

export type ModelContextBackend = 'native' | 'polyfill';

export interface ModelContextInfo {
  backend: ModelContextBackend;
  modelContext: ModelContext;
}

/**
 * Makes sure `document.modelContext` exists before the app registers any WebMCP tools.
 * A native implementation (Chrome behind the WebMCP flag / Origin Trial, or an agent-injected
 * binding like Playwright MCP's) is left untouched; everywhere else the spec-pure
 * `@mcp-b/webmcp-polyfill` is installed. Must be awaited before any registration —
 * Angular's WebMCP providers silently no-op when the API is missing.
 */
export async function ensureModelContext(): Promise<ModelContextInfo> {
  // Presence checks only: `navigator.modelContext` is the pre-May-2026 location and is deprecated,
  // but an older Chromium build or agent binding may still expose it there.
  const hasNative = 'modelContext' in document || 'modelContext' in navigator;
  const backend: ModelContextBackend = hasNative ? 'native' : 'polyfill';

  const { initializeWebMCPPolyfill } = await import('@mcp-b/webmcp-polyfill');
  // Installs the polyfill when nothing is native, and aliases a navigator-only implementation
  // onto `document`, so `document.modelContext` is the one place to read from afterwards.
  initializeWebMCPPolyfill({ installTestingShim: true });

  const modelContext = document.modelContext;
  if (!modelContext) {
    throw new Error('WebMCP is unavailable: no native support and the polyfill failed to install.');
  }
  return { backend, modelContext };
}
