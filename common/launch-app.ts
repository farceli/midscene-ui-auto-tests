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
    log?: { info: (...args: any[]) => void };
    launchedAssert?: string;
  },
): Promise<void> {
  const { platform, device, agent } = runtime;
  const log = options?.log;

  log?.info('检测 App 是否已启动');
  const isAppLaunched = await agent.aiBoolean('App 底部导航栏展示：“发现”、“服务”、“车辆”、“商店”和“我的”。');
  if (isAppLaunched) {
    log?.info('App 已启动，直接返回');
    return;
  }

  log?.info('App 未启动，准备启动 App...');
  const { appId } = getAppLaunchConfig(platform);
  await device.launch(appId);


  const assertPrompt =
    options?.launchedAssert ?? '1、App 底部导航栏展示：“发现”、“服务”、“车辆”、“商店”和“我的”。2、App 右上方展示“客服”和“消息”的 icon。';
  await agent.aiAssert?.(assertPrompt);
  log?.info('App 已启动');
}
