import { CustomField, IssueLinkType, SavedQuery, User } from '../../youtrack-rest';

/**
 * YouTrack metadata.
 */
export interface YouTrackMetadata {
  /**
   * The base URL of the YouTrack instance that returned the metadata.
   */
  baseUrl: string;
  customFields: CustomField[];
  issueLinkTypes: IssueLinkType[];
  savedSearches: SavedQuery[];
  users: User[];
  minutesPerWorkWeek: number;
}
