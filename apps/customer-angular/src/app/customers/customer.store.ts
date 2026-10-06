import { computed, Service, signal } from '@angular/core';
import { healthFor, riskReasonsFor } from './customer-risk';
import { CUSTOMERS, type CustomerId } from './customer.mock-data';

@Service()
export class CustomerStore {
  readonly #selectedId = signal<CustomerId>('priya');

  readonly customers = CUSTOMERS;
  readonly selectedId = this.#selectedId.asReadonly();
  readonly customer = computed(() => CUSTOMERS.find((c) => c.id === this.#selectedId()) ?? CUSTOMERS[0]);
  readonly riskReasons = computed(() => riskReasonsFor(this.customer()));
  readonly health = computed(() => healthFor(this.customer()));
  readonly isHighRisk = computed(() => this.health() === 'At risk');

  select(id: CustomerId): void {
    this.#selectedId.set(id);
  }
}
