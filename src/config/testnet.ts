import { ConnectConfig, keyStores } from 'near-api-js';

const keyStore = new keyStores.InMemoryKeyStore();

const connectConfig: ConnectConfig = {
  networkId: 'testnet',
  keyStore: keyStore,
  nodeUrl: 'https://rpc.testnet.near.org',
  walletUrl: 'https://wallet.testnet.near.org',
  helperUrl: 'https://helper.testnet.near.org',
  headers: {},
};

const apiUrl =
  'https://api.thegraph.com/subgraphs/name/linear-protocol/linear-testnet';

const contractId = 'linear-protocol.testnet';

export default {
  connectConfig,
  apiUrl,
  contractId,
};
