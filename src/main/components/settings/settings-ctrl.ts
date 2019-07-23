import { strict as assert } from 'assert';
import S, { DataSignal } from 's-js';
import { hrefFrom } from '../../utils/surplus';
import { Settings, toNormalizedUrl } from './settings-model';

/**
 * Controller for elementary settings (name of YouTrack instance, base URL, etc.).
 */
export class SettingsCtrl {
  public readonly normalizedBaseUrl: () => string;
  public readonly normalizedHubUrl: () => string;
  public readonly isInCloudUrl: () => boolean;

  public static currentUri(): URL {
    const uri = new URL(window.location.href);
    uri.hash = '';
    uri.username = '';
    uri.password = '';
    uri.search = '';
    return uri;
  }

  public static currentOrigin(): URL {
    const uri = SettingsCtrl.currentUri();
    uri.pathname = '';
    return uri;
  }

  public constructor(
      private readonly settings_: Settings
  ) {
    this.normalizedBaseUrl = S(() => toNormalizedUrl(this.settings_.youTrackBaseUrl()));
    this.normalizedHubUrl = S(() => toNormalizedUrl(this.settings_.hubUrl()));
    const isInCloudUrlSignal: DataSignal<boolean> = S.value(false);
    this.isInCloudUrl = isInCloudUrlSignal;

    let previousNormalizedBaseUrl: string = S.sample(this.normalizedBaseUrl);
    // 'seed' is undefined (the calculation does not keep a state), and 'onchanges' is false (do the initial run).
    S.on(this.normalizedBaseUrl, () => {
      const normalizedBaseUrl = S.sample(this.normalizedBaseUrl);
      const {hubUrl, isInCloudUrl} = hubUrlFromYouTrackBaseUrl(normalizedBaseUrl);
      isInCloudUrlSignal(isInCloudUrl);

      const previousHubUrl = S.sample(settings_.hubUrl);
      if (previousHubUrl === '' || isInCloudUrl ||
          previousHubUrl === hubUrlFromYouTrackBaseUrl(previousNormalizedBaseUrl).hubUrl) {
        // The hub URL is currently the default one for the base URL. Keep in sync.
        // If the current if-condition is not true, the user has modified the hub URL, so it shouldn't be updates.
        previousNormalizedBaseUrl = normalizedBaseUrl;
        this.settings_.hubUrl(hubUrl);
      }
    }, undefined, false);
  }

  public hrefRelativeToBaseUrl(relativePath: string): (element: HTMLAnchorElement) => void {
    const signal = (): string => {
      const baseUrl = this.normalizedBaseUrl();
      return baseUrl.length === 0
          ? ''
          : new URL(relativePath, baseUrl).toString();
    };
    return hrefFrom(signal);
  }

  public hubRelativeToBaseUrlAndServiceId(relativePath: (serviceId: string) => string):
      (element: HTMLAnchorElement) => void {
    const signal = (): string => {
      const baseUrl = this.normalizedBaseUrl();
      const serviceId = this.settings_.youTrackServiceId();
      return (baseUrl.length === 0 || serviceId.length === 0)
          ? ''
          : new URL(relativePath(serviceId), this.normalizedBaseUrl()).toString();
    };
    return hrefFrom(signal);
  }
}

function hubUrlFromYouTrackBaseUrl(baseUrl: string): {hubUrl: string, isInCloudUrl: boolean} {
  assert(baseUrl.length === 0 || baseUrl.endsWith('/'));

  const inCloudMatch: RegExpMatchArray | null = baseUrl.match(/^(https:\/\/[^./]*\.myjetbrains\.com\/)youtrack\/$/);
  let hubUrl: string;
  let isInCloudUrl: boolean = false;
  if (inCloudMatch !== null) {
    // https://www.jetbrains.com/help/youtrack/incloud/OAuth-Authorization.html#HubOauthEndpoints
    hubUrl = `${inCloudMatch[1]}hub`;
    isInCloudUrl = true;
  } else if (baseUrl.length > 0) {
    // https://www.jetbrains.com/help/youtrack/standalone/OAuth-Authorization.html#HubOauthEndpoints
    hubUrl = `${baseUrl}hub`;
  } else {
    hubUrl = '';
  }
  return {hubUrl, isInCloudUrl};
}
