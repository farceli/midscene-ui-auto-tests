/**
 * 商店-看车页 Smoke Test
 */

import { createRuntime } from '../../../util/runtime';
import { launchApp } from '../../../common/launch-app';
import { scrollOnly } from '../../../util/scroll';
import createLogger from '../../../util/logger';
import { selectMenu, selectTab } from '../../../common/store';

// 商店-看车页 Smoke Test
export async function runStoreCarPageSmokeTest(platform: 'android' | 'ios') {
    // 初始化日志记录器
    const log = createLogger(`car-page:${platform}`);

    log.info('开始执行商店-看车页测试');

    // 初始化运行时环境：拿到 AI 执行体 agent 与设备控制器 device
    const { agent, device } = await createRuntime(platform);

    try {
        // 启动 App
        await launchApp({ platform, device, agent }, { log });

        // 进入商店模块
        await selectMenu({ agent }, '商店', { log });

        // 进入看车 Tab
        await selectTab({ agent }, '看车', { log });

        const expectedCarModelList = ['轿车', 'SUV', '轿跑&敞篷', 'MPV', '纯电车型', '插电式混合动力', 'AMG', 'MAYBACH', 'G'];
        // const expectedCarModelList = ['轿车'];

        log.info('点击“全部车型”，进入 OneWeb 车型列表页');
        await agent.aiTap('“全部车型”按钮');

        log.info('等待 OneWeb 车型列表页加载完成');
        await agent.aiWaitFor('1、页面标题为“梅赛德斯-奔驰”，2、页面中部区域展示汽车图片');

        log.info('断言 OneWeb 默认已选中“轿车”车型');
        await agent.aiAssert('页面上方有两行 Tab，第一行车型 Tab 当前已选中“轿车”');

        log.info('从 OneWeb 返回上一页（看车页）');
        await agent.aiTap('返回');

        log.info('等待看车页加载完成');
        await agent.aiWaitFor('看车页面展示多种车型');

        log.info('开始逐个车型校验 OneWeb 页面');
        for (const carModel of expectedCarModelList) {
            log.info(`===== 开始校验车型：${carModel} =====`);

            log.debug(`检查当前页面是否存在“${carModel}”`);
            const isCarModelExist = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);
            log.debug(`检查结果：`, isCarModelExist);

            if (!isCarModelExist) {
                log.info(`当前页面不存在“${carModel}”，开始向下滚动查找`);
                await scrollOnly(agent, {
                    direction: 'down',
                    scrollOn: '车型列表页面',
                    stopWhenSee: `车型列表中存在"${carModel}"车型`,
                });

                log.debug(`滚动结束，再次检查“${carModel}”是否存在`);
                const isCarModelExistAfterScroll = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);
                log.debug(`二次检查结果：`, isCarModelExistAfterScroll);

                if (!isCarModelExistAfterScroll) {
                    log.error(`滚动后仍未找到车型：${carModel}`);
                    throw new Error(`滚动后仍未找到车型：${carModel}`);
                }

                log.info(`滚动结束，已找到车型，准备点击`);
            }

            log.info(`点击车型：${carModel}`);
            await agent.aiTap(carModel);

            log.info('等待 OneWeb 车型列表页加载完成');
            await agent.aiWaitFor('1、页面标题为“梅赛德斯-奔驰”，2、页面中部区域展示汽车图片');

            log.info(`断言 OneWeb 已选中车型：${carModel}`);
            await agent.aiAssert(`页面上方有两行 Tab，第一行车型 Tab 当前已选中“${carModel}”`);

            log.info('从 OneWeb 返回上一页（看车页）');
            await agent.aiTap('返回');

            log.info('等待看车页加载完成');
            await agent.aiWaitFor('看车页面展示多种车型');
        }

    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy();
    }
}
