import { selectMenu } from '@/common/store';
import { selectTab } from '@/common/store';

/**
 * 
 * @param agent 
 * @param log 
 * @returns true: 是车主，false: 不是车主
 */
export async function isOwner(
    agent: any,
    log: any,
): Promise<boolean> {
    log.debug('进入“商店”模块');
    await selectMenu(agent, '商店', log);
    log.debug('进入“互联”Tab');
    await selectTab(agent, '互联', log);
    log.debug('滑动页面到最上方');
    await agent.aiScroll({ scrollType: 'scrollToTop' })
    log.debug('检测是否车主');
    const isOwner = await agent.aiBoolean('当前页面是否有类似于“您的账号非当前车辆的主用户账号”的提示语');
    if (isOwner) {
        log.debug('不是车主，直接返回');
        return false;
    }
    log.debug('是车主，直接返回');
    return true;
}