import S, { DataSignal } from 's-js';
import { App, assignProjectPlanningApp, jsonable, Plain } from '../main';
import { createProjectPlanningApp } from '../main/components/project-planning-app/project-planning-app-model';
import { ProjectPlanningSettings } from '../main/components/project-planning-settings/project-planning-settings-model';

export interface DemoApp extends App<ProjectPlanningSettings> {
  readonly zoom: DataSignal<number>;
}

export function createDemoApp(): DemoApp {
  return {
    ...createProjectPlanningApp(),
    zoom: jsonable(S.value(0)),
  };
}

export function assignDemoApp(demoApp: DemoApp, plain: Plain<DemoApp>) {
  S.freeze(() => {
    assignProjectPlanningApp(demoApp, plain);
    demoApp.zoom(plain.zoom);
  });
}
