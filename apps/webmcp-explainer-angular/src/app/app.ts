import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Hero } from './sections/hero/hero';
import { Problem } from './sections/problem/problem';
import { StepApp } from './sections/step-app/step-app';
import { StepCall } from './sections/step-call/step-call';
import { StepDiscover } from './sections/step-discover/step-discover';
import { StepLifecycle } from './sections/step-lifecycle/step-lifecycle';
import { StepRecap } from './sections/step-recap/step-recap';
import { StepRegister } from './sections/step-register/step-register';

@Component({
  imports: [Hero, Problem, StepApp, StepRegister, StepDiscover, StepCall, StepLifecycle, StepRecap],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
