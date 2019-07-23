import createSDataArray, { SDataArray } from 's-array';
import S, { DataSignal } from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { ensureNumber, ensureString } from '../../utils/typescript';
import {
  Contributor,
  createContributor,
  DEFAULT_HOURS_PER_WEEK,
  DEFAULT_NUM_MEMBERS,
} from '../contributor/contributor-model';

export interface ContributorEditArea {
  hoursPerWeek: DataSignal<number>;
  id: DataSignal<string>;
  name: DataSignal<string>;
  numMembers: DataSignal<number>;
}

export function createContributors(): SDataArray<Contributor> {
  return jsonable(createSDataArray<Contributor>([]));
}

export function createContributorEditArea() {
  return {
    hoursPerWeek: jsonable(S.value(DEFAULT_HOURS_PER_WEEK)),
    id: jsonable(S.value('')),
    name: jsonable(S.value('')),
    numMembers: jsonable(S.value(DEFAULT_NUM_MEMBERS)),
  };
}

export function assignContributors(contributors: SDataArray<Contributor>, plain: Plain<Contributor>[]): void {
  S.freeze(() => contributors(plain.map(createContributor)));
}

export function assignContributorEditArea(contributorEditArea: ContributorEditArea, plain: Plain<ContributorEditArea>):
    void {
  S.freeze(() => {
    contributorEditArea.hoursPerWeek(ensureNumber(plain.hoursPerWeek));
    contributorEditArea.id(ensureString(plain.id));
    contributorEditArea.name(plain.name);
    contributorEditArea.numMembers(plain.numMembers);
  });
}
