import { SECOND } from './../src/consts';
import { getStakingApy, changeSDKEnvironment, SDK_ENV, setLiNearSDKConfig, getLiNearSDKConfig } from '../src';

jest.setTimeout(20 * SECOND);

describe('apy testing', () => {
  it('stake pool apy & lp apy', async () => {
    async function apyTesting() {
      const stakePoolApy = await getStakingApy();
      expect(Number(stakePoolApy)).toBeLessThan(0.3);
      expect(Number(stakePoolApy)).toBeGreaterThanOrEqual(0);
    }

    changeSDKEnvironment(SDK_ENV.MAINNET);
    await apyTesting();
    changeSDKEnvironment(SDK_ENV.TESTNET);
    await apyTesting();
  });
});
