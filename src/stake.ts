import { BigNumber } from 'bignumber.js';
import { getClient } from './helper';
import { queryLatestPriceFromSubgraph } from './price';
import { gql } from 'urql';

export async function getFirstStakingTime(accountId: string): Promise<string> {
  const getStakeTimeQuery = gql`
    {
      users (first: 1, where: {id: "${accountId}"} ){
        firstStakingTime
      }
    }
  `;
  const client = getClient();
  let { data } = await client.query(getStakeTimeQuery).toPromise();
  if (data) {
    const { firstStakingTime } = data.users[0];
    return firstStakingTime;
  } else {
    throw new Error('Failed to query first staking time');
  }
}

async function getTransferIncome(accountId: string) {
  const getTransferEvent = gql`
    {
      users(first: 1, where:{id:"${accountId}"}) {
        transferedInShares
        transferedInValue
        transferedOutShares
        transferedOutValue
      }
    }
  `;
  const client = getClient();
  let { data } = await client.query(getTransferEvent).toPromise();
  if (!data) {
    throw new Error('Failed to query transfer events');
  }

  const latestPrice = await queryLatestPriceFromSubgraph();
  const transferInShares = data.users[0].transferedInShares;
  const tranfserInValue = data.users[0].transferedInValue;
  const transferOutShares = data.users[0].transferedOutShares;
  const tranfserOutValue = data.users[0].transferedOutValue;
  //console.log(transferInShares,tranfserInValue)
  let transferInReward = latestPrice.price * transferInShares - tranfserInValue;
  let transferOutReward =
    latestPrice.price * transferOutShares - tranfserOutValue;
  return transferInReward - transferOutReward;
}

export async function getStakingRewards(
  accountId: string,
  includingFees: boolean = false
): Promise<string> {
  const getIncomeQuery = gql`
    {
      users (first: 1, where: {id: "${accountId}"} ){
        mintedLinear
        stakedNear
        unstakedLinear
        unstakeReceivedNear
        feesPaid
      }
    }
  `;
  const client = getClient();
  let { data } = await client.query(getIncomeQuery).toPromise();
  if (!data) {
    throw new Error('Failed to query user');
  }
  let user = data.data.users[0];

  const linearPrice = new BigNumber(await queryLatestPriceFromSubgraph());
  const mintedLinear = new BigNumber(user.mintedLinear);
  const stakedNear = new BigNumber(user.stakedNear);
  const unstakedLinear = new BigNumber(user.unstakedLinear);
  const unstakeReceivedNEAR = new BigNumber(user.unstakeReceivedNear);
  const feesPaid = new BigNumber(user.feesPaid);
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
