import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { selectMenu } from '@/common/navigation';
import { selectStoreTab } from '@/common/store';
import { randomScroll, scrollUntilVisible } from '@/util/scroll';
import createLogger from '@/util/logger';

const context = 'purchase-random-items';

export async function runPurchaseRandomItemsTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`);
    log.info('开始执行：购买随机商品测试');

    const { agent, device } = await createRuntime(platform, context);
    // await launchApp({ platform, device, agent }, { log });
    // await selectMenu(agent, '商店', log);
    // await selectStoreTab(agent, '周边', log);

    // log.info('随机滚动页面选择商品进入详情页')
    // await randomScroll(agent, {
    //     direction: 'down',
    //     scrollOn: '商品列表',
    //     minTimes: 3,
    //     maxTimes: 8,
    //     minDistance: 300,
    //     maxDistance: 700,
    // });
    // await agent.aiTap('点击任意商品')
    // const firstItemNameInList = await agent.aiQuery('string, 第一个商品名称')
    // await agent.aiTap(`"${firstItemNameInList}"商品`)
    // await agent.aiWaitFor(`
    //     1、页面加载完成
    //     2、页面标题为"商品详情"
    //     3、页面下方展示“加入购物车”和“立即购买”按钮
    //     `)
    // await agent.aiAssert(`商品标题为"${firstItemNameInList}"或包含"${firstItemNameInList}"`)

    await scrollUntilVisible(agent, {
        direction: 'down',
        distance: null,
        stopWhenSee: '发货须知 Delivery Notes',
        assertAfterEachScroll: '页面无异常',
    });
}