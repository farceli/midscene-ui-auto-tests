/**
 * 商店模块相关功能。
 * 
 * 提供商店页面内的 Tab 切换和验证能力。
 */

import type createLogger from '@/util/logger';

/** 商店顶部 Tab 类型 */
export type TabName = '精选' | '看车' | '互联' | '周边' | '养车';

/** Tab 加载完成断言条件映射 */
const TAB_ASSERT_CONDITIONS: Record<TabName, string> = {
  '精选': '精选 Tab 展示多个商品卡片',
  '看车': '看车 Tab 展示多种车型',
  '互联': '互联 Tab 展示多个商品卡片',
  '周边': '周边 Tab 展示多个产品分类',
  '养车': '养车 Tab 展示多个商品卡片或者展示"该商品需要绑车后查看。"提示语',
};

/**
 * 选择商店顶部 Tab。
 *
 * 如果当前已选中目标 Tab，则直接验证加载状态；否则点击目标 Tab 并等待选中，然后验证加载状态。
 *
 * @param agent Agent 实例
 * @param tabName 目标 Tab 名称，支持："精选"、"看车"、"互联"、"周边"、"养车"
 * @param log 日志记录器实例
 *
 * @example
 * ```typescript
 * await selectTab(agent, '看车', log);
 * await selectTab(agent, '互联', log);
 * ```
 */
export async function selectStoreTab(
  agent: any,
  tabName: TabName,
  log: ReturnType<typeof createLogger>,
): Promise<void> {
  log.debug('获取商店顶部已选中Tab');
  const selectedTab = await agent.aiQuery('string, 商店顶部已选中Tab');
  log.debug('当前选中 Tab：', selectedTab);

  if (selectedTab === tabName) {
    log.debug(`商店顶部已选中"${tabName}"，直接验证加载状态`);
  } else {
    log.debug(`商店顶部未选中"${tabName}"，点击"${tabName}"`);
    await agent.aiTap(`商店顶部的"${tabName}"Tab`);
    await agent.aiWaitFor(`商店顶部已选中"${tabName}"Tab`);
  }

  const assertCondition = TAB_ASSERT_CONDITIONS[tabName];
  log.debug(`检查"${tabName}" Tab 是否加载完成`);
  await agent.aiAssert(assertCondition);
  log.debug(`"${tabName}" Tab 已加载完成`);
}
