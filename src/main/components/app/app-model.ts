import S, { DataSignal } from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { assignSettings, createSettings, Settings } from '../settings/settings-model';

/**
 * The currently visible application page.
 */
export enum Page {
  HOME = '',
  WARNINGS = 'warnings',
  SETTINGS = 'settings',
}

/**
 * Non-transient state of the application.
 *
 * The state contains [S.js](https://github.com/adamhaile/S) data signals. These signals allow declarative programming:
 * Any S.js computation based on a data signal will get updated whenever the data signal is updated.
 */
export interface App {
  /**
   * Data signal carrying the current page.
   */
  readonly currentPage: DataSignal<Page>;

  /**
   * The current settings.
   */
  readonly settings: Settings;
}

/**
 * Creates a new application state.
 *
 * @param appName name of the application
 */
export function createApp(appName: string = document.title): App {
  return {
    currentPage: jsonable(S.value(Page.HOME)),
    settings: createSettings(),
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
export function assignApp(app: App, plain: Plain<App>) {
  S.freeze(() => {
    app.currentPage(plain.currentPage);
    assignSettings(app.settings, plain.settings);
  });
}
