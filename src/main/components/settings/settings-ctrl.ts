import S from 's-js';
import { hrefFrom } from '../../utils/surplus';
import { normalizedBaseUrl, Settings } from './settings-model';

/**
 * Controller for elementary settings (name of YouTrack instance, base URL, etc.).
 */
export class SettingsCtrl {
  public readonly verifiedBaseUrl: () => string = S(() => {
    return normalizedBaseUrl(this.settings_.youTrackBaseUrl());
  });

  public static currentUri(): string {
    const uri = new URL(window.location.href);
    uri.hash = '';
    uri.username = '';
    uri.password = '';
    uri.search = '';
    return uri.toString();
  }

  public constructor(
      private readonly settings_: Settings
  ) { }

  public hrefRelativeToBaseUrl(relativePath: string): (element: HTMLAnchorElement) => void {
    const signal = (): string => {
      const baseUrl = this.verifiedBaseUrl();
      return baseUrl.length === 0
          ? ''
          : new URL(relativePath, baseUrl).toString();
    };
    return hrefFrom(signal);
  }

  public hubRelativeToBaseUrlAndServiceId(relativePath: (serviceId: string) => string):
      (element: HTMLAnchorElement) => void {
    const signal = (): string => {
      const baseUrl = this.verifiedBaseUrl();
      const serviceId = this.settings_.youTrackServiceId();
      return (baseUrl.length === 0 || serviceId.length === 0)
          ? ''
          : new URL(relativePath(serviceId), this.verifiedBaseUrl()).toString();
    };
    return hrefFrom(signal);
  }
}
