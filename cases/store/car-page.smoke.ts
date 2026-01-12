/**
 * 商店-看车页 Smoke Test
 */

import { createRuntime } from '../../common/runtime';
import { getAppLaunchConfig } from '../../common/app-config';
import { scrollOnly } from '../../common/scroll';
import createLogger from '../../common/logger';

// 商店-看车页 Smoke Test
export async function runStoreCarPageSmokeTest(platform: 'android' | 'ios') {
    // 初始化日志记录器
    const log = createLogger(`car-page:${platform}`);
    
    log.info('开始执行商店-看车页测试');
    
    // 初始化运行时环境：拿到 AI 执行体 agent 与设备控制器 device
    const { agent, device } = await createRuntime(platform);

    try {
        log.info('准备启动 App...');
        const { appId } = getAppLaunchConfig(platform);
        await device.launch(appId);
        log.info('App 已启动');

        // log.info('检查底部导航栏状态');
        // const selectedMenu = await agent.aiQuery('string, 屏幕底部导航栏已选中菜单');
        // log.debug('当前选中菜单：', selectedMenu);
        // if (selectedMenu !== '商店') {
        //     log.info('导航栏未选中“商店”，点击“商店”');
        //     await agent.aiTap('导航栏的“商店”模块');
        //     await agent.aiWaitFor('商店页面上方显示"精选"、"看车"、"互联"、"周边"和"养车"五个 Tab');
        // }

        // log.info('检查商店顶部 Tab 状态');
        // const selectedTab = await agent.aiQuery('string, 商店顶部已选中Tab');
        // log.debug('当前选中 Tab：', selectedTab);
        // if (selectedTab !== '看车') {
        //     log.info('商店顶部未选中“看车”，点击“看车”');
        //     await agent.aiTap('商店顶部的“看车”Tab');
        //     await agent.aiWaitFor('看车页面显示多种车型');
        // }

        // const expectedCarModelList = ['轿车', 'SUV', '轿跑&敞篷', 'MPV', '纯电车型', '插电式混合动力', 'AMG', 'MAYBACH', 'G'];
        // // const expectedCarModelList = ['轿车'];

        // log.info('点击“全部车型”，进入 OneWeb 车型列表页');
        // await agent.aiTap('“全部车型”按钮');

        // log.info('等待 OneWeb 车型列表页加载完成');
        // await agent.aiWaitFor('1、页面标题为“梅赛德斯-奔驰”，2、页面中部区域展示汽车图片');

        // log.info('断言 OneWeb 默认已选中“轿车”车型');
        // await agent.aiAssert('页面上方有两行 Tab，第一行车型 Tab 当前已选中“轿车”');

        // log.info('从 OneWeb 返回上一页（看车页）');
        // await agent.aiTap('返回');

        // log.info('等待看车页加载完成');
        // await agent.aiWaitFor('看车页面展示多种车型');

        // log.info('开始逐个车型校验 OneWeb 页面');
        // for (const carModel of expectedCarModelList) {
        //     log.info(`===== 开始校验车型：${carModel} =====`);

        //     log.debug(`检查当前页面是否存在“${carModel}”`);
        //     const isCarModelExist = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);
        //     log.debug(`检查结果：`, isCarModelExist);

        //     if (!isCarModelExist) {
        //         log.info(`当前页面不存在“${carModel}”，开始向下滚动查找`);
        //         await scrollOnly(agent, {
        //             direction: 'down',
        //             scrollOn: '车型列表页面',
        //             stopWhenSee: `车型列表中存在"${carModel}"车型`,
        //         });

        //         log.debug(`滚动结束，再次检查“${carModel}”是否存在`);
        //         const isCarModelExistAfterScroll = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);
        //         log.debug(`二次检查结果：`, isCarModelExistAfterScroll);

        //         if (!isCarModelExistAfterScroll) {
        //             log.error(`滚动后仍未找到车型：${carModel}`);
        //             throw new Error(`滚动后仍未找到车型：${carModel}`);
        //         }

        //         log.info(`滚动结束，已找到车型，准备点击`);
        //     }

        //     log.info(`点击车型：${carModel}`);
        //     await agent.aiTap(carModel);

        //     log.info('等待 OneWeb 车型列表页加载完成');
        //     await agent.aiWaitFor('1、页面标题为“梅赛德斯-奔驰”，2、页面中部区域展示汽车图片');

        //     log.info(`断言 OneWeb 已选中车型：${carModel}`);
        //     await agent.aiAssert(`页面上方有两行 Tab，第一行车型 Tab 当前已选中“${carModel}”`);

        //     log.info('从 OneWeb 返回上一页（看车页）');
        //     await agent.aiTap('返回');

        //     log.info('等待看车页加载完成');
        //     await agent.aiWaitFor('看车页面展示多种车型');
        // }

    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy();
    }
}
