import { bootstrapApplication } from '@angular/platform-browser';
import { ensureModelContext } from '@webmcp-demo/devkit';
import { App } from './app/app';
import { appConfig } from './app/app.config';

// The tools in appConfig silently skip registration if document.modelContext is missing at bootstrap.
ensureModelContext()
  .then(() => bootstrapApplication(App, appConfig))
  .catch((err) => console.error(err));
