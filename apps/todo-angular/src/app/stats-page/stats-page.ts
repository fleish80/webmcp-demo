import { ChangeDetectionStrategy, Component, computed, inject, injectAsync, linkedSignal, onIdle } from '@angular/core';
import type { StatsExport } from './stats-exporter';
import { TodoStore } from '../todo.store';

@Component({
  selector: 'app-stats-page',
  templateUrl: './stats-page.html',
  styleUrl: './stats-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsPage {
  private readonly store = inject(TodoStore);

  // injectAsync (Angular 22): the exporter's chunk is fetched on demand — prefetched when the
  // browser is idle, or immediately on first use, whichever comes first.
  private readonly exporter = injectAsync(() => import('./stats-exporter').then((m) => m.StatsExporter), {
    prefetch: onIdle,
  });

  protected readonly openCount = this.store.openCount;
  protected readonly doneCount = this.store.doneCount;

  // linkedSignal: written by copyStats(), but an export describes a specific pair of counts —
  // the moment they change (e.g. an agent adds a todo while this page is open) it is cleared.
  private readonly counts = computed(() => `${this.openCount()}/${this.doneCount()}`);
  protected readonly exported = linkedSignal<string, StatsExport | null>({
    source: this.counts,
    computation: () => null,
  });

  protected async copyStats(): Promise<void> {
    const exporter = await this.exporter();
    this.exported.set(exporter.export());
  }
}
