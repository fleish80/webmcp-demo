import { ChangeDetectionStrategy, Component, computed, debounced, inject } from '@angular/core';
import { CounterActor, CounterStore } from '../counter.store';

@Component({
  selector: 'app-counter-card',
  templateUrl: './counter-card.html',
  styleUrl: './counter-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.counter-flash-you]': "flashing() === 'you'",
    '[class.counter-flash-agent]': "flashing() === 'agent'",
  },
})
export class CounterCard {
  private readonly store = inject(CounterStore);

  // The debounced resource is "loading" for 900ms after every change — that window is the flash.
  private readonly flashWindow = debounced(this.store.changes, 900);

  protected readonly count = this.store.count;
  protected readonly lastActor = this.store.lastActor;
  protected readonly flashing = computed<CounterActor | null>(() =>
    this.store.changes() > 0 && this.flashWindow.isLoading() ? this.store.lastActor() : null
  );

  protected humanIncrement(): void {
    this.store.increment(1, 'you');
  }
}
