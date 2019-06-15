import S from 's-js';
// noinspection ES6UnusedImports
import * as Surplus from 'surplus';
import { bindString, bindStringSet, bindToOnValue } from '../../utils/surplus';
import { ContributorsView } from '../contributors/contributors-view';
import { SettingsCtrl } from './settings-ctrl';

const FORM_GROUP_CLASS = 'form-group row';
const LABEL_CLASS = 'col-form-label col-form-label-sm col-md-4 col-lg-3 text-md-right';
const INPUT_CLASS = 'form-control form-control-sm';
const SELECT_CLASS = 'custom-select custom-select-sm';
const EDIT_AREA_CLASS = 'col-md-8 col-lg-9';
const HELP_CLASS = 'form-text text-muted';
const CHECK_CLASS = 'form-check-input col-form-label-sm';
const CHECK_LABEL_CLASS = 'form-check-label col-form-label-sm';

interface SelectPlaceholderProperties {
  defaultPlaceholder?: string;
  unknownIdPlaceholder: (unknownId: string) => string;
  selectedId: string;
  choices: Map<string, unknown> | Set<string>;
  children: JSX.Element;
}

function SinglePlaceholder({defaultPlaceholder, unknownIdPlaceholder, selectedId, choices, children}:
    SelectPlaceholderProperties): JSX.Element | null {
  const existsAsOption: boolean = choices.has(selectedId);

  let text: string = '';
  if (!existsAsOption && selectedId.length > 0) {
    text = unknownIdPlaceholder(selectedId);
  } else if (defaultPlaceholder !== undefined && selectedId.length === 0) {
    text = defaultPlaceholder;
  }

  if (text.length > 0) {
    children.innerText = text;
    return children;
  } else {
    return null;
  }
}

function multiplePlaceholders(selectedIds: Set<string>, choices: Map<string, unknown>,
    elementFactory: (selectedId: string) => JSX.Element): JSX.Element[] {
  return Array.from(selectedIds)
      .filter((inactiveStateId) => !choices.has(inactiveStateId))
      .map(elementFactory);
}

