import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExplainerLab } from '../../explainer-lab';
import { DESTROY_SNIPPET } from '../../snippets';
import { CodeBlock } from '../../ui/code-block/code-block';
import { RunButton } from '../../ui/run-button/run-button';
import { StepSection } from '../../ui/step-section/step-section';

@Component({
  selector: 'app-step-lifecycle',
  imports: [StepSection, CodeBlock, RunButton],
  templateUrl: './step-lifecycle.html',
  styleUrl: './step-lifecycle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepLifecycle {
  protected readonly lab = inject(ExplainerLab);
  protected readonly snippet = DESTROY_SNIPPET;
}
