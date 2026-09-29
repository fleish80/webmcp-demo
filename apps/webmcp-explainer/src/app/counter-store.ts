export type CounterActor = 'you' | 'agent';

export class CounterStore {
  #count = 0;
  #lastActor: CounterActor | null = null;
  #listeners = new Set<() => void>();

  get count(): number {
    return this.#count;
  }

  get lastActor(): CounterActor | null {
    return this.#lastActor;
  }

  increment(amount: number, actor: CounterActor): void {
    this.#count += amount;
    this.#lastActor = actor;
    for (const listener of this.#listeners) listener();
  }

  subscribe(listener: () => void): () => void {
    this.#listeners.add(listener);
    return () => this.#listeners.delete(listener);
  }
}
