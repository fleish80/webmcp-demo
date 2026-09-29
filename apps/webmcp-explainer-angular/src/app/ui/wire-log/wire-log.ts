import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { WireEntry } from '../../explainer-lab';

@Component({
  selector: 'app-wire-log',
  templateUrl: './wire-log.html',
  styleUrl: './wire-log.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WireLog {
  readonly entries = input.required<readonly WireEntry[]>();
}
