import { SDataArray } from 's-array';
import S from 's-js';
import { User } from '../../youtrack-rest';
import { Contributor, ContributorKind } from './contributor-model';

export class ContributorCtrl {
  public readonly name: () => string;

  constructor(
      public readonly contributor: Contributor,
      private readonly contributors: SDataArray<Contributor>,
      youTrackUserMap: () => Map<string, User>
  ) {
    if (contributor.type === ContributorKind.YOU_TRACK) {
      this.name = S(() => {
        const userMap: Map<string, User> = youTrackUserMap();
        return userMap.has(contributor.id)
          ? userMap.get(contributor.id)!.fullName
          : `Unknown name (User ID = ${contributor.id})`;
      });
    } else {
      this.name = contributor.name;
    }
  }

  public remove(): void {
    this.contributors.remove(this.contributor);
  }
}
