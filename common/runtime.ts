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

/**
 * 创建运行时对象。
 *
 * @throws Android 平台在未连接设备时抛错：`未连接安卓设备`
 */
export async function createRuntime(platform: 'android' | 'ios') {
  if (platform === 'android') {
    const devices = await getConnectedDevices();
    if (!devices.length) {
      throw new Error('未连接安卓设备');
    }

    const device = new AndroidDevice(devices[0].udid);
    await device.connect();

    const agent = new AndroidAgent(device, {
      cache: { id: 'my-cache-id' },
    });

    return { platform, device, agent };
  }

  const device = new IOSDevice({
    wdaPort: 8100,
    wdaHost: 'localhost',
  });
  await device.connect();

  const agent = new IOSAgent(device, {
    cache: { id: 'my-cache-id' },
  });

  return { platform, device, agent };
}
