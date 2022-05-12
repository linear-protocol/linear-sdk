import config, { APIURL } from './config';
import { BigNumber } from 'bignumber.js';
import * as nearAPI from 'near-api-js';
import { createClient } from 'urql';
import { LiNearContract } from './types';

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

export { client, loadContract, getSummaryFromContract };
