import S, { DataSignal } from 's-js';
import { jsonable, Plain, toPlain } from '../../utils/s';
import { ensureString } from '../../utils/typescript';

/**
 * Non-transient state of the settings UI component.
 */
export interface Settings {
  readonly name: DataSignal<string>;
  readonly youTrackBaseUrl: DataSignal<string>;
  readonly hubUrl: DataSignal<string>;
  readonly youTrackServiceId: DataSignal<string>;
}

/**
 * Creates a new state for the settings UI component.
 */
export function createSettings(): Settings {
  return {
    name: jsonable(S.value('')),
    youTrackBaseUrl: jsonable(S.value('')),
    hubUrl: jsonable(S.value('')),
    youTrackServiceId: jsonable(S.value('')),
  };
}

/**
 * Updates the state of the settings UI component to the given values in a plain JSON object.
 *
 * The update is performed within a single S.js transaction.
 *
 * @param settings state of the settings UI component
 * @param plain plain JSON object
 */
export function assignSettings(settings: Settings, plain: Plain<Settings>): void {
  S.freeze(() => {
    settings.name(ensureString(plain.name));
    settings.youTrackBaseUrl(ensureString(plain.youTrackBaseUrl));
    settings.hubUrl(ensureString(plain.hubUrl));
    settings.youTrackServiceId(ensureString(plain.youTrackServiceId));
  });
}

/**
 * Creates a new normalized plain JSON value for the given settings.
 *
 * Normalization means that the YouTrack base URL is the result of {@link toNormalizedUrl}().
 */
export function toNormalizedPlainSettings<T extends Settings>(settings: T): Plain<T> {
  const plainSettings = toPlain(settings);
  return {
    ...plainSettings,
    youTrackBaseUrl: toNormalizedUrl(plainSettings.youTrackBaseUrl),
    hubUrl: toNormalizedUrl(plainSettings.youTrackBaseUrl),
  };
}

/**
 * Returns the normalized URL.
 *
 * Normalization means returning a syntactically valid URL that ends with a slash (/).
 *
 * @return the normalized URL, or the empty string if the given URL is not valid
 */
export function toNormalizedUrl(urlString: string): string {
  try {
    const url = new URL(urlString);
    if (url.host.length === 0) {
      // Oddly, Safari 12's implementation of the URL constructor does not throw on 'http:' or 'https:' whereas both
      // Chrome and Firefox do.
      return '';
    } else if (url.pathname.length === 0 || url.pathname.charAt(url.pathname.length - 1) !== '/') {
      url.pathname = url.pathname.concat('/');
    }
    return url.toString();
  } catch (exception) {
    if (!(exception instanceof TypeError)) {
      throw exception;
    }
    return '';
  }
}
