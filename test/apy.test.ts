import {
  getStakingApy,
  getLiquidityPoolApy,
  changeSDKEnvironment,
  SDK_ENV,
} from '../src';

const SECOND = 1000;
jest.setTimeout(20 * SECOND);

describe('apy testing', () => {
  it('stake pool apy & lp apy', async () => {
    async function apyTesting() {
      const stakePoolApy = await getStakingApy();
      expect(Number(stakePoolApy)).toBeLessThan(0.3);
      expect(Number(stakePoolApy)).toBeGreaterThanOrEqual(0);
      const lpApy = await getLiquidityPoolApy();
      expect(Number(lpApy)).toBeLessThan(0.3);
      expect(Number(lpApy)).toBeGreaterThanOrEqual(0);
      console.log({
        stakePoolApy,
        lpApy
      })
    }

    changeSDKEnvironment(SDK_ENV.MAINNET);
    await apyTesting();
    changeSDKEnvironment(SDK_ENV.TESTNET);
    await apyTesting();
  });
});
