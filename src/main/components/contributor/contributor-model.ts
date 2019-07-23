import S, { DataSignal } from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { ensureNumber, ensureString, unreachableCase } from '../../utils/typescript';

export const DEFAULT_HOURS_PER_WEEK = 40;
export const DEFAULT_NUM_MEMBERS = 1;

export type Contributor = YouTrackContributor | ExternalContributor;

export interface ContributorBase {
  readonly type: ContributorKind;
  readonly hoursPerWeek: DataSignal<number>;
}

export const enum ContributorKind {
  YOU_TRACK,
  EXTERNAL,
}

/**
 * Returns the given value if it is of type {@link ContributorKind}, or otherwise the given default value.
 */
function ensureContributorKind(value: ContributorKind,
    defaultValue: ContributorKind = ContributorKind.YOU_TRACK): ContributorKind {
  switch (value) {
    case ContributorKind.EXTERNAL: case ContributorKind.YOU_TRACK: return value;
    default: return defaultValue;
  }
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


/**
 * Returns a newly created {@link Contributor} object with the values from the given plain JSON object.
 *
 * @param plain Plain JSON object. This function cannot rely on static type checking, because the data may be user
 *     input.
 */
export function createContributor(plain: Plain<Contributor>): Contributor {
  // Type cast is necessary, because TypeScript cannot know that ensureContributorKind is the identity function (for
  // well-formed input).
  const plainCopy: Plain<Contributor> = {
    ...plain,
    type: ensureContributorKind(plain.type),
  } as Plain<Contributor>;
  switch (plainCopy.type) {
    case ContributorKind.YOU_TRACK:
      return createYouTrackContributor(plainCopy);
    case ContributorKind.EXTERNAL:
      return createExternalContributor(plainCopy);
    default:
      return unreachableCase(plainCopy);
  }
}

function createExternalContributor(plain: Plain<ExternalContributor>): ExternalContributor {
  return {
    ...createContributorBase(plain),
    type: ContributorKind.EXTERNAL,
    name: jsonable(S.value(ensureString(plain.name))),
    numMembers: jsonable(S.value(ensureNumber(plain.numMembers, DEFAULT_NUM_MEMBERS))),
  };
}

function createYouTrackContributor(plain: Plain<YouTrackContributor>): YouTrackContributor {
  return {
    ...createContributorBase(plain),
    type: ContributorKind.YOU_TRACK,
    id: ensureString(plain.id),
  };
}

function createContributorBase(plain: Plain<ContributorBase>): Pick<ContributorBase, 'hoursPerWeek'> {
  return {
    hoursPerWeek: jsonable(S.value(ensureNumber(plain.hoursPerWeek, DEFAULT_HOURS_PER_WEEK))),
  };
}
