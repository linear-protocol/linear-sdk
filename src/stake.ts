import { YOCTONEAR } from './consts';
import { BigNumber } from 'bignumber.js';
import { client, loadContract } from './helper';
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
  // console.log(getStakeTimeQuery)
  let data = await client.query(getStakeTimeQuery).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('fail to query price');
  }
  // const timestampInt = Number(queryData.users[0].firstStakingTime.toString())
  // const unixTimestamp = timestampInt / 1000000
  // const date = new Date(unixTimestamp)
  // console.log("user first stake time: ", date)
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
  // console.log(getIncomeQuery)
  let data = await client.query(getIncomeQuery).toPromise();
  //console.log(data)
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
    // console.log(
    //   'rewards [subgraph with fee] =\t\t %s NEAR',
    //   rewardFinal.div(YOCTONEAR).toFixed(8)
    // );
    return rewardFinal;
  } else {
    // console.log(
    //   'rewards [subgraph without fee] =\t %s NEAR',
    //   reward.div(YOCTONEAR).toFixed(8)
    // );
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

  // console.log(
  //   'rewards [indexer] =\t\t\t %s NEAR',
  //   near_reward.div(10 ** 24).toFixed(8)
  // );
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
  // console.log("diff [subgraph - indexer] =\t\t %s NEAR", rewards_subgraph.minus(rewards_indexer).div(10 ** 24).toFixed(8));
  // console.log(
  //   'diff [subgraph with fee - indexer] =\t %s NEAR',
  // );
  return rewards_subgraph_with_fee
    .minus(rewards_indexer)
    .div(YOCTONEAR)
    .toFixed();
}
