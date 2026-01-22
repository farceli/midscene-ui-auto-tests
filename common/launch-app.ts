import type { Platform } from '@/util/app-config';
import { getAppLaunchConfig } from '@/util/app-config';

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
