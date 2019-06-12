import S, { DataSignal } from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { unreachableCase } from '../../utils/typescript';

export type Contributor = YouTrackContributor | ExternalContributor;

export interface ContributorBase {
  readonly type: ContributorKind;
  readonly hoursPerWeek: DataSignal<number>;
}

export const enum ContributorKind {
  YOU_TRACK,
  EXTERNAL,
}

export interface ExternalContributor extends ContributorBase {
  readonly type: ContributorKind.EXTERNAL;
  readonly name: DataSignal<string>;
  readonly numMembers: DataSignal<number>;
}

export interface YouTrackContributor extends ContributorBase {
  readonly type: ContributorKind.YOU_TRACK;
  readonly id: string;
}


export function createContributor(plain: Plain<Contributor>): Contributor {
  switch (plain.type) {
    case ContributorKind.YOU_TRACK:
      return createYouTrackContributor(plain);
    case ContributorKind.EXTERNAL:
      return createExternalContributor(plain);
    default:
      return unreachableCase(plain);
  }
}

export function createExternalContributor(plain: Plain<ExternalContributor>): ExternalContributor {
  return {
    ...createContributorBase(plain),
    type: ContributorKind.EXTERNAL,
    name: jsonable(S.value(plain.name)),
    numMembers: jsonable(S.value(plain.numMembers)),
  };
}

export function createYouTrackContributor(plain: Plain<YouTrackContributor>): YouTrackContributor {
  return {
    ...createContributorBase(plain),
    type: ContributorKind.YOU_TRACK,
    id: plain.id,
  };
}

function createContributorBase(plain: Plain<ContributorBase>): ContributorBase {
  return {
    type: plain.type,
    hoursPerWeek: jsonable(S.value(plain.hoursPerWeek)),
  };
}
