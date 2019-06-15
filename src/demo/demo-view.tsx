import { ProjectPlan } from '@fschopp/project-planning-for-you-track';
// noinspection ES6UnusedImports
import * as Surplus from 'surplus';
import {
  AlertsView,
  bindNumber,
  ExtendedProjectPlan,
  NavView,
  Page,
  SettingsView,
  WarningsView,
  withClassIff,
} from '../main';
import { DemoCtrl } from './demo-ctrl';

export function DemoView({ctrl}: {ctrl: DemoCtrl}): Element[] {
  return Array.from((<div>
      <NavView appCtrl={ctrl.appCtrl} />
      {/* See https://stackoverflow.com/a/36247448 for "overflow-hidden" */}
      <main role="main" class="position-relative overflow-hidden flex-shrink-1 flex-grow-1 border-top border-bottom">
        <div class="overflow-hidden position-absolute fill-parent d-flex flex-column"
             fn={withClassIff(() => ctrl.demoApp.currentPage() !== Page.HOME, 'invisible')}>
          <div class="d-flex align-items-center border-bottom px-3 py-2">
            <label for="zoom" class="mb-0">🔍</label>
            <input class="custom-range ml-2" type="range" id="zoom" min="0" max="425" step="1"
                   fn={bindNumber(ctrl.demoApp.zoom)}/>
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
              <p>Current zoom level: {ctrl.demoApp.zoom()}</p>
              <pre>{ctrl.jsonProjectPlan()}</pre>
            </div>
          </div>
        </div>
        <div class="overflow-auto position-absolute fill-parent"
             fn={withClassIff(() => ctrl.demoApp.currentPage() !== Page.WARNINGS, 'invisible')}>
          <div class="container">
            <h2 class="mt-3">Project Plan Warnings</h2>
            <WarningsView projectPlan={() => projectPlan(ctrl.appCtrl.extendedProjectPlan)} />
          </div>
        </div>
        <div class="overflow-auto position-absolute fill-parent"
             fn={withClassIff(() => ctrl.demoApp.currentPage() !== Page.SETTINGS, 'invisible')}>
          <div class="container">
            <h2 class="mt-3">Settings</h2>
            <SettingsView ctrl={ctrl.appCtrl.settingsCtrl} />
          </div>
        </div>
      </main>
      <footer class="footer my-3">
        <div class="container">
          <a href="https://github.com/fschopp/project-planning-ui-for-you-track">Back to project page.</a>
        </div>
      </footer>
      <AlertsView ctrl={ctrl.appCtrl.alertCtrl} />
    </div>).children);
}

function projectPlan(signal: () => ExtendedProjectPlan | undefined): ProjectPlan | undefined {
  const extendedProjectPlan: ExtendedProjectPlan | undefined = signal();
  return extendedProjectPlan === undefined
      ? undefined
      : extendedProjectPlan.plan;
}
