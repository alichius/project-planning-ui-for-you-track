import { ProjectPlan } from '@fschopp/project-planning-for-you-track';
import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]
import { AlertsView, bindNumber, NavView, Page, WarningsView, withClassIff, } from '../main';
import { Action, ExtendedProjectPlan } from '../main/components/project-planning-app/project-planning-app-ctrl';
import { ProjectPlanningAppComputation } from '../main/components/project-planning-app/project-planning-app-model';
import {
  ProjectPlanningSettingsView,
} from '../main/components/project-planning-settings/project-planning-settings-view';
import { DemoCtrl } from './demo-ctrl';
import { DemoApp } from './demo-model';

export interface DemoProperties {
  readonly app: DemoApp;
  readonly appComputation: ProjectPlanningAppComputation;
  readonly ctrl: DemoCtrl;
}

export function DemoView({app, appComputation, ctrl}: DemoProperties): HTMLElement {
  return (
      <div>
        <NavView appName={appComputation.name} currentPage={app.currentPage} progress={appComputation.progress}
                 numWarnings={ctrl.projectPlanningAppCtrl.numWarnings}
                 isActionBtnVisible={() => ctrl.projectPlanningAppCtrl.action() !== Action.NOTHING}
                 actionBtnLabel={ctrl.projectPlanningAppCtrl.actionLabel}
                 actionSignal={appComputation.doAction} />
        {/* See https://stackoverflow.com/a/36247448 for "overflow-hidden" */}
        <main role="main" class="position-relative overflow-hidden flex-shrink-1 flex-grow-1 border-top border-bottom">
          <div class="overflow-hidden position-absolute fill-parent d-flex flex-column"
               fn={withClassIff(() => app.currentPage() !== Page.HOME, 'invisible')}>
            <div class="d-flex align-items-center border-bottom px-3 py-2 flex-shrink-0 flex-grow-0">
              <label for="zoom" class="mb-0">🔍</label>
              <input class="custom-range ml-2" type="range" id="zoom" min="0" max="425" step="1"
                     fn={bindNumber(app.zoom)}/>
            </div>
            <div class="overflow-auto flex-shrink-1 flex-grow-1">
              <div class="container">
                <h2 class="mt-3">Demo: Project Planning User Interface for YouTrack</h2>
                <p class="lead">
                  User-interface for&#32;
                  <a href="https://github.com/fschopp/project-planning-for-you-track">
                    fschopp/project-planning-for-you-track
                  </a>.
                  Allows easy embedding of arbitrary widgets (for instance, a Gantt chart) in order to visualize project
                  schedules created from&#32;
                  <a href="https://www.jetbrains.com/help/youtrack/standalone/Saved-Search.html">
                    YouTrack saved searches
                  </a>.
                </p>
                <p>Current zoom level: {app.zoom()}</p>
                <pre>{ctrl.jsonProjectPlan()}</pre>
              </div>
            </div>
          </div>
          <div class="overflow-auto position-absolute fill-parent"
               fn={withClassIff(() => app.currentPage() !== Page.WARNINGS, 'invisible')}>
            <div class="container">
              <h2 class="mt-3">Project Plan Warnings</h2>
              <WarningsView projectPlan={() => projectPlan(ctrl.projectPlanningAppCtrl.extendedProjectPlan)} />
            </div>
          </div>
          <div class="overflow-auto position-absolute fill-parent"
               fn={withClassIff(() => app.currentPage() !== Page.SETTINGS, 'invisible')}>
            <div class="container">
              <h2 class="mt-3">Settings</h2>
              <ProjectPlanningSettingsView settings={app.settings} ctrl={ctrl.projectPlanningAppCtrl.settingsCtrl}
                                           connectSignal={appComputation.connect}/>
            </div>
          </div>
        </main>
        <footer class="footer my-3">
          <div class="container">
            <a href="https://github.com/fschopp/project-planning-ui-for-you-track">Back to project page.</a>
          </div>
        </footer>
        <AlertsView alerts={appComputation.alerts} ctrl={ctrl.projectPlanningAppCtrl.appCtrl.alertsCtrl} />
      </div>
  );
}

function projectPlan(signal: () => ExtendedProjectPlan | undefined): ProjectPlan | undefined {
  const extendedProjectPlan: ExtendedProjectPlan | undefined = signal();
  return extendedProjectPlan === undefined
      ? undefined
      : extendedProjectPlan.plan;
}
