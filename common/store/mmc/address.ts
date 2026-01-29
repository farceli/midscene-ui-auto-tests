/**
 * MMC - 地址相关能力
 *
 * 仅包含“地址选择/地址创建”等与地址页面交互的通用函数，供各用例复用。
 */

import type createLogger from '@/util/logger';
import { scrollUntilVisible } from '@/util/scroll';

/**
 * 选择指定地址。
 *
 * 如果当前已选中目标地址，则直接选择；否则向下滚动查找并选择目标地址。
 *
 * @param agent Agent 实例
 * @param addressName 目标地址名称
 * @param log 日志记录器实例
 */
export async function selectSpecifiedAddress(
    agent: any,
    addressName: string,
    log: ReturnType<typeof createLogger>,
): Promise<void> {
    // 判断当前是否在地址相关页面
    log.debug('判断当前是否在地址相关页面');
    const isAddressPage = await agent.aiBoolean('当前页面是否为地址相关页面');
    if (!isAddressPage) {
        throw new Error('当前页面不是地址相关页面，无法选择地址');
    }

    // 判断当前页面是否存在可选地址
    log.debug('判断当前页面是否存在可选地址');
    const isAddressExist = await agent.aiBoolean(`当前页面是否存在可选地址`);
    if (!isAddressExist) {
        throw new Error('当前页面不存在可选地址，无法选择地址');
    }

    // 如果当前页面存在预期地址，直接选择
    log.debug('判断当前页面是否已选中预期地址');
    const isSelectedAddress = await agent.aiBoolean(
        `当前页面是否已选中预期地址"${addressName}"`,
    );
    if (isSelectedAddress) {
        log.debug('当前页面已选中预期地址，直接选择');
        await agent.aiTap(`"${addressName}"地址`);
        return;
    }

    // 如果当前页面不存在预期地址，则向下滚动查找
    log.debug('当前页面不存在预期地址，开始向下滚动查找');
    await scrollUntilVisible(agent, {
        direction: 'down',
        scrollOn: '地址列表',
        distance: null,
        maxScrolls: 5,
        stopWhenSee: `地址列表中存在预期地址"${addressName}"`,
    }, log);

    // 滚动后找到预期地址，选择预期地址
    log.debug('滚动后找到预期地址，选择预期地址');
    await agent.aiTap(`"${addressName}"地址`);
}

export async function addAndSelectAddress(){}