import { ChangeDetectionStrategy, Component } from '@angular/core';
import { StepSection } from '../../ui/step-section/step-section';

@Component({
  selector: 'app-problem',
  imports: [StepSection],
  templateUrl: './problem.html',
  styleUrl: './problem.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Problem {}
