import { SArray, SDataArray } from 's-array';
import S from 's-js';
import { Plain } from '../../utils/s';
import { unreachableCase } from '../../utils/typescript';
import { ContributorCtrl } from '../contributor/contributor-ctrl';
import { Contributor, ContributorKind, createContributor } from '../contributor/contributor-model';
import { ContributorEditArea, DEFAULT_NUM_MEMBERS } from './contributors-model';

export const EXTERNAL_CONTRIBUTOR_VALUE = 'youtrack-planning-js/external';

export class ContributorsCtrl {
  public readonly contributorCtrls: SArray<[Contributor, ContributorCtrl]>;

  public readonly newEntryType = S(() => this.contributorEditArea_.id() === EXTERNAL_CONTRIBUTOR_VALUE
      ? ContributorKind.EXTERNAL
      : ContributorKind.YOU_TRACK
  );

  public constructor(
      private readonly contributors_: SDataArray<Contributor>,
      private readonly contributorEditArea_: ContributorEditArea,
      createContributorCtrl: (contributor: Contributor) => ContributorCtrl
  ) {
    this.contributorCtrls = contributors_.map((contributor) => [contributor, createContributorCtrl(contributor)]);
  }

  public create(): void {
    const id: string = this.contributorEditArea_.id();
    const type: ContributorKind = this.newEntryType();
    const sharedProperties = {
      hoursPerWeek: this.contributorEditArea_.hoursPerWeek(),
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
          name: this.contributorEditArea_.name(),
          numMembers: this.contributorEditArea_.numMembers(),
          ...sharedProperties,
        };
        this.contributorEditArea_.name('');
        this.contributorEditArea_.numMembers(DEFAULT_NUM_MEMBERS);
        break;
      default: return unreachableCase(type);
    }
    this.contributorEditArea_.id('');
    this.contributors_.push(createContributor(plainContributor));
  }

  public reset(): void {
    this.contributorEditArea_.id('');
  }
}
