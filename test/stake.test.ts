import { queryStakeTime, stakingRewardsDiff } from '../src';

const SECOND = 1000;
jest.setTimeout(40 * SECOND);

describe('stake', () => {
  it('stake', async () => {
    const accountIds = [
      'cookiemonster.near',
      'retitre.near',
      'calmincome1.near',
      'linguists.near',
    ];
    for (const accountId of accountIds) {
      const { id, firstStakingTime, __typename } = await queryStakeTime(
        accountId
      );
      expect(id).toContain('.near');
      expect(Number(firstStakingTime)).not.toBeNaN();
      expect(__typename).toEqual('User');
      expect(await stakingRewardsDiff(accountId)).not.toBeUndefined();
    }
  });
});
