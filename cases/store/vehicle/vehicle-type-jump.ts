/**
 * 车型跳转测试
 */

import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { scrollOnly } from '@/util/scroll';
import createLogger from '@/util/logger';
import { selectMenu } from '@/common/navigation';
import { selectStoreTab } from '@/common/store';
import { switchOwnerVehicle } from '@/common/profile';

const context = 'vehicle-type-jump';

// 车型跳转测试
export async function runVehicleTypeJumpTest(platform: 'android' | 'ios') {
    // 初始化日志记录器
    const log = createLogger(`${context}:${platform}`);

    log.info('开始执行：车型跳转测试');

    // 初始化运行时环境：拿到 AI 执行体 agent 与设备控制器 device
    const { agent, device } = await createRuntime(platform, context);

    try {
        // log.info('启动 App，进入商店-看车 Tab')
        // await launchApp({ platform, device, agent }, { log });
        // await selectMenu(agent, '商店', log);
        // await selectStoreTab(agent, '周边', log);
        await switchOwnerVehicle(agent, log);

        // // 预期车型列表
        // // const expectedCarModelList = ['轿车', 'SUV', '轿跑&敞篷', 'MPV', '纯电车型', '插电式混合动力', 'AMG', 'MAYBACH', 'G'];
        // const expectedCarModelList = ['轿车', 'SUV', '轿跑&敞篷', 'MPV', '纯电车型'];
        // // const expectedCarModelList = ['AMG', 'MAYBACH', 'G'];
        // // const expectedCarModelList = ['轿车'];

        // log.info('验证“全部车型”');
        // await agent.aiTap('点击“探索车型”右侧的“全部车型”入口');
        // await agent.aiWaitFor(`1、页面加载完成
        //     2、页面标题为“梅赛德斯-奔驰”
        //     3、页面中间区域展示汽车图片`);
        // await agent.aiAssert('已选中“轿车”');
        // await agent.aiTap('点击页面左上角“返回”按钮');
        // await agent.aiWaitFor(`1、页面加载完成
        //     2、页面底部导航栏展示：“发现”、“服务”、“车辆”、“商店”和“我的”。
        //     3、页面底部导航栏已选中“商店”`);

        // log.info('逐个验证车型跳转');
        // if (expectedCarModelList.length === 0) {
        //     log.error('预期车型列表为空');
        //     throw new Error('预期车型列表为空');
        // }
        // for (const carModel of expectedCarModelList) {
        //     log.info(`验证车型：${carModel} 跳转功能`);
        //     const isCarModelExist = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);
        //     if (!isCarModelExist) {
        //         log.debug(`当前页面不存在“${carModel}”，开始向下滚动查找`);
        //         await scrollOnly(agent, {
        //             direction: 'down',
        //             scrollOn: '车型列表页面',
        //             stopWhenSee: `车型列表中存在"${carModel}"车型`,
        //         });

        //         log.debug(`滚动结束，再次检查“${carModel}”是否存在`);
        //         const isCarModelExistAfterScroll = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);

        //         if (!isCarModelExistAfterScroll) {
        //             log.error(`滚动后仍未找到车型：${carModel}`);
        //             throw new Error(`滚动后仍未找到车型：${carModel}`);
        //         }

        //         log.debug(`滚动结束，已找到车型，准备点击`);
        //     }

        //     log.debug(`点击车型：${carModel}并验证跳转功能`);
        //     await agent.aiTap(carModel);
        //     await agent.aiWaitFor(`1、页面标题为“梅赛德斯-奔驰”
        //         2、页面中部区域展示汽车图片`);
        //     await agent.aiAssert(`已选中“${carModel}”`);

        //     // log.info('验证“预约品鉴”跳转')
        //     // await agent.aiTap('"预约品鉴"按钮')
        //     // await agent.aiWaitFor('页面标题为“预约品鉴”，且页面加载完成')
        //     // await agent.aiAssert('页面无异常；页面展示“姓名”、“手机号码”、“意向车系”、“经销商”、“金融方案”和“立即预约”按钮')
        //     // await agent.aiTap('返回')

        //     // log.debug('从 OneWeb 返回上一页（看车页）');
        //     // await agent.aiWaitFor('页面加载完成且展示“预约品鉴”按钮')
        //     await agent.aiTap('点击页面左上角“返回”按钮');
        //     await agent.aiWaitFor(`1、页面加载完成
        //         2、页面底部导航栏展示：“发现”、“服务”、“车辆”、“商店”和“我的”。
        //         3、页面底部导航栏已选中“商店”`);
        // }
    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy();
    }
}
