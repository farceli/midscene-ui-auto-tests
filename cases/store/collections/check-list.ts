import createLogger from '@/util/logger';
import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { selectMenu, selectTab } from '@/common/store';

const context = 'collections-check-list';

export async function runCollectionsCheckListTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`)
    log.info(`开始执行：${context}`)
    const { agent, device } = await createRuntime(platform, context)
    try {
        log.info('启动 App')
        await launchApp({ platform, device, agent }, { log })

        log.info('验证商品分类')

    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy()
    }
}

// 购买商品全流程
export async function runPurchaseFullProcessTest(platform: 'android' | 'ios') {
    // 定义要购买的商品名称
    const productName = '移动水壶'
    const log = createLogger(`${context}:${platform}`)
    log.info(`开始执行：${context}`)
    const { agent, device } = await createRuntime(platform, context)
    try {
        log.info('启动 App')
        await launchApp({ platform, device, agent }, { log })

        log.debug('进入商店搜索“周边”商品并进入详情页')
        await selectMenu(agent, '商店', log)
        await agent.aiTap('点击上方 Tab 栏右侧的“搜索”按钮')
        await agent.aiWaitFor('页面加载完成')
        await agent.aiAssert(`
            1、页面标题为“搜索”
            2、聚焦“搜索”的输入框并调起输入法
            3、页面存在“推荐商品”模块
            `)
        await agent.aiInput(productName, '“搜索”的输入框')
        await agent.aiAssert(`搜索输入框内展示“${productName}”`)
        await agent.aiTap('点击“输入法”的“搜索”按钮')
        await agent.aiWaitFor(`页面加载完成`)
        await agent.aiAssert(`收起输入法且正确展示“${productName}”商品`)
        await agent.aiTap(`点击“${productName}”商品`)
        await agent.aiWaitFor('页面加载完成')
        await agent.aiAssert(`
            1、页面展示“${productName}”商品信息
            2、页面下方展示“加入购物车”和“立即购买”按钮
            `)

        log.debug('购买商品')
        await agent.aiTap('立即购买按钮')
        await agent.aiWaitFor('页面加载完成，展示颜色和数量选项')
        await agent.aiTap('点击任意颜色选项，点击“确认”按钮')
        await agent.aiWaitFor('页面加载完成')
        await agent.aiAssert(`
            1、页面标题为“订单确认”
            2、
            `)
    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy()
    }
}