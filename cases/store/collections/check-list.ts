import createLogger from '@/util/logger';
import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';

const context = 'collections-check-list';

export async function runCollectionsCheckListTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`)
    log.info(`开始执行：${context}`)
    const { agent, device } = await createRuntime(platform, context)
    try {
        log.info('启动 App')
        await launchApp({ platform, device, agent }, { log })
    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy()
    }
}