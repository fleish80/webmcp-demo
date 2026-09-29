import { ChangeDetectionStrategy, Component, inject, signal, viewChild } from '@angular/core';
import { debounce, form, FormField, FormRoot, maxLength, minLength, required } from '@angular/forms/signals';
import { TodoPriority, TodoStore } from '../../todo.store';

const EMPTY_TODO = { text: '', priority: 'medium' as TodoPriority, notes: '' };

@Component({
  selector: 'app-todo-form',
  imports: [FormField, FormRoot],
  templateUrl: './todo-form.html',
  styleUrl: './todo-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoForm {
  private readonly store = inject(TodoStore);
  private readonly textField = viewChild.required('textInput', { read: FormField });

  protected readonly model = signal({ ...EMPTY_TODO });

  // A Signal Form that is ALSO a WebMCP tool: with provideExperimentalWebMcpForms() active,
  // the experimentalWebMcpTool option registers "addDetailedTodo". Angular infers the JSON
  // schema from the model's initial values and maps validators (required → required field);
  // an agent call fills the form, runs validation, and triggers the submission action.
  protected readonly addForm = form(
    this.model,
    (f) => {
      required(f.text, { message: 'Task text is required.' });
      minLength(f.text, 3, { message: 'Give the task at least 3 characters.' });
      maxLength(f.notes, 120, { message: 'Notes are limited to 120 characters.' });
      debounce(f.text, 200);
    },
    {
      experimentalWebMcpTool: {
        name: 'addDetailedTodo',
        description:
          'Add a to-do item with text (min 3 chars), priority (low | medium | high), and optional notes (max 120 chars). Validation errors are reported back.',
      },
      submission: {
        action: async (field) => {
          const { text, priority, notes } = field().value();
          this.store.add({ text: text.trim(), priority, notes: notes.trim() }, 'user');
          this.model.set({ ...EMPTY_TODO });
          this.textField().focus();
          return undefined;
        },
      },
    }
  );
}
