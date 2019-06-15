import { authorizationFor, getMinutesPerWorkWeek, httpGet } from '@fschopp/project-planning-for-you-track';
import S, { DataSignal } from 's-js';
import { CustomField, IssueLinkType, SavedQuery, User } from '../../youtrack-rest';
import { AlertsCtrl } from '../alerts/alerts-ctrl';
import { YouTrackMetadata } from './you-track-model';

enum YouTrackRestUrl {
  CUSTOM_FIELDS = 'youtrack/api/admin/customFieldSettings/customFields',
  ISSUE_LINK_TYPES = 'youtrack/api/issueLinkTypes',
  SAVED_QUERIES = 'youtrack/api/savedQueries',
  USERS = 'youtrack/api/admin/users',
}

export class YouTrackCtrl {
  public pendingMetadata: () => boolean;

  constructor(
      private readonly youTrackMetadata_: DataSignal<YouTrackMetadata | undefined>,
      baseUrl: () => string,
      alertCtrl: AlertsCtrl
  ) {
    const pendingMetadata: DataSignal<boolean> = S.value(false);
    this.pendingMetadata = pendingMetadata;

    S(() => {
      const currentBaseUrl: string = baseUrl();
      const currentYouTrackMetadata: YouTrackMetadata | undefined = S.sample(youTrackMetadata_);
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
              youTrackMetadata_({
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
