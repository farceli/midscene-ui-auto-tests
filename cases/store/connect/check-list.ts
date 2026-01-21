import createLogger from '@/util/logger';
import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { selectMenu } from '@/common/store';
import { selectTab } from '@/common/store';
import { switchOwnerVehicle } from '@/common/profile';
import { selectMenu as selectMenuProfile } from '@/common/profile';

const context = 'connect-check-list';

export async function runConnectCheckListTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`)
    log.info(`开始执行：${context}`)
    const { agent, device } = await createRuntime(platform, context)
    try {
        log.info('启动 App')
        await launchApp({ platform, device, agent }, { log })

        log.info('切换所属车辆')
        await switchOwnerVehicle(agent, log)

        log.info('验证“互联”页面')
        log.debug('使用互联展示的“车辆名称”和“我的-车辆管理”的“车辆名称”进行对比')
        await selectMenuProfile(agent, '我的', log)
        const myVehicleName = await agent.aiQuery('string, 车辆管理的“车辆名称”')
        await selectMenu(agent, '商店', log)
        await selectTab(agent, '互联', log)
        await agent.aiAssert(`互联页面展示的“车辆名称”为“${myVehicleName}”`)
        
        log.debug('滚动验证互联页面是否存在异常+更多跳转+角标展示')
        await agent.aiAct(`向下滚动页面，直到滚动到页面最底部，过程中需要:
            1、检查是否存在异常
            2、在商品列表页判断各大模块右上角是否存在“更多”入口，如果存在则点进去检查跳转是否正确，页面是否存在异常并且返回上一级页面
            3、部分商品可能存在角标，如果存在检查是否展示正确`)

        log.debug('验证商品跳转与商详页')
        await agent.aiAct('随机滚动页面选择商品验证跳转与详情页并放回上一级页面')

        log.info('验证“购物车”跳转')
        await agent.aiTap('购物车按钮')
        await agent.aiWaitFor('页面标题为“购物车”，且页面加载完成')
        await agent.aiAssert('页面无异常')
    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy()
    }

}