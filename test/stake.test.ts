import { SDK_ENV } from './../src/config/type';
import {
  changeSDKEnvironment,
} from '../src';
import {
  getFirstStakingTime,
} from "../src/stake"

const SECOND = 1;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = 365 * DAY;

const SECOND_IN_MILLISECOND = 1000; // 1s = 1000ms
const SECOND_IN_NANO = 1e9; // in contract, 1s = 1e9ns

jest.setTimeout(40 * SECOND_IN_MILLISECOND);

describe('stake', () => {
  it('stake', async () => {
    const accountIds = ['calmincome1.near', 'linguists.near'];
    const testnetAccountIds = ['111w.testnet', '123x.testnet'];
    const diffDateInSecond = new Date("2022-1-1").getTime() / SECOND_IN_MILLISECOND;

    changeSDKEnvironment(SDK_ENV.MAINNET);
    for (const accountId of accountIds) {
      const time = await getFirstStakingTime(
        accountId
      );
      const timeInSecond = Math.floor(Number(time) / SECOND_IN_NANO);
      const yearDiffFrom2022 = Math.abs(timeInSecond - diffDateInSecond) / YEAR;
      expect(yearDiffFrom2022).toBeLessThan(30); // It is valid if timestamp diff from 2022 less than 30 YEARs.
    }
    changeSDKEnvironment(SDK_ENV.TESTNET);
    for (const accountId of testnetAccountIds) {
      const time = await getFirstStakingTime(
        accountId
      );
      const timeInSecond = Math.floor(Number(time) / SECOND_IN_NANO);
      const yearDiffFrom2022 = Math.abs(timeInSecond - diffDateInSecond) / YEAR;
      expect(yearDiffFrom2022).toBeLessThan(30); // It is valid if timestamp diff from 2022 less than 30 YEARs.
    }
  });
});
