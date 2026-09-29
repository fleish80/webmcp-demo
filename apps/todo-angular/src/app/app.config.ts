import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideExperimentalWebMcpForms } from '@angular/forms/signals';
import {
  provideRouter,
  withComponentInputBinding,
  withExperimentalAutoCleanupInjectors,
  withExperimentalPlatformNavigation,
} from '@angular/router';
import { appRoutes } from './app.routes';
import { provideTodoTools } from './webmcp/todo-tools';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      // Destroys a route's environment injector on navigation → route-scoped tools unregister.
      withExperimentalAutoCleanupInjectors(),
      // Experimental (21.1+): drive routing through the browser Navigation API instead of History.
      withExperimentalPlatformNavigation(),
      withComponentInputBinding()
    ),
    provideTodoTools(),
    // Turns every Signal Form created with the experimentalWebMcpTool option into a tool.
    provideExperimentalWebMcpForms(),
  ],
};
