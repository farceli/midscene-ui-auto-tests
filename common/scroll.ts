/**
 * 更通用的滚动工具：只负责“按要求滚动”，不返回页面内容。
 *
 * 设计目标：
 * - 不绑定任何业务场景（不做 query/collect）
 * - 只做滚动动作 + 可选的结束检测
 * - 尽量保持依赖最小：只要求 agent 具备 aiScroll / aiAssert
 */

export type ScrollDirection = 'down' | 'up' | 'left' | 'right';

export interface ScrollOnlyParams {
  /** 滚动方向（singleAction） */
  direction: ScrollDirection;

  /** 在什么区域滚动（传给 aiScroll 的 locate） */
  scrollOn: string;

  /** 每次滚动距离（像素），默认 200；也可传 null 交给 Midscene 决定 */
  distance?: number | null;

  /** 最大滚动次数，默认 30 */
  maxScrolls?: number;

  /**
   * 什么时候停止滚动（自然语言描述）。
   * - 例如："页面底部出现了“没有更多了”"
   * - 例如："看到了“加载完成”"
   *
   * 说明：
   * - 若提供该字段，则每次滚动后都会尝试 aiAssert
   * - aiAssert 成功 => 认为满足停止条件
   */
  stopWhenSee?: string;

  /**
   * 是否在开始前先检查一次 stopWhenSee（默认 false）。
   * - true：如果首屏就满足停止条件，直接不滚动
   * - false：至少滚动一次后再开始判断
   */
  precheckStopCondition?: boolean;

  /**
   * 日志开关（默认 false）。
   * 说明：开启后会在控制台输出滚动过程的调试信息。
   */
  debug?: boolean;
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
  aiAssert(prompt: string): Promise<unknown>;
}

async function tryAssert(agent: ScrollOnlyAgentLike, prompt?: string): Promise<boolean> {
  if (!prompt) return false;
  try {
    await agent.aiAssert(prompt);
    return true;
  } catch {
    return false;
  }
}

/**
 * 只滚动，不采集内容。
 * 参数说明：
 * - direction：滚动方向
 * - scrollOn：在什么区域滚动
 * - distance：每次滚动距离（像素），默认 200；也可传 null 交给 Midscene 决定
 * - maxScrolls：最大滚动次数，默认 30
 * - stopWhenSee：什么时候停止滚动（自然语言描述）
 * - precheckStopCondition：是否在开始前先检查一次 stopWhenSee（默认 false）
 * - debug：日志开关（默认 false）
 * 返回：void
 */
export async function scrollOnly(agent: ScrollOnlyAgentLike, params: ScrollOnlyParams): Promise<void> {
  const {
    direction,
    scrollOn,
    distance = 200,
    maxScrolls = 30,
    stopWhenSee,
    precheckStopCondition = false,
    debug = false,
  } = params;

  const log = (...args: unknown[]) => {
    if (debug) console.log('[scrollOnly]', ...args);
  };

  log('开始执行', {
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
      log('首屏已满足停止条件，不执行滚动。');
      return;
    }
    log('首屏未满足停止条件，准备开始滚动。');
  }

  // 1) 循环滚动 + 可选停止判断
  for (let i = 0; i < maxScrolls; i++) {
    log(`滚动 ${i + 1}/${maxScrolls} 次...`);

    await agent.aiScroll({ scrollType: 'singleAction', direction, distance }, scrollOn);

    if (stopWhenSee) {
      const ok = await tryAssert(agent, stopWhenSee);
      if (ok) {
        log(`第 ${i + 1} 次滚动后满足停止条件，停止滚动。`);
        return;
      }
      log(`第 ${i + 1} 次滚动后未满足停止条件，继续滚动。`);
    }
  }

  log('达到最大滚动次数，停止。');
}

