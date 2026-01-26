/**
 * 个人中心（我的）模块相关功能。
 * 
 * 提供车辆切换、车辆管理等个人中心相关操作能力。
 */

import { scrollOnly } from '@/util/scroll';
import { selectMenu } from '@/common/navigation';
import type createLogger from '@/util/logger';

/** 自定义错误：车辆未找到 */
export class VehicleNotFoundError extends Error {
  constructor(vehicleName: string) {
    super(`滚动后仍未找到车辆：${vehicleName}`);
    this.name = 'VehicleNotFoundError';
  }
}

/** 自定义错误：车辆名称未配置 */
export class VehicleNameNotConfiguredError extends Error {
  constructor() {
    super('车辆名称未配置：请在 .env 或运行环境中配置 OWNER_VEHICLE_NAME');
    this.name = 'VehicleNameNotConfiguredError';
  }
}

/** 车辆管理页面等待条件 */
const VEHICLE_MANAGEMENT_PAGE_WAIT_CONDITION = '车辆管理页面展示一个或多个车辆并且页面下方展示"添加车辆"按钮';

/**
 * 在车辆管理页面中选择指定车辆。
 *
 * @param agent Agent 实例
 * @param vehicleName 车辆名称
 * @param log 日志记录器实例
 * @throws {VehicleNotFoundError} 当车辆不存在时
 */
async function selectVehicleInManagementPage(
  agent: any,
  vehicleName: string,
  log: ReturnType<typeof createLogger>,
): Promise<void> {
  log.debug(`点击"${vehicleName}"车辆对应的"选择车辆"按钮`);
  await agent.aiTap(`"${vehicleName}"车辆对应的"选择车辆"按钮`);
  await agent.aiWaitFor(`我的页面"车辆管理"已选中预期车辆"${vehicleName}"`);
  log.info(`已选中车辆"${vehicleName}"，切换车辆完成`);
}

/**
 * 切换车辆，根据车辆名称切换到指定车辆。
 *
 * 如果当前已选中目标车辆，则直接返回；否则进入车辆管理页面，查找并选择目标车辆。
 * 如果车辆不在当前页面，会自动滚动查找。
 *
 * @param agent Agent 实例
 * @param vehicleName 目标车辆名称
 * @param log 日志记录器实例
 * @throws {VehicleNotFoundError} 当车辆不存在时
 *
 * @example
 * ```typescript
 * await switchVehicle(agent, '我的车辆', log);
 * ```
 */
export async function switchVehicle(
  agent: any,
  vehicleName: string,
  log: ReturnType<typeof createLogger>,
): Promise<void> {
  log.debug('检测是否在"我的"页面');
  await selectMenu(agent, '我的', log);

  log.debug(`判断是否已选中预期车辆："${vehicleName}"`);
  const isSelectedVehicle = await agent.aiBoolean(
    `当前页面的车辆管理部分是否已选中预期车辆"${vehicleName}"`
  );

  if (isSelectedVehicle) {
    log.info('已经选中预期车辆，无需切换');
    return;
  }

  log.debug('进入车辆管理页面');
  await agent.aiTap('车辆管理');
  await agent.aiWaitFor(VEHICLE_MANAGEMENT_PAGE_WAIT_CONDITION);

  log.debug(`检查当前页面是否存在预期车辆："${vehicleName}"`);
  const isVehicleExist = await agent.aiBoolean(`当前页面是否存在预期车辆"${vehicleName}"`);

  if (isVehicleExist) {
    log.debug('存在预期车辆，选择预期车辆');
    await selectVehicleInManagementPage(agent, vehicleName, log);
    return;
  }

  log.debug('不存在预期车辆，开始向下滚动查找');
  await scrollOnly(agent, {
    direction: 'down',
    scrollOn: '车辆列表',
    stopWhenSee: `车辆列表中存在预期车辆"${vehicleName}"`,
  });

  log.debug('滚动后找到预期车辆，选择预期车辆');
  await selectVehicleInManagementPage(agent, vehicleName, log);
}

/**
 * 切换到所属车辆（车辆名称从环境变量获取）。
 *
 * 从 `OWNER_VEHICLE_NAME` 环境变量读取车辆名称，然后切换到该车辆。
 *
 * @param agent Agent 实例
 * @param log 日志记录器实例
 * @throws {VehicleNameNotConfiguredError} 当环境变量未配置时
 * @throws {VehicleNotFoundError} 当车辆不存在时
 *
 * @example
 * ```typescript
 * // 需要在 .env 中配置 OWNER_VEHICLE_NAME=我的车辆
 * await switchOwnerVehicle(agent, log);
 * ```
 */
export async function switchOwnerVehicle(
  agent: any,
  log: ReturnType<typeof createLogger>,
): Promise<void> {
  const vehicleName = process.env.OWNER_VEHICLE_NAME?.trim();
  if (!vehicleName) {
    throw new VehicleNameNotConfiguredError();
  }

  await switchVehicle(agent, vehicleName, log);
}