import S, { DataSignal } from 's-js';
import { hrefFrom } from '../../utils/surplus';
import {
  CustomField,
  EnumBundleCustomFieldDefaults,
  EnumBundleElement,
  IssueLinkType,
  StateBundleCustomFieldDefaults,
  StateBundleElement,
  User,
} from '../../youtrack-rest';
import { ContributorsCtrl } from '../contributors/contributors-ctrl';
import { YouTrackMetadata } from '../you-track/you-track-model';
import { Settings } from './settings-model';

/**
 * Controller for settings related to project planning (YouTrack custom fields, list of available resources, etc.).
 */
export class SettingsCtrl {
  public readonly contributorsCtrl: ContributorsCtrl;
  public readonly verifiedBaseUrl: () => string = S(() => {
    try {
      const youTrackUrlString: string = this.settings.youTrackBaseUrl();
      const url = new URL(youTrackUrlString);
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
  });
  public readonly metadata: () => YouTrackMetadata = S(() => {
    const youTrackMetadata: YouTrackMetadata | undefined = this.youTrackMetadata();
    return youTrackMetadata !== undefined && this.verifiedBaseUrl() === youTrackMetadata.baseUrl
        ? youTrackMetadata
        : emptyYouTrackMetadata();
  });

  public readonly enumFields: () => Map<string, CustomField> = this.mapOfCustomFieldTypes('enum[1]');
  public readonly periodFields: () => Map<string, CustomField> = this.mapOfCustomFieldTypes('period');
  public readonly stateFields: () => Map<string, CustomField> = this.mapOfCustomFieldTypes('state[1]');
  public readonly userFields: () => Map<string, CustomField> = this.mapOfCustomFieldTypes('user[1]');

  public readonly states: () => Map<string, StateBundleElement> = S(() => {
    const customField: CustomField | undefined = this.stateFields().get(this.settings.stateFieldId());
    const array: StateBundleElement[] = customField === undefined
        ? []
        : (customField.fieldDefaults as StateBundleCustomFieldDefaults).bundle.values
            .filter((stateBundleElement) => !stateBundleElement.isResolved)
            .sort((left, right) => left.ordinal - right.ordinal);
    return array.reduce((map, element) => map.set(element.id, element), new Map<string, StateBundleElement>());
  });
  public readonly types: () => Map<string, EnumBundleElement> = S(() => {
    const customField: CustomField | undefined = this.enumFields().get(this.settings.typeFieldId());
    const array: EnumBundleElement[] = customField === undefined
        ? []
        : (customField.fieldDefaults as EnumBundleCustomFieldDefaults).bundle.values
            .sort((left, right) => left.ordinal - right.ordinal);
    return array.reduce((map, element) => map.set(element.id, element), new Map<string, EnumBundleElement>());
  });
  public readonly directedIssueLinkTypes: () => Map<string, IssueLinkType> = S(() =>
      this.metadata().issueLinkTypes
          .filter((linkType) => linkType.directed)
          .reduce((map, linkType) => map.set(linkType.id, linkType), new Map<string, IssueLinkType>())
  );
  public readonly issueLinkDirectionNames: () => [string, string] = S(() => {
    const issueLinkType: IssueLinkType | undefined =
        this.directedIssueLinkTypes().get(this.settings.dependsLinkTypeId());
    return (issueLinkType === undefined
        ? ['→', '←']
        : [issueLinkType.sourceToTarget, issueLinkType.targetToSource]) as [string, string];
  });
  public readonly savedQueryIds: () => Set<string> = S(() =>
      new Set<string>(this.metadata().savedSearches.map((savedQuery) => savedQuery.id))
  );

  /**
   * Constructor.
   *
   * @param settings
   * @param youTrackMetadata
   * @param connectSignal
   */
  constructor(
      public readonly settings: Settings,
      public readonly youTrackMetadata: () => YouTrackMetadata | undefined,
      public readonly connectSignal: DataSignal<null>
  ) {
    const youTrackUserMap: () => Map<string, User> = S(() =>
        this.metadata().users
            .reduce((map, user) => map.set(user.id, user), new Map<string, User>())
    );
    this.contributorsCtrl = new ContributorsCtrl(settings.contributors, youTrackUserMap);

    // If saved search and overlay are the same, set the overlay to none.
    S(() => {
      if (this.settings.savedQueryId() === this.settings.overlaySavedQueryId()) {
        this.settings.overlaySavedQueryId('');
      }
    });
  }

  public static currentUri(): string {
    const uri = new URL(window.location.href);
    uri.hash = '';
    uri.username = '';
    uri.password = '';
    uri.search = '';
    return uri.toString();
  }

  public hrefRelativeToBaseUrl(relativePath: string): (element: HTMLAnchorElement) => void {
    const signal: () => string = S(() => {
      const baseUrl = this.verifiedBaseUrl();
      return baseUrl.length === 0
          ? ''
          : new URL(relativePath, baseUrl).toString();
    });
    return hrefFrom(signal);
  }

  public hubRelativeToBaseUrlAndServiceId(relativePath: (serviceId: string) => string):
      (element: HTMLAnchorElement) => void {
    const signal: () => string = S(() => {
      const baseUrl = this.verifiedBaseUrl();
      const serviceId = this.settings.youTrackServiceId();
      return (baseUrl.length === 0 || serviceId.length === 0)
          ? ''
          : new URL(relativePath(serviceId), this.verifiedBaseUrl()).toString();
    });
    return hrefFrom(signal);
  }

  private mapOfCustomFieldTypes(fieldTypeId: string): () => Map<string, CustomField> {
    return S(() => this.metadata().customFields
        .filter((customField) => customField.fieldType.id === fieldTypeId)
        .reduce((map, customField) => map.set(customField.id, customField), new Map<string, CustomField>())
    );
  }
}

function emptyYouTrackMetadata(): YouTrackMetadata {
  return {
    baseUrl: '',
    customFields: [],
    issueLinkTypes: [],
    savedSearches: [],
    users: [],
    minutesPerWorkWeek: 5 * 8 * 60,
  };
}
