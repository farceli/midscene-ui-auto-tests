import { scrollOnly } from '@/util/scroll';

export async function selectMenu(
  agent: any,
  moduleName: '我的',
  log: any,
): Promise<void> {
  log.debug('检查底部导航栏状态');
  const selectedMenu = await agent.aiQuery('string, 屏幕底部导航栏已选中菜单');
  log.debug('当前选中菜单：', selectedMenu);
  if (selectedMenu !== moduleName) {
    log.debug(`导航栏未选中“${moduleName}”，点击“${moduleName}”`);
    await agent.aiTap(`导航栏的“${moduleName}”模块`);
    await agent.aiWaitFor('页面顶部展示头像、昵称、订单中心、权益中心');
  }
}

// 切换车辆，根据车辆名称切换车辆
export async function switchVehicle(
  agent: any,
  vehicleName: string,
  log: any,
): Promise<void> {
  log.debug('检测是否在“我的”页面');
  await selectMenu(agent, '我的', log);
  log.debug(`判断是否已选中预期车辆："${vehicleName}"`);
  const isSelectedVehicle = await agent.aiBoolean(`当前页面的车辆管理部分是否已选中预期车辆“${vehicleName}”`);
  if (isSelectedVehicle) {
    log.info('已经选中预期车辆，切换车辆完成');
    return;
  }
  log.debug('进入车辆管理页面');
  await agent.aiTap('车辆管理');
  await agent.aiWaitFor('车辆管理页面展示一个或多个车辆并且页面下方展示“添加车辆”按钮');
  log.debug(`检查当前页面是否存在预期车辆："${vehicleName}"`);
  const isVehicleExist = await agent.aiBoolean(`当前页面是否存在预期车辆“${vehicleName}”`);
  if (isVehicleExist) {
    log.debug('存在预期车辆，选择预期车辆');
    await agent.aiTap(`“${vehicleName}”车辆对应的“选择车辆”按钮`);
    await agent.aiWaitFor(`我的页面“车辆管理”已选中预期车辆“${vehicleName}”`);
    log.info('已经选中预期车辆，切换车辆完成');
    return;
  }
  log.debug('不存在预期车辆，开始向下滚动查找');
  await scrollOnly(agent, {
    direction: 'down',
    scrollOn: '车辆列表',
    stopWhenSee: `车辆列表中存在预期车辆“${vehicleName}”`,
  });
  log.debug(`检查当前页面是否存在预期车辆："${vehicleName}"`);
  const isVehicleExistAfterScroll = await agent.aiBoolean(`当前页面是否存在预期车辆“${vehicleName}”`);
  if (isVehicleExistAfterScroll) {
    log.debug('存在预期车辆，选择预期车辆');
    await agent.aiTap(`“${vehicleName}”车辆对应的“选择车辆”按钮`);
    await agent.aiWaitFor(`我的页面“车辆管理”已选中预期车辆“${vehicleName}”`);
    log.info('已经选中预期车辆，切换车辆完成');
    return;
  }
  log.error(`滚动后仍未找到车型：${vehicleName}`);
  throw new Error(`滚动后仍未找到车型：${vehicleName}`);
}
