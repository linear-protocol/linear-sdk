import { calcStakePoolApy, calcLpApy } from '../src';

const SECOND = 1000;
jest.setTimeout(10 * SECOND);

describe('apy testing', () => {
  it('stake pool apy & lp apy', async () => {
    const stakePoolApy = await calcStakePoolApy();
    expect(Number(stakePoolApy)).toBeLessThan(0.3);
    expect(Number(stakePoolApy)).toBeGreaterThan(0);
    const lpApy = await calcLpApy();
    expect(Number(lpApy)).toBeLessThan(0.3);
    expect(Number(lpApy)).toBeGreaterThan(0);
  });
});
