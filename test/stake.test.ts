import { SDK_ENV } from './../src/config/type';
import {
  changeSDKEnvironment,
  queryStakeTime,
  stakingRewardsDiff,
} from '../src';

const SECOND = 1000;
jest.setTimeout(40 * SECOND);

describe('stake', () => {
  it('stake', async () => {
    const accountIds = ['calmincome1.near', 'linguists.near'];
    const testnetAccountIds = ['111w.testnet', '123x.testnet'];

    changeSDKEnvironment(SDK_ENV.MAINNET);
    for (const accountId of accountIds) {
      const { id, firstStakingTime, __typename } = await queryStakeTime(
        accountId
      );
      expect(id).toContain('.near');
      expect(Number(firstStakingTime)).not.toBeNaN();
      expect(__typename).toEqual('User');
      expect(await stakingRewardsDiff(accountId)).not.toBeUndefined();
    }
    changeSDKEnvironment(SDK_ENV.TESTNET);
    for (const accountId of testnetAccountIds) {
      const { id, firstStakingTime, __typename } = await queryStakeTime(
        accountId
      );
      expect(id).toContain('.testnet');
      expect(Number(firstStakingTime)).not.toBeNaN();
      expect(__typename).toEqual('User');
      expect(await stakingRewardsDiff(accountId)).not.toBeUndefined();
    }
  });
});
