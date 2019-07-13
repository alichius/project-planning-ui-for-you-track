import { SDataArray } from 's-array';
import S, { DataSignal } from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { Contributor } from '../contributor/contributor-model';
import {
  assignContributorEditArea,
  assignContributors,
  ContributorEditArea,
  createContributorEditArea,
  createContributors,
} from '../contributors/contributors-model';
import {
  assignDependsLinkType,
  createDependsLinkType,
  DependsLinkType,
} from '../depends-link-type/depends-link-type-model';
import { assignSettings, createSettings, Settings } from '../settings/settings-model';

/**
 * User-provided state of the settings UI component.
 */
export interface ProjectPlanningSettings extends Settings, DependsLinkType {
  readonly stateFieldId: DataSignal<string>;
  readonly inactiveStateIds: DataSignal<Set<string>>;
  readonly remainingEffortFieldId: DataSignal<string>;
  readonly remainingWaitFieldId: DataSignal<string>;
  readonly assigneeFieldId: DataSignal<string>;
  readonly typeFieldId: DataSignal<string>;
  readonly splittableTypeIds: DataSignal<Set<string>>;
  readonly savedQueryId: DataSignal<string>;
  readonly overlaySavedQueryId: DataSignal<string>;
  readonly contributors: SDataArray<Contributor>;
  readonly transient: ContributorEditArea;
}

/**
 * Creates a new state for the settings UI component.
 */
export function createProjectPlanningSettings(): ProjectPlanningSettings {
  return {
    ...createSettings(),
    stateFieldId: jsonable(S.value('')),
    inactiveStateIds: jsonable(S.value(new Set<string>())),
    remainingEffortFieldId: jsonable(S.value('')),
    remainingWaitFieldId: jsonable(S.value('')),
    assigneeFieldId: jsonable(S.value('')),
    typeFieldId: jsonable(S.value('')),
    splittableTypeIds: jsonable(S.value(new Set<string>())),
    ...createDependsLinkType(),
    savedQueryId: jsonable(S.value('')),
    overlaySavedQueryId: jsonable(S.value('')),
    contributors: createContributors(),
    transient: createContributorEditArea(),
  };
}

/**
 * Updates the state of the settings UI component to the given values in a plain JSON object.
 *
 * The update is performed within a single S.js transaction.
 *
 * @param settings state of the settings UI component
 * @param plain plain JSON object
 */
export function assignProjectPlanningSettings(settings: ProjectPlanningSettings, plain: Plain<ProjectPlanningSettings>):
    void {
  S.freeze(() => {
    assignSettings(settings, plain);
    settings.stateFieldId(plain.stateFieldId);
    settings.inactiveStateIds(new Set<string>(plain.inactiveStateIds));
    settings.remainingEffortFieldId(plain.remainingEffortFieldId);
    settings.remainingWaitFieldId(plain.remainingWaitFieldId);
    settings.assigneeFieldId(plain.assigneeFieldId);
    settings.typeFieldId(plain.typeFieldId);
    settings.splittableTypeIds(new Set<string>(plain.splittableTypeIds));
    assignDependsLinkType(settings, plain);
    settings.savedQueryId(plain.savedQueryId);
    settings.overlaySavedQueryId(plain.overlaySavedQueryId);
    assignContributors(settings.contributors, plain.contributors);
    if (plain.transient !== undefined) {
      assignContributorEditArea(settings.transient, plain.transient);
    }
  });
}
