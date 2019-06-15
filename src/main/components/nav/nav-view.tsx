// noinspection ES6UnusedImports
import * as Surplus from 'surplus';
import { ExtendedProjectPlan } from '../..';
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

export function NavView({children, className, appCtrl}:
    {children?: JSX.Element | JSX.Element[], className?: string, appCtrl: AppCtrl}): HTMLElement {
  return <nav class={append('navbar navbar-expand navbar-light bg-light', className)}>
      <ProgressBarView className="progress-navbar" progress={appCtrl.progress} />
      <a class="navbar-brand d-none d-md-inline-block">{appCtrl.appName}</a>
      <ul class="navbar-nav mr-auto ml-n2 ml-md-0">
        <li class="nav-item" fn={withClassIff(() => appCtrl.app.currentPage() === Page.HOME, 'active')}>
          <a class="nav-link text-nowrap" href={href(Page.HOME)}>
            🗓
            <span class="ml-sm-1 d-none d-sm-inline">Project Plan</span>
          </a>
        </li>
        <li class="nav-item" fn={withClassIff(() => appCtrl.app.currentPage() === Page.WARNINGS, 'active')}>
          <a class="nav-link text-nowrap" href={href(Page.WARNINGS)}>
            ⚠️
            <span class="ml-sm-1 d-none d-sm-inline">Warnings</span>
            <span class="badge badge-light badge-warning" fn={withClassIff(() => numWarnings(appCtrl) === 0, 'd-none')}>
              {() => numWarnings(appCtrl)}
            </span>
          </a>
        </li>
        <li class="nav-item" fn={withClassIff(() => appCtrl.app.currentPage() === Page.SETTINGS, 'active')}>
          <a class="nav-link text-nowrap" href={href(Page.SETTINGS)}>
            ⚙️
            <span class="ml-sm-1 d-none d-sm-inline">Settings</span>
          </a>
        </li>
      </ul>
      {children}
      <button type="button" class="btn btn-sm btn-outline-secondary" onClick={() => appCtrl.defaultAction()}
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
  const extendedProjectPlan: ExtendedProjectPlan | undefined = appCtrl.extendedProjectPlan();
  return extendedProjectPlan === undefined
      ? 0
      : extendedProjectPlan.plan.warnings.length;
}
