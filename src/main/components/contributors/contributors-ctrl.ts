import { SArray, SDataArray } from 's-array';
import S from 's-js';
import { jsonable, Plain } from '../../utils/s';
import { withClassIff } from '../../utils/surplus';
import { unreachableCase } from '../../utils/typescript';
import { User } from '../../youtrack-rest';
import { ContributorCtrl } from '../contributor/contributor-ctrl';
import { Contributor, ContributorKind, createContributor } from '../contributor/contributor-model';

export const EXTERNAL_CONTRIBUTOR_VALUE = 'youtrack-planning-js/external';
const DEFAULT_HOURS_PER_WEEK = 40;
const DEFAULT_NUM_MEMBERS = 1;

export class ContributorsCtrl {
  public readonly contributorControllers: SArray<ContributorCtrl>;
  public readonly newEntry = {
    hoursPerWeek: jsonable(S.value(DEFAULT_HOURS_PER_WEEK)),
    id: jsonable(S.value('')),
    name: jsonable(S.value('')),
    numMembers: jsonable(S.value(DEFAULT_NUM_MEMBERS)),
  };
  public readonly newEntryType = S(() => this.newEntry.id() === EXTERNAL_CONTRIBUTOR_VALUE
      ? ContributorKind.EXTERNAL
      : ContributorKind.YOU_TRACK
  );

  constructor(
      public readonly contributors: SDataArray<Contributor>,
      public readonly youTrackUserMap: () => Map<string, User>
  ) {
    this.contributorControllers =
        contributors.map((contributor) => new ContributorCtrl(contributor, contributors, youTrackUserMap));
  }

  public create(): void {
    const id: string = this.newEntry.id();
    const type: ContributorKind = this.newEntryType();
    const sharedProperties = {
      hoursPerWeek: this.newEntry.hoursPerWeek(),
    };
    let plainContributor: Plain<Contributor>;
    switch (type) {
      case ContributorKind.YOU_TRACK:
        plainContributor = {
          type,
          id,
          ...sharedProperties,
        };
        break;
      case ContributorKind.EXTERNAL:
        plainContributor = {
          type,
          name: this.newEntry.name(),
          numMembers: this.newEntry.numMembers(),
          ...sharedProperties,
        };
        this.newEntry.name('');
        this.newEntry.numMembers(DEFAULT_NUM_MEMBERS);
        break;
      default: return unreachableCase(type);
    }
    this.newEntry.id('');
    this.contributors.push(createContributor(plainContributor));
  }

  public reset(): void {
    this.newEntry.id('');
  }

  public withClassIffExternalContributor(addClassIfExternalContributor: boolean, ...classes: string[]):
      (element: HTMLElement) => void {
    const condition: () => boolean =
        S(() => (this.newEntryType() === ContributorKind.EXTERNAL) === addClassIfExternalContributor);
    return withClassIff(condition, ...classes);
  }
}
