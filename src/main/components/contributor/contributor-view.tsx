// noinspection ES6UnusedImports
import * as Surplus from 'surplus';
import { bindNumber, bindString } from '../../utils/surplus';
import { ContributorCtrl } from './contributor-ctrl';
import { ContributorKind } from './contributor-model';

export const MAX_PERSONS_PER_CONTRIBUTORS = 100;
export const MAX_HOURS_PER_WEEK = 7 * 24;
export const DRAGGABLE_HANDLE_CLASS = 'draggable-handle';
const PLAINTEXT_CLASS = 'form-control-plaintext form-control-sm w-100';
const INPUT_CLASS = 'form-control form-control-sm w-100';
const INPUT_CLASS_RIGHT = 'form-control form-control-sm text-right';

// Unfortunately, Firefox does not automatically resize <input> element of type number to the maximum required width.
// https://stackoverflow.com/questions/22590483/why-does-adding-min-max-properties-change-the-width-of-a-numeric-html5-input-ele
// As a workaround, we set the width relative to the width of digit '0'. We include some extra digits to account for:
// Padding on the left, padding on the right, and spin buttons.
export const INPUT_WIDTH_3_DIGITS: string = `${4 + Math.ceil(Math.log(MAX_HOURS_PER_WEEK) / Math.LN10)}ch`;

export function ContributorView({ctrl}: {ctrl: ContributorCtrl}): HTMLElement {
  return <li class="list-group-item draggable d-flex">
      <div class={DRAGGABLE_HANDLE_CLASS}>⣿</div>
      <div class="form-inline flex-grow-1">
        <div class="flex-fill mr-3 mb-1 mb-sm-0">
          {ctrl.contributor.type === ContributorKind.EXTERNAL
              ? <input class={INPUT_CLASS} aria-label="Name of external contributor" size={10}
                       fn={bindString(ctrl.contributor.name)} />
              : <input class={PLAINTEXT_CLASS} aria-label="Name of YouTrack user"
                       readOnly value={ctrl.name()} />
          }
        </div>
        {ctrl.contributor.type === ContributorKind.EXTERNAL &&
          <div class="input-group input-group-sm flex-nowrap mr-3 mb-1 mb-sm-0">
            <input type="number" class={INPUT_CLASS_RIGHT} min="1" max={MAX_PERSONS_PER_CONTRIBUTORS}
              aria-label="Number of persons" style={{width: INPUT_WIDTH_3_DIGITS}}
              fn={bindNumber(ctrl.contributor.numMembers)} />
            <div class="input-group-append">
              <span class="input-group-text">👤</span>
            </div>
          </div>
        }
        <div class="input-group input-group-sm flex-nowrap mr-3 mb-1 mb-sm-0">
          <input type="number" class={INPUT_CLASS_RIGHT} min="1" max={MAX_HOURS_PER_WEEK}
                 aria-label="Hours per week per person" style={{width: INPUT_WIDTH_3_DIGITS}}
                 fn={bindNumber(ctrl.contributor.hoursPerWeek)} />
          <div class="input-group-append">
            <span class="input-group-text">h/week</span>
          </div>
        </div>
      </div>
      <button type="button" class="close" aria-label="Remove contributor" onClick={() => ctrl.remove()}>
        <span aria-hidden="true">&times;</span>
      </button>
    </li>;
}
