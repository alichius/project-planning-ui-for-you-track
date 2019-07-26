import S, { DataSignal } from 's-js';
import * as Surplus from 'surplus'; // lgtm [js/unused-local-variable]
import { Counter } from '../utils/counter';
import { bindString, bindStringSet, bindToOnValue, withClassIff } from '../utils/surplus';
import {
  CHECK_CLASS,
  CHECK_LABEL_CLASS,
  EDIT_AREA_CLASS,
  FORM_GROUP_CLASS,
  HELP_CLASS,
  LABEL_CLASS,
  SELECT_CLASS,
} from './bootstrap';

/**
 * Properties for every control in a form.
 */
export interface ControlProperties {
  readonly id: string;
  readonly label: string;
}

/**
 * Properties for {@link SelectView}.
 */
export interface SelectProperties<T> extends ControlProperties {
  readonly required?: boolean;
  readonly elementId: DataSignal<string>;
  readonly elements: () => Map<string, T>;
  readonly idFromElement: (element: T) => string;
  readonly optionTextFromElement: (element: T) => string;
  readonly invalidCounter?: Counter;
  readonly children: JSX.Children;
}

/**
 * Returns a newly created `<select>` control for choosing at most one from a list of option.
 *
 * The control shows a disabled placeholder option if the current value is empty. If the current value is not available,
 * the control shows “Unknown (ID: <YouTrack entity ID>)” as select option, and this option is *not* disabled. (If it
 * was disabled, we would be running into [Firefox bug 1569314](https://bugzilla.mozilla.org/show_bug.cgi?id=1569314).)
 */
export function SelectView<T>({id, label, required = false, elementId, elements, idFromElement, optionTextFromElement,
    invalidCounter, children}: SelectProperties<T>): HTMLElement {
  return (
      <div class={FORM_GROUP_CLASS}>
        <label for={id} class={LABEL_CLASS}>{label}</label>
        <div class={EDIT_AREA_CLASS}>
          <select id={id} class={SELECT_CLASS} aria-describedby={`${id}Help`} required={required}
                  fn={bindString(elementId, invalidCounter)}>
            {!required &&
                <option value="">None</option>
            }
            <SinglePlaceholder defaultPlaceholder={!required ? undefined : 'None selected'}
                               unknownIdPlaceholder={(unknownId) => `Unknown (ID: ${unknownId})`}
                               selectedId={elementId()}
                               choices={elements()} >
              <option value={elementId()} selected disabled={elementId().length === 0} />
            </SinglePlaceholder>
            {Array.from(elements().values(), (element) =>
                <option value={idFromElement(element)}
                        selected={idFromElement(element) === S.sample(elementId)}>
                  {optionTextFromElement(element)}
                </option>
            )}
          </select>
          <small id={`${id}Help`} class={HELP_CLASS}>{children}</small>
        </div>
      </div>
  );
}

/**
 * Properties for {@link SecondarySelectView}.
 */
export interface SecondarySelectProperties<T> extends SelectProperties<T> {
  readonly primaryElementId: () => string;
}

/**
 * Returns a “secondary” `<select>` control that allows to choose a single element.
 *
 * The element must differ from the value that (typically) is already the active value of another “primary” control.
 * If the current value is not available, the control shows “Unknown (ID: <YouTrack entity ID>)” as select option, and
 * this option is *not* disabled (see {@link SelectView}).
 */
export function SecondarySelectView<T>(
    {id, label, elementId, elements, idFromElement, optionTextFromElement, primaryElementId, children}:
    SecondarySelectProperties<T>): HTMLElement {
  return <div class={FORM_GROUP_CLASS}>
      <label for={id} class={LABEL_CLASS}>{label}</label>
      <div class={EDIT_AREA_CLASS}>
        <select id={id} class={SELECT_CLASS} aria-describedby={`${id}Help`}
                fn={bindString(elementId)}>
          <option value="">None</option>
          <SinglePlaceholder unknownIdPlaceholder={(unknownId) => `Unknown (ID: ${unknownId})`}
                             selectedId={elementId()}
                             choices={elements()}>
            <option value={elementId()} selected />
          </SinglePlaceholder>
          {Array.from(elements().values(), (element) =>
              <option value={idFromElement(element)}
                      selected={idFromElement(element) === S.sample(elementId)}
                      disabled={idFromElement(element) === primaryElementId()}>
                {optionTextFromElement(element)}
              </option>
          )}
        </select>
        <small id={`${id}Help`} class={HELP_CLASS}>{children}</small>
      </div>
    </div>;
}

/**
 * Properties for {@link MultiSelectView}.
 */
