import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CustomerDetails } from './customer-details/customer-details';

@Component({
  imports: [CustomerDetails],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
