import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { selectMenu } from '@/common/navigation';
import { selectStoreTab } from '@/common/store';
import { randomScroll, scrollUntilVisible } from '@/util/scroll';
import createLogger from '@/util/logger';
import { selectSpecifiedAddress } from '@/common/store/mmc';

const context = 'purchase-random-items';

export async function runPurchaseRandomItemsTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`);


    log.info('启动 App，进入商店-周边Tab');
    const { agent, device } = await createRuntime(platform, context);
    // // 启动 App
    // await launchApp({ platform, device, agent }, { log });
    // // 进入“商店”菜单
    // await selectMenu(agent, '商店', log);
    // // 进入“周边”Tab
    // await selectStoreTab(agent, '周边', log);


    // log.info('进入随机商品详情页并检查')
    // // 随机滚动商品列表
    // await randomScroll(agent, {
    //     direction: 'down',
    //     scrollOn: '商品列表',
    //     minTimes: 3,
    //     maxTimes: 8,
    //     minDistance: 300,
    //     maxDistance: 700,
    // });
    // // 获取任意商品名称
    // const anyItemNameInList = await agent.aiQuery('string, 任意商品名称')
    // log.debug(`获取的商品名称：${anyItemNameInList}`)
    // // 点击商品进入详情页
    // await agent.aiTap(`"${anyItemNameInList}"商品`)
    // // 等待商品详情页加载完成
    // await agent.aiWaitFor(`
    //     1、页面加载完成
    //     2、页面标题为"商品详情"
    //     3、页面下方展示“加入购物车”和“立即购买”按钮
    //     `)
    // // 断言跳转的详情页是否正确
    // await agent.aiAssert(`商品详情页标题为"${anyItemNameInList}"或包含"${anyItemNameInList}"`)
    // // 滚动商品详情页检查是否存在异常
    // await scrollUntilVisible(agent, {
    //     direction: 'down',
    //     distance: null,
    //     stopWhenSee: '发货须知 Delivery Notes',
    //     assertAfterEachScroll: '页面无异常',
    // });

    // log.info('随机选择规格与数量生成订单')
    // // 唤起规格和数量选择弹窗
    // await agent.aiTap('立即购买')
    // // 等待规格和数量选择弹窗加载完成
    // await agent.aiWaitFor(`
    //     1、页面加载完成
    //     2、页面标题为"商品规格"
    //     `)
    // // 获取全部规格
    // const allSpecs = await agent.aiQuery('array, 全部规格')
    // log.debug('规格列表（全部）：', allSpecs)
    // // 随机选择一个规格
    // const randomSpec = allSpecs[Math.floor(Math.random() * allSpecs.length)]
    // log.debug('随机选择的规格：', randomSpec)
    // await agent.aiTap(randomSpec)
    // // 获取当前规格的商品单价
    // const unitPrice = await agent.aiQuery('number, 当前规格的商品单价')
    // log.debug('当前规格的商品单价：', unitPrice)
    // // 随机增加数量，避免只测默认 1 件
    // // 随机增加数量范围
    // const minNumber = 2
    // const maxNumber = 5
    // const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
    // // 商品总数(初始数量为 1，所以总数为随机数量 + 1)
    // const totalNumber = randomNumber + 1
    // // 商品总价格
    // const totalPrice = unitPrice * totalNumber
    // log.debug(`数量增加 ${randomNumber} 个，总数 ${totalNumber} 个`)
    // for (let i = 1; i <= randomNumber; i++) {
    //     // 点击数量"控件的加号
    //     await agent.aiTap('数量"控件的加号')
    //     // 断言数量和价格是否正确
    //     log.debug(`预期数量为"${i + 1}"，价格为"${unitPrice * (i + 1)}元"`)
    //     await agent.aiAssert(`数量为"${i + 1}"`)
    //     await agent.aiAssert(`价格为"${unitPrice * (i + 1)}元"`)
    // }
    // log.debug(`商品单价：${unitPrice}元，商品总数：${totalNumber}个，商品总价格：${totalPrice}元`)
    // // 点击确认生成订单
    // await agent.aiTap('确认')
    // // 等待订单确认页面加载完成
    // await agent.aiWaitFor(`
    //     1、页面加载完成
    //     2、页面标题为"订单确认"
    //     3、页面中有地址、商品信息、《隐私政策》、《销售条款》、价格和支付按钮
    //     `)


    // log.info('断言订单信息是否正确')
    // // 88元免邮
    // if (totalPrice >= 88) {
    //     await agent.aiAssert(`
    //         1、订单信息中商品名称为"${anyItemNameInList}或包含"${anyItemNameInList}""
    //         2、订单信息中规格为"${randomSpec}"
    //         3、订单信息中数量为"${randomNumber + 1}"
    //         4、订单信息中单价为"${unitPrice}元"
    //         5、订单信息中总价为"${totalPrice}元"
    //         6、页面中展示“精品商品实物类订单满 88 元包邮”提示语，且运费栏为“免运费”三个字
    //         `)
    // } else {
    //     await agent.aiAssert(`
    //         1、订单信息中商品名称为"${anyItemNameInList}或包含"${anyItemNameInList}""
    //         2、订单信息中规格为"${randomSpec}"
    //         3、订单信息中数量为"${randomNumber + 1}"
    //         4、订单信息中单价为"${unitPrice}元"
    //         5、订单信息中总价为"${totalPrice + 15}元"
    //         6、页面中展示“精品商品实物类订单满 88 元包邮”提示语，且运费栏为“¥15.00”
    //         `)
    // }


    log.info('填写地址、勾选协议并下单')
    // 点击地址栏
    await agent.aiTap('地址栏')
    // 等待地址选择弹窗加载完成
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"我的地址"
        `)
    // 选择指定地址
    await selectSpecifiedAddress(agent, 'UIAutomatic', log);
}