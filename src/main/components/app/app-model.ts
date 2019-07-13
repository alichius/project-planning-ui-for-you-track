import createSDataArray, { SDataArray } from 's-array';
import S, { DataSignal } from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { Alert } from '../alerts/alerts-model';
import { Settings } from '../settings/settings-model';
import { YouTrackMetadata } from '../you-track-metadata/you-track-metadata-model';

/**
 * The currently visible application page.
 */
export enum Page {
  HOME = '',
  WARNINGS = 'warnings',
  SETTINGS = 'settings',
}

/**
 * User-provided state of the application.
 *
 * The properties of this interface constitute user input. As such, it must be possible to reconstruct the application
 * state as defined by this interface after navigating back or forth, after a browser restart, or even on a new machine.
 *
 * The state contains [S.js](https://github.com/adamhaile/S) data signals. These signals allow declarative programming:
 * Any S.js computation based on a data signal will get updated whenever the data signal is updated.
 */
export interface App<T extends Settings> {
  /**
   * Data signal carrying the current page.
   */
  readonly currentPage: DataSignal<Page>;

  /**
   * The current settings.
   */
  readonly settings: T;
}

/**
 * Computed state of the application.
 *
 * The state defined by this interface is the result of a computation and therefore can be regenerated.
 */
export interface AppComputation {
  /**
   * Signal carrying the name of the application.
   */
  readonly name: DataSignal<string>;

  /**
   * Array signal carrying the list of alerts currently shown.
   */
  readonly alerts: SDataArray<Alert>;

  /**
   * Signal carrying YouTrack metadata, or `undefined` if metadata for the current base URL is not (yet) available.
   */
  readonly youTrackMetadata: DataSignal<YouTrackMetadata | undefined>;

  /**
   * Signal carrying the current progress (in percent) or `undefined` if no processing is currently happening.
   */
  readonly progress: DataSignal<number | undefined>;

  /**
   * Signal to trigger connecting to YouTrack.
   */
  readonly connect: DataSignal<null>;
}

/**
 * Returns a newly created object for keeping the user-provided application state.
 */
export function createApp<T extends Settings>(settings: T): App<T> {
  return {
    currentPage: jsonable(S.value(Page.HOME)),
    settings,
  };
}

/**
 * Returns a newly created object for keeping the computed application state.
 */
export function createAppComputation(): AppComputation {
  return {
    name: S.value(document.title),
    alerts: createSDataArray<Alert>([]),
    youTrackMetadata: S.value(undefined),
    progress: S.value(undefined),
    connect: S.data(null),
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
export function assignApp<T extends Settings>(app: App<T>, plain: Plain<App<T>>) {
  S.freeze(() => {
    app.currentPage(plain.currentPage);
  });
}
