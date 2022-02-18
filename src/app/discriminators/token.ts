/**
 * @file App discriminators token 有效性判定器
 * @module app/discriminators/token
 * @author Surmon <https://github.com/surmon-china>
 */

import { TOKEN } from '@app/constants/auth';

// 检查 token 的存在和有效性
export const checkTokenIsOk = (): boolean => {
  const token: string = localStorage.getItem(TOKEN);
  const tokenIsOk = token && token.split('.').length === 3;
  return tokenIsOk;
};
