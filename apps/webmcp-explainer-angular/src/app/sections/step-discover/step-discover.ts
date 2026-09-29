import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExplainerLab } from '../../explainer-lab';
import { DISCOVER_SNIPPET } from '../../snippets';
import { CodeBlock } from '../../ui/code-block/code-block';
import { RunButton } from '../../ui/run-button/run-button';
import { StepSection } from '../../ui/step-section/step-section';

@Component({
  selector: 'app-step-discover',
  imports: [StepSection, CodeBlock, RunButton],
  templateUrl: './step-discover.html',
  styleUrl: './step-discover.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepDiscover {
  protected readonly lab = inject(ExplainerLab);
  protected readonly snippet = DISCOVER_SNIPPET;
}
