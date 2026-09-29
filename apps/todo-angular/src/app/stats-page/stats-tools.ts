import { EnvironmentProviders, inject, provideExperimentalWebMcpTools } from '@angular/core';
import { TodoStore } from '../todo.store';

/**
 * Route-scoped WebMCP tools for /stats — registered when the route activates, unregistered when
 * its injector is destroyed (requires withExperimentalAutoCleanupInjectors on the router).
 */
export function provideStatsTools(): EnvironmentProviders {
  return provideExperimentalWebMcpTools([
    {
      name: 'exportStats',
      description: 'Export the to-do statistics currently shown on the stats page.',
      inputSchema: { type: 'object', properties: {} },
      execute: () => {
        const store = inject(TodoStore);
        return JSON.stringify({ open: store.openCount(), done: store.doneCount() });
      },
    },
  ]);
}
