import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import type { RegisteredTool } from '@mcp-b/webmcp-types';
import { exampleArgs, parseInputSchema } from '@webmcp-demo/devkit';
import { ToolInspectorStore } from '../tool-inspector.store';

interface CallResult {
  text: string;
  failed: boolean;
}

@Component({
  selector: 'app-tool-card',
  templateUrl: './tool-card.html',
  styleUrl: './tool-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolCard {
  private readonly store = inject(ToolInspectorStore);

  readonly tool = input.required<RegisteredTool>();

  protected readonly canExecute = this.store.canExecute;
  protected readonly schemaJson = computed(() => JSON.stringify(parseInputSchema(this.tool().inputSchema), null, 2));
  // linkedSignal: user-editable, re-seeded from the schema only when the schema itself changes —
  // not on every toolchange reload, which hands the card a fresh RegisteredTool object.
  protected readonly args = linkedSignal<string, string>({
    source: this.schemaJson,
    computation: (schemaJson) => JSON.stringify(exampleArgs(JSON.parse(schemaJson))),
  });
  protected readonly result = signal<CallResult | null>(null);

  protected onArgsInput(event: Event): void {
    this.args.set((event.target as HTMLTextAreaElement).value);
  }

  protected async run(): Promise<void> {
    try {
      this.result.set({ text: await this.store.call(this.tool(), this.args()), failed: false });
    } catch (error) {
      this.result.set({ text: String(error), failed: true });
    }
  }
}
