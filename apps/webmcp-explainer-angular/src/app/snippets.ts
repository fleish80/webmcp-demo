// The code shown on the page. REGISTER_SNIPPET must stay in sync with ExplainerLab.register().
export const REGISTER_SNIPPET = `const toolInjector = createEnvironmentInjector([], rootInjector);

await declareExperimentalWebMcpTool(
  {
    name: 'increment',
    description: 'Increase the page counter by a given amount.',
    inputSchema: {
      type: 'object',
      properties: {
        amount: { type: 'number', description: 'How much to add. Defaults to 1.' },
      },
    },
    execute: ({ amount }) => {
      const store = inject(CounterStore);          // DI works here
      store.increment(amount ?? 1, 'agent');
      return \`Count is now \${store.count()}.\`;       // Angular serializes this
    },
  },
  toolInjector,
);`;

export const DISCOVER_SNIPPET = `const tools = await document.modelContext.getTools();`;

export const DESTROY_SNIPPET = `toolInjector.destroy();   // → tool is unregistered`;
