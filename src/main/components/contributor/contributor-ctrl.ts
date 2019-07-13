import { SDataArray } from 's-array';
import { Contributor } from './contributor-model';

export class ContributorCtrl {
  public constructor(
      private readonly contributor_: Contributor,
      private readonly contributors_: SDataArray<Contributor>
  ) { }

  public remove(): void {
    this.contributors_.remove(this.contributor_);
  }
}
