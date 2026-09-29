import type { InputSchema, RegisteredTool } from '@mcp-b/webmcp-types';

/**
 * `getTools()` returns `inputSchema` as a JSON string on some Chromium builds and as an object on
 * others (and on the polyfill); normalise to an object.
 */
export function parseInputSchema(schema: RegisteredTool['inputSchema']): InputSchema {
  if (typeof schema === 'string') {
    try {
      return JSON.parse(schema) as InputSchema;
    } catch {
      return { type: 'object' };
    }
  }
  return schema ?? { type: 'object' };
}

/** Builds an example argument object from a JSON Schema, so a call editor starts with valid input. */
export function exampleArgs(schema: InputSchema): Record<string, unknown> {
  const args: Record<string, unknown> = {};
  for (const [key, definition] of Object.entries(schema.properties ?? {})) {
    const type = typeof definition === 'object' && definition !== null ? (definition as { type?: string }).type : undefined;
    args[key] = type === 'number' || type === 'integer' ? 5 : type === 'boolean' ? false : '';
  }
  return args;
}
