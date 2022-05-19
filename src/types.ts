import { Contract } from 'near-api-js';

export interface Account {
  liquidity_pool_share?: string;
  liquidity_pool_share_value?: string;
  liquidity_pool_share_ratio_in_basis_points?: number;
  can_withdraw?: boolean;
  account_id?: string;
  staked_balance?: string;
  unstaked_balance?: string;
  unstaked_available_epoch_height?: number;
}

export interface Summary {
  total_share_amount?: string;
  total_staked_near_amount?: string;
  ft_price?: string;
  lp_near_amount?: string;
  lp_target_amount?: string;
  lp_staked_share?: string;
  lp_swap_fee_basis_points?: number;
  validators_num?: number;
}

export interface LiquidityPoolConfig {
  expected_near_amount: string;
  max_fee_bps: number;
  min_fee_bps: number;
  treasury_fee_bps: number;
}

export interface LiNearContract extends Contract {
  get_account: (args: { account_id: string }) => Promise<Account>;
  get_account_details: (args: { account_id: string }) => Promise<Account>;
  get_account_staked_balance: (args: { account_id: string }) => Promise<string>;
  get_account_unstaked_balance: (args: {
    account_id: string;
  }) => Promise<string>;
  get_account_total_balance: (args: { account_id: string }) => Promise<string>;
  ft_price: () => Promise<string>; // linear price
  ft_balance_of: (args: { account_id: string }) => Promise<string>;
  get_summary: () => Promise<Summary>;
  get_liquidity_pool_config: () => Promise<LiquidityPoolConfig>;
}

export interface TotalSwapFees {
  timestamp: number;
  feesPaid: string;
}

export interface LatestPriceFromContract {
  price: number;
  timestamp: number;
}

export interface StakeTime {
  firstStakingTime: string;
}
