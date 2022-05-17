import { ONE_NEAR_IN_YOCTO } from './consts';
import { BigNumber } from 'bignumber.js';
import { getClient, loadContract } from './helper';
import { StakeTime } from './types';
import {
  queryLatestPriceFromContract,
  queryLatestPriceFromSubgraph,
  queryPriceBefore,
} from './price';

export async function queryStakeTime(accountid: string): Promise<StakeTime> {
  const getStakeTimeQuery = `
    query {
      users (first: 1, where: {id: "${accountid}"} ){
      id
      firstStakingTime
    }
  }`;
  const client = getClient();
  let data = await client.query(getStakeTimeQuery).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('fail to query price');
  }
  return queryData.users[0];
}

async function getTransferIncome(accountId: string) {
  const getTransferEvent = `
    query {
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
  }`;
  const client = getClient();
  let data = await client.query(getTransferEvent).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('fail to query transfer event');
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

async function getUserIncome(accountId: string, flag: boolean) {
  const getIncomeQuery = `
    query {
      users (first: 1, where: {id: "${accountId}"} ){
        id
        mintedLinear
        stakedNear
        unstakedLinear
        unstakeReceivedNear
        feesPaid
      }
    }`;
  const client = getClient();
  let data = await client.query(getIncomeQuery).toPromise();
  let queryData = data.data.users[0];
  if (queryData == null) {
    throw new Error('fail to query user');
  }
  const latestPrice = await queryLatestPriceFromSubgraph();
  const price1 = new BigNumber(latestPrice.price);
  const mintedLinear = new BigNumber(queryData.mintedLinear);
  const stakedNear = new BigNumber(queryData.stakedNear);
  const unstakedLinear = new BigNumber(queryData.unstakedLinear);
  const unstakedGetNEAR = new BigNumber(queryData.unstakeReceivedNear);
  const fessPaid = new BigNumber(queryData.feesPaid);
  const currentLinear = mintedLinear.minus(unstakedLinear);
  const transferReward = await getTransferIncome(accountId);
  const tfReward = new BigNumber(transferReward);
  const reward = currentLinear
    .times(price1)
    .integerValue()
    .minus(stakedNear)
    .plus(unstakedGetNEAR)
    .plus(tfReward);
  if (flag) {
    const rewardFinal = reward.plus(fessPaid);
    return rewardFinal;
  } else {
    return reward;
  }
}

async function getDeposits(accountId: string) {
  const result = await fetch(
    `https://api.linearprotocol.org/deposits/${accountId}`
  );
  const json = await result.json();
  return json.deposits;
}

async function getStakingReward(accountId: string) {
  const contract = await loadContract();
  const [liNearPrice, account, linearBalance, deposits] = await Promise.all([
    contract.ft_price(),
    contract.get_account({ account_id: accountId }),
    contract.ft_balance_of({ account_id: accountId }),
    getDeposits(accountId),
  ]);

  const near_reward = new BigNumber(linearBalance)
    .minus(deposits.linear)
    .times(liNearPrice)
    .div(10 ** 24)
    .plus(account.unstaked_balance || 0)
    .minus(deposits.near);

  return near_reward;
}

export async function stakingRewardsDiff(accountId: string) {
  const [
    rewards_subgraph_with_fee,
    // rewards_subgraph,
    rewards_indexer,
  ] = await Promise.all([
    getUserIncome(accountId, true),
    // getUserIncome(accountId, false),
    getStakingReward(accountId),
  ]);
  return rewards_subgraph_with_fee
    .minus(rewards_indexer)
    .div(ONE_NEAR_IN_YOCTO)
    .toFixed();
}
