/**
 * App 配置（跨平台）
 *
 * 目标：把用例里的 App 包名（Android PackageName）/ iOS BundleId 从代码中抽离出来，统一由环境变量提供。
 *
 * 使用方式：
 * - 通过 `getAppLaunchConfig(platform)` 获取当前平台的启动参数（目前仅包含 `appId`）
 * - 在 runner / case 中只关心 `platform`，不要在业务代码里硬编码 appId
 *
 * 必填环境变量：
 * - Android: `APP_ID_ANDROID`
 * - iOS: `APP_ID_IOS`
 *
 * 注意事项：
 * - 如果未配置对应环境变量，会直接抛错（便于尽早发现配置问题）
 * - 建议在本地通过 `.env` 管理，在 CI 里通过 secret / env 注入
 */

/** 运行平台类型 */
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

/**
 * 获取指定平台的启动配置。
 *
 * 规则：appId 必须来自环境变量；未配置则抛错。
 */
export function getAppLaunchConfig(platform: Platform): { appId: string } {
  return { appId: getRequiredAppIdFromEnv(platform) };
}

