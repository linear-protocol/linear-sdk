import { SECOND_TO_NANOSECOND, YEAR, SECOND } from './../src/consts';
import { SDK_ENV } from './../src/config/type';
import {
  changeSDKEnvironment,
} from '../src';
import {
  getFirstStakingTime,
} from "../src/stake"

jest.setTimeout(40 * SECOND);

describe('stake', () => {
  it('stake', async () => {
    const accountIds = ['calmincome1.near', 'linguists.near'];
    const testnetAccountIds = ['111w.testnet', '123x.testnet'];
    const diffDateInSecond = new Date("2022-1-1").getTime() / SECOND;

    changeSDKEnvironment(SDK_ENV.MAINNET);
    for (const accountId of accountIds) {
      const time = await getFirstStakingTime(
        accountId
      );
      const timeInSecond = Math.floor(Number(time) / SECOND_TO_NANOSECOND);
      const yearDiffFrom2022 = Math.abs(timeInSecond - diffDateInSecond) / YEAR;
      expect(yearDiffFrom2022).toBeLessThan(30); // It is valid if timestamp diff from 2022 less than 30 YEARs.
    }
    changeSDKEnvironment(SDK_ENV.TESTNET);
    for (const accountId of testnetAccountIds) {
      const time = await getFirstStakingTime(
        accountId
      );
      const timeInSecond = Math.floor(Number(time) / SECOND_TO_NANOSECOND);
      const yearDiffFrom2022 = Math.abs(timeInSecond - diffDateInSecond) / YEAR;
      expect(yearDiffFrom2022).toBeLessThan(30); // It is valid if timestamp diff from 2022 less than 30 YEARs.
    }
  });
});
