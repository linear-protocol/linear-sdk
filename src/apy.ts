import { TotalSwapFees } from './types';
import { BigNumber } from 'bignumber.js';
import { getClient, getSummaryFromContract } from './helper';
import { queryLatestPriceFromSubgraph, queryPriceBefore } from './price';

async function getLatestFeesPayed(): Promise<TotalSwapFees> {
  const getLatestQuery = `
    query {
      totalSwapFees (first: 1, orderBy: timestamp, orderDirection: desc){
        id
        timestamp
        feesPaid
      }
    }
  `;
  const client = getClient();
  let data = await client.query(getLatestQuery).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('fail to query latest totalSwapFees');
  }
  return queryData.totalSwapFees[0];
}

async function getTargetTimeFeesPayed(
  timestamp: number
): Promise<TotalSwapFees> {
  const getBeforeFeesPayed = `
    query {
      totalSwapFees (first: 1, where: {timestamp_gt: "${timestamp}"} ){
        id
        feesPaid
        timestamp
     }
  }`;
  const client = getClient();
  let data = await client.query(getBeforeFeesPayed).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('fail to query before totalSwapFees');
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
    Number(tmpFeesPayed.timestamp) - 3 * 24 * 60 * 60 * 1000000000;
  const initFeesPayed = await getTargetTimeFeesPayed(targetTimeForFees);
  const days = 3; // secsCurrent.minus(secsInit).div(24).div(60*60).div(1000000000)
  const feesCurrent = new BigNumber(tmpFeesPayed.feesPaid);
  const feesInit = new BigNumber(initFeesPayed.feesPaid);
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
    Number(latesdPrice.timestamp) - 30 * 24 * 60 * 60 * 1000000000;
  const price30DaysAgo = await queryPriceBefore(targetTime);
  const price1 = new BigNumber(latesdPrice.price);
  const price2 = new BigNumber(price30DaysAgo.price);
  const days = new BigNumber(24 * 60 * 60 * 1000000000 * 30);
  const times1 = new BigNumber(24 * 60 * 60 * 1000000000 * 365);
  const apy = price1
    .minus(price2)
    .div(price2)
    .times(times1)
    .div(days);
  return apy.toFixed();
}
