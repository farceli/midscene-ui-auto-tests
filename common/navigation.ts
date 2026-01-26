/**
 * 底部导航栏菜单选择功能。
 * 
 * 提供统一的菜单选择能力，支持在"发现"、"服务"、"车辆"、"商店"和"我的"之间切换。
 */

import type createLogger from '@/util/logger';

/** 底部导航栏菜单类型 */
export type MenuName = '发现' | '服务' | '车辆' | '商店' | '我的';

/** 菜单等待条件映射 */
const MENU_WAIT_CONDITIONS: Record<MenuName, string> = {
  '发现': '页面底部导航栏已选中"发现"',
  '服务': '页面底部导航栏已选中"服务"',
  '车辆': '页面底部导航栏已选中"车辆"',
  '商店': '商店页面上方显示"精选"、"看车"、"互联"、"周边"四个 Tab',
  '我的': '页面展示头像、昵称、订单中心、权益中心',
};

/**
 * 选择底部导航栏菜单。
 *
 * 如果当前已选中目标菜单，则直接返回；否则点击目标菜单并等待页面加载完成。
 *
 * @param agent Agent 实例
 * @param menuName 目标菜单名称，支持："发现"、"服务"、"车辆"、"商店"、"我的"
 * @param log 日志记录器实例
 * @throws {Error} 当菜单名称无效时
 *
 * @example
 * ```typescript
 * await selectMenu(agent, '商店', log);
 * await selectMenu(agent, '我的', log);
 * ```
 */
export async function selectMenu(
  agent: any,
  menuName: MenuName,
  log: ReturnType<typeof createLogger>,
): Promise<void> {
  log.debug('检查底部导航栏状态');
  const selectedMenu = await agent.aiQuery('string, 屏幕底部导航栏已选中菜单');
  log.debug('当前选中菜单：', selectedMenu);

  if (selectedMenu === menuName) {
    log.debug(`导航栏已选中"${menuName}"，无需切换`);
    return;
  }

  log.debug(`导航栏未选中"${menuName}"，点击"${menuName}"`);
  await agent.aiTap(`导航栏的"${menuName}"模块`);

  const waitCondition = MENU_WAIT_CONDITIONS[menuName];

  log.debug(`等待"${menuName}"页面加载完成`);
  await agent.aiWaitFor(waitCondition);
  log.debug(`"${menuName}"页面加载完成`);
}
