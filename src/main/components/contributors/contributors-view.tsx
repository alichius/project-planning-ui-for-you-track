import { mapSample } from 's-array';
// noinspection ES6UnusedImports
import * as Surplus from 'surplus';
import { bindNumber, bindString, focusOnChangeToValue, sortableBindSarray, withClassIff } from '../../utils/surplus';
import { ContributorKind } from '../contributor/contributor-model';
import {
  ContributorView,
  DRAGGABLE_HANDLE_CLASS,
  INPUT_WIDTH_3_DIGITS,
  MAX_HOURS_PER_WEEK,
  MAX_PERSONS_PER_CONTRIBUTORS,
} from '../contributor/contributor-view';
import { ContributorsCtrl, EXTERNAL_CONTRIBUTOR_VALUE } from './contributors-ctrl';

const HIDDEN_CLASS: string = 'd-none';
const SELECT_CLASS = 'custom-select custom-select-sm w-100';
const INPUT_CLASS = 'form-control form-control-sm';
const INPUT_CLASS_RIGHT = 'form-control form-control-sm text-right';

export function ContributorsView({className, ctrl}: {className?: string, ctrl: ContributorsCtrl}): HTMLElement {
  return <div className={className || ''}>
      <ul class="list-group mb-3"
          fn1={sortableBindSarray(ctrl.contributors, {handle: `.${DRAGGABLE_HANDLE_CLASS}`})}
          fn2={withClassIff(() => ctrl.contributors().length === 0, HIDDEN_CLASS)}>
        {mapSample(ctrl.contributorControllers, (itemCtrl) =>
            <ContributorView ctrl={itemCtrl} />
        )}
      </ul>
      <div class="list-group-add d-flex">
        <div class="form-inline flex-grow-1">
          <div class="flex-fill mr-3 mb-1 mb-sm-0" fn={ctrl.withClassIffExternalContributor(true, HIDDEN_CLASS)}>
            <select class={SELECT_CLASS} fn={bindString(ctrl.newEntry.id)}>
              {ctrl.newEntry.id().length === 0 &&
                <option value="" selected disabled>Choose to add</option>
              }
              <option value={EXTERNAL_CONTRIBUTOR_VALUE}>External contributor…</option>
              <optgroup label="YouTrack Users">
                {Array.from(ctrl.youTrackUserMap().values(), (user) =>
                    <option value={user.id}>{user.fullName}</option>
                )}
              </optgroup>
            </select>
          </div>
          <div class="input-group input-group-sm flex-nowrap flex-fill mr-3 mb-1 mb-sm-0"
               fn={ctrl.withClassIffExternalContributor(false, HIDDEN_CLASS)}>
            <input class={INPUT_CLASS} size={10} aria-label="Name of external contributor"
                   fn1={bindString(ctrl.newEntry.name)}
                   fn2={focusOnChangeToValue<ContributorKind>(ctrl.newEntryType, ContributorKind.EXTERNAL)} />
            <div class="input-group-append">
              <button type="button" class="btn btn-outline-secondary" onClick={() => ctrl.reset()}>Reset</button>
            </div>
          </div>
          <div class="input-group input-group-sm flex-nowrap mr-3 mb-1 mb-sm-0"
               fn={ctrl.withClassIffExternalContributor(false, HIDDEN_CLASS)}>
            <input type="number" class={INPUT_CLASS_RIGHT} min="1" max={MAX_PERSONS_PER_CONTRIBUTORS}
                   style={{width: INPUT_WIDTH_3_DIGITS}}
                   aria-label="Number of persons" fn={bindNumber(ctrl.newEntry.numMembers)} />
            <div class="input-group-append">
              <span class="input-group-text">👤</span>
            </div>
          </div>
          <div class="input-group input-group-sm flex-nowrap mr-3 mb-1 mb-sm-0">
            <input type="number" class={INPUT_CLASS_RIGHT} min="1" max={MAX_HOURS_PER_WEEK}
                   style={{width: INPUT_WIDTH_3_DIGITS}}
                   aria-label="Hours per week per person" fn={bindNumber(ctrl.newEntry.hoursPerWeek)} />
            <div class="input-group-append">
              <span class="input-group-text">h/week</span>
            </div>
          </div>
        </div>
        <button type="button" class="close" aria-label="Add contributor" onClick={() => ctrl.create()}>
          <span aria-hidden="true">+</span>
        </button>
      </div>
    </div>;
}
