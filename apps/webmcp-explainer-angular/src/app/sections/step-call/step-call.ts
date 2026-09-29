import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExplainerLab } from '../../explainer-lab';
import { RunButton } from '../../ui/run-button/run-button';
import { StepSection } from '../../ui/step-section/step-section';
import { WireLog } from '../../ui/wire-log/wire-log';

@Component({
  selector: 'app-step-call',
  imports: [StepSection, RunButton, WireLog],
  templateUrl: './step-call.html',
  styleUrl: './step-call.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepCall {
  protected readonly lab = inject(ExplainerLab);

  protected onArgsInput(event: Event): void {
    this.lab.agentArgs.set((event.target as HTMLInputElement).value);
  }
}
