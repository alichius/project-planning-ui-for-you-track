import { DataSignal } from 's-js';
import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]
import { ContributorsView } from '../contributors/contributors-view';
import { DependsLinkTypeView } from '../depends-link-type/depends-link-type-view';
import { SettingsView } from '../settings/settings-view';
import {
  AssigneeFieldView,
  BundleElementsView,
  IssueFieldView,
  IssueTypeFieldView,
  OverlaySavedQueryView,
  SavedQueryView,
} from '../you-track-base-views';
import { ProjectPlanningSettingsCtrl } from './project-planning-settings-ctrl';
import { ProjectPlanningSettings } from './project-planning-settings-model';

export interface ProjectPlanningSettingsProperties {
  readonly settings: ProjectPlanningSettings;
  readonly ctrl: ProjectPlanningSettingsCtrl;
  readonly connectSignal: DataSignal<null>;
}

export function ProjectPlanningSettingsView({settings, ctrl, connectSignal}:
    ProjectPlanningSettingsProperties): HTMLElement {
  return (
      <div>
        <SettingsView settings={settings} ctrl={ctrl.settingsCtrl} connectSignal={connectSignal} />
        <hr />
        <IssueFieldView id="stateField" label="State Field:" elementId={settings.stateFieldId}
                        elements={ctrl.stateFields}>
          The custom field (of type state) that contains the issue state.
        </IssueFieldView>
        <BundleElementsView id="inactiveStates" label="Inactive States:" elementIds={settings.inactiveStateIds}
                            bundleElements={ctrl.states}>
          The unresolved states indicating an issue should appear as inactive.
        </BundleElementsView>
        <IssueFieldView id="remainingEffortField" label="Remaining Effort Field:"
                        elementId={settings.remainingEffortFieldId} elements={ctrl.periodFields}>
          The custom field (of type period) that contains the remaining effort.
        </IssueFieldView>
        <IssueFieldView id="remainingWaitField" label="Remaining Wait Field:" allowEmpty={true}
                        elementId={settings.remainingWaitFieldId} elements={ctrl.periodFields}>
          The custom field (of type period) that contains the remaining wait.
        </IssueFieldView>
        <AssigneeFieldView elementId={settings.assigneeFieldId} elements={ctrl.userFields} />
        <IssueTypeFieldView elementId={settings.typeFieldId} elements={ctrl.enumFields}/>
        <BundleElementsView id="splittableTypes" label="Splittable Types:" elementIds={settings.splittableTypeIds}
                            bundleElements={ctrl.types}>
          The issue types that allow splitting across multiple persons when planning.
        </BundleElementsView>
        <DependsLinkTypeView dependsLinkType={settings}
                             directedIssueLinkTypes={ctrl.youTrackMetadataCtrl.directedIssueLinkTypes} />
        <SavedQueryView id="savedQuery" label="Saved Query:" elementId={settings.savedQueryId}
                        elements={ctrl.youTrackMetadataCtrl.savedQueries}>
          The saved search containing the issues that will comprise the project plan. Issues will be scheduled in the
          order of this saved search (unless also part of the overlay saved search).
        </SavedQueryView>
        <OverlaySavedQueryView id="overlaySavedQuery" label="Overlay:" elementId={settings.overlaySavedQueryId}
                        elements={ctrl.youTrackMetadataCtrl.savedQueries} primaryElementId={settings.savedQueryId}>
          Reorders the issues that are contained in both saved searches according to this overlay. The order (more
          precisely, the rank) of all issues not contained in this overlay remains the same.
        </OverlaySavedQueryView>
        <hr />
        <ContributorsView label="Contributors:" contributors={settings.contributors}
                          contributorEditArea={settings.transient} ctrl={ctrl.contributorsCtrl}
                          youTrackUserMap={ctrl.youTrackMetadataCtrl.youTrackUserMap} />
      </div>
  );
}
