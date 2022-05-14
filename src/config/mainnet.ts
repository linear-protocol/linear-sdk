import { ConnectConfig, keyStores } from 'near-api-js';

const keyStore = new keyStores.InMemoryKeyStore();

const connectConfig: ConnectConfig = {
  networkId: 'mainnet',
  keyStore,
  nodeUrl: 'https://rpc.mainnet.near.org',
  walletUrl: 'https://wallet.near.org',
  helperUrl: 'https://helper.near.org',
  headers: {},
};

const apiUrl = 'https://api.thegraph.com/subgraphs/name/linear-protocol/linear';

const contractId = 'linear-protocol.near';

export default {
  connectConfig,
  apiUrl,
  contractId,
};
