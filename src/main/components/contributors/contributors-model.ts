import createSDataArray, { SDataArray } from 's-array';
import S from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { Contributor, createContributor } from '../contributor/contributor-model';

export function createContributors(): SDataArray<Contributor> {
  return jsonable(createSDataArray<Contributor>([]));
}

export function assignContributors(contributors: SDataArray<Contributor>, plain: Plain<Contributor>[]): void {
  S.freeze(() => contributors(plain.map(createContributor)));
}
