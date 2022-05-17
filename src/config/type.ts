import { ConnectConfig } from 'near-api-js';

export enum SDK_ENV {
  MAINNET = 'mainnet',
  TESTNET = 'testnet',
}

export interface LiNearSDKConfig {
  connectConfig: ConnectConfig;
  apiUrl: string;
  contractId: string;
}
