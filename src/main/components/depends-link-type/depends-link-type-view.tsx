import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]
import { Counter } from '../../utils/counter';
import { IssueLinkType } from '../../youtrack-rest';
import { RadioToggleView } from '../base-views';
import { LinkTypeView } from '../you-track-base-views';
import { DependsLinkType } from './depends-link-type-model';

export interface DependsLinkTypeProperties {
  readonly dependsLinkType: DependsLinkType;
  readonly directedIssueLinkTypes: () => Map<string, IssueLinkType>;
  readonly invalidCounter: Counter;
}

/**
 * Returns a control that allows to choose the “finish-to-start” dependency link type.
 *
 * The bound value is assumed to be required.
 */
export function DependsLinkTypeView(
    {dependsLinkType, directedIssueLinkTypes, invalidCounter}: DependsLinkTypeProperties): HTMLElement {
  return (
      <div>
        <LinkTypeView id="dependsLinkType" label="Dependency Link:" required
                      elementId={dependsLinkType.dependsLinkTypeId} elements={directedIssueLinkTypes}
                      invalidCounter={invalidCounter}>
          The type of issue link that indicates a finish-to-start dependency.
        </LinkTypeView>
        <RadioToggleView id="doesInwardDependOnOutward" label="A before B:"
                         value={dependsLinkType.doesInwardDependOnOutward}
                         names={() => issueLinkDirectionNames(
                             directedIssueLinkTypes, dependsLinkType.dependsLinkTypeId)}>
          The side of a dependency link synonymous with “needs to be finished before”.
        </RadioToggleView>
      </div>
  );
}


function issueLinkDirectionNames(
    directedIssueLinkTypes: () => Map<string, IssueLinkType>, dependsLinkTypeId: () => string): [string, string] {
  const issueLinkType: IssueLinkType | undefined = directedIssueLinkTypes().get(dependsLinkTypeId());
  return issueLinkType === undefined
      ? ['A → B', 'A ← B']
      : [`A ${issueLinkType.sourceToTarget} B`, `A ${issueLinkType.targetToSource} B`];
}
