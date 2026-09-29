import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { Todo } from '../todo.store';

@Component({
  selector: 'app-todo-item',
  templateUrl: './todo-item.html',
  styleUrl: './todo-item.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.todo-done]': 'todo().done',
    '[class.todo-agent]': "todo().source === 'agent'",
    '[class.priority-low]': "todo().priority === 'low'",
    '[class.priority-medium]': "todo().priority === 'medium'",
    '[class.priority-high]': "todo().priority === 'high'",
  },
})
export class TodoItem {
  readonly todo = input.required<Todo>();
  readonly complete = output<number>();
  readonly remove = output<number>();
}
