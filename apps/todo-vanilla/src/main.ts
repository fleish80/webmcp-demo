import { ensureModelContext, mountToolInspector } from '@webmcp-demo/devkit';
import { TodoStore } from './app/todo-store';
import { mountAddForm } from './app/views/add-form';
import { mountDeclarativeForm } from './app/views/declarative-form';
import { mountTodoList } from './app/views/todo-list';
import { registerTodoTools } from './app/webmcp/todo-tools';

// The polyfill (or native modelContext) must be in place before any registerTool call.
const info = await ensureModelContext();
const store = new TodoStore();

const view = <T extends HTMLElement>(name: string) => document.querySelector<T>(`[data-view="${name}"]`)!;
mountAddForm(view<HTMLFormElement>('add-form'), store);
mountDeclarativeForm(view<HTMLFormElement>('declarative-form'), store);
mountTodoList(view('todo-list'), store);

await registerTodoTools(info.modelContext, store);
mountToolInspector(document.querySelector<HTMLElement>('#inspector-root')!, info);
