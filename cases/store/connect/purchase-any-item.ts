/**
 * 购买任意商品
 */

import createLogger from '@/util/logger';
import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { switchVehicle } from '@/common/profile';
import { isOwner } from '@/common/store/connect';
import { selectMenu, selectTab } from '@/common/store';


export async function runPurchaseAnyItemTest(platform: 'android' | 'ios') {
    // 初始化日志记录器
    const log = createLogger(`purchase-any-item:${platform}`);

    log.info('开始执行购买任何商品测试');

    // 初始化运行时环境：拿到 AI 执行体 agent 与设备控制器 device
    const { agent, device } = await createRuntime(platform);

    try {
        // // 启动 App
        // await launchApp({ platform, device, agent }, { log });
        // // 选择 A200L 时尚型车辆
        // await switchVehicle(agent, 'A200L 时尚型', log);
        // // 检测是否车主
        // const isOwnerResult = await isOwner(agent, log);
        // // 如果不是车主，抛错
        // if (!isOwnerResult) {
        //     log.error('不是车主，不能购买互联商品');
        //     throw new Error('不是车主，不能购买互联商品');
        // }
        // log.info('进入任意商品详情页');
        // await agent.aiAct('进入任意商品详情页(允许上下滚动页面实现随机)');
        // await agent.aiWaitFor('详情页文字和图片加载成功，展示价格和“立即购买”按钮');

        // log.info('检查详情页是有存在异常');
        // await agent.aiAct('向下滚动页面检查是否存在异常，直到滚动到页面最底部');

        // log.info('立即购买');
        // await agent.aiTap('“立即购买”按钮');
        // await agent.aiWaitFor('1、页面标题为“订单确认”2、展示商品信息+价格 3、展示“姓名”和“手机号码”输入框')

        log.info('填写信息并下单');
        await agent.aiInput('AutoNameTest', '“姓名”输入框', { mode: 'replace', autoDismissKeyboard: true });
        await agent.aiInput('13100000000', '“手机号码”或“充值账号”输入框', { mode: 'replace' });
        await agent.aiTap('勾选协议');
        const totalAmount = await agent.aiQuery('number, 商品总价');
        await agent.aiTap('购买按钮');
        await agent.aiWaitFor('页面标题为“支付”，页面展示“支付宝”和“微信支付”支付按钮');
        await agent.aiAssert(`订单总价为 ${totalAmount} 元`);
        const orderNumber = await agent.aiQuery('string, 订单编号');
        await agent.aiTap('返回按钮');
        await agent.aiTap('取消支付弹窗的"是"按钮');

        log.info('在订单列表中检查是否存在订单');
        await agent.aiAssert(`订单列表中存在订单编号为 ${orderNumber} 的订单且订单金额为 ${totalAmount} 元`);

    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy();
    }
}