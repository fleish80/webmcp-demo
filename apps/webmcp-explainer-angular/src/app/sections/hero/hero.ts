import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ExplainerLab } from '../../explainer-lab';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Hero {
  protected readonly backend = inject(ExplainerLab).backend;
}
