import S from 's-js';
import {
  CustomField,
  EnumBundleCustomFieldDefaults,
  EnumBundleElement,
  StateBundleCustomFieldDefaults,
  StateBundleElement,
} from '../../youtrack-rest';
import { ContributorsCtrl } from '../contributors/contributors-ctrl';
import { SettingsCtrl } from '../settings/settings-ctrl';
import { YouTrackMetadataCtrl } from '../you-track-metadata/you-track-metadata-ctrl';
import { ProjectPlanningSettings } from './project-planning-settings-model';

/**
 * Controller for settings related to project planning (YouTrack custom fields, list of available resources, etc.).
 */
export class ProjectPlanningSettingsCtrl {
  public readonly enumFields: () => Map<string, CustomField>;
  public readonly periodFields: () => Map<string, CustomField>;
  public readonly stateFields: () => Map<string, CustomField>;
  public readonly userFields: () => Map<string, CustomField>;
  public readonly states: () => Map<string, StateBundleElement>;
  public readonly types: () => Map<string, EnumBundleElement>;

  public constructor(
      private readonly settings_: ProjectPlanningSettings,
      public readonly settingsCtrl: SettingsCtrl,
      public readonly youTrackMetadataCtrl: YouTrackMetadataCtrl,
      public readonly contributorsCtrl: ContributorsCtrl
  ) {
    this.enumFields = youTrackMetadataCtrl.mapOfCustomFieldTypes('enum[1]');
    this.periodFields = youTrackMetadataCtrl.mapOfCustomFieldTypes('period');
    this.stateFields = youTrackMetadataCtrl.mapOfCustomFieldTypes('state[1]');
    this.userFields = youTrackMetadataCtrl.mapOfCustomFieldTypes('user[1]');
    this.states = S(() => {
      const customField: CustomField | undefined = this.stateFields().get(this.settings_.stateFieldId());
      const array: StateBundleElement[] = customField === undefined
          ? []
          : (customField.fieldDefaults as StateBundleCustomFieldDefaults).bundle.values
              .filter((stateBundleElement) => !stateBundleElement.isResolved)
              .sort((left, right) => left.ordinal - right.ordinal);
      return array.reduce((map, element) => map.set(element.id, element), new Map<string, StateBundleElement>());
    });
    this.types = S(() => {
      const customField: CustomField | undefined = this.enumFields().get(this.settings_.typeFieldId());
      const array: EnumBundleElement[] = customField === undefined
          ? []
          : (customField.fieldDefaults as EnumBundleCustomFieldDefaults).bundle.values
              .sort((left, right) => left.ordinal - right.ordinal);
      return array.reduce((map, element) => map.set(element.id, element), new Map<string, EnumBundleElement>());
    });

    // If saved search and overlay are the same, set the overlay to none.
    S(() => {
      if (this.settings_.savedQueryId() === this.settings_.overlaySavedQueryId()) {
        this.settings_.overlaySavedQueryId('');
      }
    });
  }
}
