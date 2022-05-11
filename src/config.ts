import { ConnectConfig, keyStores } from 'near-api-js';

const keyStore = new keyStores.InMemoryKeyStore();

const config: ConnectConfig = {
  networkId: 'mainnet',
  keyStore, // optional if not signing transactions
  // nodeUrl: "https://rpc.mainnet.near.org",
  nodeUrl: 'https://public-rpc.blockpi.io/http/near',
  walletUrl: 'https://wallet.near.org',
  helperUrl: 'https://helper.near.org',
  // explorerUrl: "https://explorer.near.org",
  headers: {},
};

const APIURL = 'https://api.thegraph.com/subgraphs/name/linear-protocol/linear';

export default config;

export { APIURL };
