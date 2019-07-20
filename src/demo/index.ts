// This file is the entry point for the TypeScript compiler, and it should not export any symbols. Otherwise, TypeDoc
// would add those to the generated documentation. See also the tsconfig.json file.

import S from 's-js';
import {
  assignProjectPlanningSettings,
  createProjectPlanningAppComputation,
  ProjectPlanningAppComputation,
  Router,
} from '../main';
import './demo-ctrl';
import { DemoCtrl } from './demo-ctrl';
import { assignDemoApp, createDemoApp, DemoApp } from './demo-model';
import { DemoView } from './demo-view';

// Unfortunate workaround for Safari. See https://github.com/fschopp/project-planning-for-you-track/issues/1
const DELAY_BEFORE_ACCESSING_SESSION_STORAGE_MS = 50;
window.setTimeout(run, DELAY_BEFORE_ACCESSING_SESSION_STORAGE_MS);

function run() {
  S.root(() => {
    // Create model
    const app: DemoApp = createDemoApp();
    const appComputation: ProjectPlanningAppComputation = createProjectPlanningAppComputation();

    // Create controller
    const ctrl = DemoCtrl.createDefaultDemoCtrl(app, appComputation);
    new Router(
        app,
        (plainApp) => assignDemoApp(app, plainApp),
        (plainSettings) => assignProjectPlanningSettings(app.settings, plainSettings)
    );

    // Create view
    document.body.append(...DemoView({app, appComputation, ctrl}).children);
  });
}
