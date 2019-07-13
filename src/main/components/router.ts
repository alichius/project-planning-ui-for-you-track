import { handlePotentialOauthRedirect } from '@fschopp/project-planning-for-you-track';
import { strict as assert } from 'assert';
import S, { DataSignal } from 's-js';
import { Plain } from '../utils/s';
import { App, Page } from './app/app-model';
import { Settings } from './settings/settings-model';

const FABRICATED_HOST = 'http://ignored-host';

interface ParsedHash {
  path: string;
  params: URLSearchParams;
  raw: string;
}

type RawHash = string;

type Hash = ParsedHash | RawHash;

function isParsedHash(hash: Hash): hash is ParsedHash {
  return typeof hash !== 'string';
}

function parseWindowLocation(): Hash {
  const theHash = window.location.hash;
  if (theHash.startsWith('#/')) {
     const fabricatedUrl = new URL(theHash.slice(1), 'http://ignored-host/');
     return {
       path: fabricatedUrl.pathname,
       params: fabricatedUrl.searchParams,
       raw: theHash,
     };
  } else {
    return theHash;
  }
}

/**
 * Router that two-way binds the fragment (also called hash) of the URI of the current window/tab and the application
 * state.
 *
 * @typeparam T Type of the application subclass.
 * @typeparam U Type of of the user-provided state; that is, of {@link App.settings}.
 */
export class Router<T extends App<U>, U extends Settings = T['settings']> {
  private hash: DataSignal<Hash> = S.value(parseWindowLocation());

  /**
   * Constructor.
   *
   * @param app The user-provided application state.
   * @param assignApp Function that updates the application state to the given values in a plain JSON object.
   * @param assignApp.app plain JSON object
   * @param assignSettings Function that updates the application settings to the given values in a plain JSON object.
   * @param assignSettings.app plain JSON object
   */
  public constructor(app: T, assignApp: (app: Plain<T>) => any, assignSettings: (settings: Plain<U>) => any) {
    const savedState: Plain<T> | undefined = handlePotentialOauthRedirect<Plain<T>>();
    if (savedState !== undefined) {
      assignApp(savedState);
    }

    // Bind hash to react to changes of window.location.hash
    const setStateFromHash = () => this.hash(parseWindowLocation());
    window.addEventListener('hashchange', setStateFromHash, false);
    S.cleanup(() => window.removeEventListener('hashchange', setStateFromHash));

    // Bind config to react to changes of hash.
    const needsNormalization: DataSignal<null> = S.data(null);
    let hashFromConfig: string = '';
    S(() => {
      const currentHash: Hash = this.hash();
      if (isParsedHash(currentHash)) {
        if (currentHash.raw.slice(1) === hashFromConfig) {
          // If this event is the result of us setting the hash ourselves (see below), ignore this update.
          return;
        }

        const candidatePageName: string = currentHash.path.slice(1);
        if (Object.values(Page).includes(candidatePageName)) {
          app.currentPage(candidatePageName as Page);
        }
        if (currentHash.params.has('config')) {
          const config: Plain<U> = JSON.parse(currentHash.params.get('config')!);
          assignSettings(config);
        } else {
          needsNormalization(null);
        }
      }
    });

    // Bind browser hash to react to changes of config
    S(() => {
      // We need to depend on the following data signal, in order to guarantee normalization of the hash if the user
      // changes it manually. (We cannot use S.on(), which may be a bit clearer, because we also depend on the
      // configuration signals.)
      needsNormalization();
      const currentHash = window.location.hash.slice(1);
      const url = new URL(`/${app.currentPage()}`, FABRICATED_HOST);
      // JSON.stringify visits the object tree recursively, so even changes to nested data signal will trigger this
      // computation to re-run. What is remarkable: nested data signals (say in a SDataArray) that do not yet exist will
      // also trigger this computation in the future! The reason it works: The set of data signals a computation depends
      // on is not static but updated whenever the computation runs. Now adding an element to SDataArray reruns this
      // computation, which then records the dependency on the element's data signal(s). The same works when removing
      // elements.
      url.searchParams.set('config', JSON.stringify(app.settings));
      assert(url.toString().startsWith(FABRICATED_HOST), 'URL.toString() returned unexpected result.');
      hashFromConfig = url.toString().substring(FABRICATED_HOST.length);
      if (currentHash !== hashFromConfig) {
        window.location.hash = hashFromConfig;
      }
    });
  }
}
