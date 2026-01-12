/**
 * App 启动配置：从环境变量读取 appId。
 * - Android: `APP_ID_ANDROID`
 * - iOS: `APP_ID_IOS`
 * 未配置则抛错。
 */

export type Platform = 'android' | 'ios';

const getEnvKeyByPlatform = (platform: Platform) =>
  platform === 'android' ? 'APP_ID_ANDROID' : 'APP_ID_IOS';

const getRequiredAppIdFromEnv = (platform: Platform): string => {
  const envKey = getEnvKeyByPlatform(platform);
  const value = process.env[envKey];
  const appId = value?.trim();
  if (!appId) {
    throw new Error(`缺少环境变量 ${envKey}：请在 .env 或运行环境中配置对应平台的 appId`);
  }
  return appId;
};

/** 获取指定平台的启动配置（未配置 env 则抛错） */
export function getAppLaunchConfig(platform: Platform): { appId: string } {
  return { appId: getRequiredAppIdFromEnv(platform) };
}

