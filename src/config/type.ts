import { ConnectConfig } from 'near-api-js';

export enum SDK_ENV {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

export interface Config {
  connectConfig: ConnectConfig;
  apiUrl: string;
  contractId: string;
}
