/**
 * 通用滚动工具：执行滚动动作并基于停止条件控制是否继续滚动。
 *
 * 设计目标：
 * - 只负责滚动与停止判断，不采集页面内容
 * - 最小依赖：agent 仅需实现 `aiScroll` + 可选 `aiAssert`
 */

import createLogger from './logger';

// const log = createLogger('scroll');

/** 滚动方向 */
export type ScrollDirection = 'down' | 'up' | 'left' | 'right';

/** 随机滚动参数 */
export interface RandomScrollParams {
    /** 滚动方向（singleAction） */
    direction: ScrollDirection;

    /** 滚动区域（传给 `aiScroll` 的 locate），如“列表区域”等 */
    scrollOn: string;

    /** 滚动次数范围（闭区间），单位：次 */
    minTimes: number;
    maxTimes: number;

    /** 每次滚动距离范围（闭区间，像素） */
    minDistance: number;
    maxDistance: number;
}

/** 滚动参数 */
export interface ScrollUntilVisibleParams {
    /** 滚动方向（singleAction） */
    direction: ScrollDirection;

    /** 滚动区域（传给 `aiScroll` 的 locate），如“车型列表页面”、“车辆列表”等 */
    scrollOn?: string;

    /**
     * 每次滚动距离（像素）。
     * - 传入 number：使用指定距离
     * - 传入 null：不传递 distance 字段，交给 Midscene 决定滚动距离
     */
    distance: number | null;

    /**
     * 每次滚动后执行的断言（自然语言，可选）。
     * - 若提供：每次滚动后都会调用 `aiAssert(assertAfterEachScroll)`
     * - 若不提供：不会额外执行断言
     */
    assertAfterEachScroll?: string;

    /** 最大滚动次数，默认 30（达到上限后停止滚动，不再抛错） */
    maxScrolls?: number;

    /**
     * 停止条件（自然语言）。
     * 每次滚动后会用 `aiAssert` 尝试判断是否已满足；满足则提前结束。
     * 例如：`车型列表中存在预期车辆"XXX"`。
     */
    stopWhenSee: string;

}

/**
 * 按指定方向滚动页面，直到满足停止条件或达到最大滚动次数。
 *
 * 特性：
 * - 每次滚动后都会通过 `aiBoolean(stopWhenSee)` 检查是否满足停止条件
 * - 达到最大滚动次数后静默停止（不抛错），由调用方决定是否需要额外校验
 *
 * @param agent Agent 实例（需实现 `aiScroll` + `aiBoolean`）
 * @param params 滚动参数配置
 *
 * @example
 * ```typescript
 * await scrollUntilVisible(agent, {
 *   direction: 'down',
 *   scrollOn: '车辆列表',
 *   stopWhenSee: '车辆列表中存在预期车辆"我的车辆"',
 *   maxScrolls: 20
 * });
 * ```
 */
export async function scrollUntilVisible(
    agent: any,
    params: ScrollUntilVisibleParams,
    log: ReturnType<typeof createLogger>,
): Promise<void> {
    const {
        direction,
        scrollOn,
        distance,
        maxScrolls = 30,
        assertAfterEachScroll,
        stopWhenSee,
    } = params;

    log.debug('开始执行滚动', {
        direction,
        scrollOn,
        distance,
        maxScrolls,
        stopWhenSee,
    });

    // 循环滚动 + 停止判断
    for (let i = 0; i < maxScrolls; i++) {
        log.debug(`滚动 ${i + 1}/${maxScrolls} 次...`);

        const scrollParam: {
            scrollType: 'singleAction';
            direction: ScrollDirection;
            distance?: number;
        } = {
            scrollType: 'singleAction',
            direction,
        };
        if (typeof distance === 'number') {
            scrollParam.distance = distance;
        }

        await agent.aiScroll(scrollParam, scrollOn);

        // 如配置，则在每次滚动后先执行断言
        if (assertAfterEachScroll) {
            await agent.aiAssert(assertAfterEachScroll);
        }

        const ok = await agent.aiBoolean(stopWhenSee);
        if (ok) {
            log.debug(`第 ${i + 1} 次滚动后满足停止条件，停止滚动。`);
            return;
        }
        log.debug(`第 ${i + 1} 次滚动后未满足停止条件，继续滚动。`);
    }

    log.debug('达到最大滚动次数，停止滚动。');
}

/**
 * 随机滚动若干次。
 *
+ * @param agent Agent 实例（需实现 `aiScroll`）
 * @param params 随机滚动参数，含次数与距离的范围
 */
export async function randomScroll(
    agent: any,
    params: RandomScrollParams,
    log: ReturnType<typeof createLogger>,
): Promise<void> {
    const {
        direction,
        scrollOn,
        minTimes,
        maxTimes,
        minDistance,
        maxDistance,
    } = params;

    if (minTimes < 1 || maxTimes < 1) {
        throw new Error('randomScroll: minTimes 和 maxTimes 必须 >= 1');
    }
    if (minTimes > maxTimes) {
        throw new Error(`randomScroll: minTimes(${minTimes}) 必须 <= maxTimes(${maxTimes})`);
    }
    if (minDistance < 0 || maxDistance < 0) {
        throw new Error('randomScroll: minDistance 和 maxDistance 不能为负数');
    }
    if (minDistance > maxDistance) {
        throw new Error(`randomScroll: minDistance(${minDistance}) 必须 <= maxDistance(${maxDistance})`);
    }

    const times = randomIntInclusive(minTimes, maxTimes);

    log.debug('开始执行随机滚动', {
        direction,
        scrollOn,
        times,
        minTimes,
        maxTimes,
        minDistance,
        maxDistance,
    });

    for (let i = 0; i < times; i++) {
        const distance = randomIntInclusive(
            Math.max(1, minDistance),
            Math.max(1, maxDistance),
        );

        log.debug(`随机滚动 ${i + 1}/${times}`);
        await agent.aiScroll(
            { scrollType: 'singleAction', direction, distance },
            scrollOn,
        );
    }
}

function randomIntInclusive(min: number, max: number): number {
    const a = Math.ceil(min);
    const b = Math.floor(max);
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
