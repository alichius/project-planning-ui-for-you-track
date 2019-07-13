import S, { DataSignal } from 's-js';
import { jsonable, Plain, toPlain } from '../../utils/s';

/**
 * Non-transient state of the settings UI component.
 */
export interface Settings {
  readonly name: DataSignal<string>;
  readonly youTrackBaseUrl: DataSignal<string>;
  readonly youTrackServiceId: DataSignal<string>;
}

/**
 * Creates a new state for the settings UI component.
 */
export function createSettings(): Settings {
  return {
    name: jsonable(S.value('')),
    youTrackBaseUrl: jsonable(S.value('')),
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
    settings.name(plain.name);
    settings.youTrackBaseUrl(plain.youTrackBaseUrl);
    settings.youTrackServiceId(plain.youTrackServiceId);
  });
}

/**
 * Creates a new normalized plain JSON value for the given settings.
 *
 * Normalization means that the YouTrack base URL is the result of {@link normalizedBaseUrl}().
 */
export function toNormalizedPlainSettings<T extends Settings>(settings: T): Plain<T> {
  const plainSettings = toPlain(settings);
  return {
    ...plainSettings,
    youTrackBaseUrl: normalizedBaseUrl(plainSettings.youTrackBaseUrl),
  };
}

/**
 * Returns the normalized YouTrack base URL.
 *
 * Normalization means returning a syntactically valid URL that ends with a slash (/).
 *
 * @return the normalized URL, or the empty string if the given URL is not valid
 */
export function normalizedBaseUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl);
    if (url.pathname.length === 0 || url.pathname.charAt(url.pathname.length - 1) !== '/') {
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
