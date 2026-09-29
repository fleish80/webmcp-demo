import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal } from '@angular/core';
import { TodoItem } from '../todo-item/todo-item';
import { Todo, TodoStore } from '../todo.store';
import { TodoFilter, TodoFilterBar } from './todo-filter/todo-filter';
import { TodoForm } from './todo-form/todo-form';

@Component({
  selector: 'app-todos-page',
  imports: [TodoForm, TodoFilterBar, TodoItem],
  templateUrl: './todos-page.html',
  styleUrl: './todos-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodosPage {
  private readonly store = inject(TodoStore);

  protected readonly todos = this.store.todos;

  // linkedSignal: writable by the filter bar, but snaps back to 'all' whenever the list empties.
  protected readonly filter = linkedSignal<readonly Todo[], TodoFilter>({
    source: this.store.todos,
    computation: (todos, previous) => (todos.length === 0 ? 'all' : (previous?.value ?? 'all')),
  });

  protected readonly visibleTodos = computed(() => {
    const filter = this.filter();
    return this.todos().filter((t) => filter === 'all' || (filter === 'done') === t.done);
  });

  protected complete(id: number): void {
    this.store.complete(id, 'user');
  }

  protected remove(id: number): void {
    this.store.remove(id);
  }
}
