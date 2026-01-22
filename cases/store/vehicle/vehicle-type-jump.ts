/**
 * 车型跳转测试
 */

import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { scrollOnly } from '@/util/scroll';
import createLogger from '@/util/logger';
import { selectMenu, selectTab } from '@/common/store';
import { switchVehicle } from '@/common/profile';

const context = 'vehicle-type-jump';

// 车型跳转测试
export async function runStoreVehicleTypeJumpTest(platform: 'android' | 'ios') {
    // 初始化日志记录器
    const log = createLogger(`${context}:${platform}`);

    log.info('开始执行：车型跳转测试');

    // 初始化运行时环境：拿到 AI 执行体 agent 与设备控制器 device
    const { agent, device } = await createRuntime(platform, context);

    try {
        // 启动 App
        await launchApp({ platform, device, agent }, { log });

        // 切换车辆
        await switchVehicle(agent, 'A180L运动轿车', log);

        // 进入商店模块
        await selectMenu(agent, '商店', log);

        // 进入看车 Tab
        await selectTab(agent, '看车', log);

        // 预期车型列表
        // const expectedCarModelList = ['轿车', 'SUV', '轿跑&敞篷', 'MPV', '纯电车型', '插电式混合动力', 'AMG', 'MAYBACH', 'G'];
        const expectedCarModelList = ['轿车', 'SUV', '轿跑&敞篷', 'MPV', '纯电车型'];
        // const expectedCarModelList = ['轿车'];

        log.info('验证“全部车型”跳转功能');
        await agent.aiTap('“全部车型”按钮');
        await agent.aiWaitFor('1、页面标题为“梅赛德斯-奔驰”，2、页面中部区域展示汽车图片');
        await agent.aiAssert('页面上方有两行 Tab，第一行车型 Tab 当前已选中“轿车”');
        await agent.aiTap('返回');
        await agent.aiWaitFor('看车页面展示多种车型');

        log.info('逐个验证车型跳转功能');
        for (const carModel of expectedCarModelList) {
            log.info(`验证车型：${carModel} 跳转功能`);
            const isCarModelExist = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);
            if (!isCarModelExist) {
                log.debug(`当前页面不存在“${carModel}”，开始向下滚动查找`);
                await scrollOnly(agent, {
                    direction: 'down',
                    scrollOn: '车型列表页面',
                    stopWhenSee: `车型列表中存在"${carModel}"车型`,
                });

                log.debug(`滚动结束，再次检查“${carModel}”是否存在`);
                const isCarModelExistAfterScroll = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);

                if (!isCarModelExistAfterScroll) {
                    log.error(`滚动后仍未找到车型：${carModel}`);
                    throw new Error(`滚动后仍未找到车型：${carModel}`);
                }

                log.debug(`滚动结束，已找到车型，准备点击`);
            }

            log.info(`点击车型：${carModel}并验证跳转功能`);
            await agent.aiTap(carModel);
            await agent.aiWaitFor('1、页面标题为“梅赛德斯-奔驰”，2、页面中部区域展示汽车图片');
            await agent.aiAssert(`页面上方有两行 Tab，第一行车型 Tab 当前已选中“${carModel}”`);

            // log.info('验证“预约品鉴”跳转')
            // await agent.aiTap('"预约品鉴"按钮')
            // await agent.aiWaitFor('页面标题为“预约品鉴”，且页面加载完成')
            // await agent.aiAssert('页面无异常；页面展示“姓名”、“手机号码”、“意向车系”、“经销商”、“金融方案”和“立即预约”按钮')
            // await agent.aiTap('返回')

            log.debug('从 OneWeb 返回上一页（看车页）');
            // await agent.aiWaitFor('页面加载完成且展示“预约品鉴”按钮')
            await agent.aiTap('返回');
            await agent.aiWaitFor('看车页面展示多种车型');
        }

    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy();
    }
}
