import { SDK_ENV } from './../src/config/type';
import {
  changeSDKEnvironment,
} from '../src';
import {
  getFirstStakingTime,
} from "../src/stake"

const SECOND = 1000;
jest.setTimeout(40 * SECOND);

describe('stake', () => {
  it('stake', async () => {
    const accountIds = ['calmincome1.near', 'linguists.near'];
    const testnetAccountIds = ['111w.testnet', '123x.testnet'];

    changeSDKEnvironment(SDK_ENV.MAINNET);
    for (const accountId of accountIds) {
      const time = await getFirstStakingTime(
        accountId
      );
      expect(Number(time)).not.toBeNaN();
    }
    changeSDKEnvironment(SDK_ENV.TESTNET);
    for (const accountId of testnetAccountIds) {
      const time = await getFirstStakingTime(
        accountId
      );
      expect(Number(time)).not.toBeNaN();
    }
  });
});
