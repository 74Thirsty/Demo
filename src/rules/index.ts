import { RuleFn } from "../types/verdict.js";
import { aaveV3Rules } from "./aaveV3.js";
import { balancerV2Rules } from "./balancerV2.js";
import { uniswapV4Rules } from "./uniswapV4.js";

export const allRules: RuleFn[] = [...aaveV3Rules, ...balancerV2Rules, ...uniswapV4Rules];
