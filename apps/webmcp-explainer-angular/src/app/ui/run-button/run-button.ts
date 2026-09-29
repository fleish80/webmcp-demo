import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-run-button',
  templateUrl: './run-button.html',
  styleUrl: './run-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RunButton {
  readonly label = input.required<string>();
  readonly doneLabel = input<string>();
  readonly done = input(false);
  readonly disabled = input(false);
  readonly danger = input(false);
  readonly run = output<void>();
}