export interface MultiSelectProperties<T> extends ControlProperties {
  readonly elementIds: DataSignal<Set<string>>;
  readonly bundleElements: () => Map<string, T>;
  readonly idFromElement: (element: T) => string;
  readonly optionTextFromElement: (element: T) => string;
  readonly children: JSX.Children;
}

/**
 * Returns a `<select multiple>` control that allows to choose zero or more elements.
 *
 * The user may choose zero or more elements, so the input is assumed to be always valid.
 */
export function MultiSelectView<T>(
    {id, label, elementIds, bundleElements, idFromElement, optionTextFromElement, children}: MultiSelectProperties<T>):
    HTMLElement {
  return <div class={FORM_GROUP_CLASS}>
        <label for={id} class={LABEL_CLASS}>{label}</label>
        <div class={EDIT_AREA_CLASS}>
          <select id={id} class={SELECT_CLASS} multiple
                  aria-describedby={`${id}Help`} fn={bindStringSet(elementIds)}>
            {multiplePlaceholders(elementIds(), bundleElements(), (inactiveStateId) =>
                <option value={inactiveStateId} selected>Unknown (ID: {inactiveStateId})</option>
            )}
            {Array.from(bundleElements().values(), (bundleElement) =>
              <option value={idFromElement(bundleElement)}
                      selected={S.sample(elementIds).has(idFromElement(bundleElement))}>
                {optionTextFromElement(bundleElement)}
              </option>
            )}
          </select>
          <small id={`${id}Help`} class={HELP_CLASS}>{children}</small>
        </div>
      </div>;
}

/**
 * Properties for {@link RadioToggleView}.
 */
export interface ToggleProperties extends ControlProperties {
  readonly value: DataSignal<boolean>;
  readonly names: () => [string, string];
  readonly children: JSX.Children;
}

export function RadioToggleView({id, label, value, names, children}: ToggleProperties): HTMLElement {
  return <div class={FORM_GROUP_CLASS}>
      <label for={id} class={LABEL_CLASS}>{label}</label>
      <fieldset id={id} class={EDIT_AREA_CLASS} aria-describedby={`${id}Help`}>
        <div class="form-check form-check-inline">
          <input class={CHECK_CLASS} type="radio" id={`${id}True`}
                 fn={bindToOnValue(value, true)}  />
          <label class={CHECK_LABEL_CLASS} for={`${id}True`}>
            {names()[0]}
          </label>
        </div>
        <div class="form-check form-check-inline">
          <input class={CHECK_CLASS} type="radio" id={`${id}False`}
                 fn={bindToOnValue(value, false)}/>
          <label class={CHECK_LABEL_CLASS} for={`${id}False`}>
            {names()[1]}
          </label>
        </div>
        <small id={`${id}Help`} class={HELP_CLASS}>{children}</small>
      </fieldset>
    </div>;
}

export interface ProgressBarProperties {
  className?: string;
  progress: () => number | undefined;
}

export function ProgressBarView({className, progress}: ProgressBarProperties): HTMLElement {
  return (
      <div class={`progress ${className || ''}`} fn={withClassIff(() => progress() === undefined, 'd-none')}>
        <div class="progress-bar progress-bar-striped progress-bar-animated"
             role="progressbar" aria-valuenow={asString(progress)} aria-valuemin="0" aria-valuemax="100"
             style={{width: asString(progress, '%')}} />
      </div>
  );
}


/**
 * Properties for {@link SinglePlaceholder}.
 */
interface SinglePlaceholderProperties {
  readonly defaultPlaceholder?: string;
  readonly unknownIdPlaceholder: (unknownId: string) => string;
  readonly selectedId: string;
  readonly choices: Map<string, unknown> | Set<string>;
  readonly children: JSX.Element;
}

/**
 * Returns the `children` property (typically an `<option>` element) if certain conditions are met, or otherwise `null`.
 *
 * The {@link HTMLElement.innerText} of the placeholder is set to:
 * - the result of `unknownIdPlaceholder(selectedId)` if `selectedId` is contained in `choices`
 * - `defaultPlaceholder` if it is defined and if `selectedId` is non-empty.
 *
 * @return in the two cases above, the placeholder (that is, the `children` property), otherwise `null`
 */
function SinglePlaceholder({defaultPlaceholder, unknownIdPlaceholder, selectedId, choices, children}:
    SinglePlaceholderProperties): JSX.Element | null {
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

function asString(progress: () => number | undefined, unit: string = ''): string {
  const currentProgress: number | undefined = progress();
  const value: number = currentProgress === undefined || currentProgress < 0
      ? 0
      : Math.min(100, currentProgress);
  return value === 0
      ? value.toString()
      : `${value}${unit}`;
}
