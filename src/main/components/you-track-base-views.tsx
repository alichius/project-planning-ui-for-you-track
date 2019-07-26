import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]
import { BundleElement, CustomField, IssueLinkType, SavedQuery } from '../youtrack-rest';
import {
  MultiSelectProperties,
  MultiSelectView,
  SecondarySelectProperties,
  SecondarySelectView,
  SelectProperties,
  SelectView,
} from './base-views';

type StandardProperties = 'idFromElement' | 'optionTextFromElement';
type ElementIdAndElements = Pick<SelectProperties<CustomField>, 'elementId' | 'elements'>;

export function IssueFieldView({id, label, required, elementId, elements, invalidCounter, children}:
    Omit<SelectProperties<CustomField>, StandardProperties>): HTMLElement {
  return (
      <SelectView id={id} label={label} required={required} elementId={elementId} elements={elements}
                  idFromElement={(field) => field.id}
                  optionTextFromElement={(field) => field.name}
                  invalidCounter={invalidCounter}>
        {children}
      </SelectView>
  );
}

/**
 * Returns a control that allows to choose the assignee custom field.
 *
 * The assignee custom field is assumed to be optional (and hence the input is always valid, even if empty).
 */
export function AssigneeFieldView({elementId, elements}: ElementIdAndElements): HTMLElement {
  return (
      <IssueFieldView id="assigneeField" label="Assignee Field:" elementId={elementId} elements={elements}>
        The custom field (of type user) that contains the assignee.
      </IssueFieldView>
  );
}

/**
 * Returns a control that allows to choose the issue type custom field.
 *
 * The issue type custom field is assumed to be optional (and hence the input is always valid, even if empty).
 */
export function IssueTypeFieldView({elementId, elements}: ElementIdAndElements): HTMLElement {
  return (
      <IssueFieldView id="typeField" label="Type Field:" elementId={elementId} elements={elements}>
        The custom field (of type enum) that contains the issue type.
      </IssueFieldView>
  );
}

export function LinkTypeView({id, label, required, elementId, elements, invalidCounter, children}:
    Omit<SelectProperties<IssueLinkType>, StandardProperties>): HTMLElement {
  return (
      <SelectView id={id} label={label} required={required} elementId={elementId} elements={elements}
                  idFromElement={(linkType) => linkType.id}
                  optionTextFromElement={(linkType) =>
                      `${linkType.name} (${linkType.sourceToTarget} → ${linkType.targetToSource})`}
                  invalidCounter={invalidCounter}>
        {children}
      </SelectView>
  );
}

export function SavedQueryView({id, label, elementId, elements, invalidCounter, children}:
    Omit<SelectProperties<SavedQuery>, StandardProperties>): HTMLElement {
  return (
      <SelectView id={id} label={label} required elementId={elementId} elements={elements}
                  idFromElement={idFromElement} optionTextFromElement={optionTextFromSavedQuery}
                  invalidCounter={invalidCounter}>
        {children}
      </SelectView>
  );
}

export function OverlaySavedQueryView({id, label, elementId, elements, primaryElementId, children}:
    Omit<SecondarySelectProperties<SavedQuery>, StandardProperties>): HTMLElement {
  return (
      <SecondarySelectView id={id} label={label} elementId={elementId} elements={elements}
                           idFromElement={idFromElement} optionTextFromElement={optionTextFromSavedQuery}
                           primaryElementId={primaryElementId}>
        {children}
      </SecondarySelectView>
  );
}

export function BundleElementsView({id, label, elementIds, bundleElements, children}:
    Omit<MultiSelectProperties<BundleElement>, StandardProperties>): HTMLElement {
  return (
      <MultiSelectView id={id} label={label} elementIds={elementIds} bundleElements={bundleElements}
                          idFromElement={idFromElement} optionTextFromElement={optionTextFromElement}>
        {children}
      </MultiSelectView>
  );
}


function idFromElement(element: {id: string}): string {
  return element.id;
}

function optionTextFromElement(element: {name: string}): string {
  return element.name;
}

function optionTextFromSavedQuery(savedQuery: SavedQuery): string {
  return `${savedQuery.name} (${savedQuery.owner.fullName})`;
}
