import { BigNumber } from 'bignumber.js';
import { getClient } from './helper';
import {
  queryLatestPriceFromContract,
  queryLatestPriceFromSubgraph,
  queryPriceBefore,
} from './price';
import gql from 'graphql-tag';

export async function getFirstStakingTime(accountId: string): Promise<string> {
  const getStakeTimeQuery = gql`
    {
      users (first: 1, where: {id: "${accountId}"} ){
        id
        firstStakingTime
      }
    }
  `;
  const client = getClient();
  let { data } = await client.query(getStakeTimeQuery).toPromise();
  if (data == null) {
    throw new Error('Failed to query first staking time');
  }
  const { firstStakingTime } = data.users[0];
  return firstStakingTime;
}

async function getTransferIncome(accountId: string) {
  const getTransferEvent = gql`
    {
      users(first: 1, where:{id:"${accountId}"}) {
        id
        transferedIn {
          amount
          timestamp
        }
        transferedOut {
          amount
          timestamp
        }
      }
    }
  `;
  const client = getClient();
  let data = await client.query(getTransferEvent).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('Failed to query transfer events');
  }
  const latestPrice = await queryLatestPriceFromContract();
  const transferIn = queryData.users[0].transferedIn;
  const transferOut = queryData.users[0].transferedOut;
  let transferInReward = 0;
  let transferOutReward = 0;
  for (let i in transferIn) {
    let tempPrice = await queryPriceBefore(transferIn[i].timestamp);
    let tmpReward =
      transferIn[i].amount * (latestPrice.price - tempPrice.price);
    transferInReward += tmpReward;
  }
  for (let i in transferOut) {
    let tempPrice = await queryPriceBefore(transferOut[i].timestamp);
    let tmpReward =
      transferOut[i].amount * (latestPrice.price - tempPrice.price);
    transferOutReward += tmpReward;
  }
  return transferInReward - transferOutReward;
}

export async function getStakingRewards(
  accountId: string,
  includingFees: boolean = false
): Promise<string> {
  const getIncomeQuery = gql`
    {
      users (first: 1, where: {id: "${accountId}"} ){
        id
        mintedLinear
        stakedNear
        unstakedLinear
        unstakeReceivedNear
        feesPaid
      }
    }
  `;
  const client = getClient();
  let data = await client.query(getIncomeQuery).toPromise();
  let queryData = data.data.users[0];
  if (queryData == null) {
    throw new Error('Failed to query user');
  }

  const linearPrice = new BigNumber(await queryLatestPriceFromSubgraph());
  const mintedLinear = new BigNumber(queryData.mintedLinear);
  const stakedNear = new BigNumber(queryData.stakedNear);
  const unstakedLinear = new BigNumber(queryData.unstakedLinear);
  const unstakeReceivedNEAR = new BigNumber(queryData.unstakeReceivedNear);
  const feesPaid = new BigNumber(queryData.feesPaid);
  const currentLinear = mintedLinear.minus(unstakedLinear);
  const transferReward = new BigNumber(await getTransferIncome(accountId));

  const reward = currentLinear
    .times(linearPrice)
    .integerValue()
    .minus(stakedNear)
    .plus(unstakeReceivedNEAR)
    .plus(transferReward);

  if (includingFees) {
    const rewardFinal = reward.plus(feesPaid);
    return rewardFinal.toFixed();
  } else {
    return reward.toFixed();
  }
}
