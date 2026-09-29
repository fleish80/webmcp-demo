import { mergeApplicationConfig } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { ensureModelContext } from '@webmcp-demo/devkit';
import { App } from './app/app';
import { appConfig } from './app/app.config';
import { MODEL_CONTEXT_INFO } from './app/model-context.token';

// modelContext must exist BEFORE Angular bootstraps: provideExperimentalWebMcpTools and
// friends silently no-op when the API is missing at registration time.
ensureModelContext()
  .then((info) =>
    bootstrapApplication(
      App,
      mergeApplicationConfig(appConfig, {
        providers: [{ provide: MODEL_CONTEXT_INFO, useValue: info }],
      })
    )
  )
  .catch((err) => console.error(err));
