import { selectMenu } from '@/common/navigation';
import { selectStoreTab } from '@/common/store';
import type createLogger from '@/util/logger';

/**
 * 判断当前账号是否为车辆主用户（车主）。
 *
 * 业务流程：
 * 1. 进入「商店」模块
 * 2. 切换到「互联」Tab
 * 3. 将页面滑动到最上方
 * 4. 通过提示语判断当前账号是否为主用户
 *
 * @param agent Agent 实例
 * @param log 日志记录器实例
 * @returns `true` 表示是车主；`false` 表示不是车主
 */
export async function isOwner(
  agent: any,
  log: ReturnType<typeof createLogger>,
): Promise<boolean> {
  log.debug('进入“商店”模块');
  await selectMenu(agent, '商店', log);

  log.debug('进入“互联”Tab');
  await selectStoreTab(agent, '互联', log);

  log.debug('滑动页面到最上方');
  await agent.aiScroll({ scrollType: 'scrollToTop' });

  log.debug('检测是否车主');
  const isOwner = await agent.aiBoolean(
    '当前页面是否有类似于“您的账号非当前车辆的主用户账号”的提示语',
  );

  if (isOwner) {
    log.debug('不是车主，直接返回');
    return false;
  }

  log.debug('是车主，直接返回');
  return true;
}