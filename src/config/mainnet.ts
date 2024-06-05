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

const apiUrl =
  'https://gateway-arbitrum.network.thegraph.com/api/37909ceac34946d62194858b55567dfe/subgraphs/id/H5F5XGL2pYCBY89Ycxzafq2RkLfqJvM47X533CwwPNjg';

const contractId = 'linear-protocol.near';

export default {
  connectConfig,
  apiUrl,
  contractId,
};
