import S, { DataSignal } from 's-js';
import { jsonable, Plain } from '../../utils/s';

/**
 * Non-transient state of the settings UI component.
 */
export interface DependsLinkType {
  readonly dependsLinkTypeId: DataSignal<string>;
  readonly doesInwardDependOnOutward: DataSignal<boolean>;
}

/**
 * Creates a new state for the settings UI component.
 */
export function createDependsLinkType(): DependsLinkType {
  return {
    dependsLinkTypeId: jsonable(S.value('')),
    doesInwardDependOnOutward: jsonable(S.value(true)),
  };
}

/**
 * Updates the state of the settings UI component to the given values in a plain JSON object.
 *
 * The update is performed within a single S.js transaction.
 *
 * @param type state of the settings UI component
 * @param plain plain JSON object
 */
export function assignDependsLinkType(type: DependsLinkType, plain: Plain<DependsLinkType>):
    void {
  S.freeze(() => {
    type.dependsLinkTypeId(plain.dependsLinkTypeId);
    type.doesInwardDependOnOutward(plain.doesInwardDependOnOutward);
  });
}
