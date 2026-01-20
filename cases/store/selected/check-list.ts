/**
 * 精选 CheckList
 */

import createLogger from '@/util/logger'
import { createRuntime } from '@/util/runtime'
import { launchApp } from '@/common/launch-app'
import { selectMenu as selectMenuStore } from '@/common/store'
import { selectTab } from '@/common/store'
import { selectMenu as selectMenuProfile } from '@/common/profile'
import { switchOwnerVehicle } from '@/common/profile'
import { randomScroll } from '@/util/scroll'
import { scrollOnly } from '@/util/scroll'

const context = 'selected-check-list'

/**
 * 在 1～3 范围内随机获取两个不重复的整数
 * 使用 Fisher–Yates 洗牌算法，确保结果不重复
 */
export function randomTwoDistinctNumbers(): [number, number] {
    // 定义可选的数字池（明确范围，避免隐式逻辑）
    const numbers: number[] = [1, 2, 3]

    // Fisher–Yates 洗牌，从数组末尾向前遍历
    for (let i = numbers.length - 1; i > 0; i--) {
        // 生成一个 [0, i] 范围内的随机索引
        const j = Math.floor(Math.random() * (i + 1));

        // 交换 numbers[i] 和 numbers[j]
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]]
    }

    // 取洗牌后的前两个元素，必然不重复
    return [numbers[0], numbers[1]]
}


// 展示：为你推荐+猜你喜欢
export async function runSelectedCheckListTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`)

    log.info(`开始执行：${context}`)

    const { agent, device } = await createRuntime(platform, context)

    try {
        // 启动 App
        await launchApp({ platform, device, agent }, { log })

        // 切换到所属车辆
        await switchOwnerVehicle(agent, log)

        // 进入商店模块
        await selectMenuStore(agent, '商店', log)

        // 进入精选 Tab
        await selectTab(agent, '精选', log)

        /**
         * 1.有数据情况下 正确显示 包括图片 价格 名称
         * 2. 没有数据时 相关模块隐藏
         * 3.当前激活的车型信息显示在 为你推荐 标题旁
         */
        log.debug('检查是否存在“为你推荐”模块')
        const isRecommendedExist = await agent.aiBoolean('当前页面是否存在“为你推荐”模块')
        if (isRecommendedExist) {
            log.debug('“为你推荐”模块存在，检查数据是否正确显示图片、价格和名称')
            await agent.aiAssert('“为你推荐”模块展示商品图片、价格和名称')
            log.debug('获取“车辆管理”当前选中车辆')
            await selectMenuProfile(agent, '我的', log)
            const currentVehicle = await agent.aiQuery('string, "车辆管理"当前选中车辆名称')
            // 进入商店模块
            await selectMenuStore(agent, '商店', log)
            // 进入精选 Tab
            await selectTab(agent, '精选', log)
            log.debug('检查“为你推荐”模块是否显示当前激活的车型信息')
            await agent.aiAssert(`“为你推荐”模块右上角显示车辆名称：“${currentVehicle}”`)
        }
        log.debug('检查是否存在“猜你喜欢”模块')
        const isLikeExist = await agent.aiBoolean('当前页面是否存在“猜你喜欢”模块')
        if (isLikeExist) {
            log.debug('“猜你喜欢”模块存在，检查数据是否正确显示图片、价格和名称')
            await agent.aiAssert('“猜你喜欢”模块展示商品图片、价格和名称')
        }
    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy()
    }
}

// 随机商品跳转详情页
export async function runRandomProductJumpDetailPageTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`)

    log.info(`开始执行：${context}`)

    const { agent, device } = await createRuntime(platform, context)

    try {
        // 启动 App
        await launchApp({ platform, device, agent }, { log })

        // 切换到所属车辆
        await switchOwnerVehicle(agent, log)

        // 进入商店模块
        await selectMenuStore(agent, '商店', log)

        // 进入精选 Tab
        await selectTab(agent, '精选', log)

        /**
         * 判断是否存在为你推荐模块，如果存在，则随机点击商品跳转详情页
         */
        log.debug('检查是否存在“为你推荐”模块')
        const isRecommendedExist = await agent.aiBoolean('当前页面是否存在“为你推荐”模块')
        if (isRecommendedExist) {
            log.info('页面存在“为你推荐”模块，开始验证')
            log.debug('“为你推荐”模块存在，获取商品数量')
            const productCount = await agent.aiQuery('number, "为你推荐"模块中的商品数量')
            log.debug('如果商品数量小于等于 2 点击所有商品，反之随机点击两个商品')
            if (productCount <= 2) {
                log.debug('点击所有商品')
                for (let i = 1; i <= productCount; i++) {
                    const productName = await agent.aiQuery(`string, "为你推荐模块中的商品排在 ${i} 的商品名称`)
                    await agent.aiTap(`为你推荐模块中的商品排在 ${i} 的商品`)
                    await agent.aiWaitFor('商品详情页展示商品信息和购买按钮')
                    await agent.aiAssert(`商品详情页展示商品名称：${productName}`)
                    await agent.aiAssert('详情页不存在异常')
                    await agent.aiTap('返回按钮')
                }
            } else {
                log.debug('随机点击两个商品')
                const [productIndex1, productIndex2] = randomTwoDistinctNumbers()
                await agent.aiTap(`为你推荐模块中的商品排在 ${productIndex1} 的商品`)
                await agent.aiTap(`为你推荐模块中的商品排在 ${productIndex2} 的商品`)
                await agent.aiWaitFor('商品详情页展示商品信息和购买按钮')
                await agent.aiAssert('详情页不存在异常')
                await agent.aiTap('返回按钮')
            }
        }

        log.debug('检查是否存在“猜你喜欢”模块')
        const isLikeExist = await agent.aiBoolean('当前页面是否存在“猜你喜欢”模块')
        if (isLikeExist) {
            log.info('页面存在“猜你喜欢”模块，随机验证 3 个商品')
            for (let i = 1; i <= 3; i++) {
                log.debug(`[${i}]随机滚动页面选择商品验证跳转与详情页`)
                await randomScroll(agent, { direction: 'down', scrollOn: '商品列表', minDistance: 300, maxDistance: 500, maxTimes: 1 })
                await new Promise(resolve => setTimeout(resolve, 1000))
                await agent.aiTap('任意商品')
                await agent.aiWaitFor('商品详情页展示商品信息和购买按钮')
                await agent.aiAssert('详情页不存在异常')
                await agent.aiTap('点击页面左上角“返回”按钮，返回上一级页面')
                await agent.aiWaitFor('展示商品列表页面')
            }
        }
    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy()
    }
}

// 购物车
export async function runShoppingCartTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`)

    log.info(`开始执行：${context}`)

    const { agent, device } = await createRuntime(platform, context)

    try {
        // 启动 App
        await launchApp({ platform, device, agent }, { log })

        // 进入商店模块
        await selectMenuStore(agent, '商店', log)

        // 进入精选 Tab
        await selectTab(agent, '精选', log)

        log.info('进入购物车验证')
        await agent.aiTap('购物车按钮')
        await agent.aiWaitFor('页面标题为“购物车”，且页面加载完成')
        await agent.aiAssert('页面无异常')
    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy()
    }
}   