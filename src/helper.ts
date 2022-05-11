import { YOCTONEAR } from './consts';
import config, { APIURL } from './config';
import { BigNumber } from 'bignumber.js';
import * as nearAPI from 'near-api-js';
import { createClient } from 'urql';
import { LiNearContract, LatestPriceFromContract } from './types';

const { connect } = nearAPI;

BigNumber.config({
  DECIMAL_PLACES: 64,
});

const client = createClient({
  url: APIURL,
});

let contract: LiNearContract | null = null;

async function loadContract() {
  const near = await connect(config);
  const account = await near.account('');
  if (!contract) {
    contract = new nearAPI.Contract(
      account, // the account object that is connecting
      'linear-protocol.near',
      {
        // name of contract you're connecting to
        viewMethods: [
          'ft_price',
          'get_summary',
          'ft_balance_of',
          'get_account',
        ], // view methods do not change state but usually return a value
        changeMethods: [], // change methods modify state
        //, // account object to initialize and sign transactions.
      }
    ) as LiNearContract;
  }
  return contract;
}

async function getSummaryFromContract() {
  const contract = await loadContract();
  let response = await contract.get_summary();
  //console.log(response);
  return response;
}

async function queryPriceBefore(timeStamp: number) {
  const getBeforeQuery = `
    query {
      prices (fisrt: 1, where: {timeStamp_gt: "${timeStamp}"} ){
        id
        timeStamp
        price
      }
    }`;
  //console.log(getBeforeQuery)
  let data = await client.query(getBeforeQuery).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    console.log('fail to query price');
    return;
  }
  // console.log("price at %s : %s",timeStamp.toString(),queryData.prices[0].price.toString())
  return queryData.prices[0];
}

async function queryLatestPriceFromContract(): Promise<
  LatestPriceFromContract
> {
  const contract = await loadContract();
  const price = await contract.ft_price();
  return {
    price: Number(new BigNumber(price).dividedBy(YOCTONEAR).toFixed()),
    timeStamp: Date.now() * 1000000,
  };
}

async function queryLatestPriceFromSubgraph() {
  const getLatestQuery = `
    query {
      prices (fisrt: 1, orderBy: id, orderDirection: desc){
        id
        timeStamp
        price
      }
    }
  `;
  let data = await client.query(getLatestQuery).toPromise();
  let queryData = data.data;
  if (queryData == null) {
    throw new Error('fail to query price');
  }
  // console.log("current price: ",queryData.prices[0].price.toString())
  return queryData.prices[0];
}

export {
  client,
  loadContract,
  getSummaryFromContract,
  queryPriceBefore,
  queryLatestPriceFromContract,
  queryLatestPriceFromSubgraph,
};
