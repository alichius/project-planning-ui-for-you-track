import { handlePotentialOauthRedirect } from '@fschopp/project-planning-for-you-track';
import { strict as assert } from 'assert';
import S, { DataSignal } from 's-js';
import { Plain } from '../../utils/s';
import { assignSettings, Settings } from '../settings/settings-model';
import { App, assignApp, Page } from './app-model';

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
 */
export class Router {
  private hash: DataSignal<Hash> = S.value(parseWindowLocation());

  public static create<T extends App>(app: T, assignSavedState: (plain: Plain<T>) => any) {
    const savedState: Plain<T> | undefined = handlePotentialOauthRedirect<Plain<T>>();
    if (savedState !== undefined) {
      assignSavedState(savedState);
    }
    return new Router(app);
  }

  /**
   * Constructor.
   *
   * @param app the non-transient application state
   */
  private constructor(app: App) {
    const savedState: Plain<App> | undefined = handlePotentialOauthRedirect<Plain<App>>();
    if (savedState !== undefined) {
      assignApp(app, savedState);
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
          const config: Plain<Settings> = JSON.parse(currentHash.params.get('config')!);
          assignSettings(app.settings, config);
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
