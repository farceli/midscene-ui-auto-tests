/**
 * Midscene 运行时初始化模块
 *
 * 职责说明：
 * 1. 根据平台类型创建对应的 Device（Android / iOS）
 * 2. 在 Device 基础上创建 Agent（AI 执行体）
 * 3. 只解决“怎么跑”，不关心任何业务行为
 */

/**
 * TODO:
 * 1. 增加多设备支持或选择逻辑
 * 2. 增加调用时aiActionContext自定义选项,非必填,有则覆盖默认值
 */

// 从 @midscene/android 包中引入：
// - AndroidDevice：表示一个 Android 设备实例
// - getConnectedDevices：获取当前通过 adb 连接的 Android 设备列表
// - AndroidAgent：Android 平台的 AI Agent
import { AndroidDevice, getConnectedDevices, AndroidAgent } from '@midscene/android';

// 从 @midscene/ios 包中引入：
// - IOSDevice：iOS 设备（基于 WebDriverAgent）
// - IOSAgent：iOS 平台的 AI Agent
import { IOSDevice, IOSAgent } from '@midscene/ios';

/**
 * 创建 Midscene 运行时环境
 *
 * @param platform 指定运行平台，只允许 'android' 或 'ios'
 * @returns 一个包含 platform、device、agent 的运行时对象
 */
export async function createRuntime(platform: 'android' | 'ios') {

    // 如果指定的平台是 Android
    if (platform === 'android') {

        // 通过 adb 查询当前已连接的 Android 设备列表
        const devices = await getConnectedDevices();

        // 如果没有任何设备连接，直接抛出错误
        if (!devices.length) {
            throw new Error('未连接安卓设备');
        }

        // 使用第一个已连接设备的 udid 创建 AndroidDevice 实例
        const device = new AndroidDevice(devices[0].udid);

        // 与设备建立连接（底层通常是 adb / transport）
        await device.connect();

        // 基于 device 创建 AndroidAgent
        // Agent 是 AI 行为执行体，所有 aiAct / aiQuery 都由它完成
        const agent = new AndroidAgent(device, {
            cache: { id: "my-cache-id" },
            // AI 行为的“全局上下文”
            // 用于处理权限弹窗、协议弹窗、登录弹窗等通用场景
            // aiActionContext:
                // '如果出现任何许可、协议或登录弹出窗口，请关闭或接受。',
        });

        // 返回统一结构的运行时对象
        // 调用方不需要关心是 Android 还是 iOS
        return { platform, device, agent };
    }

    // -------- 以下是 iOS 平台逻辑 --------

    // 创建 iOS 设备实例
    // wdaPort / wdaHost 是 WebDriverAgent 的连接参数
    const device = new IOSDevice({
        wdaPort: 8100,       // WDA 默认监听端口
        wdaHost: 'localhost',// 一般在本机运行 WDA
    });

    // 与 iOS 设备建立连接
    // 实际上是连接到 WebDriverAgent 服务
    await device.connect();

    // 基于 iOS device 创建 IOSAgent
    const agent = new IOSAgent(device, {
        cache: { id: "my-cache-id" },
        // 与 Android 使用相同的 AI 行为上下文
        // 保证跨平台行为语义一致
        // aiActionContext:
            // '如果出现任何许可、协议或登录弹出窗口，请关闭或接受。',
    });

    // 返回统一格式的运行时对象
    return { platform, device, agent };
}
