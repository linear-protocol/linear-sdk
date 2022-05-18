import { ONE_NEAR_IN_YOCTO, DAY_TO_NANOSECOND } from './consts';
import { TotalSwapFees } from './types';
import { BigNumber } from 'bignumber.js';
import { getClient, getSummaryFromContract } from './helper';
import { queryLatestPriceFromSubgraph, queryPriceBefore } from './price';
import gql from 'graphql-tag';

async function getLatestFeesPaid(): Promise<TotalSwapFees> {
  const getLatestQuery = gql`
    {
      totalSwapFees(first: 1, orderBy: timestamp, orderDirection: desc) {
        timestamp
        feesPaid
      }
    }
  `;
  const client = getClient();
  let data = await client.query(getLatestQuery).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('Failed to query latest totalSwapFees');
  }
  return queryData.totalSwapFees[0];
}

async function getTargetTimeFeesPaid(
  timestamp: number
): Promise<TotalSwapFees> {
  const getBeforeFeesPaid = gql`
    {
      totalSwapFees (first: 1, where: {timestamp_gt: "${timestamp}"} ){
        feesPaid
        timestamp
      }
    }
  `;
  const client = getClient();
  let data = await client.query(getBeforeFeesPaid).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error(
      `Failed to query totalSwapFees before timestamp ${timestamp}`
    );
  }
  return queryData.totalSwapFees[0];
}

export async function getLiquidityPoolApy(): Promise<string> {
  let summary = await getSummaryFromContract();
  const linearAmount = new BigNumber(summary.lp_staked_share!);
  const nearAmount = new BigNumber(summary.lp_near_amount!);
  const linearPrice = new BigNumber(summary.ft_price!).div(ONE_NEAR_IN_YOCTO);
  const lpTvl = linearAmount.times(linearPrice).plus(nearAmount);
  const currentTotalFees = await getLatestFeesPaid();
  const threeDaysAgo =
    Number(currentTotalFees.timestamp) - 3 * DAY_TO_NANOSECOND;
  const totalFees3DaysAgo = await getTargetTimeFeesPaid(threeDaysAgo);
  const lpApy = new BigNumber(currentTotalFees.feesPaid)
    .minus(new BigNumber(totalFees3DaysAgo.feesPaid))
    .times(365)
    .div(3)
    .times(linearPrice)
    .div(lpTvl);
  // Liquidity Pool APY
  return lpApy.toFixed();
}

export async function getStakingApy() {
  const latestPrice = await queryLatestPriceFromSubgraph();
  const targetTime = Number(latestPrice.timestamp) - 30 * DAY_TO_NANOSECOND;
  const price30DaysAgo = await queryPriceBefore(targetTime);
  const latestPriceBN = new BigNumber(latestPrice.price);
  const price30DaysAgoBN = new BigNumber(price30DaysAgo.price);
  const apy = latestPriceBN
    .minus(price30DaysAgoBN)
    .div(price30DaysAgoBN)
    .times(365)
    .div(30);
  return apy.toFixed();
}
