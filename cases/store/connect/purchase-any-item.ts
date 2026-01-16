/**
 * 购买任意商品
 */

import createLogger from '@/util/logger';
import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { switchVehicle } from '@/common/profile';
import { isOwner } from '@/common/store/connect';

const context = 'purchase-any-item';

export async function runPurchaseAnyItemTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`);

    log.info(`开始执行：${context}`);

    log.debug('初始化运行时环境：拿到 AI 执行体 agent 与设备控制器 device');
    const { agent, device } = await createRuntime(platform, context);

    try {
        // 启动 App
        await launchApp({ platform, device, agent }, { log });
        // 选择车辆
        await switchVehicle(agent, 'A200L 时尚型', log);
        // 获取是否车主
        const isOwnerResult = await isOwner(agent, log);
        log.debug('判断是否车主')
        if (!isOwnerResult) {
            log.error('不是车主，不能购买互联商品');
            throw new Error('不是车主，不能购买互联商品');
        }

        log.info('进入随机商品详情页检测异常并创建订单');
        await agent.aiAct('进入任意商品详情页(允许上下滚动页面实现随机)');
        await agent.aiWaitFor('详情页文字和图片加载成功，展示价格和“立即购买”按钮');
        await agent.aiAct('向下滚动页面检查是否存在异常，直到滚动到页面最底部');
        await agent.aiTap('“立即购买”按钮');
        await agent.aiWaitFor('1、页面标题为“订单确认”2、展示商品信息+价格 3、展示“姓名”和“手机号码”输入框')

        log.info('填写信息并下单');
        await agent.aiInput('AutoNameTest', '“姓名”输入框', { mode: 'replace', autoDismissKeyboard: true });
        await agent.aiInput('13100000000', '“手机号码”或“充值账号”输入框', { mode: 'replace' });
        await agent.aiTap('勾选协议');
        const totalAmount = await agent.aiQuery('number, 商品总价');
        await agent.aiTap('购买按钮');
        log.debug('判断是否存在二次确认弹窗')
        const isAgainConfirm = await agent.aiBoolean('当前页面是否存在“再次确认”弹窗');
        log.debug('二次确认弹窗是否存在：', isAgainConfirm);
        if (isAgainConfirm) {
            log.debug('二次确认弹窗存在，点击“确认”按钮');
            await agent.aiTap('确认');
        }

        log.info('不支付去订单列表检查订单');
        await agent.aiWaitFor('页面标题为“支付”，页面展示“支付宝”和“微信支付”支付按钮');
        await agent.aiAssert(`订单总价为 ${totalAmount} 元`);
        const orderNumber = await agent.aiQuery('string, 订单编号');
        await agent.aiTap('返回按钮');
        await agent.aiTap('取消支付弹窗的"是"按钮');
        await agent.aiAssert(`订单列表中存在订单编号为 ${orderNumber} 的订单且订单金额为 ${totalAmount} 元`);

    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy();
    }
}