import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

export type TodoFilter = 'all' | 'open' | 'done';

export const TODO_FILTERS: readonly TodoFilter[] = ['all', 'open', 'done'];

@Component({
  selector: 'app-todo-filter',
  templateUrl: './todo-filter.html',
  styleUrl: './todo-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoFilterBar {
  // model(): two-way bound by the parent — the page's linkedSignal is the source of truth.
  readonly filter = model.required<TodoFilter>();
  readonly visible = input.required<number>();
  readonly total = input.required<number>();

  protected readonly filters = TODO_FILTERS;
}
