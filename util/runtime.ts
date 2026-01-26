/**
 * Midscene 运行时初始化。
 *
 * 作用：根据平台创建 `device` + `agent`，供用例执行 UI 自动化。
 * - Android：通过 adb 获取已连接设备，并连接第一个设备
 * - iOS：通过 WebDriverAgent（WDA）连接到本机 `localhost:8100`
 *
 * 只负责“运行时组装”，不包含任何业务操作。
 */

import { AndroidDevice, getConnectedDevices, AndroidAgent } from '@midscene/android';
import { IOSDevice, IOSAgent } from '@midscene/ios';
import createLogger from '@/util/logger';

/**
 * 创建 Agent 的通用配置
 *
 * @param log 日志记录器实例
 * @returns Agent 配置对象
 */
function createAgentConfig(log: ReturnType<typeof createLogger>) {
  return {
    // cache: { id: 'my-cache-id' },
    autoPrintReportMsg: false,
    onTaskStartTip: (tip: string) => {
      log.debug(tip);
    },
  };
}

/**
 * 创建运行时对象。
 *
 * 根据平台创建 `device` + `agent`，供用例执行 UI 自动化。
 * - Android：通过 adb 获取已连接设备，并连接第一个设备
 * - iOS：通过 WebDriverAgent（WDA）连接到本机 `localhost:8100`
 *
 * @param platform 平台类型，'android' 或 'ios'
 * @param context 上下文标识，用于日志记录，如 'my-test:android'
 * @returns 运行时对象，包含 platform、device 和 agent
 *
 */
export async function createRuntime(platform: 'android' | 'ios', context: string): Promise<{ platform: 'android' | 'ios'; device: any; agent: any }> {

  const log = createLogger(`${context}:${platform}`);

  if (platform === 'android') {
    log.info('开始创建：Android 运行环境');
    const devices = await getConnectedDevices();
    if (!devices.length) {
      log.error('未连接安卓设备');
      throw new Error('未连接安卓设备');
    }
    const device = new AndroidDevice(devices[0].udid);
    log.debug('开始连接：安卓设备：', devices[0].udid);
    await device.connect();
    log.debug('连接完成：安卓设备：', devices[0].udid);

    log.debug('开始创建：Android Agent');
    const agent = new AndroidAgent(device, createAgentConfig(log));
    log.debug('创建完成：Android Agent');
    log.info('创建完成：Android 运行环境');
    return { platform, device, agent };
  }

  log.info('开始创建：iOS 运行环境');
  const device = new IOSDevice({
    wdaPort: 8100,
    wdaHost: 'localhost',
  });
  log.debug('开始连接：iOS 设备');
  await device.connect();
  log.debug('连接完成：iOS 设备');

  log.debug('开始创建：iOS Agent');
  const agent = new IOSAgent(device, createAgentConfig(log));
  log.debug('创建完成：iOS Agent');
  log.info('创建完成：iOS 运行环境');
  return { platform, device, agent };
}
