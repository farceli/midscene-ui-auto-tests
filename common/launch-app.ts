/**
 * App 启动相关功能。
 * - 从环境变量读取 appId 配置
 * - 启动 App 并等待加载完成
 */

import type { Platform } from '@/util/runtime';
import type createLogger from '@/util/logger';

/** 默认的 App 已启动检测断言 */
const DEFAULT_APP_LAUNCHED_CHECK = '当前页面底部导航栏展示："发现"、"服务"、"车辆"、"商店"和"我的"。';

/** 自定义错误：App 启动配置缺失 */
export class AppLaunchConfigError extends Error {
  constructor(platform: Platform, envKey: string) {
    super(`缺少环境变量 ${envKey}：请在 .env 或运行环境中配置对应平台的 appId`);
    this.name = 'AppLaunchConfigError';
  }
}

const getEnvKeyByPlatform = (platform: Platform) =>
  platform === 'android' ? 'APP_ID_ANDROID' : 'APP_ID_IOS';

const getRequiredAppIdFromEnv = (platform: Platform): string => {
  const envKey = getEnvKeyByPlatform(platform);
  const value = process.env[envKey];
  const appId = value?.trim();
  if (!appId) {
    throw new AppLaunchConfigError(platform, envKey);
  }
  return appId;
};

/**
 * 获取指定平台的启动配置（未配置 env 则抛错）
 *
 * @param platform 平台类型
 * @returns 包含 appId 的配置对象
 * @throws {AppLaunchConfigError} 当环境变量未配置时
 */
function getAppLaunchConfig(platform: Platform): { appId: string } {
  return { appId: getRequiredAppIdFromEnv(platform) };
}

/** 运行时对象类型 */
export interface Runtime {
  platform: Platform;
  device: any;
  agent: any;
}

/** 启动 App 的选项 */
export interface LaunchAppOptions {
  /** 日志记录器实例（必传） */
  log: ReturnType<typeof createLogger>;
  /** 自定义的启动完成断言，默认使用内置断言 */
  appLaunchedCheck?: string;
}

/**
 * 启动 App 并等待加载完成。
 *
 * 如果 App 已经启动，则直接返回；否则启动 App 并等待指定的断言条件满足。
 *
 * @param runtime 运行时对象，包含 platform、device 和 agent
 * @param options 启动选项
 * @throws {AppLaunchConfigError} 当环境变量未配置时
 * @throws {Error} 当 App 启动失败或等待超时时
 */
export async function launchApp(
  runtime: Runtime,
  options: LaunchAppOptions,
): Promise<void> {
  const { platform, device, agent } = runtime;
  const { log, appLaunchedCheck } = options;

  log.debug('检测 App 是否已启动');
  const isAppLaunched = await agent.aiBoolean(appLaunchedCheck ?? DEFAULT_APP_LAUNCHED_CHECK);
  if (isAppLaunched) {
    log.info('App 已经启动');
    return;
  }

  log.debug('App 未启动，准备启动 App...');
  const { appId } = getAppLaunchConfig(platform);
  await device.launch(appId);

  const waitForPrompt = appLaunchedCheck ?? DEFAULT_APP_LAUNCHED_CHECK;
  await agent.aiWaitFor(waitForPrompt);
  log.info('App 启动完成');
}
