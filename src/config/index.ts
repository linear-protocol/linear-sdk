import { LiNearSDKConfig, SDK_ENV } from './type';
import mainnetConfig from './mainnet';
import testnetConfig from './testnet';

const config: Record<SDK_ENV, LiNearSDKConfig> = {
  [SDK_ENV.MAINNET]: mainnetConfig,
  [SDK_ENV.TESTNET]: testnetConfig,
};

let CURRENT_CONFIG_ENV = SDK_ENV.MAINNET;
let SDK_CUSTOM_CONFIG: LiNearSDKConfig | null = null;

/**
 * default env is mainnet, but you can change it by calling this function
 * @param env SDKENV.MAINNET or SDKENV.TESTNET
 */
function changeSDKEnvironment(env = SDK_ENV.MAINNET) {
  CURRENT_CONFIG_ENV = env;
}

function getLiNearSDKConfig(): LiNearSDKConfig {
  return SDK_CUSTOM_CONFIG || config[CURRENT_CONFIG_ENV];
}

/**
 * custom configuration for LiNear SDK
 * @param config custom config
 */
function setLiNearSDKConfig(config: LiNearSDKConfig) {
  SDK_CUSTOM_CONFIG = config;
}

/**
 * change subgraph URL
 */
function changeSubgraphApiUrl(apiUrl: string) {
  const config = getLiNearSDKConfig();
  setLiNearSDKConfig({
    ...config,
    apiUrl,
  });
}

export {
  changeSDKEnvironment,
  getLiNearSDKConfig,
  setLiNearSDKConfig,
  changeSubgraphApiUrl,
};
