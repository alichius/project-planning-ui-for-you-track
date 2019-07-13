import { DataSignal } from 's-js';
import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]
import { withClassIff } from '../../utils/surplus';
import { Page } from '../app/app-model';
import { ProgressBarView } from '../base-views';

export interface NavProperties {
  className?: string;
  appName: () => string;
  currentPage: () => Page;
  progress: () => number | undefined;
  numWarnings: () => number;
  isActionBtnVisible: () => boolean;
  actionBtnLabel: () => string;
  actionSignal: DataSignal<null>;
  children?: JSX.Element | JSX.Element[];
}

export function NavView({className, appName, currentPage, progress, numWarnings, isActionBtnVisible, actionBtnLabel,
    actionSignal, children}: NavProperties): HTMLElement {
  return (
      <nav class={append('navbar navbar-expand navbar-light bg-light', className)}>
        <ProgressBarView className="progress-navbar" progress={progress} />
        <a class="navbar-brand d-none d-md-inline-block">{appName()}</a>
        <ul class="navbar-nav mr-auto ml-n2 ml-md-0">
          <li class="nav-item" fn={withClassIff(() => currentPage() === Page.HOME, 'active')}>
            <a class="nav-link text-nowrap" href={href(Page.HOME)}>
              🗓
              <span class="ml-sm-1 d-none d-sm-inline">Project Plan</span>
            </a>
          </li>
          <li class="nav-item" fn={withClassIff(() => currentPage() === Page.WARNINGS, 'active')}>
            <a class="nav-link text-nowrap" href={href(Page.WARNINGS)}>
              ⚠️
              <span class="ml-sm-1 d-none d-sm-inline">Warnings</span>
              <span class="badge badge-light badge-warning"
                    fn={withClassIff(() => numWarnings() === 0, 'd-none')}>
                &nbsp;
                {numWarnings()}
              </span>
            </a>
          </li>
          <li class="nav-item" fn={withClassIff(() => currentPage() === Page.SETTINGS, 'active')}>
            <a class="nav-link text-nowrap" href={href(Page.SETTINGS)}>
              ⚙️
              <span class="ml-sm-1 d-none d-sm-inline">Settings</span>
            </a>
          </li>
        </ul>
        {children}
        <button type="button" class="btn btn-sm btn-outline-secondary" onClick={() => actionSignal(null)}
                fn={withClassIff(() => !isActionBtnVisible(), 'd-none')}>
          {actionBtnLabel()}
        </button>
      </nav>
  );
}


function append(list: string, additional: string | undefined) {
  return additional === undefined
    ? list
    : `${list} ${additional}`;
}

function href(page: Page): string {
  return `#/${page}`;
}
