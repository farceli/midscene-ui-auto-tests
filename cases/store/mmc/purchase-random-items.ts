import { createRuntime } from '@/util/runtime';
import { launchApp } from '@/common/launch-app';
import { selectMenu } from '@/common/navigation';
import { selectStoreTab } from '@/common/store';
import { randomScroll, scrollUntilVisible } from '@/util/scroll';
import createLogger from '@/util/logger';
import { selectSpecifiedAddress } from '@/common/store/mmc/address';
import { readAgreementAndBack } from '@/common/store/mmc/agreement';

const context = 'purchase-random-items';

export async function runPurchaseRandomItemsTest(platform: 'android' | 'ios') {
    const log = createLogger(`${context}:${platform}`);
    log.info('启动 App，进入商店-周边Tab');
    const { agent, device } = await createRuntime(platform, context);
    // 启动 App
    await launchApp({ platform, device, agent }, { log });
    // 进入“商店”菜单
    await selectMenu(agent, '商店', log);
    // 进入“周边”Tab
    await selectStoreTab(agent, '周边', log);


    log.info('进入随机商品详情页并检查')
    // 随机滚动商品列表
    await randomScroll(agent, {
        direction: 'down',
        scrollOn: '商品列表',
        minTimes: 3,
        maxTimes: 8,
        minDistance: 300,
        maxDistance: 700,
    }, log);
    // 获取任意商品名称
    const anyItemNameInList = await agent.aiQuery('string, 任意商品名称')
    log.debug(`获取的商品名称：${anyItemNameInList}`)
    // 点击商品进入详情页
    await agent.aiTap(`"${anyItemNameInList}"商品`)
    // 等待商品详情页加载完成
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"商品详情"
        3、页面下方展示“加入购物车”和“立即购买”按钮
        `)
    // 断言跳转的详情页是否正确
    await agent.aiAssert(`商品详情页标题为"${anyItemNameInList}"或包含"${anyItemNameInList}"`)
    // 滚动商品详情页检查是否存在异常
    await scrollUntilVisible(agent, {
        direction: 'down',
        distance: null,
        stopWhenSee: '发货须知 Delivery Notes',
        assertAfterEachScroll: '页面无异常',
    }, log);


    log.info('随机选择规格与数量生成订单')
    // 唤起规格和数量选择弹窗
    await agent.aiTap('立即购买')
    // 等待规格和数量选择弹窗加载完成
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"商品规格"
        `)
    // 获取全部规格
    const allSpecs = await agent.aiQuery('string [], 型号/颜色选项名称')
    log.debug('规格列表（全部）：', allSpecs)
    // 随机选择一个规格
    const randomSpec = allSpecs[Math.floor(Math.random() * allSpecs.length)]
    log.debug('随机选择的规格：', randomSpec)
    await agent.aiTap(randomSpec)
    // 获取当前规格的商品单价
    const unitPrice = await agent.aiQuery('number, 当前规格的商品单价')
    log.debug('当前规格的商品单价：', unitPrice)
    // 随机增加数量，避免只测默认 1 件
    // 随机增加数量范围
    const minNumber = 2
    const maxNumber = 5
    const randomNumber = Math.floor(Math.random() * (maxNumber - minNumber + 1)) + minNumber
    // 商品总数(初始数量为 1，所以总数为随机数量 + 1)
    const totalNumber = randomNumber + 1
    // 商品总价格
    const totalPrice = unitPrice * totalNumber
    log.debug(`数量增加 ${randomNumber} 个，总数 ${totalNumber} 个`)
    for (let i = 1; i <= randomNumber; i++) {
        // 点击数量"控件的加号
        await agent.aiTap('数量"控件的加号')
        // 断言数量和价格是否正确
        log.debug(`预期数量为"${i + 1}"，价格为"${unitPrice * (i + 1)}元"`)
        await agent.aiAssert(`数量为"${i + 1}"`)
        await agent.aiAssert(`价格为"${unitPrice * (i + 1)}元"`)
    }
    log.debug(`商品单价：${unitPrice}元，商品总数：${totalNumber}个，商品总价格：${totalPrice}元`)
    // 点击确认生成订单
    await agent.aiTap('确认')
    // 等待订单确认页面加载完成
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"订单确认"
        3、页面中有地址、商品信息、《隐私政策》、《销售条款》、价格和支付按钮
        `)


    log.info('断言订单信息是否正确')
    // 88元免邮
    if (totalPrice >= 88) {
        await agent.aiAssert(`
            1、订单信息中商品名称为"${anyItemNameInList}或包含"${anyItemNameInList}""
            2、订单信息中规格为"${randomSpec}"
            3、订单信息中数量为"${randomNumber + 1}"
            4、订单信息中单价为"${unitPrice}元"
            5、订单信息中总价为"${totalPrice}元"
            6、页面中展示“精品商品实物类订单满 88 元包邮”提示语，且运费栏为“免运费”三个字
            `)
    } else {
        await agent.aiAssert(`
            1、订单信息中商品名称为"${anyItemNameInList}或包含"${anyItemNameInList}""
            2、订单信息中规格为"${randomSpec}"
            3、订单信息中数量为"${randomNumber + 1}"
            4、订单信息中单价为"${unitPrice}元"
            5、订单信息中总价为"${totalPrice + 15}元"
            6、页面中展示“精品商品实物类订单满 88 元包邮”提示语，且运费栏为“¥15.00”
            `)
    }


    log.info('填写地址')
    // 点击地址栏
    await agent.aiTap('地址栏')
    // 等待地址选择弹窗加载完成
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"我的地址"
        `)
    // 地址名称
    const addressName = 'UIAutomatic';
    // 选择指定地址
    await selectSpecifiedAddress(agent, addressName, log);
    // 断言地址是否正确
    await agent.aiAssert(`地址栏已选中"${addressName}"`);


    log.info('阅读勾选协议')
    // 验证未勾选协议时，下单按钮是否不可点击
    await agent.aiAssert(`支付按钮为浅蓝色`);

    const agreements = [
        {
            entryText: '隐私政策',
            pageTitle: '隐私政策',
            contentAssert: '隐私政策展示正确，无错误提示',
            checkboxText: '隐私政策左侧勾选框',
        },
        {
            entryText: '销售条款',
            pageTitle: '销售条款',
            contentAssert: '销售条款展示正确，无错误提示',
            checkboxText: '销售条款左侧勾选框',
        },
    ];

    // 每次运行随机打乱顺序（Fisher–Yates Shuffle）
    for (let i = agreements.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [agreements[i], agreements[j]] = [agreements[j], agreements[i]];
    }

    for (const agreement of agreements) {
        await readAgreementAndBack(agent, log, agreement);
        if (agreement === agreements[agreements.length - 1]) {
            // 如果是最后一次阅读协议，下单按钮可点击
            await agent.aiAssert(`支付按钮为深蓝色`);
        } else {
            // 如果不是最后一次阅读协议，下单按钮不可点击
            await agent.aiAssert(`支付按钮为浅蓝色`);
        }
    }


    log.info('创建订单，不支付，验证订单信息是否正确')
    // 获取当前时间(年月日时分秒)
    const currentTime = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
    log.debug('当前时间：', currentTime)
    // 点击支付按钮
    await agent.aiTap('支付')
    // 等待订单确认页面加载完成
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"支付"
        3、页面中有“感谢您选择售后商城商品，请在 30 分钟内完成支付。”提示语
        `)
    // 断言订单信息是否正确
    await agent.aiAssert(`
        1、金额为"${totalPrice}元"
        2、支付方式为“支付宝”和“微信支付”（支付宝在上，微信支付在下）
        `);
    // 取消支付
    await agent.aiTap('左上角返回按钮')
    // 二次确认
    await agent.aiTap('点击二次确认弹窗的“是”按钮')
    // 等待自动进入售后商城订单页面
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"售后商城订单"
        3、tab 选中“全部”
        `)
    // 断言列表页订单信息是否正确
    await agent.aiAssert(`
        1、列表页中至少存在一条订单数据
        2、第一条订单时间大于等于"${currentTime}"
        3、第一条订单状态为“待支付”
        4、第一条订单金额为"${totalPrice}元"
        5、第一条订单商品名称为"${anyItemNameInList}或包含"${anyItemNameInList}""
        6、第一条订单规格为"${randomSpec}"
        7、第一条订单数量为"${randomNumber + 1}"
    `);
    // 获取第一条订单的订单号
    const orderNumber = await agent.aiQuery('string, 第一条订单的订单号')
    log.debug('第一条订单的订单号：', orderNumber)
    // 获取第一条订单的下单时间
    const orderTime = await agent.aiQuery('string, 第一条订单的下单时间')
    log.debug('第一条订单的下单时间：', orderTime)
    // 点击第一条订单进入订单详情页
    await agent.aiTap(orderNumber)
    // 等待订单详情页加载完成
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"订单详情"
    `)
    // 断言订单详情页信息是否正确
    await agent.aiAssert(`
        1、订单号为"${orderNumber}"
        2、订单详情标题下方用红字展示“请下单后 30 分钟内完成付款”提示语
        3、订单金额合计为"${totalPrice}元"
        4、订单商品名称为"${anyItemNameInList}或包含"${anyItemNameInList}""
        5、订单规格为"${randomSpec}"
        6、订单数量为"${randomNumber + 1}"
        7、订单地址为"${addressName}"
        8、订单下单时间为"${orderTime}"
    `);


    log.info('取消订单')
    // 点击页面下方取消订单按钮
    await agent.aiTap('页面下方取消订单按钮')
    // 等待取消订单弹窗加载完成
    await agent.aiWaitFor(`页面展示取消订单二次确认弹窗`)
    // 点击取消订单弹窗的“是”按钮
    await agent.aiTap('取消订单弹窗的“是”按钮')
    // 等待自动进入售后商城订单页面
    await agent.aiWaitFor('弹窗关闭，页面加载完成')
    // 断言取消订单详情页是否正确
    await agent.aiAssert(`订单状态为“已取消”`);
}