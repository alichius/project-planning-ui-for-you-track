import { ProjectPlan } from '@fschopp/project-planning-for-you-track';
// noinspection ES6UnusedImports
import * as Surplus from 'surplus';
import { withClassIff } from '../../utils/surplus';
import { unreachableCase } from '../../utils/typescript';
import { Action, AppCtrl } from '../app/app-ctrl';
import { Page } from '../app/app-model';
import { ProgressBarView } from '../progress-bar/progress-bar-view';

function append(list: string, additional: string | undefined) {
  return additional === undefined
    ? list
    : `${list} ${additional}`;
}

export function NavView({className, appCtrl}: {className?: string, appCtrl: AppCtrl}): HTMLElement {
  return <nav class={append('navbar navbar-expand-sm navbar-light bg-light', className)}>
      <ProgressBarView className="progress-navbar" progress={appCtrl.progress} />
      <a class="navbar-brand">{appCtrl.appName}</a>
      <ul class="navbar-nav mr-auto">
        <li class="nav-item" fn={withClassIff(() => appCtrl.app.currentPage() === Page.HOME, 'active')}>
          <a class="nav-link" href={href(Page.HOME)}>
            🗓&nbsp;Project Plan
          </a>
        </li>
        <li class="nav-item" fn={withClassIff(() => appCtrl.app.currentPage() === Page.WARNINGS, 'active')}>
          <a class="nav-link" href={href(Page.WARNINGS)}>
            ⚠️&nbsp;Warnings
            <span class="badge badge-light badge-warning" fn={withClassIff(() => numWarnings(appCtrl) === 0, 'd-none')}>
              {() => numWarnings(appCtrl)}
            </span>
          </a>
        </li>
        <li class="nav-item" fn={withClassIff(() => appCtrl.app.currentPage() === Page.SETTINGS, 'active')}>
          <a class="nav-link" href={href(Page.SETTINGS)}>
            ⚙️&nbsp;Settings
          </a>
        </li>
      </ul>
      <button type="button" class="btn btn-outline-secondary" onClick={() => appCtrl.defaultAction()}
              fn={withClassIff(() => appCtrl.action() === Action.NOTHING, 'd-none')}>
        {labelFromAction(appCtrl.action())}
      </button>
    </nav>;
}

function href(page: Page): string {
  return `#/${page}`;
}

function labelFromAction(action: Action): string {
  switch (action) {
    case Action.CONNECT: return 'Connect';
    case Action.BUILD_PLAN: return 'Build plan';
    case Action.UPDATE_PREDICTION: return 'Update prediction';
    case Action.STOP: return 'Stop';
    case Action.NOTHING: return 'Nothing';
    default: return unreachableCase(action);
  }
}

function numWarnings(appCtrl: AppCtrl): number {
  const projectPlan: ProjectPlan | undefined = appCtrl.projectPlan();
  return projectPlan === undefined
      ? 0
      : projectPlan.warnings.length;
}
