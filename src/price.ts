import { ONE_NEAR_IN_YOCTO, SECOND, SECOND_TO_NANOSECOND } from './consts';
import { BigNumber } from 'bignumber.js';
import { LatestPriceFromContract } from './types';
import { getClient, loadContract } from './helper';
import { gql } from 'urql';

async function queryPriceBefore(timestamp: number) {
  const getBeforeQuery = gql`
    {
      prices (first: 1, where: {timestamp_gt: "${timestamp.toString()}"} ){
        price
      }
    }
  `;
  const client = getClient();
  let { data } = await client.query(getBeforeQuery).toPromise();
  if (data) {
    return data.prices[0];
  } else {
    throw new Error(`Failed to query price before timestamp ${timestamp}`);
  }
}

async function queryLatestPriceFromContract(): Promise<
  LatestPriceFromContract
> {
  const contract = await loadContract();
  const price = await contract.ft_price();
  return {
    price: Number(new BigNumber(price).dividedBy(ONE_NEAR_IN_YOCTO).toFixed()),
    timestamp: Date.now() * (SECOND_TO_NANOSECOND / SECOND),
  };
}

async function queryLatestPriceFromSubgraph() {
  const getLatestQuery = gql`
    {
      prices(first: 1, orderBy: id, orderDirection: desc) {
        id
        timestamp
        price
      }
    }
  `;
  const client = getClient();
  let { data } = await client.query(getLatestQuery).toPromise();
  if (data) {
    return data.prices[0];
  } else {
    throw new Error('Failed to query latest price');
  }
}

export {
  queryPriceBefore,
  queryLatestPriceFromContract,
  queryLatestPriceFromSubgraph,
};
