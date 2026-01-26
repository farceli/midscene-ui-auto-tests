/**
 * App 启动相关功能。
 * - 从环境变量读取 appId 配置
 * - 启动 App 并等待加载完成
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

/**
 * 获取指定平台的启动配置（未配置 env 则抛错）
 *
 * @param platform 平台类型
 * @returns 包含 appId 的配置对象
 * @throws {Error} 当环境变量未配置时
 */
function getAppLaunchConfig(platform: Platform): { appId: string } {
  return { appId: getRequiredAppIdFromEnv(platform) };
}

type Runtime = {
  platform: Platform;
  device: any;
  agent: any;
};

export async function launchApp(
  runtime: Runtime,
  options?: {
    log?: any;
    launchedAssert?: string;
  },
): Promise<void> {
  const { platform, device, agent } = runtime;
  const log = options?.log;

  log?.debug('检测 App 是否已启动');
  const isAppLaunched = await agent.aiBoolean('当前页面底部导航栏展示：“发现”、“服务”、“车辆”、“商店”和“我的”。');
  if (isAppLaunched) {
    log?.info('App 已经启动');
    return;
  }

  log?.debug('App 未启动，准备启动 App...');
  const { appId } = getAppLaunchConfig(platform);
  await device.launch(appId);


  const waitForPrompt =
    options?.launchedAssert ?? '1、App 底部导航栏展示：“发现”、“服务”、“车辆”、“商店”和“我的”。2、App 右上方展示“客服”和“消息”的 icon。';
  await agent.aiWaitFor?.(waitForPrompt);
  log?.info('App 启动完成');
}
