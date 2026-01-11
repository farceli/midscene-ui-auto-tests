/**
 * 商店-看车页 Smoke Test
 */

import { createRuntime } from '../../common/runtime';
import { getAppLaunchConfig } from '../../common/app-config';
import { scrollOnly } from '../../common/scroll';

// 商店-看车页 Smoke Test
export async function runStoreCarPageSmokeTest(platform: 'android' | 'ios') {
    // 初始化运行时环境：拿到 AI 执行体 agent 与设备控制器 device
    const { agent, device } = await createRuntime(platform);

    try {
        // 获取当前平台的 App 启动标识（Android: packageName；iOS: bundleId）
        const { appId } = getAppLaunchConfig(platform);
        // 启动目标 App
        await device.launch(appId);

        // 获取导航栏已选中菜单
        const selectedMenu = await agent.aiQuery('string, 屏幕底部导航栏已选中菜单');
        console.log('导航栏已选中菜单：', selectedMenu);
        // 如果未选中“商店”，则点击“商店”
        if (selectedMenu !== '商店') {
            console.log('导航栏未选中“商店”，点击“商店”');
            await agent.aiTap('导航栏的“商店”模块');
            // 等待商店页顶部 Tab（精选/看车/互联/周边/养车）渲染完成
            await agent.aiWaitFor('商店页面上方显示"精选"、"看车"、"互联"、"周边"和"养车"五个 Tab');
        }

        // 获取商店顶部已选中Tab
        const selectedTab = await agent.aiQuery('string, 商店顶部已选中Tab');
        console.log('商店顶部已选中Tab：', selectedTab);
        // 如果未选中“看车”，则点击“看车”
        if (selectedTab !== '看车') {
            console.log('商店顶部未选中“看车”，点击“看车”');
            await agent.aiTap('商店顶部的“看车”Tab');
            // 等待看车页面展示车型列表/车型入口
            await agent.aiWaitFor('看车页面显示多种车型');
        }

        // 预期车型列表
        const expectedCarModelList = ['轿车', 'SUV', '轿跑&敞篷', 'MPV', '纯电车型', '插电式混合动力', 'AMG', 'MAYBACH', 'G'];
        // const expectedCarModelList = ['额外内容测试', '轿车', 'SUV', '轿跑&敞篷', 'MPV', '纯电车型', '插电式混合动力', 'AMG', 'MAYBACH', 'G'];

        // 点击“全部车型”，跳转至 OneWeb 车型列表页面
        console.log('点击“全部车型”，进入 OneWeb 车型列表页');
        await agent.aiTap('“全部车型”按钮');

        // 等待 OneWeb 车型列表页面加载完成
        console.log('等待 OneWeb 车型列表页加载完成');
        await agent.aiWaitFor('1、页面标题为“梅赛德斯-奔驰”，2、页面中部区域展示汽车图片');

        // 断言 OneWeb 已选中“轿车”车型
        console.log('断言 OneWeb 默认已选中“轿车”车型');
        await agent.aiAssert('页面上方有两行 Tab，第一行车型 Tab 当前已选中“轿车”');

        // 返回上一级页面
        console.log('从 OneWeb 返回上一页（看车页）');
        await agent.aiTap('返回');

        // 等待上一级页面（看车 Tab）加载完成
        console.log('等待看车页加载完成');
        await agent.aiWaitFor('看车页面展示多种车型');

        // 验证每个车型对应 OneWeb 页面是否正确
        console.log('开始逐个车型校验 OneWeb 页面');
        for (const carModel of expectedCarModelList) {
            console.log(`开始校验车型：${carModel}`);

            // 先判断当前页面是否存在该车型
            const isCarModelExist = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);
            console.log(`当前页面是否存在“${carModel}”：`, isCarModelExist);

            if (!isCarModelExist) {
                console.log(`当前页面不存在“${carModel}”车型，开始向下滚动查找`);
                await scrollOnly(agent, {
                    direction: 'down',
                    scrollOn: '车型列表页面',
                    stopWhenSee: `车型列表中存在"${carModel}"车型`,
                });

                const isCarModelExistAfterScroll = await agent.aiBoolean(`当前页面是否存在“${carModel}”车型`);
                console.log(`滚动后当前页面是否存在“${carModel}”：`, isCarModelExistAfterScroll);

                if (!isCarModelExistAfterScroll) {
                    throw new Error(`滚动后仍未找到车型：${carModel}`);
                }

                console.log(`滚动结束，已找到车型，准备点击：${carModel}`);
            }

            // 点击车型
            console.log(`点击车型：${carModel}`);
            await agent.aiTap(carModel);

            // 等待 OneWeb 车型列表页面加载完成
            console.log('等待 OneWeb 车型列表页加载完成');
            await agent.aiWaitFor('1、页面标题为“梅赛德斯-奔驰”，2、页面中部区域展示汽车图片');

            // 断言 OneWeb 已选中当前车型
            console.log(`断言 OneWeb 已选中车型：${carModel}`);
            await agent.aiAssert(`页面上方有两行 Tab，第一行车型 Tab 当前已选中“${carModel}”`);

            // 返回上一级页面
            console.log('从 OneWeb 返回上一页（看车页）');
            await agent.aiTap('返回');

            // 等待上一级页面（看车 Tab）加载完成
            console.log('等待看车页加载完成');
            await agent.aiWaitFor('看车页面展示多种车型');
        }

    } finally {
        // 用例结束：销毁 device 释放资源（断开连接/清理会话）
        await device.destroy();
    }
}
