import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-step-section',
  templateUrl: './step-section.html',
  styleUrl: './step-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.section-locked]': 'locked()' },
})
export class StepSection {
  readonly number = input.required<number>();
  readonly title = input.required<string>();
  readonly locked = input(false);
}