export function SettingsView({ctrl}: {ctrl: SettingsCtrl}): HTMLElement {
  return <div>
      <div class={FORM_GROUP_CLASS}>
        <label for="instanceName" class={LABEL_CLASS}>Title:</label>
        <div class={EDIT_AREA_CLASS}>
          <input id="instanceName" type="text" class={INPUT_CLASS} aria-describedby="instanceNameHelp"
                 placeholder="Enter Name" fn={bindString(ctrl.settings.name)} />
          <small id="instanceNameHelp" class="form-text text-muted">
            The tab/window title, which is also used for bookmarks.
          </small>
        </div>
      </div>
      <hr />
      <div class={FORM_GROUP_CLASS}>
        <label for="baseUrl" class={LABEL_CLASS}>Base URL:</label>
        <div class={EDIT_AREA_CLASS}>
          <input id="baseUrl" type="text" class={INPUT_CLASS} aria-describedby="baseUrlHelp"
                 placeholder="Enter URL" fn={bindString(ctrl.settings.youTrackBaseUrl)} />
          <small id="baseUrlHelp" class="form-text text-muted">
            For YouTrack InCloud, this is of form <code>https://&lt;name&gt;.myjetbrains.com/</code>. For a YouTrack
            Standalone installation, this is the “Base URL” shown at Server Settings &gt; Global Settings.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="serviceId" class={LABEL_CLASS}>Service ID in Hub:</label>
        <div class={EDIT_AREA_CLASS}>
          <input id="serviceId" type="text" class={INPUT_CLASS} aria-describedby="serviceIdHelp"
                 placeholder="Enter Service ID in Hub" fn={bindString(ctrl.settings.youTrackServiceId)} />
          <small id="serviceIdHelp" class={HELP_CLASS}>
            The YouTrack service ID is available
            via <a target="_blank" fn={ctrl.hrefRelativeToBaseUrl('youtrack/admin/ring')}>Server Settings &gt; Hub
            Integration</a>.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <div class={`offset-md-4 offset-lg-3 ${EDIT_AREA_CLASS}`}>
          <button type="button" class="btn btn-sm btn-secondary" aria-describedby="loginHelp"
                  disabled={ctrl.verifiedBaseUrl().length === 0 || ctrl.settings.youTrackServiceId().length === 0}
                  onClick={() => ctrl.connectSignal(null)}>Connect…</button>
          <small id="loginHelp" class={HELP_CLASS}>
            If you are not logged into YouTrack yet, this will take you to the YouTrack login page. Once logged in, you
            will be redirected back here. Please note: The URI of this web app (that is, “{SettingsCtrl.currentUri()}”)
            needs to be registered in the&#32;
            <a target="_blank"
               fn={ctrl.hubRelativeToBaseUrlAndServiceId((serviceId) =>
                   `youtrack/admin/hub/services/${serviceId}?tab=settings`)}>
              Hub Settings
            </a> under “Redirect URIs”. The URI also needs to be added under “Allowed origins”
            at <a target="_blank" fn={ctrl.hrefRelativeToBaseUrl('youtrack/admin/settings')}>Server Settings &gt; Global
            Settings</a>.
          </small>
        </div>
      </div>
      <hr />
      <div class={FORM_GROUP_CLASS}>
        <label for="stateField" class={LABEL_CLASS}>State Field:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="stateField" class={SELECT_CLASS} aria-describedby="stateFieldHelp"
                  fn={bindString(ctrl.settings.stateFieldId)}>
            <SinglePlaceholder defaultPlaceholder="None selected"
                               unknownIdPlaceholder={(unknownId) => `Unknown (ID: ${unknownId})`}
                               selectedId={ctrl.settings.stateFieldId()}
                               choices={ctrl.stateFields()} >
              <option value={ctrl.settings.stateFieldId()} selected disabled />
            </SinglePlaceholder>
            {Array.from(ctrl.stateFields().values(), (customField) =>
              <option value={customField.id}
                      selected={customField.id === S.sample(ctrl.settings.stateFieldId)}>
                {customField.name}
              </option>
            )}
          </select>
          <small id="stateFieldHelp" class={HELP_CLASS}>
            The custom field (of type state) that contains the issue state.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="inactiveStates" class={LABEL_CLASS}>Inactive States:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="inactiveStates" class={SELECT_CLASS} multiple
                  aria-describedby="inactiveStatesHelp" fn={bindStringSet(ctrl.settings.inactiveStateIds)}>
            {multiplePlaceholders(ctrl.settings.inactiveStateIds(), ctrl.states(), (inactiveStateId) =>
                <option value={inactiveStateId} selected disabled>Unknown (ID: {inactiveStateId})</option>
            )}
            {Array.from(ctrl.states().values(), (stateBundleElement) =>
              <option value={stateBundleElement.id}
                      selected={S.sample(ctrl.settings.inactiveStateIds).has(stateBundleElement.id)}>
                {stateBundleElement.name}
              </option>
            )}
          </select>
          <small id="inactiveStatesHelp" class={HELP_CLASS}>
            The unresolved states indicating an issue should appear as inactive.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="remainingEffortField" class={LABEL_CLASS}>Remaining Effort Field:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="remainingEffortField" class={SELECT_CLASS} aria-describedby="remainingEffortFieldHelp"
                  fn={bindString(ctrl.settings.remainingEffortFieldId)}>
            <SinglePlaceholder defaultPlaceholder="None selected"
                               unknownIdPlaceholder={(unknownId) => `Unknown (ID: ${unknownId})`}
                               selectedId={ctrl.settings.remainingEffortFieldId()}
                               choices={ctrl.periodFields()} >
              <option value={ctrl.settings.remainingEffortFieldId()} selected disabled />
            </SinglePlaceholder>
            {Array.from(ctrl.periodFields().values(), (customField) =>
                <option value={customField.id}
                        selected={customField.id === S.sample(ctrl.settings.remainingEffortFieldId)}>
                  {customField.name}
                </option>
            )}
          </select>
          <small id="remainingEffortFieldHelp" class={HELP_CLASS}>
            The custom field (of type period) that contains the remaining effort.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="remainingWaitField" class={LABEL_CLASS}>Remaining Wait Field:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="remainingWaitField" class={SELECT_CLASS} aria-describedby="remainingWaitFieldHelp"
                  fn={bindString(ctrl.settings.remainingWaitFieldId)}>
            <option value="">None</option>
            {Array.from(ctrl.periodFields().values(), (customField) =>
                <option value={customField.id}
                        selected={customField.id === S.sample(ctrl.settings.remainingWaitFieldId)}>
                  {customField.name}
                </option>
            )}
          </select>
          <small id="remainingWaitFieldHelp" class={HELP_CLASS}>
            The custom field (of type period) that contains the remaining wait.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="assigneeField" class={LABEL_CLASS}>Assignee Field:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="assigneeField" class={SELECT_CLASS} aria-describedby="assigneeFieldHelp"
                  fn={bindString(ctrl.settings.assigneeFieldId)}>
            <SinglePlaceholder defaultPlaceholder="None selected"
                               unknownIdPlaceholder={(unknownId) => `Unknown (ID: ${unknownId})`}
                               selectedId={ctrl.settings.assigneeFieldId()}
                               choices={ctrl.userFields()} >
              <option value={ctrl.settings.assigneeFieldId()} selected disabled />
            </SinglePlaceholder>
            {Array.from(ctrl.userFields().values(), (customField) =>
                <option value={customField.id}
                        selected={customField.id === S.sample(ctrl.settings.assigneeFieldId)}>
                  {customField.name}
                </option>
            )}
          </select>
          <small id="stateFieldHelp" class={HELP_CLASS}>
            The custom field (of type user) that contains the assignee.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="typeField" class={LABEL_CLASS}>Type Field:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="typeField" class={SELECT_CLASS} aria-describedby="typeFieldHelp"
                  fn={bindString(ctrl.settings.typeFieldId)}>
            <SinglePlaceholder defaultPlaceholder="None selected"
                               unknownIdPlaceholder={(unknownId) => `Unknown (ID: ${unknownId})`}
                               selectedId={ctrl.settings.typeFieldId()}
                               choices={ctrl.enumFields()} >
              <option value={ctrl.settings.typeFieldId()} selected disabled />
            </SinglePlaceholder>
            {Array.from(ctrl.enumFields().values(), (customField) =>
                <option value={customField.id}
                        selected={customField.id === S.sample(ctrl.settings.typeFieldId)}>
                  {customField.name}
                </option>
            )}
          </select>
          <small id="typeFieldHelp" class={HELP_CLASS}>
            The custom field (of type enum) that contains the issue type.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="splittableTypes" class={LABEL_CLASS}>Splittable Types:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="splittableTypes" class={SELECT_CLASS} multiple
                  aria-describedby="splittableTypesHelp" fn={bindStringSet(ctrl.settings.splittableTypeIds)}>
            {multiplePlaceholders(ctrl.settings.splittableTypeIds(), ctrl.types(), (typeId) =>
                <option value={typeId} selected disabled>Unknown (ID: {typeId})</option>
            )}
            {Array.from(ctrl.types().values(), (enumBundleElement) =>
                <option value={enumBundleElement.id}
                        selected={S.sample(ctrl.settings.splittableTypeIds).has(enumBundleElement.id)}>
                  {enumBundleElement.name}
                </option>
            )}
          </select>
          <small id="splittableTypesHelp" class={HELP_CLASS}>
            The issue types that allow splitting across multiple persons when planning.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="dependsLinkType" class={LABEL_CLASS}>Dependency Link:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="dependsLinkType" class={SELECT_CLASS} aria-describedby="dependsLinkTypeHelp"
                  fn={bindString(ctrl.settings.dependsLinkTypeId)}>
            <SinglePlaceholder defaultPlaceholder="None selected"
                               unknownIdPlaceholder={(unknownId) => `Unknown (ID: ${unknownId})`}
                               selectedId={ctrl.settings.dependsLinkTypeId()}
                               choices={ctrl.directedIssueLinkTypes()} >
              <option value={ctrl.settings.dependsLinkTypeId()} selected disabled />
            </SinglePlaceholder>
            {Array.from(ctrl.directedIssueLinkTypes().values(), (linkType) =>
                <option value={linkType.id}
                        selected={linkType.id === S.sample(ctrl.settings.dependsLinkTypeId)}>
                  {linkType.name} ({linkType.sourceToTarget} → {linkType.targetToSource})
                </option>
            )}
          </select>
          <small id="dependsLinkTypeHelp" class={HELP_CLASS}>
            The type of issue link that indicates a finish-to-start dependency.
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="doesInwardDependOnOutward" class={LABEL_CLASS}>A before B:</label>
        <fieldset id="doesInwardDependOnOutward" class={EDIT_AREA_CLASS}
                  aria-describedby="doesInwardDependOnOutwardHelp">
          <div class="form-check form-check-inline">
            <input class={CHECK_CLASS} type="radio" id="gridRadios1"
                   fn={bindToOnValue(ctrl.settings.doesInwardDependOnOutward, true)}  />
            <label class={CHECK_LABEL_CLASS} for="gridRadios1">
              A {ctrl.issueLinkDirectionNames()[0]} B
            </label>
          </div>
          <div class="form-check form-check-inline">
            <input class={CHECK_CLASS} type="radio" id="gridRadios2"
                  fn={bindToOnValue(ctrl.settings.doesInwardDependOnOutward, false)}/>
            <label class={CHECK_LABEL_CLASS} for="gridRadios2">
              A {ctrl.issueLinkDirectionNames()[1]} B
            </label>
          </div>
          <small id="doesInwardDependOnOutwardHelp" class={HELP_CLASS}>
            The side of a dependency link synonymous with “needs to be finished before”.
          </small>
        </fieldset>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="savedQuery" class={LABEL_CLASS}>Saved Query:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="savedQuery" class={SELECT_CLASS} aria-describedby="savedQueryHelp"
                  fn={bindString(ctrl.settings.savedQuery)}>
            <SinglePlaceholder defaultPlaceholder="None selected"
                               unknownIdPlaceholder={(unknownId) => `Unknown (ID: ${unknownId})`}
                               selectedId={ctrl.settings.savedQuery()}
                               choices={ctrl.savedQueryIds()}>
              <option value={ctrl.settings.savedQuery()} selected disabled />
            </SinglePlaceholder>
            {ctrl.metadata().savedSearches.map((savedSearch) =>
                <option value={savedSearch.id}
                        selected={savedSearch.id === S.sample(ctrl.settings.savedQuery)}>
                  {savedSearch.name} ({savedSearch.owner.fullName})
                </option>
            )}
          </select>
          <small id="savedQueryHelp" class={HELP_CLASS}>
            The saved search containing the issues that will comprise the project plan. Issues will be scheduled in the
            order of this saved search (unless also part of the overlay saved search).
          </small>
        </div>
      </div>
      <div class={FORM_GROUP_CLASS}>
        <label for="overlaySavedQuery" class={LABEL_CLASS}>Overlay:</label>
        <div class={EDIT_AREA_CLASS}>
          <select id="overlaySavedQuery" class={SELECT_CLASS}  aria-describedby="overlaySavedQueryHelp"
                  fn={bindString(ctrl.settings.overlaySavedQuery)}>
            <option value="">None</option>
            <SinglePlaceholder unknownIdPlaceholder={(unknownId) => `Unknown (ID: ${unknownId})`}
                               selectedId={ctrl.settings.overlaySavedQuery()}
                               choices={ctrl.savedQueryIds()}>
              <option value={ctrl.settings.overlaySavedQuery()} selected disabled />
            </SinglePlaceholder>
            {ctrl.metadata().savedSearches.map((overlaySavedQuery) =>
                <option value={overlaySavedQuery.id}
                        selected={overlaySavedQuery.id === S.sample(ctrl.settings.overlaySavedQuery)}
                        disabled={overlaySavedQuery.id === ctrl.settings.savedQuery()}>
                  {overlaySavedQuery.name} ({overlaySavedQuery.owner.fullName})
                </option>
            )}
          </select>
          <small id="overlaySavedQuery" class={HELP_CLASS}>
            Reorders the issues that are contained in both saved searches according to this overlay. The order
            (more precisely, the rank) of all issues not contained in this overlay remains the same.
          </small>
        </div>
      </div>
      <hr />
      <div class={FORM_GROUP_CLASS}>
        <label class={LABEL_CLASS}>Contributors:</label>
        <ContributorsView className={EDIT_AREA_CLASS} ctrl={ctrl.contributorsCtrl} />
      </div>
    </div>;
}
