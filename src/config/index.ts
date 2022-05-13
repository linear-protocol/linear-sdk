import { Config, SDK_ENV } from './type';
import mainnetConfig from './mainnet';
import testnetConfig from './testnet';

const config: Record<SDK_ENV, Config> = {
  [SDK_ENV.MAINNET]: mainnetConfig,
  [SDK_ENV.TESTNET]: testnetConfig,
};

let CURRENT_CONFIG_ENV = SDK_ENV.MAINNET;

/**
 * default env is mainnet, but you can change it by calling this function
 * @param env SDKENV.MAINNET or SDKENV.TESTNET
 */
function changeSDKEnvironment(env = SDK_ENV.MAINNET) {
  CURRENT_CONFIG_ENV = env;
}

function getConfig() {
  return config[CURRENT_CONFIG_ENV];
}

export { changeSDKEnvironment, getConfig };
