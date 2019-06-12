// noinspection ES6UnusedImports
import * as Surplus from 'surplus';
import { AlertsView, NavView, Page, SettingsView, WarningsView, withClassIff } from '../main';
import { DemoCtrl } from './demo-ctrl';

export function DemoView({ctrl}: {ctrl: DemoCtrl}): HTMLElement {
  return <div>
      <NavView appCtrl={ctrl.appCtrl} />
      <main role="main" class="container">
        <div fn={withClassIff(() => ctrl.appCtrl.app.currentPage() !== Page.HOME, 'd-none')}>
          <h2 class="mt-3">Demo: Project Planning UI for YouTrack</h2>
          <p class="lead">
            Scheduling jobs on related machines, with optional preemption and splitting of jobs across machines.
          </p>
          <pre>{ctrl.jsonProjectPlan()}</pre>
        </div>
        <div fn={withClassIff(() => ctrl.appCtrl.app.currentPage() !== Page.WARNINGS, 'd-none')}>
          <h2 class="mt-3">Project Plan Warnings</h2>
          <WarningsView projectPlan={ctrl.appCtrl.projectPlan} />
        </div>
        <div fn={withClassIff(() => ctrl.appCtrl.app.currentPage() !== Page.SETTINGS, 'd-none')}>
          <h2 class="mt-3">Settings</h2>
          <SettingsView ctrl={ctrl.appCtrl.settingsCtrl} />
        </div>
      </main>
      <hr class="mt-5" />
      <footer class="footer">
        <div class="container">
          <a href="https://github.com/fschopp/project-planning-ui-for-you-track">Back to project page.</a>
        </div>
      </footer>
      <AlertsView ctrl={ctrl.appCtrl.alertCtrl} />
    </div>;
}