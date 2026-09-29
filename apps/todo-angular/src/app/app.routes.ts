import { Route } from '@angular/router';
import { provideStatsTools } from './stats-page/stats-tools';

export const appRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'todos' },
  {
    path: 'todos',
    loadComponent: () => import('./todos-page/todos-page').then((m) => m.TodosPage),
  },
  {
    path: 'stats',
    loadComponent: () => import('./stats-page/stats-page').then((m) => m.StatsPage),
    providers: [provideStatsTools()],
  },
];
