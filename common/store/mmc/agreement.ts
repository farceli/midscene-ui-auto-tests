import type createLogger from '@/util/logger';

export interface ReadAgreementAndBackParams {
    /** 协议入口（例如：隐私政策 / 销售条款） */
    entryText: string;
    /** 协议页面标题（用于 waitFor） */
    pageTitle: string;
    /** 协议内容正确性的断言（自然语言） */
    contentAssert: string;
    /** 返回订单确认页后需要点击的勾选框 */
    checkboxText: string;
    /** 订单确认页标题（用于 waitFor），默认：订单确认 */
    orderConfirmTitle?: string;
    /** 返回按钮文案/定位描述，默认：页面左上角返回按钮 */
    backButtonText?: string;
}

/**
 * 打开并阅读协议页面，做内容断言后返回订单确认页，并勾选对应协议。
 *
 * 适用场景：订单确认页需要先阅读并勾选“隐私政策/销售条款”等才能下单。
 */
export async function readAgreementAndBack(
    agent: any,
    log: ReturnType<typeof createLogger>,
    params: ReadAgreementAndBackParams,
): Promise<void> {
    const {
        entryText,
        pageTitle,
        contentAssert,
        checkboxText,
        orderConfirmTitle = '订单确认',
        backButtonText = '页面左上角返回按钮',
    } = params;

    log.debug(`打开协议：${entryText}`);
    await agent.aiTap(entryText);
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"${pageTitle}"
        `);
    await agent.aiAssert(contentAssert);

    log.debug(`返回订单确认页（阅读完成）：${entryText}`);
    await agent.aiTap(backButtonText);
    await agent.aiWaitFor(`
        1、页面加载完成
        2、页面标题为"${orderConfirmTitle}"
        `);

    await agent.aiTap(checkboxText);
    log.debug(`已勾选协议：${checkboxText}`);
}

