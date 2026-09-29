import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExplainerLab } from '../../explainer-lab';
import { REGISTER_SNIPPET } from '../../snippets';
import { CodeBlock } from '../../ui/code-block/code-block';
import { RunButton } from '../../ui/run-button/run-button';
import { StepSection } from '../../ui/step-section/step-section';

@Component({
  selector: 'app-step-register',
  imports: [StepSection, CodeBlock, RunButton],
  templateUrl: './step-register.html',
  styleUrl: './step-register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepRegister {
  protected readonly lab = inject(ExplainerLab);
  protected readonly snippet = REGISTER_SNIPPET;
}
