import { authorizationFor, getMinutesPerWorkWeek, httpGet } from '@fschopp/project-planning-for-you-track';
import S, { DataSignal } from 's-js';
import { CustomField, IssueLinkType, SavedQuery, User } from '../../youtrack-rest';
import { AlertsCtrl } from '../alerts/alerts-ctrl';
import { YouTrackMetadata } from './you-track-metadata-model';

enum YouTrackRestUrl {
  CUSTOM_FIELDS = 'api/admin/customFieldSettings/customFields',
  ISSUE_LINK_TYPES = 'api/issueLinkTypes',
  SAVED_QUERIES = 'api/savedQueries',
  USERS = 'api/admin/users',
}

/**
 * Controller for retrieving YouTrack metadata.
 *
 * This class provides signals containing lists of users, saved searches, etc.
 */
export class YouTrackMetadataCtrl {
  /**
   * Signal carrying YouTrack metadata. Default values are used if {@link youTrackMetadata} is `undefined`.
   */
  public readonly definedYouTrackMetadata: () => YouTrackMetadata;

  /**
   * Signal carrying a (possibly empty) map of YouTrack users, index by ID.
   */
  public readonly youTrackUserMap: () => Map<string, User>;

  /**
   * Signal carrying a (possibly empty) map of YouTrack issue links, indexed by ID.
   */
  public readonly directedIssueLinkTypes: () => Map<string, IssueLinkType>;

  /**
   * Signal carrying a (possibly empty) map from YouTrack saved search ID to YouTrack saved search.
   */
  public readonly savedQueries: () => Map<string, SavedQuery>;

  /**
   * Signal indicating whether metadata requests to YouTrack are currently pending.
   */
  public pendingMetadata: () => boolean;

  public constructor(
      youTrackMetadata: DataSignal<YouTrackMetadata | undefined>,
      normalizedBaseUrl: () => string,
      alertCtrl: AlertsCtrl
  ) {
    const pendingMetadata: DataSignal<boolean> = S.value(false);
    this.pendingMetadata = pendingMetadata;

    this.definedYouTrackMetadata = S(() => {
      const currentYouTrackMetadata: YouTrackMetadata | undefined = youTrackMetadata();
      return currentYouTrackMetadata !== undefined && normalizedBaseUrl() === currentYouTrackMetadata.baseUrl
          ? currentYouTrackMetadata
          : emptyYouTrackMetadata();
    });
    this.youTrackUserMap = S(() =>
        this.definedYouTrackMetadata().users
            .reduce((map, user) => map.set(user.id, user), new Map<string, User>())
    );
    this.directedIssueLinkTypes = S(() =>
        this.definedYouTrackMetadata().issueLinkTypes
            .filter((linkType) => linkType.directed)
            .reduce((map, linkType) => map.set(linkType.id, linkType), new Map<string, IssueLinkType>())
    );
    this.savedQueries = S(() =>
        this.definedYouTrackMetadata().savedSearches
            .reduce((map, savedQuery) => map.set(savedQuery.id, savedQuery), new Map<string, SavedQuery>())
    );

    S(() => {
      const currentBaseUrl: string = normalizedBaseUrl();
      const currentYouTrackMetadata: YouTrackMetadata | undefined = S.sample(youTrackMetadata);
      if (currentBaseUrl.length > 0 && !S.sample(pendingMetadata) && currentYouTrackMetadata === undefined &&
          authorizationFor(currentBaseUrl) !== undefined) {
        pendingMetadata(true);
        Promise
            .all([
              loadCustomFields(currentBaseUrl),
              loadIssueLinkTypes(currentBaseUrl),
              loadSavedSearches(currentBaseUrl),
              loadUsers(currentBaseUrl),
              getMinutesPerWorkWeek(currentBaseUrl),
            ])
            .then(([customFields, issueLinkTypes, savedSearches, users, minutesPerWorkWeek]) => {
              youTrackMetadata({
                baseUrl: currentBaseUrl,
                customFields,
                issueLinkTypes,
                savedSearches,
                users,
                minutesPerWorkWeek,
              });
            })
            .catch((exception) => alertCtrl.alert('Failed to retrieve YouTrack metadata', exception))
            .finally(() => pendingMetadata(false));
      }
    });
  }

  /**
   * Returns a new signal containing a map from YouTrack issue field ID to custom field.
   *
   * The returned map only contains entries with the given field type (such as `enum[1]`, `period`, etc.).
   */
  public mapOfCustomFieldTypes(fieldTypeId: string): () => Map<string, CustomField> {
    return S(() => this.definedYouTrackMetadata().customFields
        .filter((customField) => customField.fieldType.id === fieldTypeId)
        .reduce((map, customField) => map.set(customField.id, customField), new Map<string, CustomField>())
    );
  }
}

async function loadCustomFields(baseUrl: string): Promise<CustomField[]> {
  const queryParams = {
    fields: 'fieldDefaults(bundle(id,values(color(background,foreground),id,isResolved,name,ordinal))),' +
        'fieldType(id),id,name',
  };
  return await httpGet<CustomField[]>(baseUrl, YouTrackRestUrl.CUSTOM_FIELDS, queryParams);
}

async function loadIssueLinkTypes(baseUrl: string): Promise<IssueLinkType[]> {
  const queryParams = {
    fields: 'directed,id,name,sourceToTarget,targetToSource',
  };
  return await httpGet<IssueLinkType[]>(baseUrl, YouTrackRestUrl.ISSUE_LINK_TYPES, queryParams);
}

async function loadSavedSearches(baseUrl: string): Promise<SavedQuery[]> {
  const queryParams = {
    fields: 'id,name,owner(fullName)',
  };
  return await httpGet<SavedQuery[]>(baseUrl, YouTrackRestUrl.SAVED_QUERIES, queryParams);
}

async function loadUsers(baseUrl: string): Promise<User[]> {
  const queryParams = {
    fields: 'avatarUrl,id,fullName',
  };
  return await httpGet<User[]>(baseUrl, YouTrackRestUrl.USERS, queryParams);
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
