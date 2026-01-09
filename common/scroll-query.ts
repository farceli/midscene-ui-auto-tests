/**
 * 滚动列表并提取内容（尽量简单版）
 *
 * 最终敲定方案：
 * 1) 入参：
 *    - direction：滚动方向
 *    - scrollOn：在什么区域滚动
 *    - getWhat：获取什么
 *    - format：用什么格式获取结果（例如："string[]" / "object[]"）
 *    - endWhenSee：检测到什么内容代表滚动结束（自然语言描述）
 *    - distance：每次滚动距离(可选，默认100)
 *    - maxScrolls：最大滚动次数(可选，默认 30)
 * 2) 返回：固定返回数组 []，数组元素类型由 format 决定
 * 3) 思路：先 aiQuery 一次，然后循环：aiScroll 一次 -> aiQuery 一次 -> 判断是否到底
 * 4) 结束前：对最终数组做去重
 *
 * 调试：本工具会打印少量 console.log，方便定位滚动是否执行、何时结束等。
 */

export type ScrollDirection = 'down' | 'up' | 'left' | 'right';

export interface ScrollCollectParams {
  /** 滚动方向（singleAction） */
  direction: ScrollDirection;
  /** 在什么区域滚动（传给 aiScroll 的 locate） */
  scrollOn: string;
  /** 获取什么（自然语言描述） */
  getWhat: string;
  /** 用什么格式获取结果（会拼到 aiQuery 提示词里）。约定：必须是数组格式，例如 "string[]" */
  format: string;
  /** 检测到什么内容代表滚动结束（自然语言描述） */
  endWhenSee: string;
  /** 每次滚动距离（像素），默认 100；也可传 null 交给 Midscene 决定 */
  distance?: number | null;
  /** 最大滚动次数，默认 30 */
  maxScrolls?: number;
}

/**
 * 最小 agent 能力依赖（避免引入具体平台类型）。
 */
export interface ScrollCollectAgentLike {
  aiScroll(
    scrollParam: {
      scrollType?: 'singleAction';
      direction?: ScrollDirection;
      distance?: number | null;
    },
    locate?: string | object,
    options?: object,
  ): Promise<void>;

  /** aiQuery 返回类型由 format 决定，这里用 unknown 承接 */
  aiQuery(prompt: string): Promise<unknown>;

  /** 用于判断“是否到底/结束” */
  aiAssert(prompt: string): Promise<unknown>;
}

function buildQueryPrompt(getWhat: string, format: string) {
  // 尽量短、明确：减少模型发挥空间
  return `获取页面中当前可见的${getWhat}，用 ${format} 格式返回`;
}

function previewResult(result: unknown) {
  // 避免日志过长：
  // - string 截断
  // - array 显示长度
  // - object 仅做浅层 stringify（失败则退回类型）
  if (typeof result === 'string') {
    return result.length > 120 ? `${result.slice(0, 120)}...` : result;
  }
  if (Array.isArray(result)) {
    return `Array(len=${result.length})`;
  }
  if (result && typeof result === 'object') {
    try {
      const s = JSON.stringify(result);
      return s.length > 120 ? `${s.slice(0, 120)}...` : s;
    } catch {
      return 'Object';
    }
  }
  return String(result);
}

function appendArrayResult(target: unknown[], next: unknown) {
  if (Array.isArray(next)) {
    target.push(...next);
    return;
  }
  // 容错：如果模型偶尔没按要求返回数组，至少不要丢失信息
  if (next !== undefined) target.push(next);
}

function dedupeArray(items: unknown[]): unknown[] {
  // 去重策略：
  // - 基础类型：按值去重
  // - 对象：按 JSON.stringify 后的 key 去重（不保证顺序字段完全一致的对象能去重，但足够实用）
  const seen = new Set<string>();
  const out: unknown[] = [];

  for (const it of items) {
    const key =
      it === null
        ? 'null'
        : typeof it === 'object'
          ? (() => {
              try {
                return `obj:${JSON.stringify(it)}`;
              } catch {
                return `obj:${Object.prototype.toString.call(it)}`;
              }
            })()
          : `${typeof it}:${String(it)}`;

    if (!seen.has(key)) {
      seen.add(key);
      out.push(it);
    }
  }

  return out;
}

/**
 * 滚动采集：先查询一次，然后循环：滚动一次 -> 查询一次 -> 判断是否结束。
 *
 * 返回：固定返回数组（元素类型由 format 决定）。
 */
export async function scrollCollect(
  agent: ScrollCollectAgentLike,
  params: ScrollCollectParams,
): Promise<unknown[]> {
  const {
    direction,
    scrollOn,
    getWhat,
    format,
    endWhenSee,
    distance = 200,
    maxScrolls = 30,
  } = params;

  const queryPrompt = buildQueryPrompt(getWhat, format);

  console.log('[scrollCollect] 开始执行', {
    direction,
    scrollOn,
    getWhat,
    format,
    endWhenSee,
    distance,
    maxScrolls,
  });
  console.log('[scrollCollect] 查询提示词:', queryPrompt);

  const aggregated: unknown[] = [];

  // 1) 先查询一次
  let lastResult: unknown = await agent.aiQuery(queryPrompt);
  console.log('[scrollCollect] 首次查询结果:', previewResult(lastResult));
  appendArrayResult(aggregated, lastResult);

  // 如果首屏就已经满足结束条件，直接返回
  try {
    await agent.aiAssert(endWhenSee);
    console.log('[scrollCollect] 首屏已检测到结束条件，直接停止。');
    const deduped = dedupeArray(aggregated);
    console.log('[scrollCollect] 最终结果去重后长度:', deduped.length);
    return deduped;
  } catch {
    // ignore
  }

  // 2) 再循环：滚动一次、查询一次、判断一次是否结束
  for (let i = 0; i < maxScrolls; i++) {
    console.log(`[scrollCollect] 滚动 ${i + 1}/${maxScrolls} 次...`);

    await agent.aiScroll({ scrollType: 'singleAction', direction, distance }, scrollOn);

    lastResult = await agent.aiQuery(queryPrompt);
    console.log(`[scrollCollect] 第 ${i + 1} 次滚动后查询结果:`, previewResult(lastResult));
    appendArrayResult(aggregated, lastResult);

    // 判断是否滚动结束：能断言到 endWhenSee 就认为到底/结束
    try {
      await agent.aiAssert(endWhenSee);
      console.log(`[scrollCollect] 第 ${i + 1} 次滚动后检测到结束条件，停止滚动。`);
      break;
    } catch {
      console.log(`[scrollCollect] 第 ${i + 1} 次滚动后未检测到结束条件，继续滚动。`);
    }
  }

  const deduped = dedupeArray(aggregated);
  console.log('[scrollCollect] 执行完毕。');
  console.log('[scrollCollect] 最终结果去重前长度:', aggregated.length);
  console.log('[scrollCollect] 最终结果去重后长度:', deduped.length);

  return deduped;
}
