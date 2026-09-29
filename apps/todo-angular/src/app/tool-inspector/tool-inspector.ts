import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToolCard } from './tool-card/tool-card';
import { ToolInspectorStore } from './tool-inspector.store';

@Component({
  selector: 'app-tool-inspector',
  imports: [DatePipe, ToolCard],
  templateUrl: './tool-inspector.html',
  styleUrl: './tool-inspector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolInspector {
  protected readonly store = inject(ToolInspectorStore);
}
