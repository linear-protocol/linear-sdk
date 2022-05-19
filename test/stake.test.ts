import { SECOND } from './../src/consts';
import { SDK_ENV } from './../src/config/type';
import { changeSDKEnvironment } from '../src';
import { getFirstStakingTime, getStakingRewards } from '../src/stake';

jest.setTimeout(40 * SECOND);

describe('stake', () => {
  it('stake', async () => {
    const accountInfos = [
      {
        accountId: 'calmincome1.near',
        expectTime: '1651719651326726843',
        expectedRewards: 0.00035182,
      },
      {
        accountId: 'linguists.near',
        expectTime: '1648137226877012106',
        expectedRewards: 0.07997933,
      },
    ];
    const testnetAccountInfos = [
      {
        accountId: '111w.testnet',
        expectTime: '1652088792429745417',
        expectedRewards: 0.04321108,
      },
      {
        accountId: '123x.testnet',
        expectTime: '1652088807317086867',
        expectedRewards: 0.05567456
      },
    ];

    changeSDKEnvironment(SDK_ENV.MAINNET);
    for (const accountInfo of accountInfos) {
      const firstStakingTime = await getFirstStakingTime(accountInfo.accountId);
      expect(firstStakingTime).toEqual(accountInfo.expectTime);
      const rewards = await getStakingRewards(accountInfo.accountId);
      expect(Number(rewards)).toBeGreaterThanOrEqual(accountInfo.expectedRewards * 10 ** 24);
    }
    changeSDKEnvironment(SDK_ENV.TESTNET);
    for (const accountInfo of testnetAccountInfos) {
      const firstStakingTime = await getFirstStakingTime(accountInfo.accountId);
      expect(firstStakingTime).toEqual(accountInfo.expectTime);
      const rewards = await getStakingRewards(accountInfo.accountId);
      expect(Number(rewards)).toBeGreaterThanOrEqual(accountInfo.expectedRewards * 10 ** 24);
    }
  });
});
