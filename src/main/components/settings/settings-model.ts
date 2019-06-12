import { SDataArray } from 's-array';
import S, { DataSignal } from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { Contributor } from '../contributor/contributor-model';
import { assignContributors, createContributors } from '../contributors/contributors-model';

/**
 * Non-transient state of the settings UI component.
 */
export interface Settings {
  readonly name: DataSignal<string>;
  readonly youTrackBaseUrl: DataSignal<string>;
  readonly youTrackServiceId: DataSignal<string>;
  readonly stateFieldId: DataSignal<string>;
  readonly inactiveStateIds: DataSignal<Set<string>>;
  readonly remainingEffortFieldId: DataSignal<string>;
  readonly remainingWaitFieldId: DataSignal<string>;
  readonly assigneeFieldId: DataSignal<string>;
  readonly typeFieldId: DataSignal<string>;
  readonly splittableTypeIds: DataSignal<Set<string>>;
  readonly dependsLinkTypeId: DataSignal<string>;
  readonly doesInwardDependOnOutward: DataSignal<boolean>;
  readonly savedQuery: DataSignal<string>;
  readonly overlaySavedQuery: DataSignal<string>;
  readonly contributors: SDataArray<Contributor>;
}

/**
 * Creates a new state for the settings UI component.
 */
export function createSettings(): Settings {
  return {
    name: jsonable(S.value('')),
    youTrackBaseUrl: jsonable(S.value('')),
    youTrackServiceId: jsonable(S.value('')),
    stateFieldId: jsonable(S.value('')),
    inactiveStateIds: jsonable(S.value(new Set<string>())),
    remainingEffortFieldId: jsonable(S.value('')),
    remainingWaitFieldId: jsonable(S.value('')),
    assigneeFieldId: jsonable(S.value('')),
    typeFieldId: jsonable(S.value('')),
    splittableTypeIds: jsonable(S.value(new Set<string>())),
    dependsLinkTypeId: jsonable(S.value('')),
    doesInwardDependOnOutward: jsonable(S.value(true)),
    savedQuery: jsonable(S.value('')),
    overlaySavedQuery: jsonable(S.value('')),
    contributors: createContributors(),
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
export function assignSettings(settings: Settings, plain: Plain<Settings>): void {
  S.freeze(() => {
    settings.name(plain.name);
    settings.youTrackBaseUrl(plain.youTrackBaseUrl);
    settings.youTrackServiceId(plain.youTrackServiceId);
    settings.stateFieldId(plain.stateFieldId);
    settings.inactiveStateIds(new Set<string>(plain.inactiveStateIds));
    settings.remainingEffortFieldId(plain.remainingEffortFieldId);
    settings.remainingWaitFieldId(plain.remainingWaitFieldId);
    settings.assigneeFieldId(plain.assigneeFieldId);
    settings.typeFieldId(plain.typeFieldId);
    settings.splittableTypeIds(new Set<string>(plain.splittableTypeIds));
    settings.dependsLinkTypeId(plain.dependsLinkTypeId);
    settings.doesInwardDependOnOutward(plain.doesInwardDependOnOutward);
    settings.savedQuery(plain.savedQuery);
    settings.overlaySavedQuery(plain.overlaySavedQuery);
    assignContributors(settings.contributors, plain.contributors);
  });
}