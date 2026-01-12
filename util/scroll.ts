/**
 * 通用滚动工具：只负责滚动动作 + 可选停止判断，不采集页面内容。
 *
 * 依赖最小能力：agent 需要实现 `aiScroll`、`aiAssert`。
 */

import createLogger from './logger';

const log = createLogger('scroll');

export type ScrollDirection = 'down' | 'up' | 'left' | 'right';

export interface ScrollOnlyParams {
  /** 滚动方向（singleAction） */
  direction: ScrollDirection;

  /** 滚动区域（传给 `aiScroll` 的 locate） */
  scrollOn: string;

  /** 每次滚动距离（像素），默认 200；传 `null` 表示交给 Midscene 决定 */
  distance?: number | null;

  /** 最大滚动次数，默认 30 */
  maxScrolls?: number;

  /** 停止条件（自然语言）。每次滚动后会用 `aiAssert` 尝试判断是否已满足。 */
  stopWhenSee?: string;

  /** 是否在开始前先检查一次停止条件；true 表示首屏满足则不滚动。 */
  precheckStopCondition?: boolean;
}


/**
 * 最小 agent 能力依赖（避免引入具体平台类型）。
 */
export interface ScrollOnlyAgentLike {
  aiScroll(
    scrollParam: {
      scrollType?: 'singleAction';
      direction?: ScrollDirection;
      distance?: number | null;
    },
    locate?: string | object,
    options?: object,
  ): Promise<void>;

  /** 用于判断“是否满足停止条件” */
  aiAssert?: (prompt: string) => Promise<unknown>;
}

/**
 * 尝试断言停止条件。
 * - 成功：返回 true
 * - 失败：返回 false（吞掉异常，便于作为循环中的探测逻辑）
 */
async function tryAssert(agent: ScrollOnlyAgentLike, prompt?: string): Promise<boolean> {
  if (!prompt) return false;
  if (!agent.aiAssert) return false;
  try {
    await agent.aiAssert(prompt);
    return true;
  } catch {
    return false;
  }
}

/**
 * 只滚动，不采集内容。
 * - 如果设置 `stopWhenSee`：每次滚动后都会尝试断言，满足则提前结束
 * - 如果设置 `precheckStopCondition`：先检查首屏是否满足停止条件
 */
export async function scrollOnly(agent: ScrollOnlyAgentLike, params: ScrollOnlyParams): Promise<void> {
  const {
    direction,
    scrollOn,
    distance = 200,
    maxScrolls = 30,
    stopWhenSee,
    precheckStopCondition = false,
  } = params;

  log.debug('开始执行', {
    direction,
    scrollOn,
    distance,
    maxScrolls,
    stopWhenSee,
    precheckStopCondition,
  });

  // 0) 可选：先检查一次停止条件
  if (precheckStopCondition && stopWhenSee) {
    const ok = await tryAssert(agent, stopWhenSee);
    if (ok) {
      log.debug('首屏已满足停止条件，不执行滚动。');
      return;
    }
    log.debug('首屏未满足停止条件，准备开始滚动。');
  }

  // 1) 循环滚动 + 可选停止判断
  for (let i = 0; i < maxScrolls; i++) {
    log.debug(`滚动 ${i + 1}/${maxScrolls} 次...`);

    await agent.aiScroll({ scrollType: 'singleAction', direction, distance }, scrollOn);

    if (stopWhenSee) {
      const ok = await tryAssert(agent, stopWhenSee);
      if (ok) {
        log.debug(`第 ${i + 1} 次滚动后满足停止条件，停止滚动。`);
        return;
      }
      log.debug(`第 ${i + 1} 次滚动后未满足停止条件，继续滚动。`);
    }
  }

  log.debug('达到最大滚动次数，停止。');
}

