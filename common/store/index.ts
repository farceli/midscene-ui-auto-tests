export async function selectMenu(
  agent: any,
  moduleName: '商店',
  log: any,
): Promise<void> {
  log.info('检查底部导航栏状态');
  const selectedMenu = await agent.aiQuery('string, 屏幕底部导航栏已选中菜单');
  log.debug('当前选中菜单：', selectedMenu);
  if (selectedMenu !== moduleName) {
    log.info(`导航栏未选中“${moduleName}”，点击“${moduleName}”`);
    await agent.aiTap(`导航栏的“${moduleName}”模块`);
    await agent.aiWaitFor('商店页面上方显示"精选"、"看车"、"互联"、"周边"和"养车"五个 Tab');
  }
}

export async function selectTab(
  agent: any,
  tabName: '精选' | '看车' | '互联' | '周边' | '养车',
  log: any,
): Promise<void> {
  log.info('检查商店顶部 Tab 状态');
  const selectedTab = await agent.aiQuery('string, 商店顶部已选中Tab');
  log.debug('当前选中 Tab：', selectedTab);
  if (selectedTab !== tabName) {
    log.info(`商店顶部未选中“${tabName}”，点击“${tabName}”`);
    await agent.aiTap(`商店顶部的“${tabName}”Tab`);
    await agent.aiWaitFor(`商店顶部已选中“${tabName}”Tab`);
  }
  log.info(`检查"${tabName}"Tab是否加载完成`);
  if (tabName === '精选') {
    await agent.aiAssert('精选 Tab 展示多个商品卡片');
  } else if (tabName === '看车') {
    await agent.aiAssert('看车 Tab 展示多种车型');
  } else if (tabName === '互联') {
    await agent.aiAssert('互联 Tab 展示多个商品卡片');
  } else if (tabName === '周边') {
    await agent.aiAssert('周边 Tab 展示多个产品分类');
  } else if (tabName === '养车') {
    await agent.aiAssert('养车 Tab 展示多个商品卡片或者展示“该商品需要绑车后查看。”提示语');
  }
  log.info(`检查"${tabName}"Tab已加载完成`);
}
