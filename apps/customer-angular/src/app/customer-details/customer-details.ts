import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CustomerStore } from '../customers/customer.store';

@Component({
  selector: 'app-customer-details',
  imports: [CurrencyPipe],
  templateUrl: './customer-details.html',
  styleUrl: './customer-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetails {
  protected readonly customerStore = inject(CustomerStore);
}
