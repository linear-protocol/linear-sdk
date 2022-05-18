import { ONE_NEAR_IN_YOCTO, SECOND, SECOND_TO_NANOSECOND } from './consts';
import { BigNumber } from 'bignumber.js';
import { LatestPriceFromContract } from './types';
import { getClient, loadContract } from './helper';
import { gql } from 'urql';

async function queryPriceBefore(timestamp: number) {
  const getPriceBeforeTimestamp = gql`
    {
      prices (first: 1, orderBy: timestamp, orderDirection: desc, where: {timestamp_lte: "${timestamp.toString()}"} ){
        price
      }
    }
  `;
  const client = getClient();
  let { data } = await client.query(getPriceBeforeTimestamp).toPromise();
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
  const getLatestPriceQuery = gql`
    {
      prices(first: 1, orderBy: timestamp, orderDirection: desc) {
        id
        timestamp
        price
      }
    }
  `;
  const client = getClient();
  let { data } = await client.query(getLatestPriceQuery).toPromise();
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
