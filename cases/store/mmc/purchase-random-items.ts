import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { selectMenu } from '@/common/navigation';
import { selectStoreTab } from '@/common/store';
import { randomScroll } from '@/util/scroll';
import createLogger from '@/util/logger';

const context = 'purchase-random-items';

export async function runPurchaseRandomItemsTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`);
    log.info('开始执行：购买随机商品测试');

    const { agent, device } = await createRuntime(platform, context);
    // await launchApp({ platform, device, agent }, { log });
    // await selectMenu(agent, '商店', log);
    // await selectStoreTab(agent, '周边', log);
    await randomScroll(agent, {
        direction: 'down',
        scrollOn: '商品列表',
        minTimes: 3,
        maxTimes: 8,
        minDistance: 300,
        maxDistance: 700,
    });
}