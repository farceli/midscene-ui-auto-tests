/**
 * App 配置（跨平台）
 *
 * 目标：把用例里的 App 包名 / iOS BundleId 从代码中抽离出来，统一在配置里管理。
 */

export type Platform = 'android' | 'ios';

export interface AppLaunchConfig {
  /** Android: packageName；iOS: bundleId */
  appId: string;
}

export const APP_LAUNCH_CONFIG: Record<Platform, AppLaunchConfig> = {
  android: {
    // Mercedes me (CN) Android 包名
    appId: 'com.daimler.ris.mercedesme.cn.android',
  },
  ios: {
    // TODO: 替换为真实的 iOS Bundle Identifier
    appId: 'com.daimler.ris.mercedesme.cn.ios',
  },
};

export function getAppLaunchConfig(platform: Platform): AppLaunchConfig {
  return APP_LAUNCH_CONFIG[platform];
}

