import { CustomField, IssueLinkType, SavedQuery, User } from '../../youtrack-rest';

export interface YouTrackMetadata {
  baseUrl: string;
  customFields: CustomField[];
  issueLinkTypes: IssueLinkType[];
  savedSearches: SavedQuery[];
  users: User[];
  minutesPerWorkWeek: number;
}
