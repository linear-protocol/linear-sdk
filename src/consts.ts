import { utils } from 'near-api-js';

export const ONE_NEAR_IN_YOCTO = utils.format.parseNearAmount('1')!;

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const YEAR = 365 * DAY;

export const SECOND_TO_NANOSECOND = 1e9; // in contract, 1s = 1e9ns
export const MINUTE_TO_NANOSECOND = 60 * SECOND_TO_NANOSECOND;
export const HOUR_TO_NANOSECOND = 60 * MINUTE_TO_NANOSECOND;
export const DAY_TO_NANOSECOND = 24 * HOUR_TO_NANOSECOND;
export const YEAR_TO_NANOSECOND = 365 * DAY_TO_NANOSECOND;
