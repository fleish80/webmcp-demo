import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CounterCard } from '../../counter-card/counter-card';
import { StepSection } from '../../ui/step-section/step-section';

@Component({
  selector: 'app-step-app',
  imports: [StepSection, CounterCard],
  templateUrl: './step-app.html',
  styleUrl: './step-app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepApp {}
