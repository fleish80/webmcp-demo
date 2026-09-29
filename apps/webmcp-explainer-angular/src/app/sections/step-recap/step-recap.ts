import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExplainerLab } from '../../explainer-lab';
import { StepSection } from '../../ui/step-section/step-section';

@Component({
  selector: 'app-step-recap',
  imports: [StepSection],
  templateUrl: './step-recap.html',
  styleUrl: './step-recap.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepRecap {
  protected readonly lab = inject(ExplainerLab);
}
