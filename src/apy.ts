import { LpApies } from './types';
import { BigNumber } from 'bignumber.js';
import {
  client,
  getSummaryFromContract,
  queryLatestPriceFromSubgraph,
  queryPriceBefore,
} from './helper';

async function getLatestFeesPayed(): Promise<LpApies> {
  const getLatestQuery = `
    query {
      totalSwapFees (first: 1, orderBy: timeStamp, orderDirection: desc){
        id
        timeStamp
        feesPayed
      }
    }
  `;
  let data = await client.query(getLatestQuery).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('fail to query latest lpApies');
  }
  return queryData.totalSwapFees[0];
}

async function getTargetTimeFeesPayed(timeStamp: number) {
  const getBeforeFeesPayed = `
    query {
      totalSwapFees (first: 1, where: {timeStamp_gt: "${timeStamp}"} ){
        id
        feesPayed
        timeStamp
     }
  }`;
  let data = await client.query(getBeforeFeesPayed).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('fail to query before lpApies');
  }
  return queryData.totalSwapFees[0];
}

export async function calcLpApy(): Promise<string> {
  let response = await getSummaryFromContract();
  const tmpLinearShares = new BigNumber(response.lp_staked_share!);
  const tmpNEARShares = new BigNumber(response.lp_near_amount!);
  const tmpPrice = new BigNumber(response.ft_price!).div(
    1000000000000000000000000
  );
  const tmpLpTVL = tmpLinearShares.times(tmpPrice).plus(tmpNEARShares);
  const tmpFeesPayed = await getLatestFeesPayed();
  const targetTimeForFees =
    Number(tmpFeesPayed.timeStamp) - 3 * 24 * 60 * 60 * 1000000000;
  const initFeesPayed = await getTargetTimeFeesPayed(targetTimeForFees);
  const days = 3; // secsCurrent.minus(secsInit).div(24).div(60*60).div(1000000000)
  const feesCurrent = new BigNumber(tmpFeesPayed.feesPayed);
  const feesInit = new BigNumber(initFeesPayed.feesPayed);
  const lpApy = feesCurrent
    .minus(feesInit)
    .div(days)
    .times(365)
    .times(tmpPrice)
    .div(tmpLpTVL);
  // Liquidity Pool APY
  return lpApy.toFixed();
}

export async function calcStakePoolApy() {
  const latesdPrice = await queryLatestPriceFromSubgraph();
  const targetTime =
    Number(latesdPrice.timeStamp) - 30 * 24 * 60 * 60 * 1000000000;
  const price30DaysAgo = await queryPriceBefore(targetTime);
  const price1 = new BigNumber(latesdPrice.price);
  const price2 = new BigNumber(price30DaysAgo.price);
  const timeGap = new BigNumber(
    Number(latesdPrice.timeStamp - price30DaysAgo.timeStamp)
  );
  const times1 = new BigNumber(24 * 60 * 60 * 1000000000 * 365);
  const apy = price1
    .minus(price2)
    .times(times1)
    .div(timeGap);
  // Staking APY
  return apy.toFixed();
}
