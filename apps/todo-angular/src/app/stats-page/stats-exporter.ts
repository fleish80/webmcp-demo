import { Clipboard } from '@angular/cdk/clipboard';
import { inject, Service } from '@angular/core';
import { TodoStore } from '../todo.store';

export interface StatsExport {
  json: string;
  copied: boolean;
}

// Loaded lazily via injectAsync() from StatsPage — it never lands in the initial bundle.
@Service()
export class StatsExporter {
  private readonly store = inject(TodoStore);
  private readonly clipboard = inject(Clipboard);

  toJson(): string {
    return JSON.stringify(
      { open: this.store.openCount(), done: this.store.doneCount(), exportedAt: new Date().toISOString() },
      null,
      2
    );
  }

  export(): StatsExport {
    const json = this.toJson();
    return { json, copied: this.clipboard.copy(json) };
  }
}
