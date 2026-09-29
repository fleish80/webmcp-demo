import { Service, signal } from '@angular/core';

export type CounterActor = 'you' | 'agent';

// @Service() (Angular 22) replaces @Injectable({ providedIn: 'root' }): auto-provided at root.
@Service()
export class CounterStore {
  readonly #count = signal(0);
  readonly #lastActor = signal<CounterActor | null>(null);
  readonly #changes = signal(0);

  readonly count = this.#count.asReadonly();
  readonly lastActor = this.#lastActor.asReadonly();
  readonly changes = this.#changes.asReadonly();

  increment(amount: number, actor: CounterActor): void {
    this.#count.update((c) => c + amount);
    this.#lastActor.set(actor);
    this.#changes.update((n) => n + 1);
  }
}
