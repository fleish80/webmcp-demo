import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToolInspector } from './tool-inspector/tool-inspector';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToolInspector],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
