import S, { DataSignal } from 's-js';
import { Plain } from '../../utils/s';
import { App, AppComputation, assignApp, createApp, createAppComputation } from '../app/app-model';
import {
  assignProjectPlanningSettings,
  createProjectPlanningSettings,
  ProjectPlanningSettings,
} from '../project-planning-settings/project-planning-settings-model';

export interface ProjectPlanningAppComputation extends AppComputation {
  /**
   * Signal to trigger the current action ({@link ProjectPlanningAppCtrl.action}).
   */
  readonly doAction: DataSignal<null>;
}

/**
 * Returns a newly created object for keeping the user-provided application state.
 */
export function createProjectPlanningApp(): App<ProjectPlanningSettings> {
  return createApp(createProjectPlanningSettings());
}

/**
 * Returns a newly created object for keeping the computed application state.
 */
export function createProjectPlanningAppComputation(): ProjectPlanningAppComputation {
  return {
    ...createAppComputation(),
    doAction: S.data(null),
  };
}

/**
 * Updates the application state to the given values in a plain JSON object.
 *
 * The update is performed within a single S.js transaction.
 *
 * @param app application state
 * @param plain plain JSON object
 */
export function assignProjectPlanningApp(
    app: App<ProjectPlanningSettings>, plain: Plain<App<ProjectPlanningSettings>>) {
  S.freeze(() => {
    assignApp(app, plain);
    assignProjectPlanningSettings(app.settings, plain.settings);
  });
}
