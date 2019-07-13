import createSDataArray, { SDataArray } from 's-array';
import S, { DataSignal } from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { Contributor, createContributor } from '../contributor/contributor-model';

export const DEFAULT_HOURS_PER_WEEK = 40;
export const DEFAULT_NUM_MEMBERS = 1;

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
    contributorEditArea.hoursPerWeek(plain.hoursPerWeek);
    contributorEditArea.id(plain.id);
    contributorEditArea.name(plain.name);
    contributorEditArea.numMembers(plain.numMembers);
  });
}
